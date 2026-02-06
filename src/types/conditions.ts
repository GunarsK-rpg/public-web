import type { Classifier } from './classifier';
import type { ClassifierRef, ClassifierInput } from './shared';

/** Condition classifier (cl_conditions) */
export type Condition = Classifier;

/** Hero condition - upsert payload */
export interface HeroConditionBase {
  id?: number;
  heroId: number;
  condition: ClassifierInput;
  notes?: string | null;
}

/** Hero condition - API response */
export interface HeroCondition extends HeroConditionBase {
  id: number;
  condition: ClassifierRef;
}

/** Injury classifier (cl_injuries) */
export type Injury = Classifier;

/** Hero injury - upsert payload */
export interface HeroInjuryBase {
  id?: number;
  heroId: number;
  injury: ClassifierInput;
  notes?: string | null;
}

/** Hero injury - API response */
export interface HeroInjury extends HeroInjuryBase {
  id: number;
  injury: ClassifierRef;
}
