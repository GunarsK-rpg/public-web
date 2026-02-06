import type { Classifier } from './classifier';
import type { ClassifierRef, ClassifierInput } from './shared';

/** Attribute type classifier (cl_attribute_types) */
export type AttributeType = Classifier;

/** Attribute classifier (cl_attributes) */
export interface Attribute extends Classifier {
  attrType: ClassifierRef;
}

/** Hero attribute - upsert payload */
export interface HeroAttributeBase {
  id?: number;
  heroId: number;
  attribute: ClassifierInput;
  value: number;
}

/** Hero attribute - API response */
export interface HeroAttribute extends HeroAttributeBase {
  id: number;
  attribute: ClassifierRef;
}

/** Hero defense - upsert payload */
export interface HeroDefenseBase {
  id?: number;
  heroId: number;
  attributeType: ClassifierInput;
  value: number;
  modifier: number;
}

/** Hero defense - API response */
export interface HeroDefense extends HeroDefenseBase {
  id: number;
  attributeType: ClassifierRef;
}

/** Hero defense - calculated in hero sheet (no id) */
export interface HeroDefenseSheet {
  attributeType: ClassifierRef;
  baseValue: number;
  modifier: number;
  totalValue: number;
}
