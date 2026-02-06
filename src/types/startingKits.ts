import type { Classifier } from './classifier';
import type { ClassifierRef } from './shared';

/** Starting kit classifier (cl_starting_kits) */
export interface StartingKit extends Classifier {
  startingSpheres: string;
  equipment?: (ClassifierRef & { quantity: number })[];
  expertises?: ClassifierRef[];
}
