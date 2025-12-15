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
          <div v-if="getKeyTalentForPath(path.id)" class="q-mb-md">
            <div class="subsection-title">Key Talent</div>
            <talent-item :talent="getKeyTalentForPath(path.id)!" />
          </div>

          <!-- General Path Talents (no specialty) -->
          <div v-if="getGeneralTalentsForPath(path.id).length > 0" class="q-mb-md">
            <div class="subsection-title">Path Talents</div>
            <talent-item
              v-for="talent in getGeneralTalentsForPath(path.id)"
              :key="talent.id"
              :talent="talent"
            />
          </div>

          <!-- Specialties for this path -->
          <template v-for="specialty in getSpecialtiesForPath(path.id)" :key="specialty.id">
            <div v-if="getTalentsForSpecialty(specialty.id).length > 0" class="specialty-section">
              <div class="specialty-title">{{ specialty.name }}</div>
              <talent-item
                v-for="talent in getTalentsForSpecialty(specialty.id)"
                :key="talent.id"
                :talent="talent"
              />
            </div>
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
            <div v-if="getSprenBondTalents().length === 0" class="text-empty q-pa-sm">
              No bond talents acquired
            </div>
            <talent-item
              v-for="talent in getSprenBondTalents()"
              :key="talent.id"
              :talent="talent"
            />
          </div>

          <!-- Surges -->
          <div v-for="surge in getOrderSurges()" :key="surge.id" class="specialty-section">
            <div class="specialty-title">{{ surge.name }}</div>
            <div v-if="getSurgeTalents(surge.id).length === 0" class="text-empty q-pa-sm">
              No {{ surge.name }} talents acquired
            </div>
            <talent-item
              v-for="talent in getSurgeTalents(surge.id)"
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
import type { Talent, Path, Specialty, Surge } from 'src/types';

const TalentItem = defineAsyncComponent(() => import('./TalentItem.vue'));

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// Get all hero talents as Talent objects
const heroTalents = computed((): Talent[] => {
  const talents = heroStore.hero?.talents ?? [];
  return talents
    .map((t) => classifiers.getById(classifiers.talents, t.talentId))
    .filter((t): t is Talent => t !== undefined);
});

// Get unique paths that have talents
const pathsWithTalents = computed((): Path[] => {
  const pathIds = new Set<number>();
  heroTalents.value.forEach((t) => {
    if (t.pathId) pathIds.add(t.pathId);
  });
  return Array.from(pathIds)
    .map((id) => classifiers.getById(classifiers.paths, id))
    .filter((p): p is Path => p !== undefined);
});

// Get radiant order details
const radiantOrder = computed(() => {
  return classifiers.getById(classifiers.radiantOrders, heroStore.hero?.radiantOrderId);
});

// Ancestry talents (e.g., singer talents)
const ancestryTalents = computed(() => {
  return heroTalents.value.filter((t) => t.ancestryId !== undefined);
});

// Cached ancestry ID from talents to avoid repeated lookups
const ancestryTalentAncestryId = computed(() => ancestryTalents.value[0]?.ancestryId);

// Cached ancestry name for display
const ancestryTalentName = computed(() => {
  const id = ancestryTalentAncestryId.value;
  if (!id) return '';
  return classifiers.getById(classifiers.ancestries, id)?.name ?? '';
});

// Helper functions
function getKeyTalentForPath(pathId: number): Talent | undefined {
  return heroTalents.value.find((t) => t.pathId === pathId && t.isKey);
}

function getGeneralTalentsForPath(pathId: number): Talent[] {
  return heroTalents.value.filter((t) => t.pathId === pathId && !t.isKey && !t.specialtyId);
}

function getSpecialtiesForPath(pathId: number): Specialty[] {
  return classifiers.specialties.filter((s) => s.pathId === pathId);
}

function getTalentsForSpecialty(specialtyId: number): Talent[] {
  return heroTalents.value.filter((t) => t.specialtyId === specialtyId);
}

// Get the two surges for the radiant order
function getOrderSurges(): Surge[] {
  if (!radiantOrder.value) return [];
  const surge1 = classifiers.getById(classifiers.surges, radiantOrder.value.surge1Id);
  const surge2 = classifiers.getById(classifiers.surges, radiantOrder.value.surge2Id);
  return [surge1, surge2].filter((s): s is Surge => s !== undefined);
}

// Get radiant order talents that are for the order itself (not surge-specific)
function getSprenBondTalents(): Talent[] {
  if (!radiantOrder.value) return [];
  return heroTalents.value.filter((t) => t.radiantOrderId === radiantOrder.value?.id && !t.surgeId);
}

// Get talents for a specific surge by ID
function getSurgeTalents(surgeId: number): Talent[] {
  return heroTalents.value.filter((t) => t.surgeId === surgeId);
}
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
