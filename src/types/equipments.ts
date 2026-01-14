import type { Classifier } from './classifier';
import type { EquipmentAttributeMap } from './equipmentAttributes';

/**
 * Equipment type classifier (cl_equipment_types)
 */
export interface EquipmentType extends Classifier {
  icon: string;
}

/**
 * Damage type classifier (cl_damage_types)
 */
export type DamageType = Classifier;

/**
 * Equipment special properties (JSONB)
 */
export interface EquipmentSpecial {
  damage?: string;
  range?: string;
  deflect?: number;
  charges?: number;
  maxCharges?: number;
}

/**
 * Equipment classifier (cl_equipments)
 * Actions granted by equipment are linked via cl_action_links
 */
export interface Equipment extends Classifier {
  equipTypeId: number;
  damageTypeId?: number | null;
  unitId?: number | null;
  special?: EquipmentSpecial | null;
  cost: number;
  isCustom: boolean;
  heroId?: number | null;
  attributes?: EquipmentAttributeMap[]; // Frontend-only, populated from cl_equipment_attributes_map
}

/**
 * Hero's equipment item (equipment table)
 */
export interface HeroEquipment {
  id: number;
  heroId: number;
  equipmentId: number;
  amount: number;
  isEquipped: boolean;
  isPrimary: boolean;
  notes?: string | null;
  customName?: string | null;
}
