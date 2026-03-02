<template>
  <div class="creation-footer q-pa-sm row items-center no-wrap">
    <q-btn
      v-if="currentStep > 1"
      flat
      dense
      round
      icon="arrow_back"
      aria-label="Previous step"
      @click="previousStep"
    />
    <q-space />
    <div
      v-if="displayError"
      class="status-message text-negative text-caption q-mr-sm"
      role="alert"
      aria-live="polite"
    >
      <q-icon name="error" size="xs" class="q-mr-xs" aria-hidden="true" />
      {{ displayError }}
    </div>
    <div
      v-else-if="displayWarning"
      class="status-message text-warning text-caption q-mr-sm"
      role="status"
      aria-live="polite"
    >
      <q-icon name="warning" size="xs" class="q-mr-xs" aria-hidden="true" />
      {{ displayWarning }}
    </div>
    <q-btn
      v-if="isEditMode && !isLastStep"
      flat
      dense
      label="Save"
      class="q-mx-sm q-px-md"
      :loading="saving"
      @click="$emit('save-close')"
    />
    <q-btn
      v-if="!isLastStep"
      flat
      dense
      round
      icon="arrow_forward"
      aria-label="Next step"
      :loading="saving"
      @click="$emit('next')"
    />
    <q-btn
      v-else
      color="primary"
      dense
      label="Finish"
      class="q-px-md"
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
  'save-close': [];
}>();

const wizardStore = useWizardStore();
const { currentStepCode, currentValidation, allStepsValidation } = useStepValidation();

const currentStep = computed(() => wizardStore.currentStep);
const isLastStep = computed(() => currentStepCode.value === STEP_CODES.REVIEW);
const isEditMode = computed(() => wizardStore.mode === 'edit');
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
  flex-shrink: 0;
  background-color: var(--q-dark-page);
  border-top: 1px solid $color-border-dark;

  .body--light & {
    background-color: $color-background-light;
    border-top-color: $color-border-light;
  }
}

.status-message {
  min-width: 0;
  flex-shrink: 1;
  text-align: right;
}
</style>
