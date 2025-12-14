<template>
  <div>
    <div class="text-subtitle1 q-mb-sm">Select your expertises</div>
    <div class="text-caption q-mb-md">
      Free slots:
      <strong :class="slotsRemaining >= 0 ? 'text-positive' : 'text-negative'">{{
        slotsRemaining
      }}</strong>
      ({{ intellectScore }} from Intellect)
    </div>

    <!-- Cultural Expertises Banner -->
    <q-banner v-if="culturalExpertises.length > 0" class="banner-info q-mb-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_language" />
      </template>
      <div>
        <strong>Cultural Expertises:</strong>
        {{ culturalExpertises.map((e) => e.name).join(', ') }}
      </div>
      <div class="text-caption text-muted">Auto-applied from your selected cultures</div>
    </q-banner>

    <!-- Starting Kit Expertises Banner -->
    <q-banner v-if="startingKitExpertises.length > 0" class="banner-info q-mb-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_backpack" />
      </template>
      <div>
        <strong>Starting Kit Expertises:</strong>
        {{ startingKitExpertises.map((e) => e.name).join(', ') }}
      </div>
      <div class="text-caption text-muted">Granted by your starting kit</div>
    </q-banner>

    <!-- Category Tabs -->
    <q-tabs
      v-model="selectedCategory"
      dense
      class="q-mb-md"
      active-color="primary"
      indicator-color="primary"
    >
      <q-tab name="all" label="All" />
      <q-tab
        v-for="expType in classifiers.expertiseTypes"
        :key="expType.id"
        :name="expType.code"
        :label="expType.name"
      />
    </q-tabs>

    <!-- Expertise List -->
    <q-list bordered separator>
      <q-item
        v-for="expertise in filteredExpertises"
        :key="expertise.id"
        :class="{ 'item-selected': isSelected(expertise.id) }"
      >
        <q-item-section avatar>
          <q-checkbox
            :model-value="isSelected(expertise.id)"
            :disable="
              isReadOnly(expertise.id) || (!isSelected(expertise.id) && slotsRemaining <= 0)
            "
            @update:model-value="toggleExpertise(expertise.id)"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ expertise.name }}</q-item-label>
          <q-item-label caption>{{ expertise.description }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge v-if="getSource(expertise.id)" color="grey-7">
            {{ getSource(expertise.id) }}
          </q-badge>
          <q-badge v-if="isSpecialist(expertise.id)" color="warning">Restricted</q-badge>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { useStepValidation } from 'src/composables/useStepValidation';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();
const { budget } = useStepValidation();

const selectedCategory = ref('all');

const intellectScore = computed(() => heroStore.getAttributeValue('int'));
const expertisesBudget = computed(() => budget('expertises'));
const slotsRemaining = computed(() => expertisesBudget.value.remaining);

// Hero's current expertises
const heroExpertises = computed(() => heroStore.hero?.expertises ?? []);

// Get cultural expertises (auto-applied from cultures)
const culturalExpertises = computed(() => {
  return heroExpertises.value
    .filter((e) => e.source?.sourceType === 'culture')
    .map((e) => classifiers.getById(classifiers.expertises, e.expertiseId))
    .filter((e): e is NonNullable<typeof e> => e !== undefined);
});

// Get expertises from starting kit
const startingKitExpertises = computed(() => {
  return heroExpertises.value
    .filter((e) => e.source?.sourceType === 'starting_kit')
    .map((e) => classifiers.getById(classifiers.expertises, e.expertiseId))
    .filter((e): e is NonNullable<typeof e> => e !== undefined);
});

// Get expertise type by code
function getExpertiseTypeId(code: string): number | undefined {
  return classifiers.getByCode(classifiers.expertiseTypes, code)?.id;
}

const filteredExpertises = computed(() => {
  if (selectedCategory.value === 'all') {
    return classifiers.expertises;
  }
  const typeId = getExpertiseTypeId(selectedCategory.value);
  if (!typeId) return [];
  return classifiers.expertises.filter((e) => e.expertiseTypeId === typeId);
});

function isSelected(expertiseId: number): boolean {
  return heroExpertises.value.some((e) => e.expertiseId === expertiseId);
}

function isReadOnly(expertiseId: number): boolean {
  const source = getSource(expertiseId);
  // Cultural and starting kit expertises are read-only
  return source === 'culture' || source === 'starting_kit';
}

function getSource(expertiseId: number): string | null {
  const heroExp = heroExpertises.value.find((e) => e.expertiseId === expertiseId);
  return heroExp?.source?.sourceType ?? null;
}

function toggleExpertise(expertiseId: number) {
  if (isSelected(expertiseId)) {
    // Don't remove read-only expertises
    if (!isReadOnly(expertiseId)) {
      heroStore.removeExpertise(expertiseId);
    }
  } else if (slotsRemaining.value > 0) {
    heroStore.addExpertise(expertiseId, { sourceType: 'intellect' });
  }
}

// Check if expertise is specialist type (restricted)
function isSpecialist(expertiseId: number): boolean {
  const specialistTypeId = getExpertiseTypeId('specialist');
  if (!specialistTypeId) return false;
  const expertise = classifiers.getById(classifiers.expertises, expertiseId);
  return expertise?.expertiseTypeId === specialistTypeId;
}
</script>
