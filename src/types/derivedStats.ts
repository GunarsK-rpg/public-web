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
 * Hero's derived stat value (derived_stats table)
 *
 * Note: The database only stores `modifier`. The `value` field is calculated
 * client-side using formulas from cl_derived_stat_values and is included here
 * for convenience in the UI layer.
 */
export interface HeroDerivedStat {
  id: number;
  heroId: number;
  statId: number;
  /** Calculated base value (not stored in DB - computed from formulas) */
  value: number;
  /** Custom modifier stored in DB (from gear, talents, etc.) */
  modifier: number;
  /** Optional unit reference for display (e.g., feet, pounds) */
  unitId?: number;
}
