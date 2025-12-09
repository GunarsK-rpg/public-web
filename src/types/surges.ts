/**
 * Surge code identifiers
 */
export type SurgeCode =
  | 'abrasion'
  | 'adhesion'
  | 'cohesion'
  | 'division'
  | 'gravitation'
  | 'illumination'
  | 'progression'
  | 'tension'
  | 'transformation'
  | 'transportation';

/**
 * Surge classifier
 */
export interface Surge {
  id: number;
  code: SurgeCode;
  name: string;
  attributeId: number;
  description?: string;
}
