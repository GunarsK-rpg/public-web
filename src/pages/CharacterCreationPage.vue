<template>
  <q-page class="character-creation-page">
    <!-- Sticky Header with Step Navigation -->
    <div class="creation-header bg-dark text-white">
      <!-- Top row: back button and title -->
      <div class="row items-center q-px-sm q-py-xs">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          color="white"
          aria-label="Go back"
          @click="goBack"
        />
        <div class="text-subtitle1 q-ml-sm">Create Character</div>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="refresh"
          color="negative"
          aria-label="Reset character creation"
          @click="confirmReset"
        >
          <q-tooltip>Reset</q-tooltip>
        </q-btn>
      </div>

      <!-- Horizontal scrollable step tabs -->
      <StepTabs />
    </div>

    <!-- Loading state -->
    <div v-if="initializing" class="flex flex-center q-pa-xl step-content">
      <q-spinner-dots size="50px" color="primary" aria-label="Loading character creation" />
    </div>

    <!-- Step Content (swipeable on mobile) -->
    <div
      v-else
      ref="stepContentRef"
      :id="`step-panel-${currentStep}`"
      :aria-labelledby="`step-tab-${currentStep}`"
      class="q-pa-md step-content"
      role="tabpanel"
    >
      <component :is="currentStepComponent" />
    </div>

    <!-- Bottom Navigation -->
    <StepNavigation :creating="creating" @create="createCharacter" />

    <!-- Reset Confirmation Dialog -->
    <q-dialog v-model="showResetDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Reset Character Creation?</div>
        </q-card-section>
        <q-card-section> This will clear all your progress. Are you sure? </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Reset" color="negative" @click="resetWizard" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Component } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useWizardStore } from 'stores/wizard';
import { useHeroStore } from 'stores/hero';
import { useClassifierStore } from 'stores/classifiers';
import { useSwipeNavigation } from 'src/composables/useSwipeNavigation';
import { logger } from 'src/utils/logger';
import { WIZARD_STEPS } from 'src/types';

// Shared components
import StepTabs from 'components/character-creation/shared/StepTabs.vue';
import StepNavigation from 'components/character-creation/shared/StepNavigation.vue';

// Step components
import BasicSetupStep from 'components/character-creation/steps/BasicSetupStep.vue';
import AncestryStep from 'components/character-creation/steps/AncestryStep.vue';
import CultureStep from 'components/character-creation/steps/CultureStep.vue';
import AttributesStep from 'components/character-creation/steps/AttributesStep.vue';
import SkillsStep from 'components/character-creation/steps/SkillsStep.vue';
import ExpertisesStep from 'components/character-creation/steps/ExpertisesStep.vue';
import PathsStep from 'components/character-creation/steps/PathsStep.vue';
import StartingKitStep from 'components/character-creation/steps/StartingKitStep.vue';
import EquipmentStep from 'components/character-creation/steps/EquipmentStep.vue';
import PersonalDetailsStep from 'components/character-creation/steps/PersonalDetailsStep.vue';
import ReviewStep from 'components/character-creation/steps/ReviewStep.vue';

const router = useRouter();
const $q = useQuasar();
const wizardStore = useWizardStore();
const heroStore = useHeroStore();
const classifierStore = useClassifierStore();

// State
const creating = ref(false);
const showResetDialog = ref(false);
const initializing = ref(true);
const stepContentRef = ref<HTMLElement | null>(null);

// Swipe navigation for mobile
const totalSteps = WIZARD_STEPS.length;

useSwipeNavigation(stepContentRef, {
  onSwipeLeft: () => {
    // Next step
    if (currentStep.value < totalSteps) {
      wizardStore.markStepCompleted(currentStep.value);
      wizardStore.goToStep(currentStep.value + 1);
    }
  },
  onSwipeRight: () => {
    // Previous step
    if (currentStep.value > 1) {
      wizardStore.goToStep(currentStep.value - 1);
    }
  },
});

const stepComponents: Record<number, Component> = {
  1: BasicSetupStep,
  2: AncestryStep,
  3: CultureStep,
  4: AttributesStep,
  5: SkillsStep,
  6: ExpertisesStep,
  7: PathsStep,
  8: StartingKitStep,
  9: EquipmentStep,
  10: PersonalDetailsStep,
  11: ReviewStep,
};

// Current step
const currentStep = computed(() => wizardStore.currentStep);
const currentStepComponent = computed(() => {
  const component = stepComponents[currentStep.value];
  if (!component) {
    // Log issue for debugging rather than silent fallback
    logger.warn('Invalid wizard step, defaulting to step 1', {
      requestedStep: currentStep.value,
      availableSteps: Object.keys(stepComponents).map(Number),
    });
    return stepComponents[1];
  }
  return component;
});

// Navigation
function goBack() {
  router.back();
}

// Create character
async function createCharacter(): Promise<void> {
  creating.value = true;
  try {
    // TODO: Replace with actual API call
    await Promise.resolve(); // Placeholder for: await heroService.createHero(heroStore.hero);
    $q.notify({
      type: 'positive',
      message: 'Character created successfully!',
      position: 'top',
    });
    wizardStore.reset();
    heroStore.clearHero();
    void router.push('/campaigns');
  } catch (err) {
    logger.error('Failed to create character', err instanceof Error ? err : { error: String(err) });
    $q.notify({
      type: 'negative',
      message: 'Failed to create character',
      position: 'top',
    });
  } finally {
    creating.value = false;
  }
}

// Reset
function confirmReset() {
  showResetDialog.value = true;
}

function resetWizard() {
  wizardStore.reset();
  heroStore.clearHero();
  wizardStore.startCreate();
  $q.notify({
    type: 'info',
    message: 'Character creation reset',
    position: 'top',
  });
}

// Initialize wizard and load classifiers on mount
onMounted(async () => {
  try {
    if (!classifierStore.initialized) {
      await classifierStore.initialize();
    }
    if (!wizardStore.isActive) {
      wizardStore.startCreate();
    }
  } catch (error) {
    logger.error(
      'Failed to initialize character creation',
      error instanceof Error ? error : { error: String(error) }
    );
    $q.notify({
      type: 'negative',
      message: 'Failed to initialize',
      caption: 'Unable to load required data. Please refresh the page.',
      timeout: 8000,
    });
  } finally {
    initializing.value = false;
  }
});
</script>

<style scoped lang="scss">
.character-creation-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 !important;
}

.step-content {
  flex: 1;
}

.creation-header {
  position: sticky;
  top: 0;
  z-index: 100;
}
</style>
