import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { WIZARD_STEPS } from 'src/types/wizard';
import type { CampaignRef } from 'src/types/shared';
import { useHeroStore } from './hero';
import { logger } from 'src/utils/logger';
import { toError } from 'src/utils/errorHandling';

export type WizardMode = 'create' | 'edit';

export const useWizardStore = defineStore('wizard', () => {
  // ===================
  // STATE
  // ===================
  const currentStep = ref(1);
  // Use Set for O(1) lookup performance instead of Array.includes()
  const completedStepsSet = ref<Set<number>>(new Set());
  const mode = ref<WizardMode>('create');
  const isActive = ref(false);

  // Expose as array for backwards compatibility with existing consumers
  const completedSteps = computed(() => Array.from(completedStepsSet.value));

  // ===================
  // COMPUTED
  // ===================
  const currentStepConfig = computed(() => WIZARD_STEPS.find((s) => s.id === currentStep.value));
  const canGoNext = computed(() => currentStep.value < WIZARD_STEPS.length);
  const canGoPrev = computed(() => currentStep.value > 1);

  const progress = computed(() => ({
    current: currentStep.value,
    total: WIZARD_STEPS.length,
    completed: completedStepsSet.value.size,
    percentage: Math.round((completedStepsSet.value.size / WIZARD_STEPS.length) * 100),
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
    completedStepsSet.value.add(step);
  }

  function markStepIncomplete(step: number) {
    completedStepsSet.value.delete(step);
  }

  function isStepCompleted(step: number): boolean {
    return completedStepsSet.value.has(step);
  }

  // ===================
  // WIZARD LIFECYCLE
  // ===================
  function startCreate(campaign?: CampaignRef) {
    const heroStore = useHeroStore();
    heroStore.initNewHero(campaign);
    mode.value = 'create';
    currentStep.value = 1;
    completedStepsSet.value = new Set();
    isActive.value = true;
  }

  async function startEdit(heroId: number): Promise<boolean> {
    const heroStore = useHeroStore();
    try {
      await heroStore.loadHero(heroId);
      // Check if hero was actually loaded
      if (!heroStore.hero) {
        logger.warn('Hero not found for editing', { heroId });
        reset();
        return false;
      }
      mode.value = 'edit';
      currentStep.value = 1;
      // In edit mode, consider all steps completed initially
      completedStepsSet.value = new Set(WIZARD_STEPS.map((s) => s.id));
      isActive.value = true;
      return true;
    } catch (error) {
      logger.error('Failed to load hero for editing', toError(error));
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
    completedStepsSet.value = new Set();
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
    cancel,
    reset,
  };
});
