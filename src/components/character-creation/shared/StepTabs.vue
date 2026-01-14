<template>
  <div class="step-tabs-container">
    <div class="step-tabs row no-wrap" role="tablist" aria-label="Character creation steps">
      <div
        v-for="step in steps"
        :key="step.id"
        :id="`step-tab-${step.id}`"
        role="tab"
        :tabindex="currentStep === step.id ? 0 : -1"
        :aria-selected="currentStep === step.id"
        :aria-controls="`step-panel-${step.id}`"
        class="step-tab q-px-md q-py-sm text-center cursor-pointer"
        :class="{
          'step-tab--active': currentStep === step.id,
          'step-tab--done': isStepDone(step.id) && currentStep !== step.id,
          'text-negative': hasStepErrors(step.code),
        }"
        @click="goToStep(step.id)"
        @keydown.enter="goToStep(step.id)"
        @keydown.space.prevent="goToStep(step.id)"
        @keydown.left="navigateTabs(-1)"
        @keydown.right="navigateTabs(1)"
      >
        <div class="step-tab-name text-caption text-uppercase">
          <q-icon
            v-if="stepErrors[step.code]"
            name="error"
            size="xs"
            class="q-mr-xs"
            :aria-label="`${step.name} has validation errors`"
          />
          {{ step.name }}
        </div>
      </div>
    </div>
    <q-linear-progress
      :value="Math.min(currentStep / totalSteps, 1)"
      color="primary"
      size="3px"
      class="step-progress"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWizardStore } from 'src/stores/wizard';
import { useStepValidation } from 'src/composables/useStepValidation';
import { WIZARD_STEPS } from 'src/types';

const wizardStore = useWizardStore();
const { validate } = useStepValidation();

const steps = WIZARD_STEPS;
const totalSteps = steps.length;

const currentStep = computed(() => wizardStore.currentStep);

// Cache step errors to avoid repeated validation calls during render
const stepErrors = computed(() => {
  const errors: Record<string, boolean> = {};
  for (const step of steps) {
    if (wizardStore.isStepCompleted(step.id)) {
      errors[step.code] = !validate(step.code).isValid;
    } else {
      errors[step.code] = false;
    }
  }
  return errors;
});

function isStepDone(step: number): boolean {
  return wizardStore.completedSteps.includes(step);
}

function hasStepErrors(stepCode: string): boolean {
  return stepErrors.value[stepCode] ?? false;
}

function goToStep(step: number) {
  // Only mark as completed if navigating forward/away
  if (step !== wizardStore.currentStep) {
    wizardStore.markStepCompleted(wizardStore.currentStep);
  }
  wizardStore.goToStep(step);
}

function navigateTabs(direction: number) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep.value);
  const newIndex = Math.max(0, Math.min(steps.length - 1, currentIndex + direction));
  const targetStep = steps[newIndex];
  if (newIndex !== currentIndex && targetStep) {
    // Use direct step navigation without marking current step complete
    // This allows keyboard exploration without unintended side effects
    wizardStore.goToStep(targetStep.id);
  }
}
</script>

<style scoped lang="scss">
.step-tabs-container {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  position: relative;

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
    background: $color-overlay-light;
  }

  &--done {
    opacity: 0.8;
  }
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
</style>
