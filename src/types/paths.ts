import type { Classifier } from './classifier';

/**
 * Heroic path classifier (cl_paths)
 */
export type Path = Classifier;

/**
 * Specialty classifier (cl_specialties)
 */
export interface Specialty extends Classifier {
  pathId: number;
}
