<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Customize your equipment and currency</div>

    <!-- Starting Kit Summary -->
    <q-banner v-if="selectedStartingKit" class="banner-info q-mb-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_backpack" aria-hidden="true" />
      </template>
      <div class="row items-center">
        <div class="col">
          <strong>{{ selectedStartingKit.name }}</strong>
          <div class="text-caption">{{ selectedStartingKit.description }}</div>
        </div>
        <div class="col-auto">
          <q-badge color="grey-7">{{ selectedStartingKit.startingSpheres }} marks</q-badge>
        </div>
      </div>
    </q-banner>

    <!-- Currency -->
    <div class="text-subtitle2 q-mb-sm">Currency (Diamond Marks)</div>
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-6 col-sm-4 col-md-3">
        <q-input
          :model-value="heroCurrency"
          label="Diamond Marks"
          type="number"
          outlined
          dense
          :min="0"
          :max="999999"
          @update:model-value="setCurrencyAmount"
        />
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Equipment from Starting Kit -->
    <InfoBanner
      v-if="startingKitEquipmentNames.length > 0"
      icon="sym_o_inventory_2"
      :content="`Equipment from starting kit: ${startingKitEquipmentNames.join(', ')}`"
    />

    <!-- Equipment by Type -->
    <div v-for="eqType in equipmentTypesList" :key="eqType.id" class="q-mb-lg">
      <div class="text-subtitle2 q-mb-sm">{{ eqType.name }}</div>

      <!-- Items of this type -->
      <q-list v-if="equipmentByType[eqType.id]?.length" bordered separator>
        <q-item v-for="item in equipmentByType[eqType.id]" :key="item.id">
          <q-item-section>
            <q-item-label>{{ getEquipmentName(item.equipment.id) }}</q-item-label>
            <q-item-label caption>Qty: {{ item.amount }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              round
              icon="sym_o_delete"
              color="negative"
              size="sm"
              :aria-label="`Remove ${getEquipmentName(item.equipment.id)}`"
              @click="removeItem(item.equipment.id)"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="text-caption text-muted q-pa-sm">No {{ eqType.name.toLowerCase() }}</div>

      <!-- Add item of this type -->
      <div class="row items-center q-mt-sm q-gutter-sm">
        <q-select
          :model-value="newEquipmentByType[eqType.id]"
          :options="getAvailableByType(eqType.id)"
          :label="`Add ${eqType.name}`"
          outlined
          dense
          emit-value
          map-options
          clearable
          class="col equipment-select"
          @update:model-value="(val) => (newEquipmentByType[eqType.id] = val)"
        />
        <q-btn
          v-if="newEquipmentByType[eqType.id]"
          color="primary"
          icon="sym_o_add"
          dense
          :aria-label="`Add ${eqType.name} item`"
          @click="addItemOfType(eqType.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroEquipmentStore } from 'src/stores/heroEquipment';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById } from 'src/utils/arrayUtils';
import { normalizeModifierInput } from 'src/composables/useModifierInput';
import InfoBanner from '../shared/InfoBanner.vue';
import type { ClassifierRef } from 'src/types';

const heroStore = useHeroStore();
const equipStore = useHeroEquipmentStore();
const classifiers = useClassifierStore();

// Equipment types list from classifiers
const equipmentTypesList = computed(() => classifiers.equipmentTypes);

// Track new equipment selection per type
const newEquipmentByType = reactive<Record<number, number | null>>({});

// Get selected starting kit
const selectedStartingKit = computed(() =>
  findById(classifiers.startingKits, heroStore.hero?.startingKit?.id)
);

// Hero's currency (diamond marks)
const heroCurrency = computed(() => heroStore.hero?.currency ?? 0);

// Hero equipment list
const heroEquipment = computed(() => heroStore.equipment);

// Get equipment names from starting kit
const startingKitEquipmentNames = computed(() => {
  const kit = selectedStartingKit.value;
  if (!kit?.equipment) return [];
  return kit.equipment
    .map((e: ClassifierRef & { quantity: number }) => {
      const name = findById(classifiers.equipment, e.id)?.name;
      if (!name) return null;
      return e.quantity > 1 ? `${name} x${e.quantity}` : name;
    })
    .filter((name): name is string => name !== null);
});

// Pre-computed equipment lookup maps for O(1) access
const equipmentMaps = computed(() => {
  const nameMap = new Map<number, string>();
  const typeMap = new Map<number, number>(); // equipmentId -> equipTypeId
  for (const eq of classifiers.equipment) {
    nameMap.set(eq.id, eq.name);
    typeMap.set(eq.id, eq.equipType.id);
  }
  return { nameMap, typeMap };
});

function getEquipmentName(equipmentId: number): string {
  return equipmentMaps.value.nameMap.get(equipmentId) ?? 'Unknown';
}

// Pre-computed equipment grouped by type using O(n) single pass
const equipmentByType = computed(() => {
  const result: Record<number, typeof heroEquipment.value> = {};
  // Initialize empty arrays for all types
  for (const eqType of equipmentTypesList.value) {
    result[eqType.id] = [];
  }
  // Single pass through hero equipment - O(n)
  for (const item of heroEquipment.value) {
    const typeId = equipmentMaps.value.typeMap.get(item.equipment.id);
    if (typeId !== undefined && result[typeId]) {
      result[typeId].push(item);
    }
  }
  return result;
});

// Get available equipment options for a specific type
function getAvailableByType(typeId: number) {
  return classifiers.equipment
    .filter((e) => e.equipType.id === typeId)
    .map((e) => ({ value: e.id, label: e.name }));
}

function setCurrencyAmount(val: string | number | null) {
  const normalized = normalizeModifierInput(val, 0, 999999);
  if (normalized !== null) {
    equipStore.setCurrency(normalized);
  }
}

function addItemOfType(typeId: number) {
  const equipmentId = newEquipmentByType[typeId];
  if (equipmentId != null) {
    equipStore.addEquipment(equipmentId, 1);
    newEquipmentByType[typeId] = null;
  }
}

function removeItem(equipmentId: number) {
  equipStore.removeEquipment(equipmentId);
}
</script>

<style scoped>
.equipment-select {
  max-width: min(300px, 90vw);
}
</style>
