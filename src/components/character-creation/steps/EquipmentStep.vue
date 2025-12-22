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
          @update:model-value="setCurrencyAmount"
        />
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Equipment from Starting Kit -->
    <q-banner v-if="startingKitEquipmentNames.length > 0" class="banner-info q-mb-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_inventory_2" aria-hidden="true" />
      </template>
      Equipment from starting kit: {{ startingKitEquipmentNames.join(', ') }}
    </q-banner>

    <!-- Equipment by Type -->
    <div v-for="eqType in equipmentTypesList" :key="eqType.id" class="q-mb-lg">
      <div class="text-subtitle2 q-mb-sm">{{ eqType.name }}</div>

      <!-- Items of this type -->
      <q-list v-if="equipmentByType[eqType.id]?.length" bordered separator>
        <q-item v-for="item in equipmentByType[eqType.id]" :key="item.equipmentId">
          <q-item-section>
            <q-item-label>{{ getEquipmentName(item.equipmentId) }}</q-item-label>
            <q-item-label caption>Qty: {{ item.amount }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              round
              icon="sym_o_delete"
              color="negative"
              size="sm"
              aria-label="Remove item"
              @click="removeItem(item.equipmentId)"
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
          class="col"
          style="max-width: 300px"
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
import { useClassifierStore } from 'src/stores/classifiers';
import { findById } from 'src/utils/arrayUtils';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// Equipment types list from classifiers
const equipmentTypesList = computed(() => classifiers.equipmentTypes);

// Track new equipment selection per type
const newEquipmentByType = reactive<Record<number, number | null>>({});

// Get selected starting kit
const selectedStartingKit = computed(() =>
  findById(classifiers.startingKits, heroStore.hero?.startingKitId)
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
    .map((e: { equipmentId: number; quantity: number }) => {
      const name = findById(classifiers.equipment, e.equipmentId)?.name;
      if (!name) return null;
      return e.quantity > 1 ? `${name} x${e.quantity}` : name;
    })
    .filter((name): name is string => name !== null);
});

// Pre-computed equipment name lookup to avoid repeated findById calls in template
const equipmentNamesMap = computed(() => {
  const map = new Map<number, string>();
  for (const eq of classifiers.equipment) {
    map.set(eq.id, eq.name);
  }
  return map;
});

function getEquipmentName(equipmentId: number): string {
  return equipmentNamesMap.value.get(equipmentId) ?? 'Unknown';
}

// Pre-computed equipment grouped by type to avoid repeated filter calls
const equipmentByType = computed(() => {
  const result: Record<number, typeof heroEquipment.value> = {};
  for (const eqType of equipmentTypesList.value) {
    result[eqType.id] = heroEquipment.value.filter((item) => {
      const eq = findById(classifiers.equipment, item.equipmentId);
      return eq?.equipTypeId === eqType.id;
    });
  }
  return result;
});

// Get available equipment options for a specific type
function getAvailableByType(typeId: number) {
  return classifiers.equipment
    .filter((e) => e.equipTypeId === typeId)
    .map((e) => ({ value: e.id, label: e.name }));
}

function setCurrencyAmount(val: string | number | null) {
  if (val === null) return;
  const numVal = typeof val === 'string' ? Number(val) : val;
  if (Number.isNaN(numVal)) return;
  heroStore.setCurrency(Math.max(0, numVal));
}

function addItemOfType(typeId: number) {
  const equipmentId = newEquipmentByType[typeId];
  if (equipmentId) {
    heroStore.addEquipment(equipmentId, 1);
    newEquipmentByType[typeId] = null;
  }
}

function removeItem(equipmentId: number) {
  heroStore.removeEquipment(equipmentId);
}
</script>
