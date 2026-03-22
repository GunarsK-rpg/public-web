<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="stat-picker-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="stat-picker-card" role="dialog">
      <q-card-section>
        <div id="stat-picker-dialog-title" class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-sm">
        <q-select
          v-model="selectedCode"
          :options="availableOptions"
          label="Select *"
          outlined
          dense
          emit-value
          map-options
          behavior="menu"
          autofocus
        />
        <q-input v-model.number="form.value" label="Value *" type="number" outlined dense />
        <q-input
          v-if="showDisplayValue"
          v-model="form.displayValue"
          label="Display text"
          outlined
          dense
          placeholder="e.g. 25 ft."
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="close" />
        <q-btn
          flat
          color="primary"
          :label="editIndex != null ? 'Save' : 'Add'"
          :disable="!selectedCode || form.value == null"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Classifier } from 'src/types/classifier';

const props = defineProps<{
  modelValue: boolean;
  title: string;
  options: Classifier[];
  usedCodes: string[];
  editIndex?: number | null | undefined;
  editCode?: string | undefined;
  editValue?: number | undefined;
  editDisplayValue?: string | null | undefined;
  showDisplayValue?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [code: string, value: number, displayValue: string | null];
}>();

const selectedCode = ref<string | null>(null);
const form = ref({ value: 0, displayValue: '' });

const availableOptions = computed(() => {
  const isEdit = props.editIndex != null;
  return props.options
    .filter((o) => (isEdit ? o.code === props.editCode : !props.usedCodes.includes(o.code)))
    .map((o) => ({ label: o.name, value: o.code }));
});

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    if (props.editIndex != null && props.editCode) {
      selectedCode.value = props.editCode;
      form.value.value = props.editValue ?? 0;
      form.value.displayValue = props.editDisplayValue ?? '';
    } else {
      selectedCode.value = null;
      form.value.value = 0;
      form.value.displayValue = '';
    }
  }
);

function onSubmit() {
  if (!selectedCode.value) return;
  emit('save', selectedCode.value, form.value.value, form.value.displayValue.trim() || null);
}

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.stat-picker-card {
  min-width: min(400px, 90vw);
  max-width: 500px;
}
</style>
