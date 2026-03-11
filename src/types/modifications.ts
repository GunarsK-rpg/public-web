import type { ClassifierRef, SpecialEntry } from './shared';

/** Modification classifier (cl_modifications) */
export interface ModificationClassifier {
  id: number;
  code: string;
  name: string;
  description: string | null;
  modType: 'upgrade' | 'drawback';
  category: 'item' | 'fabrial';
  tier: 'basic' | 'advanced';
  equipment: ClassifierRef | null;
  special: SpecialEntry[];
  displayOrder: number;
}
