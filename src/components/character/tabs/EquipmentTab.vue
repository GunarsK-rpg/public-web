<template>
  <div class="equipment-tab">
    <!-- Currency Summary -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row items-center">
        <q-icon name="sym_o_paid" size="md" color="amber" class="q-mr-md" aria-hidden="true" />
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
        <q-list v-if="equipmentByType[eqType.id]?.length" bordered separator>
          <EquipmentItem
            v-for="heroEquip in equipmentByType[eqType.id]"
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
import { ref, computed, watch } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { groupByChainedKey } from 'src/utils/arrayUtils';
import EquipmentItem from './EquipmentItem.vue';
import type { HeroEquipment } from 'src/types';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// Active tab with sync to equipmentTypes (handles async classifier loading)
const activeTab = ref(classifiers.equipmentTypes[0]?.id ?? 0);

// Sync activeTab when equipmentTypes become available (async classifier init)
watch(
  () => classifiers.equipmentTypes,
  (types) => {
    const firstType = types[0];
    if (firstType && activeTab.value === 0) {
      activeTab.value = firstType.id;
    }
  },
  { immediate: true }
);

// Currency value in diamond marks
const totalCurrencyValue = computed(() => heroStore.hero?.currency ?? 0);

// Hero equipment grouped by type (via heroEquip.equipmentId -> equipment.equipTypeId)
const equipmentByType = computed((): Record<number, HeroEquipment[]> => {
  if (!heroStore.hero?.equipment) return {};
  return groupByChainedKey(
    heroStore.hero.equipment,
    'equipmentId',
    classifiers.equipment,
    'equipTypeId'
  );
});
</script>
