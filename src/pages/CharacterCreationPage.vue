<template>
  <q-page class="character-creation-page">
    <!-- Sticky Header with Step Navigation -->
    <div class="creation-header">
      <div class="row items-center no-wrap">
        <StepTabs class="col q-my-md" />
        <q-btn
          flat
          round
          dense
          icon="refresh"
          color="negative"
          class="q-mr-xs"
          aria-label="Reset character creation"
          @click="confirmReset"
        >
          <q-tooltip>Reset</q-tooltip>
        </q-btn>
      </div>
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
      @save-close="handleSaveAndClose"
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
import { ref, computed, provide, onMounted, onUnmounted, type Component } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useWizardStore } from 'stores/wizard';
import { useHeroStore } from 'stores/hero';
import { useClassifierStore } from 'stores/classifiers';
import { useCampaignStore } from 'stores/campaigns';
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
  characterId?: string;
}>();

const router = useRouter();
const route = useRoute();

// campaignId comes from query param (e.g. /characters/new?campaignId=5)
const queryCampaignId = computed(() => {
  const val = route.query.campaignId;
  return typeof val === 'string' ? val : undefined;
});
const $q = useQuasar();
const wizardStore = useWizardStore();
const heroStore = useHeroStore();
const classifierStore = useClassifierStore();
const campaignStore = useCampaignStore();

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
async function handleNext(): Promise<void> {
  await saveAndAdvance();
}

function closeWizardAndNavigate(): void {
  const heroId = heroStore.hero?.id;
  deletionTracker.clearAll();
  wizardStore.reset();
  heroStore.clearHero();
  if (heroId && heroId > 0) {
    void router.push({ name: 'character-sheet', params: { characterId: String(heroId) } });
  } else {
    void router.push({ name: 'my-characters' });
  }
}

async function handleSaveAndClose(): Promise<void> {
  const saved = await saveAndAdvance();
  if (saved) {
    closeWizardAndNavigate();
  }
}

function finishWizard() {
  closeWizardAndNavigate();
}

// Reset
function confirmReset() {
  showResetDialog.value = true;
}

function resetWizard() {
  deletionTracker.clearAll();
  wizardStore.reset();
  heroStore.clearHero();
  const campId =
    queryCampaignId.value !== undefined && queryCampaignId.value !== ''
      ? Number(queryCampaignId.value)
      : undefined;
  if (campId !== undefined && (!Number.isFinite(campId) || campId <= 0)) {
    $q.notify({ type: 'negative', message: 'Invalid campaign ID' });
    void router.replace({ name: 'campaigns' });
    return;
  }
  wizardStore.startCreate(campId);
  // If we were on an edit route, switch URL back to create
  if (props.characterId) {
    const createRoute = campId
      ? { name: 'character-create', query: { campaignId: String(campId) } }
      : { name: 'character-create' };
    void router.replace(createRoute);
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
    // Ensure campaigns are available for modifier-based validation
    if (!campaignStore.hasCampaigns) {
      await campaignStore.fetchCampaigns();
    }
    if (!wizardStore.isActive) {
      if (props.characterId) {
        // Edit route — load existing hero
        const heroId = Number(props.characterId);
        if (!Number.isFinite(heroId) || heroId <= 0) {
          $q.notify({ type: 'negative', message: 'Invalid character ID' });
          void router.replace({ name: 'my-characters' });
          return;
        }
        const success = await wizardStore.startEdit(heroId);
        if (!success) {
          $q.notify({
            type: 'negative',
            message: 'Character not found',
            caption: 'Unable to load the character for editing.',
            timeout: 5000,
          });
          void router.replace({ name: 'my-characters' });
          return;
        }
      } else {
        // Create route — start fresh
        const campId =
          queryCampaignId.value !== undefined && queryCampaignId.value !== ''
            ? Number(queryCampaignId.value)
            : undefined;
        if (campId !== undefined && (!Number.isFinite(campId) || campId <= 0)) {
          $q.notify({ type: 'negative', message: 'Invalid campaign ID' });
          void router.replace({ name: 'campaigns' });
          return;
        }
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

onUnmounted(() => {
  deletionTracker.clearAll();
  wizardStore.reset();
  heroStore.clearHero();
});
</script>

<style scoped lang="scss">
$app-header-height: 50px;
$bottom-nav-height: 56px;

.character-creation-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - #{$app-header-height} - #{$bottom-nav-height});
  padding: 0 !important;
}

.step-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.creation-header {
  flex-shrink: 0;
}
</style>
