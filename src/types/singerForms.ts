import type { Classifier } from './classifier';

/**
 * Attribute codes matching cl_attributes.code values
 * These are the canonical attribute abbreviations used throughout the system
 */
export type AttributeCode = 'str' | 'spd' | 'int' | 'wil' | 'awa' | 'pre';

/**
 * Singer form bonuses (JSONB)
 * Keys are attribute codes from cl_attributes, plus special form bonuses
 */
export interface SingerFormBonuses {
  // Attribute bonuses (keys match cl_attributes.code)
  str?: number;
  spd?: number;
  int?: number;
  wil?: number;
  awa?: number;
  pre?: number;
  // Special bonuses
  deflect?: number;
  focus?: number;
}

/**
 * Singer form classifier (cl_singer_forms)
 */
export interface SingerForm extends Classifier {
  sprenType?: string;
  talentId: number | null;
  bonuses?: SingerFormBonuses;
}
