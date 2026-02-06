import type { ClassifierRef } from './shared';

/** Generic classifier base type */
export interface Classifier extends ClassifierRef {
  description?: string;
  displayOrder?: number;
}
