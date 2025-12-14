import type { Classifier } from './classifier';

/**
 * Level classifier
 * Maps to cl_levels table
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
