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
        <q-btn flat round dense aria-label="Close dialog" v-close-popup><X :size="20" /></q-btn>
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
            <q-list v-if="localModifications.length" dense separator>
              <q-item v-for="mod in localModifications" :key="mod.id">
                <q-item-section>
                  <ModificationLabel :mod="mod" />
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    :disable="modBusy"
                    aria-label="Remove modification"
                    @click="removeModification(mod.id)"
                    ><X :size="20"
                  /></q-btn>
                </q-item-section>
              </q-item>
            </q-list>

            <!-- Add classifier modification -->
            <div
              v-if="availableModifications.length"
              class="row no-wrap items-center q-gutter-xs q-mt-xs"
            >
              <q-select
                v-model="selectedModification"
                :options="availableModifications"
                option-label="name"
                dense
                outlined
                label="Add modification"
                class="col"
                clearable
                behavior="menu"
                aria-label="Select modification"
              />
              <q-btn
                flat
                dense
                round
                size="sm"
                color="primary"
                :disable="!selectedModification || modBusy"
                aria-label="Add classifier modification"
                @click="addClassifierModification"
                ><Plus :size="20"
              /></q-btn>
            </div>

            <!-- Add custom text modification -->
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
                placeholder="Custom modification"
                class="col"
                aria-label="Custom modification text"
                @keyup.enter="addCustomModification"
              />
              <q-btn
                flat
                dense
                round
                size="sm"
                color="primary"
                :disable="!newModValue.trim() || modBusy"
                aria-label="Add custom modification"
                @click="addCustomModification"
                ><Plus :size="20"
              /></q-btn>
            </div>
          </template>

          <!-- Stat overrides (edit mode or custom add mode) -->
          <template v-if="showStatEditor">
            <div class="text-subtitle2 q-mt-md q-mb-xs">Stats</div>
            <q-select
              v-if="showDamage"
              v-model="statDamageValue"
              :options="dieSizeOptions"
              label="Damage Die"
              emit-value
              map-options
              dense
              outlined
              clearable
              class="q-mt-xs"
              aria-label="Damage die"
            />
            <q-input
              v-if="showRange"
              v-model="statRange"
              label="Range"
              placeholder="e.g. Melee, 80/320"
              dense
              outlined
              class="q-mt-xs"
              aria-label="Range"
            />
            <q-input
              v-if="showDeflect"
              v-model.number="statDeflect"
              type="number"
              label="Deflect"
              min="0"
              dense
              outlined
              class="q-mt-xs"
              aria-label="Deflect"
            />
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
import { X, Plus } from 'lucide-vue-next';
import ModificationLabel from './ModificationLabel.vue';
import { useHeroStore } from 'src/stores/hero';
import { useErrorHandler } from 'src/composables/useErrorHandler';
import { MAX_EQUIPMENT_STACK } from 'src/constants';
import { clamp } from 'src/utils/numberUtils';
import { getSpecialByType, SPECIAL } from 'src/utils/specialUtils';
import {
  getEffectiveSpecial,
  mergeSpecial,
  recalculateSpecialFromMods,
} from 'src/utils/equipmentStats';
import equipmentApi from 'src/services/equipmentApi';
import type {
  Equipment,
  HeroEquipment,
  AppliedModification,
  ModificationClassifier,
} from 'src/types';
import type { SpecialEntry } from 'src/types/shared';
import { DIE_SIZES } from 'src/utils/equipmentStats';

const dieSizeOptions = DIE_SIZES.map((d) => ({ value: d, label: `d${d}` }));

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
const { handleError } = useErrorHandler();
const saving = computed(() => heroStore.saving);
const modBusy = ref(false);

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

// Modification state (edit mode)
const localModifications = ref<AppliedModification[]>([]);
const selectedModification = ref<ModificationClassifier | null>(null);
const newModType = ref<'upgrade' | 'drawback'>('upgrade');
const newModValue = ref('');
const modTypeOptions = [
  { label: 'Upgrade', value: 'upgrade' },
  { label: 'Drawback', value: 'drawback' },
];

// Stat override state
const statDamageValue = ref<number | null>(null);
const statRange = ref('');
const statDeflect = ref<number | null>(null);

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
    localModifications.value = [...props.editItem.modifications];
    selectedModification.value = null;
    newModType.value = 'upgrade';
    newModValue.value = '';
    syncStatInputs(props.editItem);
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
    localModifications.value = [];
    statDamageValue.value = null;
    statRange.value = '';
    statDeflect.value = null;
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

// Available classifier modifications (filtered by category + equipment)
const availableModifications = computed(() => {
  const editEquipmentId = props.editItem?.equipment?.id;
  const typeCode = isEditing.value
    ? (props.editItem?.equipType?.code ?? '')
    : selectedTypeCode.value;
  const isFabrial = typeCode === 'fabrial';

  // Already-applied classifier mod codes
  const appliedCodes = new Set(
    localModifications.value.filter((m) => m.modification !== null).map((m) => m.modification!.code)
  );

  return classifiers.modifications.filter((mod) => {
    // Skip already applied
    if (appliedCodes.has(mod.code)) return false;
    // Equipment-specific mod: only for that equipment
    if (mod.equipment) return mod.equipment.id === editEquipmentId;
    // Category filter: fabrials can pick from both pools
    if (isFabrial) return true;
    return mod.category === 'item';
  });
});

// Stat editor visibility
const editTypeCode = computed(() => props.editItem?.equipType?.code ?? '');

const showStatEditor = computed(() => {
  if (isEditing.value) return showDamage.value || showRange.value || showDeflect.value;
  // Custom add mode: show if type is selected
  return mode.value === 'custom' && customTypeId.value != null;
});

const showDamage = computed(() => {
  if (isEditing.value) {
    const code = editTypeCode.value;
    if (code === 'weapon' || code === 'fabrial') return true;
    // Show if item already has damage
    const eff = props.editItem ? getEffectiveSpecial(props.editItem) : [];
    return !!getSpecialByType(eff, SPECIAL.DAMAGE);
  }
  const code = selectedTypeCode.value;
  return code === 'weapon' || code === 'fabrial';
});

const showRange = computed(() => {
  if (isEditing.value) {
    if (editTypeCode.value === 'weapon') return true;
    const eff = props.editItem ? getEffectiveSpecial(props.editItem) : [];
    return !!getSpecialByType(eff, SPECIAL.RANGE);
  }
  return selectedTypeCode.value === 'weapon';
});

const showDeflect = computed(() => {
  if (isEditing.value) {
    const code = editTypeCode.value;
    if (code === 'armor' || code === 'fabrial') return true;
    const eff = props.editItem ? getEffectiveSpecial(props.editItem) : [];
    return !!getSpecialByType(eff, SPECIAL.DEFLECT);
  }
  const code = selectedTypeCode.value;
  return code === 'armor' || code === 'fabrial';
});

function syncStatInputs(item: HeroEquipment): void {
  const eff = getEffectiveSpecial(item);
  const damage = getSpecialByType(eff, SPECIAL.DAMAGE);
  statDamageValue.value = damage?.value ?? null;
  const range = getSpecialByType(eff, SPECIAL.RANGE);
  statRange.value = range?.display_value ?? '';
  const deflect = getSpecialByType(eff, SPECIAL.DEFLECT);
  statDeflect.value = deflect?.value ?? null;
}

function buildStatOverrides(): SpecialEntry[] {
  const overrides: SpecialEntry[] = [];
  if (statDamageValue.value != null) {
    overrides.push({
      type: SPECIAL.DAMAGE,
      display_value: '1d{dice_size}',
      value: statDamageValue.value,
    });
  }
  if (statRange.value.trim()) {
    overrides.push({ type: SPECIAL.RANGE, display_value: statRange.value.trim() });
  }
  if (statDeflect.value != null && statDeflect.value > 0) {
    overrides.push({ type: SPECIAL.DEFLECT, value: statDeflect.value });
  }
  return overrides;
}

// Modification management (calls API directly)
async function addClassifierModification(): Promise<void> {
  if (!selectedModification.value || !props.editItem || !heroStore.hero) return;
  modBusy.value = true;
  try {
    const response = await equipmentApi.addModification(heroStore.hero.id, props.editItem.id, {
      equipmentId: props.editItem.id,
      modification: { code: selectedModification.value.code },
    });
    const updated = response.data;
    localModifications.value = updated.modifications;
    selectedModification.value = null;
    // Recalculate and save overrides from new mod list
    const newOverrides = recalculateSpecialFromMods(updated.special, updated.modifications);
    await heroStore.updateEquipment(updated.id, { specialOverrides: newOverrides });
    syncStatInputs({ ...updated, specialOverrides: newOverrides });
  } catch (err) {
    handleError(err as Error, { message: 'Failed to add modification' });
  } finally {
    modBusy.value = false;
  }
}

async function addCustomModification(): Promise<void> {
  const trimmed = newModValue.value.trim();
  if (!trimmed || !props.editItem || !heroStore.hero) return;
  modBusy.value = true;
  try {
    const response = await equipmentApi.addModification(heroStore.hero.id, props.editItem.id, {
      equipmentId: props.editItem.id,
      customText: trimmed,
      modType: newModType.value,
    });
    const updated = response.data;
    localModifications.value = updated.modifications;
    newModValue.value = '';
    // Custom text mods don't have special effects, but recalculate for consistency
    const newOverrides = recalculateSpecialFromMods(updated.special, updated.modifications);
    await heroStore.updateEquipment(updated.id, { specialOverrides: newOverrides });
    syncStatInputs({ ...updated, specialOverrides: newOverrides });
  } catch (err) {
    handleError(err as Error, { message: 'Failed to add modification' });
  } finally {
    modBusy.value = false;
  }
}

async function removeModification(modId: number): Promise<void> {
  if (!props.editItem || !heroStore.hero) return;
  modBusy.value = true;
  try {
    await equipmentApi.removeModification(heroStore.hero.id, props.editItem.id, modId);
    localModifications.value = localModifications.value.filter((m) => m.id !== modId);
    // Recalculate from remaining mods
    const baseSpecial = props.editItem.special;
    const newOverrides = recalculateSpecialFromMods(baseSpecial, localModifications.value);
    await heroStore.updateEquipment(props.editItem.id, { specialOverrides: newOverrides });
    syncStatInputs({
      ...props.editItem,
      specialOverrides: newOverrides,
      modifications: localModifications.value,
    });
  } catch (err) {
    handleError(err as Error, { message: 'Failed to remove modification' });
  } finally {
    modBusy.value = false;
  }
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
    // Merge mod-derived overrides with manual stat edits (stat entries win per type)
    const modOverrides = recalculateSpecialFromMods(item.special, localModifications.value);
    changes.specialOverrides = mergeSpecial(modOverrides, buildStatOverrides());
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
    const opts: { notes?: string; maxCharges?: number; specialOverrides?: SpecialEntry[] } = {};
    const trimmedNotes = customNotes.value.trim();
    if (trimmedNotes) opts.notes = trimmedNotes;
    if (isFabrialType.value && customMaxCharges.value != null && customMaxCharges.value > 0) {
      opts.maxCharges = customMaxCharges.value;
    }
    const statOverrides = buildStatOverrides();
    if (statOverrides.length) opts.specialOverrides = statOverrides;
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
