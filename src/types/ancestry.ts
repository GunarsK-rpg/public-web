/**
 * Ancestry code identifiers
 */
export type AncestryCode = 'human' | 'singer';

/**
 * Ancestry trait
 */
export interface AncestryTrait {
  id: number;
  code: string;
  name: string;
  level: number;
  description?: string;
}

/**
 * Ancestry classifier
 */
export interface Ancestry {
  id: number;
  code: AncestryCode;
  name: string;
  size?: string;
  traits?: AncestryTrait[];
  description?: string;
}
