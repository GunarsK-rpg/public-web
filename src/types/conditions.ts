import type { Classifier } from './classifier';
import type { ClassifierRef, ClassifierInput, SpecialEntry } from './shared';

/** Condition classifier (cl_conditions) */
export interface Condition extends Classifier {
  isPositive: boolean;
  isParameterized: boolean;
}

/** Hero condition - upsert payload */
export interface HeroConditionBase {
  id?: number;
  heroId: number;
  condition: ClassifierInput;
  notes?: string | null;
  special?: SpecialEntry[] | null;
  sourceInjuryId?: number | null;
}

/** Hero condition - API response */
export interface HeroCondition extends HeroConditionBase {
  id: number;
  condition: ClassifierRef;
  sourceInjuryId: number | null;
}

/** Injury classifier (cl_injuries) */
export interface Injury extends Classifier {
  condition?: ClassifierRef | null;
  special?: SpecialEntry[] | null;
}

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
