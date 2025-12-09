import type { Attribute, AttributeType } from 'src/types';

/**
 * Attribute type classifiers
 */
export const attributeTypes: AttributeType[] = [
  { id: 1, code: 'physical', name: 'Physical' },
  { id: 2, code: 'cognitive', name: 'Cognitive' },
  { id: 3, code: 'spiritual', name: 'Spiritual' },
];

/**
 * Base attributes
 */
export const attributes: Attribute[] = [
  {
    id: 1,
    code: 'strength',
    name: 'Strength',
    abbreviation: 'STR',
    attrTypeId: 1, // physical
    notes: 'Physical power, health, lifting capacity',
  },
  {
    id: 2,
    code: 'speed',
    name: 'Speed',
    abbreviation: 'SPD',
    attrTypeId: 1, // physical
    notes: 'Physical agility, movement rate',
  },
  {
    id: 3,
    code: 'intellect',
    name: 'Intellect',
    abbreviation: 'INT',
    attrTypeId: 2, // cognitive
    notes: 'Mental acuity, number of expertises',
  },
  {
    id: 4,
    code: 'willpower',
    name: 'Willpower',
    abbreviation: 'WIL',
    attrTypeId: 2, // cognitive
    notes: 'Mental resilience, focus, recovery',
  },
  {
    id: 5,
    code: 'awareness',
    name: 'Awareness',
    abbreviation: 'AWA',
    attrTypeId: 3, // spiritual
    notes: 'Perception, senses range',
  },
  {
    id: 6,
    code: 'presence',
    name: 'Presence',
    abbreviation: 'PRE',
    attrTypeId: 3, // spiritual
    notes: 'Force of personality, connections',
  },
];

/**
 * Helper to get attribute type name from ID
 */
export function getAttributeTypeName(attrTypeId: number): string {
  return attributeTypes.find((t) => t.id === attrTypeId)?.name ?? 'Unknown';
}

/**
 * Helper to get attribute type code from ID
 */
export function getAttributeTypeCode(attrTypeId: number): string {
  return attributeTypes.find((t) => t.id === attrTypeId)?.code ?? 'unknown';
}
