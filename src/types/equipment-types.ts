/**
 * Equipment type code identifiers
 */
export type EquipmentTypeCode = 'weapon' | 'armor' | 'fabrial' | 'consumable' | 'gear';

/**
 * Equipment type classifier
 */
export interface EquipmentType {
  id: number;
  code: EquipmentTypeCode;
  name: string;
}
