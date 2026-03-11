<template>
  <div class="actions-tab">
    <!-- Tabs from cl_action_types classifier -->
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
            v-for="entry in actionsByType[actionType.id]"
            :key="getEntryKey(entry)"
            :action="getEntryAction(entry)"
            v-bind="getEquipmentProps(entry)"
            :readonly="readonly"
          />
        </q-list>
        <div v-else class="text-center text-muted q-pa-lg">
          No {{ actionType.name.toLowerCase() }} available.
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Icon Legend -->
    <div class="icon-legend q-mt-md q-pa-sm">
      <div class="text-caption text-weight-medium q-mb-xs">Action Types</div>
      <div class="legend-grid">
        <div
          v-for="at in sortedActivationTypes"
          :key="at.id"
          class="legend-item"
          :title="at.description"
        >
          <img
            v-if="getActionIconUrl(at.icon)"
            :src="getActionIconUrl(at.icon)"
            alt=""
            aria-hidden="true"
            class="legend-icon icon-theme-aware"
          />
          <span class="text-caption">{{ at.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById, findByCode } from 'src/utils/arrayUtils';
import { getIconUrl } from 'src/utils/iconUrl';
import { getEffectiveSpecial } from 'src/utils/equipmentStats';
import { SPECIAL } from 'src/utils/specialUtils';
import {
  createCustomEquipmentAction,
  getInstanceWeaponLabel,
} from 'src/utils/equipmentActionUtils';
import ActionItem from './ActionItem.vue';
import type { Action, EquipmentActionInstance } from 'src/types';
import { isEquipmentActionInstance } from 'src/types';

type ActionEntry = Action | EquipmentActionInstance;

defineProps<{
  readonly?: boolean;
}>();

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

function getActionIconUrl(icon: string | undefined): string {
  return getIconUrl(icon, 'actions');
}

// Sentinel value for uninitialized tab state (action type IDs are always >= 1)
const UNINITIALIZED_TAB = -1;

// Active tab with sync to actionTypes (handles async classifier loading)
const activeTab = ref(classifiers.actionTypes[0]?.id ?? UNINITIALIZED_TAB);

// Sync activeTab when actionTypes become available (async classifier init)
watch(
  () => classifiers.actionTypes,
  (types) => {
    const firstType = types[0];
    if (firstType && activeTab.value === UNINITIALIZED_TAB) {
      activeTab.value = firstType.id;
    }
  },
  { immediate: true }
);

// Activation type display order lookup: id → displayOrder
const activationTypeOrder = computed(() => {
  const map = new Map<number, number>();
  for (const at of classifiers.activationTypes) {
    map.set(at.id, at.displayOrder ?? Number.MAX_SAFE_INTEGER);
  }
  return map;
});

// Activation types sorted by display order (for legend)
const sortedActivationTypes = computed(() =>
  [...classifiers.activationTypes].sort(
    (a, b) =>
      (a.displayOrder ?? Number.MAX_SAFE_INTEGER) - (b.displayOrder ?? Number.MAX_SAFE_INTEGER)
  )
);

// Extract the Action from an ActionEntry (plain Action or EquipmentActionInstance)
function getEntryAction(entry: ActionEntry): Action {
  return isEquipmentActionInstance(entry) ? entry.action : entry;
}

// Build optional equipment props for ActionItem (avoids passing undefined for exact optional types)
function getEquipmentProps(
  entry: ActionEntry
): { equipmentInstance: EquipmentActionInstance } | Record<string, never> {
  if (isEquipmentActionInstance(entry)) {
    return { equipmentInstance: entry };
  }
  return {};
}

// Unique key for an ActionEntry (equipment instances need heroEquipment.id to disambiguate)
function getEntryKey(entry: ActionEntry): string {
  if (isEquipmentActionInstance(entry)) {
    return `${entry.action.id}-${entry.heroEquipment.id}`;
  }
  return String(entry.id);
}

function entrySortKey(entry: ActionEntry): string {
  const action = getEntryAction(entry);
  const order = activationTypeOrder.value.get(action.activationType.id) ?? Number.MAX_SAFE_INTEGER;
  const label = isEquipmentActionInstance(entry) ? (getInstanceWeaponLabel(entry) ?? '') : '';
  return `${String(order).padStart(10, '0')}\0${action.name}\0${label}`;
}

function sortEntries<T extends ActionEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => entrySortKey(a).localeCompare(entrySortKey(b)));
}

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
const actionsByType = computed((): Record<number, ActionEntry[]> => {
  const result: Record<number, ActionEntry[]> = {};
  for (const actionType of classifiers.actionTypes) {
    result[actionType.id] = getActionsByTypeId(actionType.id);
  }
  return result;
});

// Get action type by code
function getActionTypeByCode(code: string) {
  return findByCode(classifiers.actionTypes, code);
}

// Get hero's object IDs by action type (non-equipment types only)
function getHeroObjectIds(actionTypeCode: string): Set<number> {
  if (actionTypeCode === 'talent') {
    return new Set((heroStore.hero?.talents || []).map((t) => t.talent.id));
  }
  if (actionTypeCode === 'surge') {
    const order = heroStore.hero?.radiantOrder;
    if (!order) return new Set();
    const fullOrder = findById(classifiers.radiantOrders, order.id);
    if (!fullOrder) return new Set();
    const ids: number[] = [];
    if (fullOrder.surge1?.id != null) ids.push(fullOrder.surge1.id);
    if (fullOrder.surge2?.id != null) ids.push(fullOrder.surge2.id);
    return new Set(ids);
  }
  return new Set();
}

// Build equipment action instances for all equipped items
function getEquipmentActionInstances(actionTypeId: number): EquipmentActionInstance[] {
  const actionType = findById(classifiers.actionTypes, actionTypeId);
  if (!actionType) return [];
  const defaultActivationType = findByCode(classifiers.activationTypes, 'action');

  return sortEntries(
    (heroStore.hero?.equipment || [])
      .filter((e) => e.isEquipped)
      .flatMap((heroEquip): EquipmentActionInstance[] => {
        const effectiveSpecial = getEffectiveSpecial(heroEquip);
        if (heroEquip.equipment) {
          return [...(actionLinksMap.value.get(heroEquip.equipment.id) ?? [])]
            .map((id) => findById(classifiers.actions, id))
            .filter((a): a is Action => !!a && a.actionType.id === actionTypeId)
            .map((action) => ({ action, heroEquipment: heroEquip, effectiveSpecial }));
        }
        if (
          defaultActivationType &&
          effectiveSpecial.some((s) => s.type === SPECIAL.DAMAGE && s.value != null)
        ) {
          return [
            {
              action: createCustomEquipmentAction(heroEquip, actionType, defaultActivationType),
              heroEquipment: heroEquip,
              effectiveSpecial,
            },
          ];
        }
        return [];
      })
  );
}

// Get actions by action type ID
// - Basic actions: everyone has all of them
// - Equipment actions: per-instance with effective stats
// - Other types: only actions linked to objects the hero possesses
function getActionsByTypeId(actionTypeId: number): ActionEntry[] {
  const actionType = findById(classifiers.actionTypes, actionTypeId);
  if (!actionType) return [];

  // Basic actions - everyone has all of them
  const basicType = getActionTypeByCode('basic');
  if (basicType && actionTypeId === basicType.id) {
    return sortEntries(classifiers.actions.filter((a) => a.actionType.id === actionTypeId));
  }

  // Stormlight actions - all Radiants have them
  const stormlightType = getActionTypeByCode('stormlight');
  if (stormlightType && actionTypeId === stormlightType.id) {
    if (!heroStore.hero?.radiantOrder) return [];
    return sortEntries(classifiers.actions.filter((a) => a.actionType.id === actionTypeId));
  }

  // Equipment actions - resolve per equipped item instance
  const equipmentType = getActionTypeByCode('equipment');
  if (equipmentType && actionTypeId === equipmentType.id) {
    return getEquipmentActionInstances(actionTypeId);
  }

  // Other action types (talent, surge) - filter by actionLinks using pre-computed map
  const heroObjectIds = getHeroObjectIds(actionType.code);
  if (heroObjectIds.size === 0) return [];

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

  return sortEntries(classifiers.actions.filter((a) => linkedActionIds.has(a.id)));
}
</script>

<style scoped>
.icon-legend {
  border-top: 1px solid rgba(128, 128, 128, 0.2);
}

.legend-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-icon {
  width: 16px;
  height: 16px;
}
</style>
