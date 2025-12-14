import type { Classifier } from './classifier';

/**
 * Equipment attribute classifier (cl_equipment_attributes)
 */
export type EquipmentAttribute = Classifier;

/**
 * Equipment to attribute mapping
 */
export interface EquipmentAttributeMap {
  id: number;
  equipmentId: number;
  attributeId: number;
}
