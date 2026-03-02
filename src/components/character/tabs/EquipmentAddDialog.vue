<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="equipment-add-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="equipment-add-card" role="dialog">
      <q-card-section class="row items-center">
        <div id="equipment-add-dialog-title" class="text-h6">
          {{ isEditing ? 'Edit Equipment' : 'Add Equipment' }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense aria-label="Close dialog" v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <!-- Mode toggle (hidden in edit mode) -->
        <q-btn-toggle
          v-if="!isEditing"
          v-model="mode"
          spread
          no-caps
          toggle-color="primary"
          class="q-mb-md"
          :options="[
            { label: 'Classifier', value: 'classifier' },
            { label: 'Custom', value: 'custom' },
          ]"
          aria-label="Equipment mode"
        />

        <!-- Classifier mode -->
        <template v-if="mode === 'classifier'">
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
            :max="MAX_EQUIPMENT_STACK"
            :hint="`Max ${MAX_EQUIPMENT_STACK}`"
            class="q-mt-md"
            aria-label="Amount"
          />
        </template>

        <!-- Custom / Edit mode -->
        <template v-else>
          <q-select
            v-if="!isEditing"
            v-model="customTypeId"
            :options="equipmentTypeOptions"
            label="Type"
            emit-value
            map-options
            aria-label="Equipment type"
          />
          <q-input
            v-model="customName"
            label="Name"
            :placeholder="editBaseName"
            maxlength="100"
            :class="{ 'q-mt-md': !isEditing }"
            aria-label="Custom name"
          />
          <q-input
            v-model="customNotes"
            label="Notes"
            type="textarea"
            autogrow
            class="q-mt-md"
            aria-label="Notes"
          />
          <q-input
            v-if="showMaxCharges"
            v-model.number="customMaxCharges"
            type="number"
            label="Max Charges"
            min="1"
            class="q-mt-md"
            aria-label="Max charges"
          />

          <!-- Modifications (edit mode only) -->
          <template v-if="isEditing">
            <div class="text-subtitle2 q-mt-md q-mb-xs">Modifications</div>
            <q-list v-if="editModifications.length" dense separator>
              <q-item
                v-for="(mod, idx) in editModifications"
                :key="idx"
                :class="mod.type === 'upgrade' ? 'text-positive' : 'text-negative'"
              >
                <q-item-section>
                  {{ mod.type === 'upgrade' ? '+' : '-' }} {{ mod.display_value }}
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="close"
                    aria-label="Remove modification"
                    @click="removeModification(idx)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
            <div class="row no-wrap items-center q-gutter-xs q-mt-xs">
              <q-btn-toggle
                v-model="newModType"
                dense
                no-caps
                toggle-color="primary"
                :options="modTypeOptions"
                aria-label="Modification type"
              />
              <q-input
                v-model="newModValue"
                dense
                outlined
                placeholder="Description"
                class="col"
                aria-label="Modification description"
                @keyup.enter="addModification"
              />
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="add"
                color="primary"
                :disable="!newModValue.trim()"
                aria-label="Add modification"
                @click="addModification"
              />
            </div>
          </template>
        </template>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          flat
          :label="isEditing ? 'Save' : 'Add'"
          color="primary"
          :disable="!canSave || saving"
          :loading="saving"
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import { useHeroStore } from 'src/stores/hero';
import { MAX_EQUIPMENT_STACK } from 'src/constants';
import { clamp } from 'src/utils/numberUtils';
import type { Equipment, HeroEquipment, Modification } from 'src/types';

const props = defineProps<{
  modelValue: boolean;
  equipmentTypeId?: number;
  editItem?: HeroEquipment | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const classifiers = useClassifierStore();
const heroStore = useHeroStore();
const saving = computed(() => heroStore.saving);

const isEditing = computed(() => !!props.editItem);

// Mode: classifier or custom
const mode = ref<'classifier' | 'custom'>('classifier');

// Classifier mode state
const selectedEquipment = ref<Equipment | null>(null);
const amount = ref(1);
const filterText = ref('');

// Custom mode state
const customTypeId = ref<number | null>(null);
const customName = ref('');
const customNotes = ref('');
const customMaxCharges = ref<number | null>(null);

// Reset dialog state when opened
watch([() => props.modelValue, () => props.editItem], () => {
  if (!props.modelValue) return;

  if (props.editItem) {
    // Edit mode: force custom view, pre-fill from existing item
    mode.value = 'custom';
    customTypeId.value = props.editItem.equipType?.id ?? null;
    customName.value = props.editItem.customName || props.editItem.equipment?.name || '';
    customNotes.value = props.editItem.notes || '';
    customMaxCharges.value = props.editItem.maxCharges;
    editModifications.value = [...(props.editItem.modifications || [])];
    newModType.value = 'upgrade';
    newModValue.value = '';
    // Not used in edit mode but reset for cleanliness
    selectedEquipment.value = null;
    amount.value = 1;
    filterText.value = '';
  } else {
    // Add mode: reset everything
    mode.value = 'classifier';
    selectedEquipment.value = null;
    amount.value = 1;
    filterText.value = '';
    customTypeId.value = props.equipmentTypeId ?? null;
    customName.value = '';
    customNotes.value = '';
    customMaxCharges.value = null;
  }
});

// Equipment type options for custom mode
const equipmentTypeOptions = computed(() =>
  classifiers.equipmentTypes.map((t) => ({ value: t.id, label: t.name }))
);

const selectedTypeCode = computed(() => {
  if (!customTypeId.value) return '';
  return classifiers.equipmentTypes.find((t) => t.id === customTypeId.value)?.code ?? '';
});

const isFabrialType = computed(() => selectedTypeCode.value === 'fabrial');

const showMaxCharges = computed(
  () => isFabrialType.value || (isEditing.value && props.editItem?.maxCharges != null)
);

const editBaseName = computed(() => {
  if (!props.editItem?.equipment) return '';
  const eq = classifiers.equipment.find((e) => e.id === props.editItem!.equipment!.id);
  return eq?.name ?? props.editItem.equipment.name;
});

// Modification editing (edit mode)
const editModifications = ref<Modification[]>([]);
const newModType = ref<'upgrade' | 'drawback'>('upgrade');
const newModValue = ref('');
const modTypeOptions = [
  { label: 'Upgrade', value: 'upgrade' },
  { label: 'Drawback', value: 'drawback' },
];

function removeModification(idx: number): void {
  editModifications.value = editModifications.value.filter((_, i) => i !== idx);
}

function addModification(): void {
  const trimmed = newModValue.value.trim();
  if (!trimmed) return;
  editModifications.value = [
    ...editModifications.value,
    { type: newModType.value, display_value: trimmed },
  ];
  newModValue.value = '';
}

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

const canSave = computed(() => {
  if (isEditing.value) {
    // Custom equipment (no classifier) requires a name
    if (!props.editItem?.equipment) {
      return customName.value.trim().length > 0;
    }
    return true;
  }
  if (mode.value === 'classifier') {
    return selectedEquipment.value && Number.isFinite(amount.value) && amount.value >= 1;
  }
  return customTypeId.value && customName.value.trim().length > 0;
});

function onFilter(val: string, update: (fn: () => void) => void): void {
  update(() => {
    filterText.value = val;
  });
}

async function onSave(): Promise<void> {
  if (isEditing.value) {
    const item = props.editItem!;
    const changes: Parameters<typeof heroStore.updateEquipment>[1] = {};
    const trimmedName = customName.value.trim();
    // If name matches the base classifier name, clear the override
    const baseName = item.equipment?.name ?? editBaseName.value;
    changes.customName = trimmedName && trimmedName !== baseName ? trimmedName : null;
    changes.notes = customNotes.value.trim() || null;
    if (customMaxCharges.value != null && customMaxCharges.value > 0) {
      changes.maxCharges = customMaxCharges.value;
    } else if (item.maxCharges != null) {
      changes.maxCharges = null;
    }
    changes.modifications = editModifications.value;
    await heroStore.updateEquipment(item.id, changes);
    emit('update:modelValue', false);
    return;
  }

  if (mode.value === 'classifier') {
    if (!selectedEquipment.value) return;
    const safeAmount = Number.isFinite(amount.value)
      ? clamp(Math.floor(amount.value), 1, MAX_EQUIPMENT_STACK)
      : 1;
    const success = await heroStore.addEquipment(
      selectedEquipment.value.code,
      safeAmount,
      selectedEquipment.value.maxCharges
    );
    if (!success) return;
  } else {
    if (!customTypeId.value || !customName.value.trim()) return;
    const opts: { notes?: string; maxCharges?: number } = {};
    const trimmedNotes = customNotes.value.trim();
    if (trimmedNotes) opts.notes = trimmedNotes;
    if (isFabrialType.value && customMaxCharges.value != null && customMaxCharges.value > 0) {
      opts.maxCharges = customMaxCharges.value;
    }
    const success = await heroStore.addCustomEquipment(
      selectedTypeCode.value,
      customName.value.trim(),
      opts
    );
    if (!success) return;
  }
  emit('update:modelValue', false);
}
</script>

<style scoped>
.equipment-add-card {
  min-width: min(400px, 90vw);
  max-width: 500px;
}
</style>
