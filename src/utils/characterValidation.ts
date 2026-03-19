import type {
  Level,
  HeroSheet,
  HeroAttribute,
  HeroSkill,
  HeroExpertise,
  HeroTalent,
  HeroCulture,
} from 'src/types';
import { WIZARD_STEPS, STEP_CODES, type StepCodeType } from 'src/types/wizard';

export type StepCode = StepCodeType;

export interface StepValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BudgetPool {
  budget: number;
  spent: number;
  remaining: number;
}

export interface BudgetValidation extends StepValidation, BudgetPool {}

export interface SkillsBudgetValidation extends BudgetValidation {
  maxRank: number;
}

export interface FlexBudgetValidation {
  skills: BudgetPool;
  talents: BudgetPool;
  flex: BudgetPool;
  isOverBudget: boolean;
}

export function calculateFlexBudget(
  levelData: Level | undefined,
  skills: HeroSkill[],
  talents: HeroTalent[],
  skillsModifier: number,
  talentsModifier: number
): FlexBudgetValidation {
  const skillsBudget = (levelData?.skillRanks ?? 0) + skillsModifier;
  const skillsSpent = skills.reduce((sum, s) => sum + s.rank, 0);
  const skillsOver = Math.max(0, skillsSpent - skillsBudget);

  const talentsBudget = (levelData?.talentSlots ?? 0) + talentsModifier;
  const talentsSpent = talents.length;
  const talentsOver = Math.max(0, talentsSpent - talentsBudget);

  const flexBudget = levelData?.skillTalentFlex ?? 0;
  const flexUsed = skillsOver + talentsOver;
  const flexRemaining = flexBudget - flexUsed;

  return {
    skills: { budget: skillsBudget, spent: skillsSpent, remaining: skillsBudget - skillsSpent },
    talents: {
      budget: talentsBudget,
      spent: talentsSpent,
      remaining: talentsBudget - talentsSpent,
    },
    flex: { budget: flexBudget, spent: flexUsed, remaining: flexRemaining },
    isOverBudget: flexRemaining < 0,
  };
}

// Base expertise slots before Intellect bonus (from game rules)
const BASE_EXPERTISE_SLOTS = 2;

function validateAttributes(
  levelData: Level | undefined,
  attributes: HeroAttribute[]
): BudgetValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const budget = levelData?.attributePoints ?? 0;
  const spent = attributes.reduce((sum, a) => sum + a.value, 0);
  const remaining = budget - spent;

  if (remaining < 0) {
    warnings.push('Attribute points exceeded');
  }
  if (remaining > 0) {
    warnings.push(`${remaining} attribute points remaining`);
  }

  // Check for invalid attribute values (DB CHECK constraint)
  const hasInvalidAttr = attributes.some((attr) => attr.value < 0 || attr.value > 5);
  if (hasInvalidAttr) {
    errors.push('Attribute values must be between 0 and 5');
  }

  return { isValid: errors.length === 0, errors, warnings, budget, spent, remaining };
}

function validateSkills(
  levelData: Level | undefined,
  skills: HeroSkill[],
  skillsModifier: number,
  flex: FlexBudgetValidation
): SkillsBudgetValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const budget = (levelData?.skillRanks ?? 0) + skillsModifier;
  const maxRank = levelData?.maxSkillRank ?? 2;
  const spent = skills.reduce((sum, s) => sum + s.rank, 0);
  const remaining = budget - spent;

  if (remaining < 0 && flex.flex.budget > 0 && !flex.isOverBudget) {
    // Over guaranteed budget but covered by flex — not a warning
  } else if (remaining < 0) {
    warnings.push('Skill ranks exceeded');
  } else if (remaining > 0) {
    warnings.push(`${remaining} skill ranks remaining`);
  }

  const hasExceedingRank = skills.some((skill) => skill.rank > maxRank);
  if (hasExceedingRank) {
    warnings.push(`Skill rank exceeds maximum of ${maxRank}`);
  }

  return { isValid: errors.length === 0, errors, warnings, budget, spent, remaining, maxRank };
}

function validateExpertises(
  intellectValue: number,
  expertises: HeroExpertise[],
  expertisesModifier: number
): BudgetValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const budget = BASE_EXPERTISE_SLOTS + intellectValue + expertisesModifier;
  // Count only player-purchased expertises (exclude starting kit, talent, and singer form grants)
  const spent = expertises.filter(
    (e) =>
      e.source?.sourceType !== 'starting_kit' &&
      e.source?.sourceType !== 'talent' &&
      e.source?.sourceType !== 'singer_form'
  ).length;
  const remaining = budget - spent;

  if (remaining < 0) {
    warnings.push('Expertise slots exceeded');
  }

  return { isValid: errors.length === 0, errors, warnings, budget, spent, remaining };
}

function validateTalents(
  levelData: Level | undefined,
  talents: HeroTalent[],
  talentsModifier: number,
  flex: FlexBudgetValidation
): BudgetValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const budget = (levelData?.talentSlots ?? 0) + talentsModifier;
  const spent = talents.length;
  const remaining = budget - spent;

  if (remaining < 0 && flex.flex.budget > 0 && !flex.isOverBudget) {
    // Over guaranteed budget but covered by flex — not a warning
  } else if (remaining < 0) {
    warnings.push('Talent slots exceeded');
  }

  return { isValid: errors.length === 0, errors, warnings, budget, spent, remaining };
}

function validateBasicSetup(
  name: string,
  level: number,
  ancestryId: number | null | undefined,
  maxLevel: number
): StepValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name.trim()) {
    errors.push('Name is required');
  }
  if (level < 1 || level > maxLevel) {
    errors.push(`Level must be between 1 and ${maxLevel}`);
  }
  if (!ancestryId) {
    errors.push('Ancestry is required');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

function validateCulture(cultures: HeroCulture[]): StepValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (cultures.length === 0) {
    errors.push('At least one culture is required');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

function validatePaths(
  levelData: Level | undefined,
  talents: HeroTalent[],
  talentsModifier: number,
  flex: FlexBudgetValidation
): StepValidation {
  const talentValidation = validateTalents(levelData, talents, talentsModifier, flex);

  if (talents.length === 0) {
    talentValidation.warnings.push('No talents selected');
  }

  return talentValidation;
}

function validateStartingKit(startingKitId: number | null | undefined): StepValidation {
  const warnings: string[] = [];

  if (!startingKitId) {
    warnings.push('No starting kit selected');
  }

  return { isValid: true, errors: [], warnings };
}

/**
 * Data needed for hero validation
 */
export interface HeroValidationData {
  hero: HeroSheet;
  levelData: Level | undefined;
  intellectValue: number;
  talentsModifier: number;
  skillsModifier: number;
  expertisesModifier: number;
  maxLevel: number;
  flexBudget: FlexBudgetValidation;
}

export function getStepValidation(stepCode: StepCode, data: HeroValidationData): StepValidation {
  const {
    hero,
    levelData,
    intellectValue,
    talentsModifier,
    skillsModifier,
    expertisesModifier,
    flexBudget,
  } = data;

  switch (stepCode) {
    case STEP_CODES.BASIC_SETUP:
      return validateBasicSetup(hero.name, hero.level, hero.ancestry?.id, data.maxLevel);
    case STEP_CODES.CULTURE:
      return validateCulture(hero.cultures);
    case STEP_CODES.ATTRIBUTES:
      return validateAttributes(levelData, hero.attributes);
    case STEP_CODES.SKILLS:
      return validateSkills(levelData, hero.skills, skillsModifier, flexBudget);
    case STEP_CODES.EXPERTISES:
      return validateExpertises(intellectValue, hero.expertises, expertisesModifier);
    case STEP_CODES.PATHS:
      return validatePaths(levelData, hero.talents, talentsModifier, flexBudget);
    case STEP_CODES.STARTING_KIT:
      return validateStartingKit(hero.startingKit?.id);
    case STEP_CODES.EQUIPMENT:
    case STEP_CODES.PERSONAL_DETAILS:
      return { isValid: true, errors: [], warnings: [] };
    case STEP_CODES.REVIEW: {
      const errors: string[] = [];
      const warnings: string[] = [];
      const allSteps = WIZARD_STEPS.filter((s) => s.code !== STEP_CODES.REVIEW);
      for (const step of allSteps) {
        const stepResult = getStepValidation(step.code, data);
        if (!step.isOptional) {
          errors.push(...stepResult.errors);
        }
        warnings.push(...stepResult.warnings);
      }
      return { isValid: errors.length === 0, errors, warnings };
    }
    default:
      return { isValid: true, errors: [], warnings: [] };
  }
}

const DEFAULT_BUDGET: BudgetValidation = {
  isValid: true,
  errors: [],
  warnings: [],
  budget: 0,
  spent: 0,
  remaining: 0,
};

export function getBudgetValidation(
  stepCode: typeof STEP_CODES.SKILLS,
  data: HeroValidationData
): SkillsBudgetValidation;
export function getBudgetValidation(
  stepCode: Exclude<StepCode, typeof STEP_CODES.SKILLS>,
  data: HeroValidationData
): BudgetValidation;
export function getBudgetValidation(
  stepCode: StepCode,
  data: HeroValidationData
): BudgetValidation | SkillsBudgetValidation;
export function getBudgetValidation(
  stepCode: StepCode,
  data: HeroValidationData
): BudgetValidation | SkillsBudgetValidation {
  const {
    hero,
    levelData,
    intellectValue,
    talentsModifier,
    skillsModifier,
    expertisesModifier,
    flexBudget,
  } = data;

  switch (stepCode) {
    case STEP_CODES.ATTRIBUTES:
      return validateAttributes(levelData, hero.attributes);
    case STEP_CODES.SKILLS:
      return validateSkills(levelData, hero.skills, skillsModifier, flexBudget);
    case STEP_CODES.EXPERTISES:
      return validateExpertises(intellectValue, hero.expertises, expertisesModifier);
    case STEP_CODES.PATHS:
      return validateTalents(levelData, hero.talents, talentsModifier, flexBudget);
    default:
      return DEFAULT_BUDGET;
  }
}
