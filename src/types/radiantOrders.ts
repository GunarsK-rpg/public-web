import type { Classifier } from './classifier';

/**
 * Radiant order classifier (cl_radiant_orders)
 */
export interface RadiantOrder extends Classifier {
  surge1Id: number;
  surge2Id: number;
}
