import type { Classifier } from './classifier';
import type { ClassifierRef, ClassifierInput, SpecialEntry } from './shared';

/** Equipment type classifier (cl_equipment_types) */
export interface EquipmentType extends Classifier {
  icon: string;
}

/** Damage type classifier (cl_damage_types) */
export type DamageType = Classifier;

/** Equipment attribute reference with trait parameters (from map table) */
export interface EquipmentAttributeRef extends ClassifierRef {
  value: number | null;
  isExpert: boolean;
}

/** Equipment classifier (cl_equipments) */
export interface Equipment extends Classifier {
  equipType: ClassifierRef;
  damageType: ClassifierRef | null;
  unit: ClassifierRef | null;
  special: SpecialEntry[];
  maxCharges: number | null;
  weight: number;
  cost: number | null;
  isCustom: boolean;
  attributes: EquipmentAttributeRef[];
}

/** Equipment modification (upgrade or drawback) */
export interface Modification {
  type: 'upgrade' | 'drawback';
  display_value: string;
}

/** Hero equipment - upsert payload */
export interface HeroEquipmentBase {
  id?: number;
  heroId: number;
  equipment?: ClassifierInput | null;
  equipType?: ClassifierInput | null;
  amount: number;
  isEquipped: boolean;
  notes?: string | null;
  customName?: string | null;
  charges?: number | null;
  maxCharges?: number | null;
  modifications?: Modification[];
}

/** Hero equipment - API response */
export interface HeroEquipment extends HeroEquipmentBase {
  id: number;
  equipment: ClassifierRef | null;
  equipType: ClassifierRef | null;
  special: SpecialEntry[];
  charges: number | null;
  maxCharges: number | null;
  modifications: Modification[];
}
