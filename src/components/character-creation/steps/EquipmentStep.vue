<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Customize your equipment and currency</div>

    <!-- Starting Kit Summary -->
    <q-banner v-if="selectedStartingKit" class="banner-info q-mb-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_backpack" />
      </template>
      <div class="row items-center">
        <div class="col">
          <strong>{{ selectedStartingKit.name }}</strong>
          <div class="text-caption">{{ selectedStartingKit.description }}</div>
        </div>
        <div class="col-auto">
          <q-badge v-if="rolledSpheres !== undefined" color="positive">
            {{ rolledSpheres }} marks rolled
          </q-badge>
          <q-badge v-else color="grey-7"> {{ selectedStartingKit.startingSpheres }} marks </q-badge>
        </div>
      </div>
    </q-banner>

    <!-- Currency -->
    <div class="row items-center q-mb-md">
      <div class="text-subtitle2">Total Spheres</div>
      <q-space />
      <q-input
        v-model.number="spheres"
        type="number"
        outlined
        dense
        style="width: 120px"
        :min="0"
      />
    </div>

    <q-separator class="q-my-md" />

    <!-- Equipment from Starting Kit -->
    <q-banner v-if="startingKitEquipmentNames.length > 0" class="banner-info q-mb-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_inventory_2" />
      </template>
      Equipment from starting kit: {{ startingKitEquipmentNames.join(', ') }}
    </q-banner>

    <!-- Equipment by Type -->
    <div v-for="eqType in equipmentTypesList" :key="eqType.id" class="q-mb-lg">
      <div class="text-subtitle2 q-mb-sm">{{ eqType.name }}</div>

      <!-- Items of this type -->
      <q-list v-if="getEquipmentByType(eqType.id).length > 0" bordered separator>
        <q-item v-for="item in getEquipmentByType(eqType.id)" :key="item.equipmentId">
          <q-item-section>
            <q-item-label>{{ getEquipmentName(item.equipmentId) }}</q-item-label>
            <q-item-label caption>Qty: {{ item.quantity }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              round
              icon="sym_o_delete"
              color="negative"
              size="sm"
              @click="removeItem(item.equipmentId)"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="text-caption text-muted q-pa-sm">No {{ eqType.name.toLowerCase() }}</div>

      <!-- Add item of this type -->
      <div class="row items-center q-mt-sm q-gutter-sm">
        <q-select
          v-model="newEquipmentByType[eqType.id]"
          :options="getAvailableByType(eqType.id)"
          :label="`Add ${eqType.name}`"
          outlined
          dense
          emit-value
          map-options
          clearable
          class="col"
          style="max-width: 300px"
        />
        <q-btn
          v-if="newEquipmentByType[eqType.id]"
          color="primary"
          icon="sym_o_add"
          dense
          @click="addItemOfType(eqType.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useCharacterCreationStore } from 'stores/character-creation';
import { useClassifierStore } from 'stores/classifiers';
import { equipmentTypes } from 'src/mock/equipment';

const store = useCharacterCreationStore();
const classifiers = useClassifierStore();

// Equipment types list for iteration
const equipmentTypesList = equipmentTypes;

// Track new equipment selection per type
const newEquipmentByType = reactive<Record<number, number | null>>({
  1: null, // weapon
  2: null, // armor
  3: null, // fabrial
  4: null, // consumable
  5: null, // gear
});

// Get selected starting kit from the previous step
const selectedStartingKit = computed(() =>
  classifiers.getStartingKitById(store.startingKit.startingKitId)
);

const rolledSpheres = computed(() => store.startingKit.rolledSpheres);

const spheres = computed({
  get: () => store.equipment.spheres,
  set: (val) => store.updateEquipment({ spheres: val }),
});
const equipment = computed(() => store.equipment.equipment);

// Get equipment names from starting kit
const startingKitEquipmentNames = computed(() => {
  const kit = selectedStartingKit.value;
  if (!kit?.equipment) return [];
  return kit.equipment
    .map((e) => {
      const item = classifiers.getEquipmentById(e.equipmentId);
      if (!item) return null;
      return e.quantity > 1 ? `${item.name} x${e.quantity}` : item.name;
    })
    .filter((name): name is string => name !== null);
});

// Get equipment items grouped by type
function getEquipmentByType(typeId: number) {
  return equipment.value.filter((item) => {
    const eq = classifiers.getEquipmentById(item.equipmentId);
    return eq?.equipTypeId === typeId;
  });
}

// Get available equipment options for a specific type
function getAvailableByType(typeId: number) {
  return classifiers.equipment
    .filter((e) => e.equipTypeId === typeId)
    .map((e) => ({ value: e.id, label: e.name }));
}

function getEquipmentName(id: number): string {
  return classifiers.equipment.find((e) => e.id === id)?.name || 'Unknown';
}

function addItemOfType(typeId: number) {
  const equipmentId = newEquipmentByType[typeId];
  if (equipmentId) {
    store.addEquipmentItem({
      equipmentId,
      quantity: 1,
      isEquipped: false,
    });
    newEquipmentByType[typeId] = null;
  }
}

function removeItem(equipmentId: number) {
  store.removeEquipmentItem(equipmentId);
}
</script>
