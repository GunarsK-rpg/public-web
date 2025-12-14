import type { Classifier } from './classifier';

/**
 * Derived stat classifier (cl_derived_stats)
 */
export type DerivedStat = Classifier;

/**
 * Derived stat value lookup (cl_derived_stat_values)
 * Maps attribute values to derived stat values for calculation
 */
export interface DerivedStatValue {
  id: number;
  derivedStatId: number;
  attrId: number;
  attrMin: number;
  attrMax: number | null;
  value: number;
}

/**
 * Hero's derived stat value (saved to DB)
 */
export interface HeroDerivedStat {
  id: number;
  heroId: number;
  statId: number;
  value: number;
  modifier: number;
  unitId?: number;
}
