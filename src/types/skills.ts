import type { Classifier } from './classifier';

/**
 * Skill classifier (cl_skills)
 */
export interface Skill extends Classifier {
  attrId: number;
}

/**
 * Hero's skill (skills table)
 */
export interface HeroSkill {
  id: number;
  heroId: number;
  skillId: number;
  rank: number;
  modifier: number;
}
