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
        :alert="stepAlert(step)"
        :alert-icon="stepAlertIcon(step)"
        :class="{
          'text-negative': hasStepErrors(step.code),
          'text-warning': !hasStepErrors(step.code) && hasStepWarning(step.code),
        }"
      />
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWizardStore } from 'src/stores/wizard';
import { useHeroStore } from 'src/stores/hero';
import { useStepValidation } from 'src/composables/useStepValidation';
import { WIZARD_STEPS, STEP_CODES, type WizardStep } from 'src/types/wizard';

const emit = defineEmits<{
  navigate: [step: number];
}>();

const wizardStore = useWizardStore();
const heroStore = useHeroStore();
const { validate, budget, flexBudget } = useStepValidation();

const steps = WIZARD_STEPS;

const currentStep = computed(() => wizardStore.currentStep);

type BudgetStepCode = 'attributes' | 'skills' | 'expertises' | 'paths';
const BUDGET_STEP_CODES: Set<string> = new Set([
  STEP_CODES.ATTRIBUTES,
  STEP_CODES.SKILLS,
  STEP_CODES.PATHS,
  STEP_CODES.EXPERTISES,
]);

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

const FLEX_STEP_CODES: Set<string> = new Set([STEP_CODES.SKILLS, STEP_CODES.PATHS]);

// Cache step warnings (unspent budget on visited tabs + validation warnings)
const stepWarnings = computed(() => {
  const warnings: Record<string, boolean> = {};
  const hasUnspentFlex = flexBudget.value.flex.remaining > 0;
  for (const step of steps) {
    if (!wizardStore.isStepVisited(step.id)) {
      warnings[step.code] = false;
      continue;
    }
    if (BUDGET_STEP_CODES.has(step.code)) {
      const b = budget(step.code as BudgetStepCode);
      const flexWarning = FLEX_STEP_CODES.has(step.code) && hasUnspentFlex;
      const overBudget =
        b.remaining < 0 && (!FLEX_STEP_CODES.has(step.code) || flexBudget.value.isOverBudget);
      warnings[step.code] = b.remaining > 0 || flexWarning || overBudget;
    } else {
      warnings[step.code] = validate(step.code).warnings.length > 0;
    }
  }
  return warnings;
});

function hasStepErrors(stepCode: string): boolean {
  return stepErrors.value[stepCode] ?? false;
}

function hasStepWarning(stepCode: string): boolean {
  return stepWarnings.value[stepCode] ?? false;
}

function stepAlert(step: WizardStep): string | false {
  if (hasStepErrors(step.code)) return 'negative';
  if (hasStepWarning(step.code)) return 'warning';
  return false;
}

function stepAlertIcon(step: WizardStep): string | undefined {
  if (hasStepErrors(step.code)) return 'error';
  if (hasStepWarning(step.code)) return 'info';
  return undefined;
}

function canNavigateTo(step: number): boolean {
  if (wizardStore.mode === 'create' && heroStore.isNew) {
    // Before hero is persisted, only allow sequential navigation
    return step <= currentStep.value || wizardStore.isStepCompleted(step);
  }
  // Once hero has an ID (or in edit mode), all steps are accessible
  return true;
}

function handleTabClick(step: number) {
  if (!canNavigateTo(step) || step === wizardStore.currentStep) return;
  emit('navigate', step);
}
</script>

<style scoped>
/* Place alert icon inline after tab label on the same row */
.step-tabs-container :deep(.q-tab__content) {
  flex-direction: row;
  gap: 4px;
}

.step-tabs-container :deep(.q-tab__alert-icon) {
  position: relative;
  top: auto;
  right: auto;
  font-size: 16px;
}
</style>
