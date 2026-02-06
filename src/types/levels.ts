import type { ClassifierRef } from './shared';

/** Level classifier (cl_levels) */
export interface Level {
  id: number;
  level: number;
  tier: ClassifierRef;
  attributePoints: number;
  healthBase: number;
  maxSkillRank: number;
  skillRanks: number;
  talentSlots: number;
}
