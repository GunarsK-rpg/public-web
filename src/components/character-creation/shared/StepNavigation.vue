<template>
  <div class="q-mt-md row items-center">
    <q-btn
      v-if="step > 1"
      flat
      label="Back"
      icon="sym_o_arrow_back"
      @click="goBack"
      class="q-mr-sm"
    />
    <q-btn
      color="primary"
      :label="isLastStep ? 'Review' : 'Continue'"
      :icon-right="isLastStep ? 'sym_o_checklist' : 'sym_o_arrow_forward'"
      :disable="!canContinue"
      @click="goNext"
    />
    <q-space />
    <div v-if="validation.warnings.length > 0" class="text-warning">
      <q-icon name="sym_o_warning" class="q-mr-xs" />
      {{ validation.warnings[0] }}
    </div>
    <div v-if="validation.errors.length > 0" class="text-negative">
      <q-icon name="sym_o_error" class="q-mr-xs" />
      {{ validation.errors[0] }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterCreationStore } from 'stores/character-creation';
import { WIZARD_STEPS } from 'src/types';

const props = defineProps<{
  step: number;
}>();

const store = useCharacterCreationStore();

const isLastStep = computed(() => props.step === WIZARD_STEPS.length - 1);

const validation = computed(() => store.validateStep(props.step));

const canContinue = computed(() => validation.value.isValid);

function goBack() {
  store.previousStep();
}

function goNext() {
  store.nextStep();
}
</script>
