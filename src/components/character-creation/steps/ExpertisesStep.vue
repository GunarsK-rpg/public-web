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
      align="left"
      narrow-indicator
      mobile-arrows
      outside-arrows
      class="q-mb-md"
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
            :aria-label="`Toggle ${expertise.name}`"
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

      <!-- Custom expertises matching current tab -->
      <q-item v-for="ce in filteredCustomExpertises" :key="`custom-${ce.id}`" class="item-selected">
        <q-item-section avatar>
          <q-checkbox :model-value="true" disable :aria-label="`${ce.customName} (custom)`" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ ce.customName }} *</q-item-label>
          <q-item-label caption>Custom</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            dense
            icon="close"
            size="sm"
            :aria-label="`Remove custom expertise: ${ce.customName || 'custom'}`"
            @click="removeCustom(ce.id)"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Add Custom button -->
    <div class="q-pa-sm q-mt-xs">
      <q-btn
        flat
        dense
        icon="add"
        label="Add Custom"
        color="primary"
        size="sm"
        :disable="slotsRemaining <= 0"
        aria-label="Add custom expertise"
        @click="openCustomDialog"
      />
    </div>

    <!-- Add Custom Expertise Dialog -->
    <q-dialog
      v-model="showCustomDialog"
      aria-modal="true"
      aria-labelledby="custom-exp-dialog-title"
    >
      <q-card class="custom-expertise-card" role="dialog">
        <q-card-section class="row items-center">
          <div id="custom-exp-dialog-title" class="text-h6">Add Custom Expertise</div>
          <q-space />
          <q-btn icon="close" flat round dense aria-label="Close dialog" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-select
            v-model="customTypeId"
            :options="expertiseTypeOptions"
            label="Type"
            emit-value
            map-options
            behavior="menu"
            aria-label="Expertise type"
          />
          <q-input
            v-model="customNameInput"
            label="Name"
            :maxlength="100"
            class="q-mt-md"
            aria-label="Custom name"
          />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Add" color="primary" :disable="!canAddCustom" @click="addCustom" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useClassifierStore } from 'src/stores/classifiers';
import { useStepValidation } from 'src/composables/useStepValidation';
import { findById, findByCode } from 'src/utils/arrayUtils';
import type { DeletionTracker } from 'src/composables/useDeletionTracker';
import BudgetDisplay from '../shared/BudgetDisplay.vue';
import InfoBanner from '../shared/InfoBanner.vue';

const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();
const classifiers = useClassifierStore();
const { budget } = useStepValidation();
const deletionTracker = inject<DeletionTracker>('deletionTracker');

const selectedCategory = ref('all');
const showCustomDialog = ref(false);
const customTypeId = ref<number | null>(null);
const customNameInput = ref('');

const intellectScore = computed(() => attrStore.getAttributeValue('int'));
const expertisesBudget = computed(() => budget('expertises'));
const slotsRemaining = computed(() => expertisesBudget.value.remaining);

// Cache specialist type ID lookup to avoid repeated findByCode calls
const specialistTypeId = computed(() => findByCode(classifiers.expertiseTypes, 'specialist')?.id);

// Hero's current expertises
const heroExpertises = computed(() => heroStore.expertises);

// Pre-computed Maps for O(1) lookups in template (avoids O(n) per item in v-for)
const selectedSet = computed(
  () =>
    new Set(
      heroExpertises.value.map((e) => e.expertise?.id).filter((id): id is number => id != null)
    )
);
const sourceMap = computed(() => {
  const map = new Map<number, string>();
  for (const e of heroExpertises.value) {
    if (e.expertise?.id != null && e.source?.sourceType) {
      map.set(e.expertise.id, e.source.sourceType);
    }
  }
  return map;
});

// Helper to get expertises by source type
function getExpertisesBySource(sourceType: string) {
  return heroExpertises.value
    .filter((e) => e.source?.sourceType === sourceType)
    .map((e) => findById(classifiers.expertises, e.expertise?.id))
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
  return classifiers.expertises.filter((e) => e.expertiseType?.id === typeId);
});

// Custom expertises filtered by current tab
const filteredCustomExpertises = computed(() => {
  const customs = heroExpertises.value.filter((e) => !e.expertise);
  if (selectedCategory.value === 'all') return customs;
  const typeId = getExpertiseTypeId(selectedCategory.value);
  if (!typeId) return [];
  return customs.filter((e) => e.expertiseType?.id === typeId);
});

const expertiseTypeOptions = computed(() =>
  classifiers.expertiseTypes.map((t) => ({ label: t.name, value: t.id }))
);

const canAddCustom = computed(() => {
  if (!customTypeId.value || !customNameInput.value.trim()) return false;
  if (slotsRemaining.value <= 0) return false;
  const name = customNameInput.value.trim();
  return !heroExpertises.value.some(
    (e) => !e.expertise && e.expertiseType?.id === customTypeId.value && e.customName === name
  );
});

function isSelected(expertiseId: number): boolean {
  return selectedSet.value.has(expertiseId);
}

function isReadOnly(expertiseId: number): boolean {
  const source = getSource(expertiseId);
  // Cultural and starting kit expertises are read-only
  return source === 'culture' || source === 'starting_kit';
}

function getSource(expertiseId: number): string | null {
  return sourceMap.value.get(expertiseId) ?? null;
}

function toggleExpertise(expertiseId: number, checked: boolean) {
  if (checked) {
    // Defensive guard: prevent adding if already selected (edge case from rapid clicks)
    if (slotsRemaining.value > 0 && !isSelected(expertiseId)) {
      attrStore.addExpertise(expertiseId, { sourceType: 'intellect' });
    }
  } else if (!isReadOnly(expertiseId)) {
    // Track deletion before removing from local state
    const heroExp = heroStore.hero?.expertises.find((e) => e.expertise?.id === expertiseId);
    if (heroExp && heroExp.id > 0) {
      deletionTracker?.trackDeletion('expertises', heroExp.id);
    }
    attrStore.removeExpertise(expertiseId);
  }
}

// Check if expertise is specialist type (restricted)
function isSpecialist(expertiseId: number): boolean {
  if (!specialistTypeId.value) return false;
  const expertise = findById(classifiers.expertises, expertiseId);
  return expertise?.expertiseType?.id === specialistTypeId.value;
}

function openCustomDialog() {
  customTypeId.value = getExpertiseTypeId(selectedCategory.value) ?? null;
  customNameInput.value = '';
  showCustomDialog.value = true;
}

function addCustom() {
  if (!canAddCustom.value || !customTypeId.value) return;
  attrStore.addCustomExpertise(customTypeId.value, customNameInput.value.trim(), {
    sourceType: 'intellect',
  });
  customNameInput.value = '';
  showCustomDialog.value = false;
}

function removeCustom(id: number) {
  if (id > 0) {
    deletionTracker?.trackDeletion('expertises', id);
  }
  attrStore.removeCustomExpertise(id);
}
</script>

<style scoped>
.custom-expertise-card {
  min-width: min(350px, 90vw);
  max-width: 450px;
}
</style>
