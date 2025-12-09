/**
 * Equipment attribute code identifiers
 */
export type EquipmentAttributeCode =
  | 'accurate'
  | 'area'
  | 'blocking'
  | 'brutal'
  | 'cumbersome'
  | 'dangerous'
  | 'defensive'
  | 'disarming'
  | 'entangling'
  | 'loaded'
  | 'loud'
  | 'noisy'
  | 'offhand'
  | 'paired'
  | 'pierce'
  | 'ranged'
  | 'reach'
  | 'thrown'
  | 'two-handed'
  | 'unique'
  | 'unwieldy';

/**
 * Equipment attribute classifier
 */
export interface EquipmentAttribute {
  id: number;
  code: EquipmentAttributeCode;
  name: string;
}

/**
 * Equipment to attribute mapping
 */
export interface EquipmentAttributeMap {
  id: number;
  equipmentId: number;
  attributeId: number;
}
