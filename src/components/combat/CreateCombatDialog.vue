<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="create-combat-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="create-combat-card" role="dialog">
      <q-card-section>
        <div id="create-combat-dialog-title" class="text-h6">New Combat</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-model="name"
          label="Name"
          autofocus
          :rules="[(v: string) => !!v.trim() || 'Name is required']"
          @keydown.enter="onSubmit"
        />
        <q-input
          v-model="description"
          label="Description (optional)"
          type="textarea"
          class="q-mt-sm"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="close" />
        <q-btn
          flat
          color="primary"
          label="Create"
          :disable="!name.trim() || saving"
          :loading="saving"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  saving: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  create: [name: string, description: string | null];
}>();

const name = ref('');
const description = ref('');

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      name.value = '';
      description.value = '';
    }
  }
);

function onSubmit() {
  if (!name.value.trim()) return;
  emit('create', name.value.trim(), description.value.trim() || null);
}

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.create-combat-card {
  min-width: min(400px, 90vw);
  max-width: 500px;
}
</style>
