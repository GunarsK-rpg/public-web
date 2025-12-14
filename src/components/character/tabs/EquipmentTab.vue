<template>
  <div class="equipment-tab">
    <!-- Currency Summary -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row items-center">
        <q-icon name="sym_o_paid" size="md" color="amber" class="q-mr-md" />
        <div>
          <div class="text-h6">{{ totalCurrencyValue }} marks</div>
          <div class="text-caption text-muted">Total currency value</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabs from cl_equipment_types classifier -->
    <q-tabs v-model="activeTab" dense align="left" class="q-mb-md" narrow-indicator>
      <q-tab
        v-for="eqType in classifiers.equipmentTypes"
        :key="eqType.id"
        :name="eqType.id"
        :label="eqType.name"
      />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel
        v-for="eqType in classifiers.equipmentTypes"
        :key="eqType.id"
        :name="eqType.id"
        class="q-pa-none"
      >
        <q-list v-if="getEquipmentByTypeId(eqType.id).length > 0" bordered separator>
          <EquipmentItem
            v-for="heroEquip in getEquipmentByTypeId(eqType.id)"
            :key="heroEquip.id"
            :hero-equipment="heroEquip"
          />
        </q-list>
        <div v-else class="text-center text-muted q-pa-lg">
          No {{ eqType.name.toLowerCase() }} in inventory.
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import EquipmentItem from './EquipmentItem.vue';
import type { HeroEquipment } from 'src/types';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// Default to first equipment type
const activeTab = ref(classifiers.equipmentTypes[0]?.id ?? 0);

// Currency value in diamond marks
const totalCurrencyValue = computed(() => heroStore.hero?.currency ?? 0);

// Get hero's equipment filtered by equipment type ID
function getEquipmentByTypeId(typeId: number): HeroEquipment[] {
  if (!heroStore.hero?.equipment) return [];

  return heroStore.hero.equipment.filter((heroEquip) => {
    const eq = classifiers.getById(classifiers.equipment, heroEquip.equipmentId);
    return eq?.equipTypeId === typeId;
  });
}
</script>

<style scoped>
.text-muted {
  color: #6c757d;
}
</style>
