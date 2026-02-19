<template>
  <div class="creation-footer q-pa-sm row items-center">
    <q-btn v-if="currentStep > 1" flat dense icon="arrow_back" label="Back" @click="previousStep" />
    <q-space />
    <div
      v-if="displayError"
      class="text-negative text-caption q-mr-sm"
      role="alert"
      aria-live="polite"
    >
      <q-icon name="error" size="xs" class="q-mr-xs" aria-hidden="true" />
      {{ displayError }}
    </div>
    <div
      v-else-if="displayWarning"
      class="text-warning text-caption q-mr-sm"
      role="status"
      aria-live="polite"
    >
      <q-icon name="warning" size="xs" class="q-mr-xs" aria-hidden="true" />
      {{ displayWarning }}
    </div>
    <q-btn
      v-if="!isLastStep"
      color="primary"
      dense
      label="Next"
      icon-right="arrow_forward"
      :loading="saving"
      @click="$emit('next')"
    />
    <q-btn
      v-else
      color="primary"
      dense
      label="Finish"
      icon="check"
      :disable="!isReadyToFinish"
      @click="$emit('finish')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWizardStore } from 'src/stores/wizard';
import { useStepValidation } from 'src/composables/useStepValidation';
import { STEP_CODES } from 'src/types/wizard';

const props = defineProps<{
  saving?: boolean;
  saveError?: string | null;
}>();

defineEmits<{
  next: [];
  finish: [];
}>();

const wizardStore = useWizardStore();
const { currentStepCode, currentValidation, allStepsValidation } = useStepValidation();

const currentStep = computed(() => wizardStore.currentStep);
const isLastStep = computed(() => currentStepCode.value === STEP_CODES.REVIEW);
const isReadyToFinish = computed(() => allStepsValidation.value.isValid);

const displayError = computed(() => {
  if (props.saveError) return props.saveError;
  const errors = currentValidation.value.errors;
  return errors.length > 0 ? errors[0] : null;
});

const displayWarning = computed(() => {
  const warnings = currentValidation.value.warnings;
  return warnings.length > 0 ? warnings[0] : null;
});

function previousStep() {
  wizardStore.previousStep();
}
</script>

<style scoped lang="scss">
.creation-footer {
  position: sticky;
  bottom: 0;
  z-index: 100;
  background-color: var(--q-dark-page);
  border-top: 1px solid $color-border-dark;

  .body--light & {
    background-color: $color-background-light;
    border-top-color: $color-border-light;
  }
}
</style>
