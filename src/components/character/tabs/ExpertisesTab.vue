<template>
  <div class="expertises-tab">
    <div class="text-body2 text-muted q-mb-md">
      Expertises grant advantage on related skill tests and unlock special options.
    </div>

    <!-- Dynamic sections from expertise types classifier -->
    <div v-for="expType in classifiers.expertiseTypes" :key="expType.id" class="category-section">
      <div class="category-title">{{ expType.name }}</div>
      <div v-if="getExpertisesByTypeId(expType.id).length === 0" class="text-empty q-pa-sm">
        No {{ expType.name.toLowerCase() }} expertises
      </div>
      <q-chip v-for="heroExp in getExpertisesByTypeId(expType.id)" :key="heroExp.id">
        {{ getExpertiseName(heroExp.expertiseId) }}
        <q-badge v-if="heroExp.source" color="grey" class="q-ml-xs">
          {{ heroExp.source.sourceType }}
        </q-badge>
      </q-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import type { HeroExpertise } from 'src/types';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

const heroExpertises = computed(() => heroStore.hero?.expertises ?? []);

function getExpertisesByTypeId(typeId: number): HeroExpertise[] {
  return heroExpertises.value.filter((heroExp) => {
    const expertise = classifiers.getById(classifiers.expertises, heroExp.expertiseId);
    return expertise?.expertiseTypeId === typeId;
  });
}

function getExpertiseName(expertiseId: number): string {
  return classifiers.getById(classifiers.expertises, expertiseId)?.name ?? '';
}
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
