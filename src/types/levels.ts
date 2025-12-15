import type { Classifier } from './classifier';

/**
 * Level classifier (cl_levels)
 */
export interface Level extends Classifier {
  level: number;
  tierId: number;
  attributePoints: number;
  healthBase: number;
  maxSkillRank: number;
  skillRanks: number;
  talentSlots: number;
}
