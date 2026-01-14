import type { Classifier } from './classifier';

/**
 * Attribute type classifier (cl_attribute_types)
 */
export type AttributeType = Classifier;

/**
 * Attribute classifier (cl_attributes)
 */
export interface Attribute extends Classifier {
  attrTypeId: number;
}

/**
 * Hero's attribute value (hero_attributes table)
 */
export interface HeroAttribute {
  id: number;
  heroId: number;
  attrId: number;
  value: number;
}

/**
 * Hero's defense value (hero_defenses table)
 */
export interface HeroDefense {
  id: number;
  heroId: number;
  attrTypeId: number;
  value: number;
  modifier: number;
}
