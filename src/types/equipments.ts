import type { Classifier } from './classifier';
import type { ClassifierRef, ClassifierInput } from './shared';

/** Equipment type classifier (cl_equipment_types) */
export interface EquipmentType extends Classifier {
  icon: string;
}

/** Damage type classifier (cl_damage_types) */
export type DamageType = Classifier;

/** Equipment special properties (JSONB) */
export interface EquipmentSpecial {
  damage?: string;
  range?: string;
  deflect?: number;
  charges?: number;
  maxCharges?: number;
}

/** Equipment classifier (cl_equipments) */
export interface Equipment extends Classifier {
  equipType: ClassifierRef;
  damageType: ClassifierRef | null;
  unit: ClassifierRef | null;
  special?: EquipmentSpecial | null;
  weight: number;
  cost: number;
  isCustom: boolean;
  attributes: ClassifierRef[];
}

/** Hero equipment - upsert payload */
export interface HeroEquipmentBase {
  id?: number;
  heroId: number;
  equipment: ClassifierInput;
  amount: number;
  isEquipped: boolean;
  notes?: string | null;
  customName?: string | null;
}

/** Hero equipment - API response */
export interface HeroEquipment extends HeroEquipmentBase {
  id: number;
  equipment: ClassifierRef;
}
