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

    <!-- Equipment List -->
    <div class="text-subtitle2 q-mb-sm">Your Equipment</div>
    <q-list v-if="equipment.length > 0" bordered separator>
      <q-item v-for="(item, index) in equipment" :key="index">
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
    <div v-else class="text-caption text-muted q-pa-md">
      No equipment added yet. Add equipment below or it will be populated from your starting kit.
    </div>

    <!-- Add Equipment -->
    <div class="q-mt-md">
      <q-select
        v-model="newEquipmentId"
        :options="availableEquipment"
        label="Add Equipment"
        outlined
        emit-value
        map-options
        clearable
      />
      <q-btn
        v-if="newEquipmentId"
        color="primary"
        label="Add"
        icon="sym_o_add"
        class="q-mt-sm"
        @click="addItem"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCharacterCreationStore } from 'stores/character-creation';
import { useClassifierStore } from 'stores/classifiers';

const store = useCharacterCreationStore();
const classifiers = useClassifierStore();

const newEquipmentId = ref<number | null>(null);

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

const availableEquipment = computed(() =>
  classifiers.equipment.map((e) => ({ value: e.id, label: e.name }))
);

function getEquipmentName(id: number): string {
  return classifiers.equipment.find((e) => e.id === id)?.name || 'Unknown';
}

function addItem() {
  if (newEquipmentId.value) {
    store.addEquipmentItem({
      equipmentId: newEquipmentId.value,
      quantity: 1,
      isEquipped: false,
    });
    newEquipmentId.value = null;
  }
}

function removeItem(equipmentId: number) {
  store.removeEquipmentItem(equipmentId);
}
</script>
