import type {
  Level,
  Hero,
  HeroAttribute,
  HeroSkill,
  HeroExpertise,
  HeroTalent,
  HeroCulture,
} from 'src/types';
import { WIZARD_STEPS } from 'src/types';

export type StepCode = (typeof WIZARD_STEPS)[number]['code'];

export interface StepValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BudgetValidation extends StepValidation {
  budget: number;
  spent: number;
  remaining: number;
}

export interface SkillsBudgetValidation extends BudgetValidation {
  maxRank: number;
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
    errors.push('Attribute points exceeded');
  }
  if (remaining > 0) {
    warnings.push(`${remaining} attribute points remaining`);
  }

  // Check for invalid attribute values (only add error once)
  const hasInvalidAttr = attributes.some((attr) => attr.value < 0 || attr.value > 5);
  if (hasInvalidAttr) {
    errors.push('Attribute values must be between 0 and 5');
  }

  return { isValid: errors.length === 0, errors, warnings, budget, spent, remaining };
}

function validateSkills(levelData: Level | undefined, skills: HeroSkill[]): SkillsBudgetValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const budget = levelData?.skillRanks ?? 0;
  const maxRank = levelData?.maxSkillRank ?? 2;
  const spent = skills.reduce((sum, s) => sum + s.rank, 0);
  const remaining = budget - spent;

  if (remaining < 0) {
    errors.push('Skill ranks exceeded');
  }
  if (remaining > 0) {
    warnings.push(`${remaining} skill ranks remaining`);
  }

  // Check for skill ranks exceeding max (only add error once)
  const hasExceedingRank = skills.some((skill) => skill.rank > maxRank);
  if (hasExceedingRank) {
    errors.push(`Skill rank exceeds maximum of ${maxRank}`);
  }

  return { isValid: errors.length === 0, errors, warnings, budget, spent, remaining, maxRank };
}

function validateExpertises(intellectValue: number, expertises: HeroExpertise[]): BudgetValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const budget = BASE_EXPERTISE_SLOTS + intellectValue;
  // Count only non-starting-kit expertises
  const spent = expertises.filter((e) => e.source?.sourceType !== 'starting_kit').length;
  const remaining = budget - spent;

  if (remaining < 0) {
    errors.push('Expertise slots exceeded');
  }

  return { isValid: errors.length === 0, errors, warnings, budget, spent, remaining };
}

function validateTalents(levelData: Level | undefined, talents: HeroTalent[]): BudgetValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const budget = levelData?.talentSlots ?? 0;
  const spent = talents.length;
  const remaining = budget - spent;

  if (remaining < 0) {
    errors.push('Talent slots exceeded');
  }

  return { isValid: errors.length === 0, errors, warnings, budget, spent, remaining };
}

function validateBasicSetup(name: string, level: number): StepValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name.trim()) {
    errors.push('Name is required');
  }
  if (level < 1 || level > 20) {
    errors.push('Level must be between 1 and 20');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

function validateAncestry(ancestryId: number): StepValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

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

function validatePaths(levelData: Level | undefined, talents: HeroTalent[]): StepValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (talents.length === 0) {
    errors.push('At least one talent is required');
  }

  const talentBudget = levelData?.talentSlots ?? 0;
  if (talents.length > talentBudget) {
    errors.push(`Talent slots exceeded (${talents.length}/${talentBudget})`);
  }

  return { isValid: errors.length === 0, errors, warnings };
}

function validateStartingKit(startingKitId: number | null): StepValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!startingKitId) {
    errors.push('Starting kit is required');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Data needed for hero validation
 */
export interface HeroValidationData {
  hero: Hero;
  levelData: Level | undefined;
  intellectValue: number;
}

export function getStepValidation(stepCode: StepCode, data: HeroValidationData): StepValidation {
  const { hero, levelData, intellectValue } = data;

  switch (stepCode) {
    case 'basic-setup':
      return validateBasicSetup(hero.name, hero.level);
    case 'ancestry':
      return validateAncestry(hero.ancestryId);
    case 'culture':
      return validateCulture(hero.cultures);
    case 'attributes':
      return validateAttributes(levelData, hero.attributes);
    case 'skills':
      return validateSkills(levelData, hero.skills);
    case 'expertises':
      return validateExpertises(intellectValue, hero.expertises);
    case 'paths':
      return validatePaths(levelData, hero.talents);
    case 'starting-kit':
      return validateStartingKit(hero.startingKitId);
    case 'equipment':
    case 'personal-details':
      return { isValid: true, errors: [], warnings: [] };
    case 'review': {
      const errors: string[] = [];
      const requiredSteps = WIZARD_STEPS.filter((s) => !s.isOptional && s.code !== 'review');
      for (const step of requiredSteps) {
        errors.push(...getStepValidation(step.code, data).errors);
      }
      return { isValid: errors.length === 0, errors, warnings: [] };
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
  stepCode: 'skills',
  data: HeroValidationData
): SkillsBudgetValidation;
export function getBudgetValidation(
  stepCode: Exclude<StepCode, 'skills'>,
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
  const { hero, levelData, intellectValue } = data;

  switch (stepCode) {
    case 'attributes':
      return validateAttributes(levelData, hero.attributes);
    case 'skills':
      return validateSkills(levelData, hero.skills);
    case 'expertises':
      return validateExpertises(intellectValue, hero.expertises);
    case 'paths':
      return validateTalents(levelData, hero.talents);
    default:
      return DEFAULT_BUDGET;
  }
}
