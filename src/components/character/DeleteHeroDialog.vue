<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="delete-hero-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="delete-hero-card" role="dialog">
      <q-card-section>
        <div id="delete-hero-dialog-title" class="text-h6">Delete Character</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <p>
          Are you sure you want to delete <strong>{{ heroName }}</strong
          >? This action cannot be undone.
        </p>
        <q-input
          v-model="confirmInput"
          outlined
          dense
          placeholder='Type "delete" to confirm'
          :disable="deleting"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" :disable="deleting" @click="$emit('update:modelValue', false)" />
        <q-btn
          flat
          label="Delete"
          color="negative"
          :disable="!isConfirmed || deleting"
          :loading="deleting"
          @click="$emit('confirm')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  heroName: string;
  deleting: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const confirmInput = ref('');
const isConfirmed = computed(() => confirmInput.value.trim().toLowerCase() === 'delete');

watch(
  () => props.modelValue,
  (open) => {
    if (open) confirmInput.value = '';
  }
);
</script>

<style scoped>
.delete-hero-card {
  min-width: min(400px, 90vw);
  max-width: 500px;
}
</style>
