<template>
  <div class="actions-tab">
    <!-- Tabs from cl_action_types classifier -->
    <q-tabs v-model="activeTab" dense align="left" class="q-mb-md" narrow-indicator>
      <q-tab
        v-for="actionType in classifiers.actionTypes"
        :key="actionType.id"
        :name="actionType.id"
        :label="actionType.name"
      />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel
        v-for="actionType in classifiers.actionTypes"
        :key="actionType.id"
        :name="actionType.id"
        class="q-pa-none"
      >
        <q-list v-if="actionsByType[actionType.id]?.length" bordered separator>
          <ActionItem
            v-for="action in actionsByType[actionType.id]"
            :key="action.id"
            :action="action"
          />
        </q-list>
        <div v-else class="text-center text-muted q-pa-lg">
          No {{ actionType.name.toLowerCase() }} available.
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById, findByCode } from 'src/utils/arrayUtils';
import ActionItem from './ActionItem.vue';
import type { Action } from 'src/types';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// Default to first action type
const activeTab = ref(classifiers.actionTypes[0]?.id ?? 0);

// Pre-computed actions grouped by type to avoid repeated filter calls
const actionsByType = computed((): Record<number, Action[]> => {
  const result: Record<number, Action[]> = {};
  for (const actionType of classifiers.actionTypes) {
    result[actionType.id] = getActionsByTypeId(actionType.id);
  }
  return result;
});

// Get action type by code
function getActionTypeByCode(code: string) {
  return findByCode(classifiers.actionTypes, code);
}

// Get hero's object IDs by action type
// Returns the set of objectIds the hero has for the given action type
function getHeroObjectIds(actionTypeCode: string): Set<number> {
  const ids = new Set<number>();

  switch (actionTypeCode) {
    case 'equipment':
      // Hero's equipment IDs
      for (const heroEquip of heroStore.hero?.equipment || []) {
        ids.add(heroEquip.equipmentId);
      }
      break;
    case 'talent':
      // Hero's talent IDs
      for (const heroTalent of heroStore.hero?.talents || []) {
        ids.add(heroTalent.talentId);
      }
      break;
    case 'surge':
      // Hero's surge IDs (from radiant order)
      if (heroStore.hero?.radiantOrderId) {
        const order = findById(classifiers.radiantOrders, heroStore.hero.radiantOrderId);
        if (order) {
          ids.add(order.surge1Id);
          ids.add(order.surge2Id);
        }
      }
      break;
  }

  return ids;
}

// Get actions by action type ID
// - Basic actions: everyone has all of them
// - Other types: only actions linked to objects the hero possesses
function getActionsByTypeId(actionTypeId: number): Action[] {
  const actionType = findById(classifiers.actionTypes, actionTypeId);
  if (!actionType) return [];

  // Basic actions - everyone has all of them
  const basicType = getActionTypeByCode('basic');
  if (basicType && actionTypeId === basicType.id) {
    return classifiers.actions.filter((a) => a.actionTypeId === actionTypeId);
  }

  // Other action types - filter by actionLinks
  const heroObjectIds = getHeroObjectIds(actionType.code);
  if (heroObjectIds.size === 0) return [];

  // Find action IDs linked to hero's objects
  const linkedActionIds = new Set<number>();
  for (const link of classifiers.actionLinks) {
    if (heroObjectIds.has(link.objectId)) {
      // Verify the action is of the correct type
      const action = findById(classifiers.actions, link.actionId);
      if (action?.actionTypeId === actionTypeId) {
        linkedActionIds.add(link.actionId);
      }
    }
  }

  return classifiers.actions.filter((a) => linkedActionIds.has(a.id));
}
</script>
