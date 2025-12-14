import type { Classifier } from './classifier';

/**
 * Tier classifier
 * Maps to cl_tiers table
 */
export interface Tier extends Classifier {
  levelMin: number;
  levelMax: number | null; // NULL for tier 5 (21+)
}
