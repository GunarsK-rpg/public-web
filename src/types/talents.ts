import type { HeroicPathId, SpecialtyId } from './paths';
import type { SkillId } from './skills';

/**
 * Talent activation type
 */
export type TalentActivation =
  | 'action'
  | 'double-action'
  | 'triple-action'
  | 'free-action'
  | 'reaction'
  | 'special'
  | 'always-active';

/**
 * Talent definition from classifiers
 */
export interface Talent {
  id: string;
  name: string;
  pathId?: HeroicPathId;
  specialtyId?: SpecialtyId;
  isKeyTalent: boolean;
  activation: TalentActivation;
  focusCost?: number;
  investitureCost?: number;
  prerequisites: TalentPrerequisite[];
  effect: string;
  description?: string;
}

/**
 * Talent prerequisite types
 */
export type TalentPrerequisiteType = 'talent' | 'skill' | 'ideal' | 'narrative' | 'level';

/**
 * Talent prerequisite definition
 */
export interface TalentPrerequisite {
  type: TalentPrerequisiteType;
  talentId?: string;
  skillId?: SkillId;
  skillRank?: number;
  idealLevel?: number;
  description?: string;
}

/**
 * Character's acquired talent
 */
export interface CharacterTalent {
  id: string;
  talentId: string;
  notes?: string;
}
