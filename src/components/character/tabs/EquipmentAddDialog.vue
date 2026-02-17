<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="equipment-add-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="equipment-add-card" role="dialog">
      <q-card-section class="row items-center">
        <div id="equipment-add-dialog-title" class="text-h6">Add Equipment</div>
        <q-space />
        <q-btn icon="close" flat round dense aria-label="Close dialog" v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-select
          v-model="selectedEquipment"
          :options="filteredOptions"
          option-label="name"
          option-value="code"
          label="Equipment"
          use-input
          input-debounce="100"
          clearable
          :loading="!classifiers.initialized"
          aria-label="Select equipment"
          @filter="onFilter"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-muted">No results</q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input
          v-model.number="amount"
          type="number"
          label="Amount"
          min="1"
          class="q-mt-md"
          aria-label="Amount"
        />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          flat
          label="Add"
          color="primary"
          :disable="!selectedEquipment || !Number.isFinite(amount) || amount < 1 || saving"
          :loading="saving"
          @click="onAdd"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import { useHeroStore } from 'src/stores/hero';
import type { Equipment } from 'src/types';

const props = defineProps<{
  modelValue: boolean;
  equipmentTypeId?: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const classifiers = useClassifierStore();
const heroStore = useHeroStore();
const saving = computed(() => heroStore.saving);

const selectedEquipment = ref<Equipment | null>(null);
const amount = ref(1);
const filterText = ref('');

// Reset dialog state when opened (or when equipment type changes)
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      selectedEquipment.value = null;
      amount.value = 1;
      filterText.value = '';
    }
  }
);

// Filter equipment by type (if provided) and search text
const filteredOptions = computed(() => {
  let items = classifiers.equipment;
  if (props.equipmentTypeId) {
    items = items.filter((eq) => eq.equipType.id === props.equipmentTypeId);
  }
  if (filterText.value) {
    const search = filterText.value.toLowerCase();
    items = items.filter((eq) => eq.name.toLowerCase().includes(search));
  }
  return items;
});

function onFilter(val: string, update: (fn: () => void) => void): void {
  update(() => {
    filterText.value = val;
  });
}

async function onAdd(): Promise<void> {
  if (!selectedEquipment.value) return;
  const safeAmount = Number.isFinite(amount.value) ? Math.max(1, Math.floor(amount.value)) : 1;
  await heroStore.addEquipment(selectedEquipment.value.code, safeAmount);
  selectedEquipment.value = null;
  amount.value = 1;
  emit('update:modelValue', false);
}
</script>

<style scoped>
.equipment-add-card {
  min-width: min(400px, 90vw);
  max-width: 500px;
}
</style>
