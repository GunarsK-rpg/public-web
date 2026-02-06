import type { Classifier } from './classifier';
import type { ClassifierRef } from './shared';

/** Heroic path classifier (cl_paths) */
export type Path = Classifier;

/** Specialty classifier (cl_specialties) */
export interface Specialty extends Classifier {
  path: ClassifierRef;
}
