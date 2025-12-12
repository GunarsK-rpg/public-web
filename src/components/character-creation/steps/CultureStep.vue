<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Choose your cultural background</div>

    <!-- Primary Culture Selection -->
    <q-select
      v-model="primaryCultureId"
      :options="cultureOptions"
      label="Primary Culture"
      outlined
      emit-value
      map-options
      class="q-mb-md"
    />

    <!-- Secondary Culture (Optional) -->
    <q-select
      v-model="secondaryCultureId"
      :options="secondaryCultureOptions"
      label="Secondary Culture (Optional)"
      outlined
      emit-value
      map-options
      clearable
      class="q-mb-md"
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
import { useCharacterCreationStore } from 'stores/character-creation';
import { useClassifierStore } from 'stores/classifiers';

const store = useCharacterCreationStore();
const classifiers = useClassifierStore();

const cultureOptions = computed(() =>
  classifiers.cultures.map((c) => ({ value: c.id, label: c.name }))
);

const secondaryCultureOptions = computed(() =>
  classifiers.cultures
    .filter((c) => c.id !== store.culture.primaryCultureId)
    .map((c) => ({ value: c.id, label: c.name }))
);

const primaryCultureId = computed({
  get: () => store.culture.primaryCultureId || null,
  set: (val) => store.updateCulture({ primaryCultureId: val || 0 }),
});

const secondaryCultureId = computed({
  get: () => store.culture.secondaryCultureId ?? null,
  set: (val: number | null) => {
    if (val === null) {
      store.clearSecondaryCulture();
    } else {
      store.updateCulture({ secondaryCultureId: val });
    }
  },
});

const selectedCulture = computed(() =>
  classifiers.cultures.find((c) => c.id === store.culture.primaryCultureId)
);

// Get cultural expertise names for display
const culturalExpertiseNames = computed(() => {
  const names: string[] = [];

  // Primary culture expertise (using culture code to find matching expertise)
  if (store.culture.primaryCultureId) {
    const primaryCulture = classifiers.cultures.find(
      (c) => c.id === store.culture.primaryCultureId
    );
    if (primaryCulture) {
      // Cultural expertises have the same name as cultures
      const expertise = classifiers.expertises.find(
        (e) => e.categoryId === 2 && e.name === primaryCulture.name
      );
      if (expertise) names.push(expertise.name);
    }
  }

  // Secondary culture expertise
  if (store.culture.secondaryCultureId) {
    const secondaryCulture = classifiers.cultures.find(
      (c) => c.id === store.culture.secondaryCultureId
    );
    if (secondaryCulture) {
      const expertise = classifiers.expertises.find(
        (e) => e.categoryId === 2 && e.name === secondaryCulture.name
      );
      if (expertise) names.push(expertise.name);
    }
  }

  return names;
});
</script>
