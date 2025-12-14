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
  damageTypeId?: number;
  unitId?: number;
  special?: EquipmentSpecial;
  cost: number;
  isCustom: boolean;
  heroId?: number;
  attributes?: EquipmentAttributeMap[];
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
  notes?: string;
  customName?: string;
}
