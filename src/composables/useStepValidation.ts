import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useWizardStore } from 'src/stores/wizard';
import { useCampaignStore } from 'src/stores/campaigns';
import { useClassifierStore } from 'src/stores/classifiers';
import { STEP_CODES } from 'src/types/wizard';
import {
  getStepValidation,
  getBudgetValidation,
  calculateFlexBudget,
  type StepCode,
  type StepValidation,
  type BudgetValidation,
  type SkillsBudgetValidation,
  type BudgetPool,
  type FlexBudgetValidation,
  type HeroValidationData,
} from 'src/utils/characterValidation';

export function useStepValidation() {
  const heroStore = useHeroStore();
  const attrStore = useHeroAttributesStore();
  const wizardStore = useWizardStore();
  const campaignStore = useCampaignStore();

  const classifierStore = useClassifierStore();

  const validationData = computed<HeroValidationData | null>(() => {
    if (!heroStore.hero) return null;

    const campaignId = heroStore.hero.campaignId;
    const campaign = campaignId ? campaignStore.campaigns.find((c) => c.id === campaignId) : null;
    const levels = classifierStore.levels;
    const maxLevel = levels.length > 0 ? Math.max(...levels.map((l) => l.level)) : 40;
    const skillsMod = (campaign?.skillsModifier ?? 0) + (heroStore.hero.radiantOrder ? 2 : 0);
    const talentsMod = campaign?.talentsModifier ?? 0;

    return {
      hero: heroStore.hero,
      levelData: attrStore.levelData,
      intellectValue: attrStore.getAttributeValue('int'),
      talentsModifier: talentsMod,
      skillsModifier: skillsMod,
      expertisesModifier: campaign?.expertisesModifier ?? 0,
      maxLevel,
      flexBudget: calculateFlexBudget(
        attrStore.levelData,
        heroStore.hero.skills,
        heroStore.hero.talents,
        skillsMod,
        talentsMod
      ),
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

  const EMPTY_POOL: BudgetPool = { budget: 0, spent: 0, remaining: 0 };
  const DEFAULT_FLEX: FlexBudgetValidation = {
    skills: EMPTY_POOL,
    talents: EMPTY_POOL,
    flex: EMPTY_POOL,
    isOverBudget: false,
  };

  const flexBudget = computed<FlexBudgetValidation>(
    () => validationData.value?.flexBudget ?? DEFAULT_FLEX
  );

  const currentStepCode = computed((): StepCode => {
    return wizardStore.currentStepConfig?.code ?? STEP_CODES.BASIC_SETUP;
  });
  const currentValidation = computed(() => validate(currentStepCode.value));
  const allStepsValidation = computed(() => validate(STEP_CODES.REVIEW));

  return {
    validate,
    budget,
    flexBudget,
    currentStepCode,
    currentValidation,
    allStepsValidation,
  };
}
