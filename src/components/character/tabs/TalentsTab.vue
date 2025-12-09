<template>
  <div class="talents-tab">
    <!-- Heroic Paths -->
    <q-expansion-item
      v-for="pathCode in heroicPaths"
      :key="pathCode"
      :label="getPathName(pathCode)"
      header-class="path-header"
      default-opened
      class="q-mb-sm"
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon name="shield" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-bold">{{ getPathName(pathCode) }}</q-item-label>
          <q-item-label caption>Heroic Path</q-item-label>
        </q-item-section>
      </template>

      <q-card>
        <q-card-section class="q-pt-none">
          <!-- Key Talent -->
          <div v-if="getKeyTalentForPath(pathCode)" class="q-mb-md">
            <div class="subsection-title">Key Talent</div>
            <talent-item :talent="getKeyTalentForPath(pathCode)!" is-key />
          </div>

          <!-- General Path Talents (no specialty) -->
          <div v-if="getGeneralTalentsForPath(pathCode).length > 0" class="q-mb-md">
            <div class="subsection-title">Path Talents</div>
            <talent-item
              v-for="talent in getGeneralTalentsForPath(pathCode)"
              :key="talent.id"
              :talent="talent"
            />
          </div>

          <!-- Specialties for this path -->
          <template v-for="specialty in getSpecialtiesForPath(pathCode)" :key="specialty.id">
            <div v-if="getTalentsForSpecialty(specialty).length > 0" class="specialty-section">
              <div class="specialty-title">{{ specialty.name }}</div>
              <talent-item
                v-for="talent in getTalentsForSpecialty(specialty)"
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
      v-if="isRadiant && radiantOrder"
      :label="radiantOrder.name"
      header-class="radiant-header"
      default-opened
      class="q-mb-sm"
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon name="auto_awesome" color="amber" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-bold">{{ radiantOrder.name }}</q-item-label>
          <q-item-label caption>Radiant Order - Ideal {{ character?.radiantIdeal || 0 }}</q-item-label>
        </q-item-section>
      </template>

      <q-card>
        <q-card-section class="q-pt-none">
          <!-- Spren Bond -->
          <div class="specialty-section">
            <div class="specialty-title">{{ getSprenTypeName(radiantOrder.sprenType) }} Bond</div>
            <div v-if="getSprenBondTalents().length === 0" class="text-grey q-pa-sm">
              No spren bond talents acquired
            </div>
            <talent-item
              v-for="talent in getSprenBondTalents()"
              :key="talent.id"
              :talent="talent"
            />
          </div>

          <!-- Surges -->
          <div v-for="surgeCode in radiantOrder.surgeCodes" :key="surgeCode" class="specialty-section">
            <div class="specialty-title">{{ getSurgeName(surgeCode) }}</div>
            <div v-if="getSurgeTalents(surgeCode).length === 0" class="text-grey q-pa-sm">
              No {{ getSurgeName(surgeCode) }} talents acquired
            </div>
            <talent-item
              v-for="talent in getSurgeTalents(surgeCode)"
              :key="talent.id"
              :talent="talent"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Ancestry Talents (e.g., Singer Forms) -->
    <q-expansion-item
      v-if="hasAncestryTalents"
      :label="getAncestryName(ancestryTalents[0]?.ancestryId || 0)"
      header-class="ancestry-header"
      default-opened
      class="q-mb-sm"
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon name="music_note" color="purple" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-bold">{{ getAncestryName(ancestryTalents[0]?.ancestryId || 0) }} Forms</q-item-label>
          <q-item-label caption>Ancestry Talents</q-item-label>
        </q-item-section>
      </template>

      <q-card>
        <q-card-section class="q-pt-none">
          <talent-item
            v-for="talent in ancestryTalents"
            :key="talent.id"
            :talent="talent"
            :is-key="talent.isKey"
          />
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Uncategorized talents (if any) -->
    <q-expansion-item
      v-if="uncategorizedTalents.length > 0"
      label="Other Talents"
      header-class="other-header"
      default-opened
      class="q-mb-sm"
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon name="category" color="grey" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-bold">Other Talents</q-item-label>
          <q-item-label caption>Miscellaneous</q-item-label>
        </q-item-section>
      </template>

      <q-card>
        <q-card-section class="q-pt-none">
          <talent-item
            v-for="talent in uncategorizedTalents"
            :key="talent.id"
            :talent="talent"
          />
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useCharacterStore } from 'stores/character';
import { useClassifierStore } from 'stores/classifiers';
import type { Talent, HeroicPathCode, SurgeCode, SprenType, Specialty } from 'src/types';

const TalentItem = defineAsyncComponent(() => import('./TalentItem.vue'));

const characterStore = useCharacterStore();
const classifierStore = useClassifierStore();

const character = computed(() => characterStore.character);
const isRadiant = computed(() => characterStore.isRadiant);
const heroicPaths = computed(() => character.value?.heroicPaths || []);

// Get all character talents as Talent objects
const characterTalents = computed((): Talent[] => {
  const talents = character.value?.talents || [];
  return talents
    .map((t) => classifierStore.getTalentById(t.talentId))
    .filter((t): t is Talent => t !== undefined);
});

// Get radiant order details
const radiantOrder = computed(() => {
  if (!character.value?.radiantOrder) return null;
  return classifierStore.getRadiantOrderByCode(character.value.radiantOrder);
});

// Ancestry talents (e.g., singer talents)
const ancestryTalents = computed(() => {
  return characterTalents.value.filter((t) => t.ancestryId !== undefined);
});

const hasAncestryTalents = computed(() => ancestryTalents.value.length > 0);

// Get ancestry name for display
function getAncestryName(ancestryId: number): string {
  const ancestry = classifierStore.getAncestryById(ancestryId);
  return ancestry?.name || String(ancestryId);
}

// Helper functions
function getPathName(pathCode: HeroicPathCode): string {
  const path = classifierStore.getHeroicPathByCode(pathCode);
  return path?.name || pathCode;
}

function getKeyTalentForPath(pathCode: HeroicPathCode): Talent | undefined {
  const path = classifierStore.getHeroicPathByCode(pathCode);
  if (!path) return undefined;
  return characterTalents.value.find((t) => t.pathId === path.id && t.isKey);
}

function getGeneralTalentsForPath(pathCode: HeroicPathCode): Talent[] {
  const path = classifierStore.getHeroicPathByCode(pathCode);
  if (!path) return [];
  return characterTalents.value.filter(
    (t) => t.pathId === path.id && !t.isKey && !t.specialtyId
  );
}

function getSpecialtiesForPath(pathCode: HeroicPathCode): Specialty[] {
  const path = classifierStore.getHeroicPathByCode(pathCode);
  if (!path) return [];
  return classifierStore.getSpecialtiesByPathId(path.id);
}

function getTalentsForSpecialty(specialty: Specialty): Talent[] {
  return characterTalents.value.filter((t) => t.specialtyId === specialty.id);
}

function getSurgeName(surgeCode: SurgeCode): string {
  const surge = classifierStore.getSurgeByCode(surgeCode);
  return surge?.name || surgeCode;
}

function getSprenTypeName(sprenType: SprenType | undefined): string {
  if (!sprenType) return 'Spren';
  const names: Record<SprenType, string> = {
    honorspren: 'Honorspren',
    highspren: 'Highspren',
    ashspren: 'Ashspren',
    cultivationspren: 'Cultivationspren',
    mistspren: 'Mistspren',
    cryptic: 'Cryptic',
    inkspren: 'Inkspren',
    lightspren: 'Lightspren',
    peakspren: 'Peakspren',
    stormfather: 'Stormfather',
    nightwatcher: 'Nightwatcher',
    sibling: 'Sibling',
  };
  return names[sprenType] || sprenType;
}

// TODO: These would need proper categorization based on talent metadata
function getSprenBondTalents(): Talent[] {
  // For now, return empty - would need talent metadata to identify spren bond talents
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getSurgeTalents(surgeCode: SurgeCode): Talent[] {
  // TODO: Filter talents by surgeCode once talent metadata includes surge association
  return [];
}

// Uncategorized talents (not in any heroic path, radiant order, or ancestry tree)
const uncategorizedTalents = computed(() => {
  const pathIds = heroicPaths.value
    .map((code) => classifierStore.getHeroicPathByCode(code)?.id)
    .filter((id): id is number => id !== undefined);

  return characterTalents.value.filter((t) => {
    // Not an ancestry talent
    if (t.ancestryId) return false;
    // Not associated with any of character's heroic paths
    if (t.pathId && pathIds.includes(t.pathId)) return false;
    // Has no path association at all and isn't categorized elsewhere
    return !t.pathId;
  });
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
  color: var(--q-primary);
}

:deep(.path-header) {
  background: color-mix(in srgb, var(--q-primary) 10%, transparent);
}

:deep(.radiant-header) {
  background: color-mix(in srgb, var(--q-warning) 10%, transparent);
}

:deep(.ancestry-header) {
  background: color-mix(in srgb, var(--q-purple) 10%, transparent);
}

:deep(.other-header) {
  background: color-mix(in srgb, var(--q-grey) 10%, transparent);
}
</style>
