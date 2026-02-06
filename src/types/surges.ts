import type { Classifier } from './classifier';
import type { ClassifierRef } from './shared';

/** Surge classifier (cl_surges) */
export interface Surge extends Classifier {
  attr: ClassifierRef;
}
