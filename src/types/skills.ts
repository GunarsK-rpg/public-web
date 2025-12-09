/**
 * Skill code identifiers
 */
export type SkillCode =
  | 'agility'
  | 'athletics'
  | 'heavy-weaponry'
  | 'light-weaponry'
  | 'stealth'
  | 'thievery'
  | 'crafting'
  | 'deduction'
  | 'discipline'
  | 'intimidation'
  | 'lore'
  | 'medicine'
  | 'deception'
  | 'insight'
  | 'leadership'
  | 'perception'
  | 'persuasion'
  | 'survival';

/**
 * Skill classifier
 */
export interface Skill {
  id: number;
  code: SkillCode;
  name: string;
  attrId: number;
}

/**
 * Hero's skill
 */
export interface HeroSkill {
  id: number;
  heroId: number;
  skillId: number;
  rank: number;
  modifier: number;
}
