<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Choose your cultural background</div>

    <!-- Primary Culture Selection -->
    <q-select
      :model-value="primaryCultureId"
      :options="cultureOptions"
      label="Primary Culture"
      outlined
      emit-value
      map-options
      class="q-mb-md"
      @update:model-value="setPrimaryCulture"
    />

    <!-- Secondary Culture (Optional) -->
    <q-select
      :model-value="secondaryCultureId"
      :options="secondaryCultureOptions"
      label="Secondary Culture (Optional)"
      outlined
      emit-value
      map-options
      clearable
      class="q-mb-md"
      @update:model-value="setSecondaryCulture"
    />

    <!-- Culture Info -->
    <q-card v-if="selectedCulture" flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2">{{ selectedCulture.name }}</div>
        <div class="text-body2">{{ selectedCulture.description }}</div>
      </q-card-section>
    </q-card>

    <!-- Cultural Expertises Info Banner -->
    <q-banner v-if="culturalExpertiseNames.length > 0" class="banner-info q-mt-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_workspace_premium" />
      </template>
      <div><strong>Cultural Expertises:</strong> {{ culturalExpertiseNames.join(', ') }}</div>
    </q-banner>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// Hero cultures as array of cultureIds
const heroCultureIds = computed(() => heroStore.hero?.cultures.map((c) => c.cultureId) ?? []);

// Primary = first culture, Secondary = second culture
const primaryCultureId = computed(() => heroCultureIds.value[0] ?? null);
const secondaryCultureId = computed(() => heroCultureIds.value[1] ?? null);

const cultureOptions = computed(() =>
  classifiers.cultures.map((c) => ({ value: c.id, label: c.name }))
);

const secondaryCultureOptions = computed(() =>
  classifiers.cultures
    .filter((c) => c.id !== primaryCultureId.value)
    .map((c) => ({ value: c.id, label: c.name }))
);

const selectedCulture = computed(() =>
  classifiers.getById(classifiers.cultures, primaryCultureId.value)
);

// Get cultural expertise names for display
const culturalExpertiseNames = computed(() => {
  const culturalType = classifiers.getByCode(classifiers.expertiseTypes, 'cultural');
  if (!culturalType) return [];

  const culturalExpertises = classifiers.expertises.filter(
    (e) => e.expertiseTypeId === culturalType.id
  );

  return heroCultureIds.value
    .map((cultureId) => {
      const culture = classifiers.getById(classifiers.cultures, cultureId);
      if (!culture) return null;
      const expertise = culturalExpertises.find((e) => e.name === culture.name);
      return expertise?.name ?? null;
    })
    .filter((name): name is string => name !== null);
});

function setCulture(oldId: number | null, newId: number | null) {
  if (oldId) {
    heroStore.removeCulture(oldId);
  }
  if (newId !== null) {
    heroStore.addCulture(newId);
  }
}

function setPrimaryCulture(val: number | null) {
  setCulture(primaryCultureId.value, val);
}

function setSecondaryCulture(val: number | null) {
  setCulture(secondaryCultureId.value, val);
}
</script>
