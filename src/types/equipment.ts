/**
 * Damage type identifiers
 */
export type DamageType = 'energy' | 'impact' | 'keen' | 'spirit' | 'vital';

/**
 * Weapon category
 */
export type WeaponCategory = 'light' | 'heavy' | 'special';

/**
 * Weapon trait identifiers
 */
export type WeaponTrait =
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
 * Weapon definition from classifiers
 */
export interface Weapon {
  id: string;
  name: string;
  category: WeaponCategory;
  damage: string;
  damageType: DamageType;
  traits: WeaponTrait[];
  cost: number;
  description?: string;
}

/**
 * Character's equipped weapon
 */
export interface CharacterWeapon {
  weaponId: string;
  customName?: string;
  isEquipped: boolean;
  isPrimary: boolean;
  notes?: string;
}

/**
 * Armor definition from classifiers
 */
export interface Armor {
  id: string;
  name: string;
  deflect: number;
  cost: number;
  traits?: string[];
  description?: string;
}

/**
 * Character's equipped armor
 */
export interface CharacterArmor {
  armorId: string;
  isEquipped: boolean;
  charges?: number;
  notes?: string;
}

/**
 * Equipment item definition
 */
export interface Equipment {
  id: string;
  name: string;
  cost: number;
  category: string;
  description?: string;
}

/**
 * Character's equipment item
 */
export interface CharacterEquipment {
  itemId: string;
  quantity: number;
  notes?: string;
}

/**
 * Fabrial definition
 */
export interface Fabrial {
  id: string;
  name: string;
  maxCharges: number;
  cost: number;
  effect: string;
  description?: string;
}
