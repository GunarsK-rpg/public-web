import type { AttributeId, AttributeCategory } from './attributes';

/**
 * Base skill identifiers
 */
export type SkillId =
  // Physical skills
  | 'agility'
  | 'athletics'
  | 'heavy-weaponry'
  | 'light-weaponry'
  | 'stealth'
  | 'thievery'
  // Cognitive skills
  | 'crafting'
  | 'deduction'
  | 'discipline'
  | 'intimidation'
  | 'lore'
  | 'medicine'
  // Spiritual skills
  | 'deception'
  | 'insight'
  | 'leadership'
  | 'perception'
  | 'persuasion'
  | 'survival';

/**
 * Skill definition from classifiers
 */
export interface Skill {
  id: SkillId;
  name: string;
  attributeId: AttributeId;
  category: AttributeCategory;
  description: string;
}

/**
 * Custom skill defined by player
 */
export interface CustomSkill {
  id: string;
  name: string;
  attributeId: AttributeId;
  description?: string;
}

/**
 * Character's skill with rank
 * Note: skillId can be a SkillId for standard skills or a custom string for custom skills
 */
export interface CharacterSkill {
  skillId: string;
  rank: number;
  customModifier?: number;
}
