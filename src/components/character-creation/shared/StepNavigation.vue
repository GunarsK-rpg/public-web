<template>
  <div class="creation-footer q-pa-sm row items-center no-wrap">
    <q-btn
      v-if="currentStep > 1"
      flat
      dense
      round
      icon="arrow_back"
      aria-label="Previous step"
      @click="emit('previous')"
    />
    <q-space />
    <div
      v-if="displayError"
      class="status-message text-negative text-caption q-mr-sm"
      role="alert"
      aria-live="polite"
    >
      <CircleAlert :size="14" class="q-mr-xs" aria-hidden="true" />
      {{ displayError }}
    </div>
    <div
      v-else-if="displayWarning"
      class="status-message text-warning text-caption q-mr-sm"
      role="status"
      aria-live="polite"
    >
      <TriangleAlert :size="14" class="q-mr-xs" aria-hidden="true" />
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
import { CircleAlert, TriangleAlert } from 'lucide-vue-next';

const props = defineProps<{
  saving?: boolean;
  saveError?: string | null;
}>();

const emit = defineEmits<{
  previous: [];
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
</script>

<style scoped lang="scss">
.creation-footer {
  flex-shrink: 0;
  border-top: 1px solid var(--cosmere-gold-muted);

  .body--dark & {
    border-top-color: rgba(201, 168, 76, 0.3);
  }
}

.status-message {
  min-width: 0;
  flex-shrink: 1;
  text-align: right;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
