<template>
  <div class="creation-footer q-pa-sm row items-center">
    <q-btn v-if="currentStep > 1" flat dense icon="arrow_back" label="Back" @click="previousStep" />
    <q-space />
    <div
      v-if="hasErrors"
      class="text-negative text-caption q-mr-sm"
      role="alert"
      aria-live="polite"
    >
      <q-icon name="error" size="xs" class="q-mr-xs" aria-hidden="true" />
      {{ firstError }}
    </div>
    <q-btn
      v-if="!isLastStep"
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
      @click="$emit('create')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWizardStore } from 'src/stores/wizard';
import { useStepValidation } from 'src/composables/useStepValidation';

defineProps<{
  creating?: boolean;
}>();

defineEmits<{
  create: [];
}>();

const wizardStore = useWizardStore();
const { currentStepCode, currentValidation, allStepsValidation } = useStepValidation();

const currentStep = computed(() => wizardStore.currentStep);
const isLastStep = computed(() => currentStepCode.value === 'review');
const hasErrors = computed(() => currentValidation.value.errors.length > 0);
const firstError = computed(() => currentValidation.value.errors[0] ?? '');
const canCreate = computed(() => allStepsValidation.value.isValid);

function previousStep() {
  wizardStore.previousStep();
}

function nextStep() {
  wizardStore.nextStep();
}
</script>

<style scoped lang="scss">
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
