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
    code: 'str',
    name: 'Strength',
    attrTypeId: 1, // physical
    description: 'Physical power, health, lifting capacity',
  },
  {
    id: 2,
    code: 'spd',
    name: 'Speed',
    attrTypeId: 1, // physical
    description: 'Physical agility, movement rate',
  },
  {
    id: 3,
    code: 'int',
    name: 'Intellect',
    attrTypeId: 2, // cognitive
    description: 'Mental acuity, number of expertises',
  },
  {
    id: 4,
    code: 'wil',
    name: 'Willpower',
    attrTypeId: 2, // cognitive
    description: 'Mental resilience, focus, recovery',
  },
  {
    id: 5,
    code: 'awa',
    name: 'Awareness',
    attrTypeId: 3, // spiritual
    description: 'Perception, senses range',
  },
  {
    id: 6,
    code: 'pre',
    name: 'Presence',
    attrTypeId: 3, // spiritual
    description: 'Force of personality, connections',
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
