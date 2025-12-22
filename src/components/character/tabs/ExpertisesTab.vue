<template>
  <div class="expertises-tab" role="region" aria-label="Character expertises">
    <div class="text-body2 text-muted q-mb-md">
      Expertises grant advantage on related skill tests and unlock special options.
    </div>

    <!-- Dynamic sections from expertise types classifier -->
    <div v-for="expType in classifiers.expertiseTypes" :key="expType.id" class="category-section">
      <div class="category-title">{{ expType.name }}</div>
      <template v-if="expertisesByTypeRecord[expType.id]?.length">
        <q-chip v-for="heroExp in expertisesByTypeRecord[expType.id]" :key="heroExp.id">
          {{ findById(classifiers.expertises, heroExp.expertiseId)?.name }}
          <q-badge v-if="heroExp.source" color="grey" class="q-ml-xs">
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
import { findById } from 'src/utils/arrayUtils';
import type { HeroExpertise } from 'src/types';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

const heroExpertises = computed(() => heroStore.expertises);

// Hero expertises grouped by type (via heroExp.expertiseId -> expertise.expertiseTypeId)
const expertisesByTypeRecord = computed((): Record<number, HeroExpertise[]> => {
  return classifiers.groupByChainedKey(
    heroExpertises.value,
    'expertiseId',
    classifiers.expertises,
    'expertiseTypeId'
  );
});
</script>

<style scoped>
.category-section {
  margin-bottom: 16px;
}

.category-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 8px;
}
</style>
