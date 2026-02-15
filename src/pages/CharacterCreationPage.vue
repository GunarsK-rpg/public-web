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
        <div class="text-subtitle1 q-ml-sm">
          {{ wizardStore.mode === 'edit' ? 'Edit Character' : 'Create Character' }}
        </div>
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
    <StepNavigation
      :saving="saving"
      :save-error="saveError"
      @next="handleNext"
      @finish="finishWizard"
    />

    <!-- Reset Confirmation Dialog -->
    <q-dialog v-model="showResetDialog" aria-modal="true" aria-labelledby="reset-dialog-title">
      <q-card role="dialog">
        <q-card-section>
          <div id="reset-dialog-title" class="text-h6">Reset Character Creation?</div>
        </q-card-section>
        <q-card-section> This will clear all your progress. Are you sure? </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" aria-label="Cancel and close dialog" v-close-popup />
          <q-btn flat label="Reset" color="negative" @click="resetWizard" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted, type Component } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useWizardStore } from 'stores/wizard';
import { useHeroStore } from 'stores/hero';
import { useClassifierStore } from 'stores/classifiers';
import { useSwipeNavigation } from 'src/composables/useSwipeNavigation';
import { useDeletionTracker } from 'src/composables/useDeletionTracker';
import { useWizardSave } from 'src/composables/useWizardSave';
import { logger } from 'src/utils/logger';
import { toError } from 'src/utils/errorHandling';

// Shared components
import StepTabs from 'components/character-creation/shared/StepTabs.vue';
import StepNavigation from 'components/character-creation/shared/StepNavigation.vue';

// Step components
import BasicSetupStep from 'components/character-creation/steps/BasicSetupStep.vue';
import CultureStep from 'components/character-creation/steps/CultureStep.vue';
import AttributesStep from 'components/character-creation/steps/AttributesStep.vue';
import SkillsStep from 'components/character-creation/steps/SkillsStep.vue';
import ExpertisesStep from 'components/character-creation/steps/ExpertisesStep.vue';
import PathsStep from 'components/character-creation/steps/PathsStep.vue';
import StartingKitStep from 'components/character-creation/steps/StartingKitStep.vue';
import EquipmentStep from 'components/character-creation/steps/EquipmentStep.vue';
import PersonalDetailsStep from 'components/character-creation/steps/PersonalDetailsStep.vue';
import ReviewStep from 'components/character-creation/steps/ReviewStep.vue';

const props = defineProps<{
  campaignId?: string;
  characterId?: string;
}>();

const router = useRouter();
const $q = useQuasar();
const wizardStore = useWizardStore();
const heroStore = useHeroStore();
const classifierStore = useClassifierStore();

// Deletion tracker — provided to step components via inject
const deletionTracker = useDeletionTracker();
provide('deletionTracker', deletionTracker);

// Save composable
const { saving, saveError, saveAndAdvance } = useWizardSave(deletionTracker);

// State
const showResetDialog = ref(false);
const initializing = ref(true);
const stepContentRef = ref<HTMLElement | null>(null);

// Swipe navigation for mobile — only back (right swipe), not forward (left swipe)
useSwipeNavigation(stepContentRef, {
  onSwipeRight: () => {
    if (currentStep.value > 1) {
      wizardStore.goToStep(currentStep.value - 1);
    }
  },
});

const stepComponents: Record<number, Component> = {
  1: BasicSetupStep,
  2: CultureStep,
  3: AttributesStep,
  4: SkillsStep,
  5: ExpertisesStep,
  6: PathsStep,
  7: StartingKitStep,
  8: EquipmentStep,
  9: PersonalDetailsStep,
  10: ReviewStep,
};

// Current step
const currentStep = computed(() => wizardStore.currentStep);
const currentStepComponent = computed(() => {
  const component = stepComponents[currentStep.value];
  if (!component) {
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

async function handleNext(): Promise<void> {
  await saveAndAdvance();
}

function finishWizard() {
  const heroId = heroStore.hero?.id;
  const campId = heroStore.hero?.campaignId;
  wizardStore.reset();
  heroStore.clearHero();
  if (heroId && heroId > 0 && campId) {
    void router.push(`/campaigns/${campId}/characters/${heroId}`);
  } else {
    void router.push('/campaigns');
  }
}

// Reset
function confirmReset() {
  showResetDialog.value = true;
}

function resetWizard() {
  deletionTracker.clearAll();
  wizardStore.reset();
  heroStore.clearHero();
  const campId = props.campaignId ? Number(props.campaignId) : undefined;
  wizardStore.startCreate(campId);
  // If we were on an edit route, switch URL back to create
  if (props.characterId) {
    const newPath = campId ? `/campaigns/${campId}/characters/new` : '/characters/new';
    void router.replace(newPath);
  }
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
      if (props.characterId) {
        // Edit route — load existing hero
        const heroId = Number(props.characterId);
        const success = await wizardStore.startEdit(heroId);
        if (!success) {
          $q.notify({
            type: 'negative',
            message: 'Character not found',
            caption: 'Unable to load the character for editing.',
            timeout: 5000,
          });
          void router.replace('/campaigns');
          return;
        }
      } else {
        // Create route — start fresh
        const campId = props.campaignId ? Number(props.campaignId) : undefined;
        wizardStore.startCreate(campId);
      }
    }
  } catch (error) {
    logger.error('Failed to initialize character creation', toError(error));
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
