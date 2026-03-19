<template>
  <div class="talents-tab">
    <template v-if="talentTabs.length > 0">
      <q-tabs
        v-model="activeTab"
        dense
        align="left"
        class="q-mb-md"
        narrow-indicator
        mobile-arrows
        outside-arrows
      >
        <q-tab v-for="tab in talentTabs" :key="tab.key" :name="tab.key" :label="tab.label" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel v-for="tab in talentTabs" :key="tab.key" :name="tab.key" class="q-pa-none">
          <q-list v-if="tab.talents.length" bordered separator>
            <TalentItem v-for="talent in tab.talents" :key="talent.id" :talent="talent" />
          </q-list>
          <div v-else class="text-center text-muted q-pa-lg">No talents in this category.</div>
        </q-tab-panel>
      </q-tab-panels>
    </template>

    <div v-else class="text-empty q-pa-md">No talents acquired</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById } from 'src/utils/arrayUtils';
import { buildSpecialtyPathMap, talentBelongsToPath } from 'src/utils/talentUtils';
import type { Talent } from 'src/types';
import TalentItem from './TalentItem.vue';

interface TalentTab {
  key: string;
  label: string;
  talents: Talent[];
}

const heroStore = useHeroStore();
const talentStore = useHeroTalentsStore();
const classifiers = useClassifierStore();

// Resolve hero talents to full Talent objects
const heroTalents = computed((): Talent[] =>
  heroStore.talents
    .map((t) => findById(classifiers.talents, t.talent.id))
    .filter((t): t is Talent => t !== undefined)
);

const specialtyPathMap = computed(() => buildSpecialtyPathMap(classifiers.specialties));

// Build tabs dynamically from hero's talent sources
const talentTabs = computed((): TalentTab[] => {
  const tabs: TalentTab[] = [];

  // Path tabs - driven by key talents
  const seenPaths = new Set<number>();
  for (const keyTalent of heroTalents.value.filter((t) => t.isKey && t.path)) {
    const pathId = keyTalent.path!.id;
    if (seenPaths.has(pathId)) continue;
    seenPaths.add(pathId);
    const path = findById(classifiers.paths, pathId);
    if (!path) continue;
    const pathTalents = heroTalents.value.filter((t) =>
      talentBelongsToPath(t, pathId, specialtyPathMap.value)
    );
    // Key talent first
    pathTalents.sort((a, b) => (a.isKey === b.isKey ? 0 : a.isKey ? -1 : 1));
    tabs.push({
      key: `path-${path.id}`,
      label: path.name,
      talents: pathTalents,
    });
  }

  // Radiant order tabs - bond tab + one tab per surge
  if (talentStore.isRadiant && heroStore.hero?.radiantOrder) {
    const order = findById(classifiers.radiantOrders, heroStore.hero.radiantOrder.id);
    if (order) {
      // Bond talents (order-specific, no surge)
      const bondTalents = heroTalents.value.filter(
        (t) => t.radiantOrder?.id === order.id && !t.surge
      );
      if (bondTalents.length > 0) {
        tabs.push({
          key: `order-${order.id}`,
          label: order.name,
          talents: bondTalents,
        });
      }

      // Surge tabs
      const surgeRefs = [order.surge1, order.surge2];
      for (const surgeRef of surgeRefs) {
        const surge = findById(classifiers.surges, surgeRef.id);
        if (!surge) continue;
        const surgeTalents = heroTalents.value.filter((t) => t.surge?.id === surge.id);
        if (surgeTalents.length > 0) {
          tabs.push({
            key: `surge-${surge.id}`,
            label: surge.name,
            talents: surgeTalents,
          });
        }
      }
    }
  }

  // Ancestry tab
  const ancestryTalents = heroTalents.value.filter((t) => t.ancestry !== null);
  const firstAncestry = ancestryTalents[0]?.ancestry;
  if (firstAncestry) {
    tabs.push({
      key: `ancestry-${firstAncestry.id}`,
      label: firstAncestry.name,
      talents: ancestryTalents,
    });
  }

  return tabs;
});

// Active tab state with sync
const UNINITIALIZED = '__none__';
const activeTab = ref(UNINITIALIZED);

watch(
  talentTabs,
  (tabs) => {
    const first = tabs[0];
    if (
      first &&
      (activeTab.value === UNINITIALIZED || !tabs.some((t) => t.key === activeTab.value))
    ) {
      activeTab.value = first.key;
    }
  },
  { immediate: true }
);
</script>
