<template>
  <div class="expertises-tab" role="region" aria-label="Character expertises">
    <div class="text-body2 text-muted q-mb-md">
      Expertises grant advantage on related skill tests and unlock special options.
    </div>

    <!-- Dynamic sections from expertise types classifier -->
    <div v-for="expType in classifiers.expertiseTypes" :key="expType.id" class="category-section">
      <div class="section-title section-title--md">{{ expType.name }}</div>
      <template v-if="expertisesByTypeRecord[expType.id]?.length">
        <q-chip
          v-for="heroExp in expertisesByTypeRecord[expType.id]"
          :key="heroExp.id"
          :aria-label="`${getDisplayName(heroExp)} expertise`"
          :outline="!!heroExp.source"
        >
          {{ getDisplayName(heroExp) }}
          <q-tooltip v-if="getSourceLabel(heroExp.source)">
            {{ getSourceLabel(heroExp.source) }}
          </q-tooltip>
        </q-chip>
      </template>
      <div v-else class="text-empty q-pa-sm">No {{ expType.name.toLowerCase() }} expertises</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { buildIdNameMap, makeNameGetter } from 'src/utils/arrayUtils';
import type { HeroExpertise, ExpertiseSourceData } from 'src/types';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

const heroExpertises = computed(() => heroStore.expertises);

// Hero expertises grouped by type
const expertisesByTypeRecord = computed((): Record<number, HeroExpertise[]> => {
  const result: Record<number, HeroExpertise[]> = {};
  for (const heroExp of heroExpertises.value) {
    const typeId = heroExp.expertiseType?.id;
    if (!typeId) continue;
    if (!result[typeId]) result[typeId] = [];
    result[typeId].push(heroExp);
  }
  return result;
});

// Name getter for classifier expertises
const getClassifierName = makeNameGetter(computed(() => buildIdNameMap(classifiers.expertises)));

function getDisplayName(heroExp: HeroExpertise): string {
  if (heroExp.expertise) {
    return getClassifierName(heroExp.expertise.id);
  }
  return heroExp.customName || 'Custom';
}

function getSourceLabel(source?: ExpertiseSourceData | null): string | null {
  if (!source) return null;
  if (source.sourceType === 'talent' && source.sourceId) {
    const heroTalent = heroStore.hero?.talents.find((t) => t.talent.id === source.sourceId);
    return heroTalent ? `From: ${heroTalent.talent.name}` : 'From talent';
  }
  if (source.sourceType === 'singer_form' && source.sourceId) {
    const form = classifiers.singerForms.find((f) => f.id === source.sourceId);
    return form ? `From: ${form.name}` : 'From singer form';
  }
  return null;
}
</script>

<style scoped>
.category-section {
  margin-bottom: 16px;
}
</style>
