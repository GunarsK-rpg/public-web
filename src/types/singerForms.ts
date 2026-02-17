import type { Classifier } from './classifier';
import type { ClassifierRef, SpecialEntry } from './shared';

/** Singer form classifier (cl_singer_forms) */
export interface SingerForm extends Classifier {
  sprenType?: string | null;
  talent: ClassifierRef | null;
  special: SpecialEntry[];
}
