<template>
  <div class="talents-tab">
    <!-- Paths with talents -->
    <q-expansion-item
      v-for="path in pathsWithTalents"
      :key="path.id"
      :label="path.name"
      default-opened
      class="q-mb-sm"
    >
      <template #header>
        <q-item-section>
          <q-item-label class="text-weight-bold">{{ path.name }}</q-item-label>
          <q-item-label caption>Path</q-item-label>
        </q-item-section>
      </template>

      <q-card>
        <q-card-section class="q-pt-none">
          <!-- Key Talent -->
          <template v-if="keyTalentsByPath[path.id]">
            <div class="q-mb-md">
              <div class="subsection-title">Key Talent</div>
              <talent-item :talent="keyTalentsByPath[path.id]!" />
            </div>
          </template>

          <!-- General Path Talents (no specialty) -->
          <template v-if="generalTalentsByPath[path.id]?.length">
            <div class="q-mb-md">
              <div class="subsection-title">Path Talents</div>
              <talent-item
                v-for="talent in generalTalentsByPath[path.id]"
                :key="talent.id"
                :talent="talent"
              />
            </div>
          </template>

          <!-- Specialties for this path -->
          <template v-for="specialty in specialtiesByPath[path.id]" :key="specialty.id">
            <template v-if="talentsBySpecialty[specialty.id]?.length">
              <div class="specialty-section">
                <div class="specialty-title">{{ specialty.name }}</div>
                <talent-item
                  v-for="talent in talentsBySpecialty[specialty.id]"
                  :key="talent.id"
                  :talent="talent"
                />
              </div>
            </template>
          </template>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Radiant Order -->
    <q-expansion-item
      v-if="heroStore.isRadiant && radiantOrder"
      :label="radiantOrder.name"
      default-opened
      class="q-mb-sm"
    >
      <template #header>
        <q-item-section>
          <q-item-label class="text-weight-bold">{{ radiantOrder.name }}</q-item-label>
          <q-item-label caption
            >Radiant Order - Ideal {{ heroStore.hero?.radiantIdeal ?? 0 }}</q-item-label
          >
        </q-item-section>
      </template>

      <q-card>
        <q-card-section class="q-pt-none">
          <!-- Order Core Talents -->
          <div class="specialty-section">
            <div class="specialty-title">{{ radiantOrder.name }} Bond</div>
            <div v-if="sprenBondTalents.length === 0" class="text-empty q-pa-sm">
              No bond talents acquired
            </div>
            <talent-item v-for="talent in sprenBondTalents" :key="talent.id" :talent="talent" />
          </div>

          <!-- Surges -->
          <div v-for="surge in orderSurges" :key="surge.id" class="specialty-section">
            <div class="specialty-title">{{ surge.name }}</div>
            <div v-if="!surgeTalentsMap[surge.id]?.length" class="text-empty q-pa-sm">
              No {{ surge.name }} talents acquired
            </div>
            <talent-item
              v-for="talent in surgeTalentsMap[surge.id] ?? []"
              :key="talent.id"
              :talent="talent"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Ancestry Talents (e.g., Singer Forms) -->
    <q-expansion-item
      v-if="ancestryTalents.length > 0"
      :label="ancestryTalentName"
      default-opened
      class="q-mb-sm"
    >
      <template #header>
        <q-item-section>
          <q-item-label class="text-weight-bold">{{ ancestryTalentName }}</q-item-label>
          <q-item-label caption>Ancestry Talents</q-item-label>
        </q-item-section>
      </template>

      <q-card>
        <q-card-section class="q-pt-none">
          <talent-item v-for="talent in ancestryTalents" :key="talent.id" :talent="talent" />
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Empty state -->
    <div v-if="heroTalents.length === 0" class="text-empty q-pa-md">No talents acquired</div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById } from 'src/utils/arrayUtils';
import type { Talent, Path, Specialty, Surge } from 'src/types';

const TalentItem = defineAsyncComponent(() => import('./TalentItem.vue'));

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// Get all hero talents as Talent objects
const heroTalents = computed((): Talent[] => {
  return heroStore.talents
    .map((t) => findById(classifiers.talents, t.talentId))
    .filter((t): t is Talent => t !== undefined);
});

// Get unique paths that have talents
const pathsWithTalents = computed((): Path[] => {
  const pathIds = new Set(
    heroTalents.value.map((t) => t.pathId).filter((id): id is number => id !== undefined)
  );
  return Array.from(pathIds)
    .map((id) => findById(classifiers.paths, id))
    .filter((p): p is Path => p !== undefined);
});

// Get radiant order details
const radiantOrder = computed(() =>
  findById(classifiers.radiantOrders, heroStore.hero?.radiantOrderId)
);

// Ancestry talents (e.g., singer talents)
const ancestryTalents = computed(() => heroTalents.value.filter((t) => t.ancestryId !== undefined));
const ancestryTalentName = computed(
  () => findById(classifiers.ancestries, ancestryTalents.value[0]?.ancestryId)?.name
);

// Pre-computed lookups to avoid repeated filter calls in template
const keyTalentsByPath = computed((): Record<number, Talent | undefined> => {
  const result: Record<number, Talent | undefined> = {};
  for (const path of pathsWithTalents.value) {
    result[path.id] = heroTalents.value.find((t) => t.pathId === path.id && t.isKey);
  }
  return result;
});

const generalTalentsByPath = computed((): Record<number, Talent[]> => {
  const result: Record<number, Talent[]> = {};
  for (const path of pathsWithTalents.value) {
    result[path.id] = heroTalents.value.filter(
      (t) => t.pathId === path.id && !t.isKey && !t.specialtyId
    );
  }
  return result;
});

// All specialties grouped by path (for paths that have talents)
const specialtiesByPath = computed((): Record<number, Specialty[]> => {
  return classifiers.groupByForeignKey(classifiers.specialties, 'pathId');
});

const talentsBySpecialty = computed((): Record<number, Talent[]> => {
  const result: Record<number, Talent[]> = {};
  for (const specialty of classifiers.specialties) {
    const talents = heroTalents.value.filter((t) => t.specialtyId === specialty.id);
    if (talents.length > 0) {
      result[specialty.id] = talents;
    }
  }
  return result;
});

// Get the two surges for the radiant order
const orderSurges = computed((): Surge[] => {
  if (!radiantOrder.value) return [];
  const surge1 = findById(classifiers.surges, radiantOrder.value.surge1Id);
  const surge2 = findById(classifiers.surges, radiantOrder.value.surge2Id);
  return [surge1, surge2].filter((s): s is Surge => s !== undefined);
});

// Get radiant order talents that are for the order itself (not surge-specific)
const sprenBondTalents = computed((): Talent[] => {
  if (!radiantOrder.value) return [];
  return heroTalents.value.filter((t) => t.radiantOrderId === radiantOrder.value?.id && !t.surgeId);
});

// Pre-computed surge talents map
const surgeTalentsMap = computed((): Record<number, Talent[]> => {
  const result: Record<number, Talent[]> = {};
  for (const surge of orderSurges.value) {
    result[surge.id] = heroTalents.value.filter((t) => t.surgeId === surge.id);
  }
  return result;
});
</script>

<style scoped>
.subsection-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.6;
  margin-bottom: 8px;
}

.specialty-section {
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 2px solid var(--q-separator-color);
}

.specialty-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 8px;
}
</style>
