<template>
  <div class="expertises-tab">
    <div class="text-body2 text-muted q-mb-md">
      Expertises grant advantage on related skill tests and unlock special options.
    </div>

    <!-- Cultural Expertises -->
    <div class="category-section">
      <div class="category-title">Cultural</div>
      <div v-if="culturalExpertises.length === 0" class="text-empty q-pa-sm">
        No cultural expertises
      </div>
      <q-chip
        v-for="exp in culturalExpertises"
        :key="exp.expertiseId"
        color="blue-2"
        text-color="blue-10"
        icon="language"
      >
        {{ getExpertiseName(exp.expertiseId) }}
        <q-tooltip>Source: {{ exp.source }}</q-tooltip>
      </q-chip>
    </div>

    <!-- Utility Expertises -->
    <div class="category-section">
      <div class="category-title">Utility</div>
      <div v-if="utilityExpertises.length === 0" class="text-empty q-pa-sm">
        No utility expertises
      </div>
      <q-chip
        v-for="exp in utilityExpertises"
        :key="exp.expertiseId"
        color="green-2"
        text-color="green-10"
        icon="build"
      >
        {{ getExpertiseName(exp.expertiseId) }}
        <q-tooltip>Source: {{ exp.source }}</q-tooltip>
      </q-chip>
    </div>

    <!-- Weapon Expertises -->
    <div class="category-section">
      <div class="category-title">Weapon</div>
      <div v-if="weaponExpertises.length === 0" class="text-empty q-pa-sm">
        No weapon expertises
      </div>
      <q-chip
        v-for="exp in weaponExpertises"
        :key="exp.expertiseId"
        color="red-2"
        text-color="red-10"
        icon="gps_fixed"
      >
        {{ getExpertiseName(exp.expertiseId) }}
        <q-tooltip>Source: {{ exp.source }}</q-tooltip>
      </q-chip>
    </div>

    <!-- Specialist Expertises -->
    <div class="category-section">
      <div class="category-title">Specialist</div>
      <div v-if="specialistExpertises.length === 0" class="text-empty q-pa-sm">
        No specialist expertises
      </div>
      <q-chip
        v-for="exp in specialistExpertises"
        :key="exp.expertiseId"
        color="purple-2"
        text-color="purple-10"
        icon="star"
      >
        {{ getExpertiseName(exp.expertiseId) }}
        <q-tooltip>Source: {{ exp.source }}</q-tooltip>
      </q-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterStore } from 'stores/character';
import { useClassifierStore } from 'stores/classifiers';

const characterStore = useCharacterStore();
const classifierStore = useClassifierStore();

const character = computed(() => characterStore.character);
const expertises = computed(() => character.value?.expertises || []);

const culturalExpertises = computed(() =>
  expertises.value.filter((e) => {
    const exp = classifierStore.getExpertiseById(e.expertiseId);
    return classifierStore.getExpertiseCategoryCode(exp?.categoryId ?? 0) === 'cultural';
  })
);

const utilityExpertises = computed(() =>
  expertises.value.filter((e) => {
    const exp = classifierStore.getExpertiseById(e.expertiseId);
    return classifierStore.getExpertiseCategoryCode(exp?.categoryId ?? 0) === 'utility';
  })
);

const weaponExpertises = computed(() =>
  expertises.value.filter((e) => {
    const exp = classifierStore.getExpertiseById(e.expertiseId);
    return classifierStore.getExpertiseCategoryCode(exp?.categoryId ?? 0) === 'weapon';
  })
);

const specialistExpertises = computed(() =>
  expertises.value.filter((e) => {
    const exp = classifierStore.getExpertiseById(e.expertiseId);
    return classifierStore.getExpertiseCategoryCode(exp?.categoryId ?? 0) === 'specialist';
  })
);

function getExpertiseName(id: number): string {
  return classifierStore.getExpertiseById(id)?.name || String(id);
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
