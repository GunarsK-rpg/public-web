import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useWizardStore } from 'src/stores/wizard';
import { useCampaignStore } from 'src/stores/campaigns';
import { STEP_CODES } from 'src/types/wizard';
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
  const attrStore = useHeroAttributesStore();
  const wizardStore = useWizardStore();
  const campaignStore = useCampaignStore();

  const validationData = computed<HeroValidationData | null>(() => {
    if (!heroStore.hero) return null;

    const campaignId = heroStore.hero.campaignId;
    const campaign = campaignId ? campaignStore.campaigns.find((c) => c.id === campaignId) : null;

    return {
      hero: heroStore.hero,
      levelData: attrStore.levelData,
      intellectValue: attrStore.getAttributeValue('int'),
      talentsModifier: campaign?.talentsModifier ?? 0,
      skillsModifier: (campaign?.skillsModifier ?? 0) + (heroStore.hero.radiantOrder ? 2 : 0),
      expertisesModifier: campaign?.expertisesModifier ?? 0,
    };
  });

  function validate(stepCode: StepCode): StepValidation {
    if (!validationData.value) {
      return { isValid: false, errors: ['No hero loaded'], warnings: [] };
    }
    return getStepValidation(stepCode, validationData.value);
  }

  function budget(stepCode: typeof STEP_CODES.SKILLS): SkillsBudgetValidation;
  function budget(stepCode: Exclude<StepCode, typeof STEP_CODES.SKILLS>): BudgetValidation;
  function budget(stepCode: StepCode): BudgetValidation | SkillsBudgetValidation;
  function budget(stepCode: StepCode): BudgetValidation | SkillsBudgetValidation {
    if (!validationData.value) {
      if (stepCode === STEP_CODES.SKILLS) {
        return {
          isValid: false,
          errors: [],
          warnings: [],
          budget: 0,
          spent: 0,
          remaining: 0,
          maxRank: 2,
        };
      }
      return { isValid: false, errors: [], warnings: [], budget: 0, spent: 0, remaining: 0 };
    }
    return getBudgetValidation(stepCode, validationData.value);
  }

  const currentStepCode = computed((): StepCode => {
    return wizardStore.currentStepConfig?.code ?? STEP_CODES.BASIC_SETUP;
  });
  const currentValidation = computed(() => validate(currentStepCode.value));
  const allStepsValidation = computed(() => validate(STEP_CODES.REVIEW));

  return {
    validate,
    budget,
    currentStepCode,
    currentValidation,
    allStepsValidation,
  };
}
