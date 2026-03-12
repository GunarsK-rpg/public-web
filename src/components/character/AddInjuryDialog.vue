<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="injury-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="injury-dialog-card" role="dialog">
      <q-card-section>
        <div id="injury-dialog-title" class="text-h6">Add Injury</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-select
          v-model="injuryCode"
          :options="injuries"
          option-label="name"
          option-value="code"
          label="Injury type"
          dense
          outlined
          emit-value
          map-options
          behavior="menu"
          class="q-mb-sm"
        />
        <q-input v-model="notes" label="Notes (duration, cause)" dense outlined maxlength="500" />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="close" />
        <q-btn flat color="primary" label="Add" :disable="!injuryCode" @click="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Injury } from 'src/types/conditions';

const props = defineProps<{
  modelValue: boolean;
  injuries: Injury[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  add: [injuryCode: string, notes: string | null];
}>();

const injuryCode = ref<string | null>(null);
const notes = ref('');

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      injuryCode.value = null;
      notes.value = '';
    }
  }
);

function submit() {
  if (!injuryCode.value) return;
  emit('add', injuryCode.value, notes.value.trim() || null);
  close();
}

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.injury-dialog-card {
  min-width: min(400px, 90vw);
  max-width: 500px;
}
</style>
