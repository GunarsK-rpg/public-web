import type { Classifier } from './classifier';
import type { ClassifierRef } from './shared';

/** Radiant order classifier (cl_radiant_orders) */
export interface RadiantOrder extends Classifier {
  surge1: ClassifierRef;
  surge2: ClassifierRef;
}
