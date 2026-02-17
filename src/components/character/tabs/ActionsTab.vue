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

// Pre-compute action links map for O(1) lookup: objectId → Set<actionId>
const actionLinksMap = computed(() => {
  const map = new Map<number, Set<number>>();
  for (const link of classifiers.actionLinks) {
    if (!map.has(link.objectId)) {
      map.set(link.objectId, new Set());
    }
    map.get(link.objectId)!.add(link.action.id);
  }
  return map;
});

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

// Configuration map for extracting hero object IDs by action type
const heroObjectExtractors: Record<string, () => number[]> = {
  equipment: () => (heroStore.hero?.equipment || []).map((e) => e.equipment.id),
  talent: () => (heroStore.hero?.talents || []).map((t) => t.talent.id),
  surge: () => {
    const order = heroStore.hero?.radiantOrder;
    if (!order) return [];
    const fullOrder = findById(classifiers.radiantOrders, order.id);
    return fullOrder ? [fullOrder.surge1.id, fullOrder.surge2.id] : [];
  },
};

// Get hero's object IDs by action type
// Returns the set of objectIds the hero has for the given action type
function getHeroObjectIds(actionTypeCode: string): Set<number> {
  const extractor = heroObjectExtractors[actionTypeCode];
  return new Set(extractor ? extractor() : []);
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
    return classifiers.actions.filter((a) => a.actionType.id === actionTypeId);
  }

  // Stormlight actions - all Radiants have them
  const stormlightType = getActionTypeByCode('stormlight');
  if (stormlightType && actionTypeId === stormlightType.id) {
    if (!heroStore.hero?.radiantOrder) return [];
    return classifiers.actions.filter((a) => a.actionType.id === actionTypeId);
  }

  // Other action types - filter by actionLinks using pre-computed map
  const heroObjectIds = getHeroObjectIds(actionType.code);
  if (heroObjectIds.size === 0) return [];

  // Find action IDs linked to hero's objects using O(1) map lookup
  const linkedActionIds = new Set<number>();
  for (const objectId of heroObjectIds) {
    const actionIds = actionLinksMap.value.get(objectId);
    if (actionIds) {
      for (const actionId of actionIds) {
        const action = findById(classifiers.actions, actionId);
        if (action?.actionType.id === actionTypeId) {
          linkedActionIds.add(actionId);
        }
      }
    }
  }

  return classifiers.actions.filter((a) => linkedActionIds.has(a.id));
}
</script>
