import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useWizardStore } from 'src/stores/wizard';
import {
  getStepValidation,
  getBudgetValidation,
  type StepCode,
  type StepValidation,
  type BudgetValidation,
  type SkillsBudgetValidation,
  type HeroValidationData,
} from 'src/utils/characterValidation';

export function useStepValidation() {
  const heroStore = useHeroStore();
  const wizardStore = useWizardStore();

  const validationData = computed<HeroValidationData | null>(() => {
    if (!heroStore.hero) return null;
    return {
      hero: heroStore.hero,
      levelData: heroStore.levelData,
      intellectValue: heroStore.getAttributeValue('int'),
    };
  });

  function validate(stepCode: StepCode): StepValidation {
    if (!validationData.value) {
      return { isValid: false, errors: ['No hero loaded'], warnings: [] };
    }
    return getStepValidation(stepCode, validationData.value);
  }

  function budget(stepCode: StepCode): BudgetValidation | SkillsBudgetValidation {
    if (!validationData.value) {
      return { isValid: false, errors: [], warnings: [], budget: 0, spent: 0, remaining: 0 };
    }
    return getBudgetValidation(stepCode, validationData.value);
  }

  const currentStepCode = computed(() => wizardStore.currentStepConfig?.code as StepCode);
  const currentValidation = computed(() => validate(currentStepCode.value));
  const allStepsValidation = computed(() => validate('review'));

  return {
    validate,
    budget,
    currentStepCode,
    currentValidation,
    allStepsValidation,
  };
}
