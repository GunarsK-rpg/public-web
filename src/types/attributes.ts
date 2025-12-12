/**
 * Attribute code identifiers
 */
export type AttributeCode =
  | 'strength'
  | 'speed'
  | 'intellect'
  | 'willpower'
  | 'awareness'
  | 'presence';

/**
 * Attribute classifier
 */
export interface Attribute {
  id: number;
  code: AttributeCode;
  name: string;
  abbreviation: string;
  attrTypeId: number;
  notes?: string;
}

/**
 * Hero's attribute value
 */
export interface HeroAttribute {
  id: number;
  heroId: number;
  attrId: number;
  value: number;
}

/**
 * Hero's defense value
 */
export interface HeroDefense {
  id: number;
  heroId: number;
  attrTypeId: number;
  value: number;
  modifier: number;
}
