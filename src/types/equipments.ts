/**
 * Damage type identifiers
 */
export type DamageType = 'energy' | 'impact' | 'keen' | 'spirit' | 'vital';

/**
 * Equipment special properties (JSONB)
 */
export interface EquipmentSpecial {
  damage?: string;
  damageType?: DamageType;
  range?: string;
  deflect?: number;
  charges?: number;
  maxCharges?: number;
}

/**
 * Equipment classifier
 */
export interface Equipment {
  id: number;
  code: string;
  name: string;
  equipTypeId: number;
  actionId?: number;
  unitId?: number;
  special?: EquipmentSpecial;
  cost: number;
  isCustom: boolean;
  heroId?: number;
}

/**
 * Hero's equipment item
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

/**
 * @deprecated Use Equipment with equipTypeId=1 instead
 * Weapon type for backwards compatibility
 */
export interface Weapon {
  id: number;
  code: string;
  name: string;
  category: string;
  skillCode: string;
  damage: string;
  damageType: DamageType;
  traits: string[];
  cost: number;
  description?: string;
}

/**
 * @deprecated Use Equipment with equipTypeId=2 instead
 * Armor type for backwards compatibility
 */
export interface Armor {
  id: number;
  code: string;
  name: string;
  deflect: number;
  cost: number;
  description?: string;
}
