/**
 * Core attribute identifiers
 */
export type AttributeId =
  | 'strength'
  | 'speed'
  | 'intellect'
  | 'willpower'
  | 'awareness'
  | 'presence';

/**
 * Attribute category groupings
 */
export type AttributeCategory = 'physical' | 'cognitive' | 'spiritual';

/**
 * Attribute definition from classifiers
 */
export interface Attribute {
  id: AttributeId;
  name: string;
  abbreviation: string;
  category: AttributeCategory;
  description: string;
}

/**
 * Defense type identifiers
 */
export type DefenseId = 'physical' | 'cognitive' | 'spiritual';

/**
 * Defense definition with contributing attributes
 */
export interface Defense {
  id: DefenseId;
  name: string;
  attribute1: AttributeId;
  attribute2: AttributeId;
}

/**
 * Derived stat lookup tables based on attribute values
 */
export interface DerivedStatTable {
  movement: Record<number, number>;
  liftingCapacity: Record<number, number>;
  carryingCapacity: Record<number, number>;
  sensesRange: Record<number, string>;
  unarmedDamage: Record<number, string>;
  recoveryDie: Record<number, string>;
}
