<template>
  <div class="step-tabs-container">
    <q-tabs
      :model-value="currentStep"
      dense
      align="left"
      narrow-indicator
      mobile-arrows
      outside-arrows
      @update:model-value="handleTabClick"
    >
      <q-tab
        v-for="step in steps"
        :key="step.id"
        :name="step.id"
        :label="step.name"
        :disable="!canNavigateTo(step.id)"
        :alert="hasStepErrors(step.code) ? 'negative' : false"
        :alert-icon="hasStepErrors(step.code) ? 'error' : undefined"
        :class="{ 'text-negative': hasStepErrors(step.code) }"
      />
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWizardStore } from 'src/stores/wizard';
import { useStepValidation } from 'src/composables/useStepValidation';
import { WIZARD_STEPS } from 'src/types';

const emit = defineEmits<{
  navigate: [step: number];
}>();

const wizardStore = useWizardStore();
const { validate } = useStepValidation();

const steps = WIZARD_STEPS;

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

function hasStepErrors(stepCode: string): boolean {
  return stepErrors.value[stepCode] ?? false;
}

function canNavigateTo(step: number): boolean {
  // In create mode, only allow backward navigation or to completed steps
  if (wizardStore.mode === 'create') {
    return step <= currentStep.value || wizardStore.isStepCompleted(step);
  }
  // In edit mode, all steps are accessible
  return true;
}

function handleTabClick(step: number) {
  if (!canNavigateTo(step) || step === wizardStore.currentStep) return;
  emit('navigate', step);
}
</script>
