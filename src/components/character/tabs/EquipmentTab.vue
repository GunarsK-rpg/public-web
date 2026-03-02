<template>
  <div class="equipment-tab">
    <!-- Currency Summary -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row items-center">
        <q-icon
          name="sym_o_paid"
          size="md"
          :color="RPG_COLORS.currency"
          class="q-mr-md"
          aria-hidden="true"
        />
        <div>
          <div class="text-h6">{{ totalCurrencyValue }} marks</div>
          <div class="text-caption text-muted">Total currency value</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabs from cl_equipment_types classifier -->
    <q-tabs
      v-model="activeTab"
      dense
      align="left"
      class="q-mb-md"
      narrow-indicator
      mobile-arrows
      outside-arrows
    >
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
            @edit="openEditDialog(heroEquip)"
          />
        </q-list>
        <div v-else class="text-center text-muted q-pa-lg">
          No {{ eqType.name.toLowerCase() }} in inventory.
        </div>
        <div class="q-pa-sm q-mt-xs">
          <q-btn
            flat
            dense
            icon="add"
            :label="`Add ${eqType.name}`"
            color="primary"
            size="sm"
            @click="openAddDialog(eqType.id)"
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <EquipmentAddDialog
      v-model="showAddDialog"
      :equipment-type-id="addDialogTypeId"
      :edit-item="editDialogItem"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById } from 'src/utils/arrayUtils';
import { RPG_COLORS } from 'src/constants/theme';
import EquipmentItem from './EquipmentItem.vue';
import EquipmentAddDialog from './EquipmentAddDialog.vue';
import type { HeroEquipment } from 'src/types';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// Sentinel value for uninitialized tab state (equipment type IDs are always >= 1)
const UNINITIALIZED_TAB = -1;

// Active tab with sync to equipmentTypes (handles async classifier loading)
const activeTab = ref(classifiers.equipmentTypes[0]?.id ?? UNINITIALIZED_TAB);

// Sync activeTab when equipmentTypes become available (async classifier init)
watch(
  () => classifiers.equipmentTypes,
  (types) => {
    const firstType = types[0];
    if (firstType && activeTab.value === UNINITIALIZED_TAB) {
      activeTab.value = firstType.id;
    }
  },
  { immediate: true }
);

// Dialog state (shared for add and edit)
const showAddDialog = ref(false);
const addDialogTypeId = ref(0);
const editDialogItem = ref<HeroEquipment | null>(null);

function openAddDialog(equipmentTypeId: number): void {
  editDialogItem.value = null;
  addDialogTypeId.value = equipmentTypeId;
  showAddDialog.value = true;
}

function openEditDialog(item: HeroEquipment): void {
  editDialogItem.value = item;
  addDialogTypeId.value = 0;
  showAddDialog.value = true;
}

// Currency value in diamond marks
const totalCurrencyValue = computed(() => heroStore.hero?.currency ?? 0);

// Hero equipment grouped by type (via equipType or classifier lookup)
const equipmentByType = computed((): Record<number, HeroEquipment[]> => {
  if (!heroStore.hero?.equipment) return {};
  const result: Record<number, HeroEquipment[]> = {};
  for (const heroEquip of heroStore.hero.equipment) {
    const typeId =
      heroEquip.equipType?.id ??
      findById(classifiers.equipment, heroEquip.equipment?.id ?? 0)?.equipType.id;
    if (!typeId) continue;
    if (!result[typeId]) result[typeId] = [];
    result[typeId].push(heroEquip);
  }
  return result;
});
</script>
