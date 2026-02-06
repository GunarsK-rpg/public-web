import type { Classifier } from './classifier';
import type { ClassifierRef, ClassifierInput } from './shared';

/** Skill classifier (cl_skills) */
export interface Skill extends Classifier {
  attr: ClassifierRef;
}

/** Hero skill - upsert payload */
export interface HeroSkillBase {
  id?: number;
  heroId: number;
  skill: ClassifierInput;
  rank: number;
  modifier: number;
}

/** Hero skill - API response */
export interface HeroSkill extends HeroSkillBase {
  id: number;
  skill: ClassifierRef;
}
