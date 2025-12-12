<template>
  <q-page class="character-creation-page">
    <!-- Sticky Header with Step Navigation -->
    <div class="creation-header bg-dark text-white">
      <!-- Top row: back button and title -->
      <div class="row items-center q-px-sm q-py-xs">
        <q-btn flat round dense icon="arrow_back" color="white" @click="goBack" />
        <div class="text-subtitle1 q-ml-sm">Create Character</div>
        <q-space />
        <q-btn flat round dense icon="refresh" color="negative" @click="confirmReset">
          <q-tooltip>Reset</q-tooltip>
        </q-btn>
      </div>

      <!-- Horizontal scrollable step tabs -->
      <div class="step-tabs-container">
        <div class="step-tabs row no-wrap">
          <div
            v-for="step in steps"
            :key="step.id"
            class="step-tab q-px-md q-py-sm text-center cursor-pointer"
            :class="{
              'step-tab--active': currentStep === step.id,
              'step-tab--done': isStepDone(step.id) && currentStep !== step.id,
              'step-tab--error': hasStepError(step.id) && currentStep !== step.id,
            }"
            @click="goToStep(step.id)"
          >
            <div class="step-tab-name text-caption text-uppercase">{{ step.name }}</div>
          </div>
        </div>
        <!-- Progress bar under tabs -->
        <q-linear-progress
          :value="currentStep / totalSteps"
          color="primary"
          size="3px"
          class="step-progress"
        />
      </div>
    </div>

    <!-- Step Content -->
    <div class="q-pa-md step-content">
      <component :is="currentStepComponent" />
    </div>

    <!-- Bottom Navigation -->
    <div class="creation-footer q-pa-sm row items-center">
      <q-btn
        v-if="currentStep > 1"
        flat
        dense
        icon="arrow_back"
        label="Back"
        @click="previousStep"
      />
      <q-space />
      <div
        v-if="hasErrors"
        class="text-negative text-caption q-mr-sm ellipsis"
        style="max-width: 150px"
      >
        <q-icon name="error" size="xs" class="q-mr-xs" />
        {{ firstError }}
      </div>
      <q-btn
        v-if="currentStep < totalSteps"
        color="primary"
        dense
        label="Next"
        icon-right="arrow_forward"
        @click="nextStep"
      />
      <q-btn
        v-else
        color="primary"
        dense
        label="Create"
        icon="check"
        :loading="creating"
        :disable="!canCreate"
        @click="createCharacter"
      />
    </div>

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
import { useCharacterCreationStore } from 'stores/character-creation';
import { useClassifierStore } from 'stores/classifiers';
import { WIZARD_STEPS } from 'src/types';

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
const creationStore = useCharacterCreationStore();
const classifierStore = useClassifierStore();

// State
const creating = ref(false);
const showResetDialog = ref(false);

// Steps config
const steps = WIZARD_STEPS;
const totalSteps = steps.length;

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
const currentStep = computed(() => creationStore.currentStep);
const currentStepComponent = computed(() => stepComponents[currentStep.value]);

// Validation
const currentValidation = computed(() => creationStore.validateStep(currentStep.value));
const hasErrors = computed(() => currentValidation.value.errors.length > 0);
const firstError = computed(() => currentValidation.value.errors[0] ?? '');

function isStepDone(step: number): boolean {
  return creationStore.completedSteps.includes(step);
}

function hasStepError(step: number): boolean {
  const validation = creationStore.validateStep(step);
  return !validation.isValid && creationStore.completedSteps.includes(step);
}

// Navigation
function goBack() {
  router.back();
}

function goToStep(step: number) {
  creationStore.goToStep(step);
}

function nextStep() {
  creationStore.nextStep();
}

function previousStep() {
  creationStore.previousStep();
}

// Can create character
const canCreate = computed(() => {
  const validation = creationStore.validateStep(11);
  return validation.isValid;
});

// Create character
function createCharacter() {
  creating.value = true;
  try {
    // TODO: Implement API call to create character
    $q.notify({
      type: 'positive',
      message: 'Character created successfully!',
      position: 'top',
    });
    creationStore.reset();
    void router.push('/campaigns');
  } catch (err) {
    console.error('Failed to create character:', err);
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
  creationStore.reset();
  $q.notify({
    type: 'info',
    message: 'Character creation reset',
    position: 'top',
  });
}

// Load classifiers on mount
onMounted(async () => {
  if (!classifierStore.initialized) {
    await classifierStore.initialize();
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

.step-tabs-container {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.step-tabs {
  min-width: max-content;
}

.step-tab {
  min-width: 80px;
  opacity: 0.6;
  transition:
    opacity 0.2s,
    border-color 0.2s;
  border-bottom: 3px solid transparent;
  white-space: nowrap;

  &:hover {
    opacity: 0.8;
  }

  &--active {
    opacity: 1;
    border-bottom-color: var(--q-primary);
    background: rgba(255, 255, 255, 0.1);
  }

  &--done {
    opacity: 0.8;

    .step-tab-number {
      color: var(--q-positive);
    }
  }

  &--error {
    .step-tab-number {
      color: var(--q-negative);
    }
  }
}

.step-tab-number {
  font-weight: 600;
}

.step-tab-name {
  font-size: 10px;
  letter-spacing: 0.5px;
}

.step-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.creation-footer {
  position: sticky;
  bottom: 0;
  z-index: 100;
  background-color: var(--q-dark-page);
  border-top: 1px solid rgba(255, 255, 255, 0.12);

  .body--light & {
    background-color: #fff;
    border-top-color: rgba(0, 0, 0, 0.12);
  }
}
</style>
