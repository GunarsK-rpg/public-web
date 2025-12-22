import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { WIZARD_STEPS } from 'src/types/wizard';
import { useHeroStore } from './hero';

export type WizardMode = 'create' | 'edit' | 'levelup';

// Helper to get step ID by code - avoids hardcoding step numbers
function getStepIdByCode(code: string): number {
  const step = WIZARD_STEPS.find((s) => s.code === code);
  return step?.id ?? 1;
}

export const useWizardStore = defineStore('wizard', () => {
  // ===================
  // STATE
  // ===================
  const currentStep = ref(1);
  const completedSteps = ref<number[]>([]);
  const mode = ref<WizardMode>('create');
  const isActive = ref(false);

  // ===================
  // COMPUTED
  // ===================
  const currentStepConfig = computed(() => WIZARD_STEPS.find((s) => s.id === currentStep.value));
  const canGoNext = computed(() => currentStep.value < WIZARD_STEPS.length);
  const canGoPrev = computed(() => currentStep.value > 1);

  const progress = computed(() => ({
    current: currentStep.value,
    total: WIZARD_STEPS.length,
    completed: completedSteps.value.length,
    percentage: Math.round((completedSteps.value.length / WIZARD_STEPS.length) * 100),
  }));

  // ===================
  // NAVIGATION
  // ===================
  function goToStep(step: number) {
    if (step >= 1 && step <= WIZARD_STEPS.length) {
      currentStep.value = step;
    }
  }

  function nextStep() {
    if (currentStep.value < WIZARD_STEPS.length) {
      markStepCompleted(currentStep.value);
      currentStep.value++;
    }
  }

  function previousStep() {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  }

  function markStepCompleted(step: number) {
    if (!completedSteps.value.includes(step)) {
      completedSteps.value.push(step);
    }
  }

  function markStepIncomplete(step: number) {
    completedSteps.value = completedSteps.value.filter((s) => s !== step);
  }

  function isStepCompleted(step: number): boolean {
    return completedSteps.value.includes(step);
  }

  // ===================
  // WIZARD LIFECYCLE
  // ===================
  function startCreate(campaignId?: number) {
    const heroStore = useHeroStore();
    heroStore.initNewHero(campaignId);
    mode.value = 'create';
    currentStep.value = 1;
    completedSteps.value = [];
    isActive.value = true;
  }

  async function startEdit(heroId: number): Promise<boolean> {
    const heroStore = useHeroStore();
    try {
      await heroStore.loadHero(heroId);
      mode.value = 'edit';
      currentStep.value = 1;
      // In edit mode, consider all steps completed initially
      completedSteps.value = WIZARD_STEPS.map((s) => s.id);
      isActive.value = true;
      return true;
    } catch (error) {
      console.error('Failed to load hero for editing:', error);
      reset();
      return false;
    }
  }

  async function startLevelUp(heroId: number): Promise<boolean> {
    const heroStore = useHeroStore();
    try {
      await heroStore.loadHero(heroId);
      mode.value = 'levelup';
      // Start at attributes step for level up - use step codes to avoid hardcoding numbers
      const attributesStepId = getStepIdByCode('attributes');
      currentStep.value = attributesStepId;
      // Mark steps before attributes as completed (basic-setup, ancestry, culture)
      completedSteps.value = WIZARD_STEPS.filter((s) => s.id < attributesStepId).map((s) => s.id);
      isActive.value = true;
      return true;
    } catch (error) {
      console.error('Failed to load hero for level up:', error);
      reset();
      return false;
    }
  }

  function cancel() {
    const heroStore = useHeroStore();
    heroStore.clearHero();
    reset();
  }

  function reset() {
    currentStep.value = 1;
    completedSteps.value = [];
    mode.value = 'create';
    isActive.value = false;
  }

  return {
    // State
    currentStep,
    completedSteps,
    mode,
    isActive,

    // Computed
    currentStepConfig,
    canGoNext,
    canGoPrev,
    progress,

    // Navigation
    goToStep,
    nextStep,
    previousStep,
    markStepCompleted,
    markStepIncomplete,
    isStepCompleted,

    // Lifecycle
    startCreate,
    startEdit,
    startLevelUp,
    cancel,
    reset,
  };
});
