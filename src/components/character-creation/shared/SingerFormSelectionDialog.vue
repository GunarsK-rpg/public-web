<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="singer-form-selection-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="singer-form-selection-card" role="dialog">
      <q-card-section class="row items-center">
        <div id="singer-form-selection-dialog-title" class="text-h6">Select Singer Form</div>
        <q-space />
        <q-btn flat round dense aria-label="Close dialog" @click="$emit('update:modelValue', false)"
          ><X :size="20" aria-hidden="true"
        /></q-btn>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list bordered separator role="listbox" aria-label="Singer forms">
          <q-item
            v-for="form in availableForms"
            :key="form.id"
            :active="selectedFormId === form.id"
            :aria-selected="selectedFormId === form.id"
            role="option"
            clickable
            v-ripple
            @click="selectedFormId !== form.id && selectForm(form.id)"
          >
            <q-item-section>
              <q-item-label>{{ form.name }}</q-item-label>
              <q-item-label v-if="form.sprenType" caption>{{ form.sprenType }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <Check
                v-if="selectedFormId === form.id"
                :size="18"
                class="text-positive selected-indicator"
                aria-hidden="true"
              />
              <span v-if="selectedFormId === form.id" class="sr-only">Selected</span>
              <q-btn
                v-else
                flat
                dense
                color="primary"
                label="Select"
                size="sm"
                @click.stop="selectForm(form.id)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { Check, X } from 'lucide-vue-next';
import type { SingerForm } from 'src/types';

defineProps<{
  modelValue: boolean;
  selectedFormId: number | null;
  availableForms: SingerForm[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  select: [formId: number];
}>();

function selectForm(formId: number) {
  emit('select', formId);
  emit('update:modelValue', false);
}
</script>

<style scoped>
.singer-form-selection-card {
  min-width: min(400px, 90vw);
  max-width: 500px;
}
</style>
