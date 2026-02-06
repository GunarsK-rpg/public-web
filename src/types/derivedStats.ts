import type { Classifier } from './classifier';
import type { ClassifierRef, ClassifierInput } from './shared';

/** Derived stat classifier (cl_derived_stats) */
export type DerivedStat = Classifier;

/** Derived stat value lookup (cl_derived_stat_values) */
export interface DerivedStatValue {
  id: number;
  derivedStat: ClassifierRef;
  attr: ClassifierRef;
  attrMin: number;
  attrMax: number | null;
  value: number;
}

/** Hero derived stat - upsert payload */
export interface HeroDerivedStatBase {
  id?: number;
  heroId: number;
  derivedStat: ClassifierInput;
  modifier: number;
}

/** Hero derived stat - API response */
export interface HeroDerivedStat extends HeroDerivedStatBase {
  id: number;
  derivedStat: ClassifierRef;
}

/** Hero derived stat - calculated in hero sheet (no id) */
export interface HeroDerivedStatSheet {
  derivedStat: ClassifierRef;
  baseValue: number | null;
  modifier: number;
  totalValue: number | null;
}
