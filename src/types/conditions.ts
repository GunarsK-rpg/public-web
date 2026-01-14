import type { Classifier } from './classifier';

/**
 * Condition classifier (cl_conditions)
 */
export type Condition = Classifier;

/**
 * Hero's condition (conditions table)
 */
export interface HeroCondition {
  id: number;
  heroId: number;
  conditionId: number;
  notes?: string | null;
}

/**
 * Injury classifier (cl_injuries)
 */
export type Injury = Classifier;

/**
 * Hero's injury (injuries table)
 */
export interface HeroInjury {
  id: number;
  heroId: number;
  injuryId: number;
  notes?: string | null;
}
