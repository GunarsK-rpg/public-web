import type { Classifier } from './classifier';

/**
 * Tier classifier (cl_tiers)
 */
export interface Tier extends Classifier {
  levelMin: number;
  levelMax: number | null; // NULL for tier 5 (21+)
}
