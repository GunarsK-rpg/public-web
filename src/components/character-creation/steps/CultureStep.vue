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
      :rules="[(val) => !!val || 'Primary culture is required']"
      behavior="menu"
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
      behavior="menu"
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
    <InfoBanner
      v-if="culturalExpertiseNames.length > 0"
      :icon="Languages"
      title="Cultural Expertises"
      :content="culturalExpertiseNames.join(', ')"
      class="q-mt-md"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById } from 'src/utils/arrayUtils';
import { Languages } from 'lucide-vue-next';
import type { DeletionTracker } from 'src/composables/useDeletionTracker';
import InfoBanner from '../shared/InfoBanner.vue';

const heroStore = useHeroStore();
const talentStore = useHeroTalentsStore();
const classifiers = useClassifierStore();
const deletionTracker = inject<DeletionTracker>('deletionTracker');

// Hero cultures as array of cultureIds
const heroCultureIds = computed(() => heroStore.hero?.cultures.map((c) => c.culture.id) ?? []);

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

const selectedCulture = computed(() => findById(classifiers.cultures, primaryCultureId.value));

// Get cultural expertise names for display
const culturalExpertiseNames = computed(() => {
  return heroCultureIds.value
    .map((cultureId) => {
      const culture = findById(classifiers.cultures, cultureId);
      if (!culture?.expertise?.id) return null;
      return findById(classifiers.expertises, culture.expertise.id)?.name || null;
    })
    .filter((name): name is string => name !== null);
});

function trackCultureDeletion(cultureId: number) {
  if (!heroStore.hero) return;
  // Track the HeroCulture record for deletion
  const heroCulture = heroStore.hero.cultures.find((c) => c.culture.id === cultureId);
  if (heroCulture) {
    deletionTracker?.trackDeletion('cultures', heroCulture.id);
  }
  // Track associated cultural expertises for deletion
  for (const e of heroStore.hero.expertises) {
    if (e.source?.sourceType === 'culture' && e.source.sourceId === cultureId) {
      deletionTracker?.trackDeletion('expertises', e.id);
    }
  }
}

function setCulture(oldId: number | null, newId: number | null, isPrimary: boolean) {
  // Skip if no actual change
  if (oldId === newId) return;

  // For primary culture changes, we need to preserve array order
  // to prevent secondary culture from shifting to primary position
  if (isPrimary && secondaryCultureId.value !== null) {
    const secondaryId = secondaryCultureId.value;
    // Track deletions before removing from local state
    if (oldId !== null) trackCultureDeletion(oldId);
    // Secondary is re-added, so only track if it's truly being removed
    // (it's temporarily removed and re-added, so don't track it)
    // Remove both cultures
    if (oldId !== null) talentStore.removeCulture(oldId);
    talentStore.removeCulture(secondaryId);
    // Re-add in correct order: new primary first, then secondary
    if (newId !== null) talentStore.addCulture(newId);
    talentStore.addCulture(secondaryId);
  } else {
    // Simple case: no secondary or changing secondary
    if (oldId !== null) {
      trackCultureDeletion(oldId);
      talentStore.removeCulture(oldId);
    }
    if (newId !== null) {
      talentStore.addCulture(newId);
    }
  }
}

function setPrimaryCulture(val: number | null) {
  setCulture(primaryCultureId.value, val, true);
}

function setSecondaryCulture(val: number | null) {
  setCulture(secondaryCultureId.value, val, false);
}
</script>
