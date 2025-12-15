import type { Classifier } from './classifier';

/**
 * Equipment attribute classifier (cl_equipment_attributes)
 */
export type EquipmentAttribute = Classifier;

/**
 * Equipment to attribute mapping (cl_equipment_attribute_maps table)
 */
export interface EquipmentAttributeMap {
  id: number;
  equipmentId: number;
  attributeId: number;
}
