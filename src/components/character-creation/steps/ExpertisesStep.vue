<template>
  <div>
    <div class="text-subtitle1 q-mb-sm">Select your expertises</div>
    <BudgetDisplay
      label="Free slots"
      :remaining="slotsRemaining"
      :suffix="`${intellectScore} from Intellect`"
    />

    <!-- Cultural Expertises Banner -->
    <InfoBanner
      v-if="culturalExpertises.length > 0"
      icon="sym_o_language"
      title="Cultural Expertises"
      :content="culturalExpertises.map((e) => e.name).join(', ')"
      caption="Auto-applied from your selected cultures"
    />

    <!-- Starting Kit Expertises Banner -->
    <InfoBanner
      v-if="startingKitExpertises.length > 0"
      icon="sym_o_backpack"
      title="Starting Kit Expertises"
      :content="startingKitExpertises.map((e) => e.name).join(', ')"
      caption="Granted by your starting kit"
    />

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
            @update:model-value="(val) => toggleExpertise(expertise.id, val)"
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
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useClassifierStore } from 'src/stores/classifiers';
import { useStepValidation } from 'src/composables/useStepValidation';
import { findById, findByCode } from 'src/utils/arrayUtils';
import BudgetDisplay from '../shared/BudgetDisplay.vue';
import InfoBanner from '../shared/InfoBanner.vue';

const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();
const classifiers = useClassifierStore();
const { budget } = useStepValidation();

const selectedCategory = ref('all');

const intellectScore = computed(() => attrStore.getAttributeValue('int'));
const expertisesBudget = computed(() => budget('expertises'));
const slotsRemaining = computed(() => expertisesBudget.value.remaining);

// Cache specialist type ID lookup to avoid repeated findByCode calls
const specialistTypeId = computed(() => findByCode(classifiers.expertiseTypes, 'specialist')?.id);

// Hero's current expertises
const heroExpertises = computed(() => heroStore.expertises);

// Helper to get expertises by source type
function getExpertisesBySource(sourceType: string) {
  return heroExpertises.value
    .filter((e) => e.source?.sourceType === sourceType)
    .map((e) => findById(classifiers.expertises, e.expertise.id))
    .filter((e): e is NonNullable<typeof e> => e !== undefined);
}

// Get cultural expertises (auto-applied from cultures)
const culturalExpertises = computed(() => getExpertisesBySource('culture'));

// Get expertises from starting kit
const startingKitExpertises = computed(() => getExpertisesBySource('starting_kit'));

// Get expertise type by code
function getExpertiseTypeId(code: string): number | undefined {
  return findByCode(classifiers.expertiseTypes, code)?.id;
}

const filteredExpertises = computed(() => {
  if (selectedCategory.value === 'all') {
    return classifiers.expertises;
  }
  const typeId = getExpertiseTypeId(selectedCategory.value);
  if (!typeId) return [];
  return classifiers.expertises.filter((e) => e.expertiseType.id === typeId);
});

function isSelected(expertiseId: number): boolean {
  return heroExpertises.value.some((e) => e.expertise.id === expertiseId);
}

function isReadOnly(expertiseId: number): boolean {
  const source = getSource(expertiseId);
  // Cultural and starting kit expertises are read-only
  return source === 'culture' || source === 'starting_kit';
}

function getSource(expertiseId: number): string | null {
  const heroExp = heroExpertises.value.find((e) => e.expertise.id === expertiseId);
  return heroExp?.source?.sourceType ?? null;
}

function toggleExpertise(expertiseId: number, checked: boolean) {
  if (checked) {
    // Defensive guard: prevent adding if already selected (edge case from rapid clicks)
    if (slotsRemaining.value > 0 && !isSelected(expertiseId)) {
      attrStore.addExpertise(expertiseId, { sourceType: 'intellect' });
    }
  } else if (!isReadOnly(expertiseId)) {
    // Don't remove read-only expertises
    attrStore.removeExpertise(expertiseId);
  }
}

// Check if expertise is specialist type (restricted)
function isSpecialist(expertiseId: number): boolean {
  if (!specialistTypeId.value) return false;
  const expertise = findById(classifiers.expertises, expertiseId);
  return expertise?.expertiseType.id === specialistTypeId.value;
}
</script>
