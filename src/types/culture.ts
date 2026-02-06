import type { Classifier } from './classifier';
import type { ClassifierRef, ClassifierInput } from './shared';

/** Culture classifier (cl_cultures) */
export interface Culture extends Classifier {
  expertise: ClassifierRef;
}

/** Hero culture - upsert payload */
export interface HeroCultureBase {
  id?: number;
  heroId: number;
  culture: ClassifierInput;
}

/** Hero culture - API response */
export interface HeroCulture extends HeroCultureBase {
  id: number;
  culture: ClassifierRef;
}
