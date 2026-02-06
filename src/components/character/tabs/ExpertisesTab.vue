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
          :aria-label="`${getExpertiseName(heroExp.expertise.id)} expertise`"
        >
          {{ getExpertiseName(heroExp.expertise.id) }}
          <q-badge v-if="heroExp.source" :color="RPG_COLORS.badgeMuted" class="q-ml-xs">
            {{ heroExp.source.sourceType }}
          </q-badge>
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
import { findById, buildIdNameMap, makeNameGetter } from 'src/utils/arrayUtils';
import { RPG_COLORS } from 'src/constants/theme';
import type { HeroExpertise } from 'src/types';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

const heroExpertises = computed(() => heroStore.expertises);

// Hero expertises grouped by type (via heroExp.expertise.id -> expertise.expertiseType.id)
const expertisesByTypeRecord = computed((): Record<number, HeroExpertise[]> => {
  const result: Record<number, HeroExpertise[]> = {};
  for (const heroExp of heroExpertises.value) {
    const expertise = findById(classifiers.expertises, heroExp.expertise.id);
    if (!expertise) continue;
    const typeId = expertise.expertiseType.id;
    if (!result[typeId]) result[typeId] = [];
    result[typeId].push(heroExp);
  }
  return result;
});

// Name getter using factory pattern
const getExpertiseName = makeNameGetter(computed(() => buildIdNameMap(classifiers.expertises)));
</script>

<style scoped>
.category-section {
  margin-bottom: 16px;
}
</style>
