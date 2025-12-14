<template>
  <div class="step-tabs-container">
    <div class="step-tabs row no-wrap">
      <div
        v-for="step in steps"
        :key="step.id"
        class="step-tab q-px-md q-py-sm text-center cursor-pointer"
        :class="{
          'step-tab--active': currentStep === step.id,
          'step-tab--done': isStepDone(step.id) && currentStep !== step.id,
          'text-negative': hasStepErrors(step.code),
        }"
        @click="goToStep(step.id)"
      >
        <div class="step-tab-name text-caption text-uppercase">
          <q-icon v-if="hasStepErrors(step.code)" name="error" size="xs" class="q-mr-xs" />
          {{ step.name }}
        </div>
      </div>
    </div>
    <q-linear-progress
      :value="currentStep / totalSteps"
      color="primary"
      size="3px"
      class="step-progress"
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

function isStepDone(step: number): boolean {
  return wizardStore.completedSteps.includes(step);
}

function hasStepErrors(stepCode: string): boolean {
  if (!wizardStore.isStepCompleted(stepIdFromCode(stepCode))) return false;
  return !validate(stepCode).isValid;
}

function stepIdFromCode(code: string): number {
  return steps.find((s) => s.code === code)?.id ?? 0;
}

function goToStep(step: number) {
  wizardStore.markStepCompleted(wizardStore.currentStep);
  wizardStore.goToStep(step);
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
    background: rgba(255, 255, 255, 0.1);
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
