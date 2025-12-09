import type {
  Equipment,
  EquipmentType,
  EquipmentAttribute,
  Unit,
  Currency,
  // Deprecated types for backward compatibility
  Weapon,
  Armor,
} from 'src/types';

/**
 * Equipment type classifiers
 */
export const equipmentTypes: EquipmentType[] = [
  { id: 1, code: 'weapon', name: 'Weapon' },
  { id: 2, code: 'armor', name: 'Armor' },
  { id: 3, code: 'fabrial', name: 'Fabrial' },
  { id: 4, code: 'consumable', name: 'Consumable' },
  { id: 5, code: 'gear', name: 'Gear' },
];

/**
 * Equipment attribute classifiers
 */
export const equipmentAttributes: EquipmentAttribute[] = [
  { id: 1, code: 'accurate', name: 'Accurate' },
  { id: 2, code: 'area', name: 'Area' },
  { id: 3, code: 'blocking', name: 'Blocking' },
  { id: 4, code: 'brutal', name: 'Brutal' },
  { id: 5, code: 'cumbersome', name: 'Cumbersome' },
  { id: 6, code: 'dangerous', name: 'Dangerous' },
  { id: 7, code: 'defensive', name: 'Defensive' },
  { id: 8, code: 'disarming', name: 'Disarming' },
  { id: 9, code: 'entangling', name: 'Entangling' },
  { id: 10, code: 'loaded', name: 'Loaded' },
  { id: 11, code: 'loud', name: 'Loud' },
  { id: 12, code: 'noisy', name: 'Noisy' },
  { id: 13, code: 'offhand', name: 'Offhand' },
  { id: 14, code: 'paired', name: 'Paired' },
  { id: 15, code: 'pierce', name: 'Pierce' },
  { id: 16, code: 'ranged', name: 'Ranged' },
  { id: 17, code: 'reach', name: 'Reach' },
  { id: 18, code: 'thrown', name: 'Thrown' },
  { id: 19, code: 'two-handed', name: 'Two-Handed' },
  { id: 20, code: 'unique', name: 'Unique' },
  { id: 21, code: 'unwieldy', name: 'Unwieldy' },
];

/**
 * Unit classifiers
 */
export const units: Unit[] = [
  { id: 1, code: 'lb', name: 'Pounds' },
  { id: 2, code: 'ft', name: 'Feet' },
  { id: 3, code: 'pcs', name: 'Pieces' },
];

/**
 * Currency classifiers
 */
export const currencies: Currency[] = [
  { id: 1, code: 'diamond', name: 'Diamond Mark', cost: 1000 },
  { id: 2, code: 'emerald', name: 'Emerald Mark', cost: 100 },
  { id: 3, code: 'sapphire', name: 'Sapphire Mark', cost: 50 },
  { id: 4, code: 'ruby', name: 'Ruby Mark', cost: 25 },
  { id: 5, code: 'topaz', name: 'Topaz Mark', cost: 10 },
  { id: 6, code: 'heliodor', name: 'Heliodor Mark', cost: 5 },
  { id: 7, code: 'garnet', name: 'Garnet Mark', cost: 3 },
  { id: 8, code: 'zircon', name: 'Zircon Mark', cost: 2 },
  { id: 9, code: 'amethyst', name: 'Amethyst Mark', cost: 1 },
  { id: 10, code: 'smokestone', name: 'Smokestone Chip', cost: 0.5 },
  { id: 11, code: 'chip', name: 'Clear Chip', cost: 0.2 },
];

/**
 * Equipment items - equipTypeId references equipmentTypes.id
 * 1=weapon, 2=armor, 3=fabrial, 4=consumable, 5=gear
 */
export const equipments: Equipment[] = [
  // Weapons (equipTypeId 1)
  {
    id: 1,
    code: 'knife',
    name: 'Knife',
    equipTypeId: 1,
    actionId: 1, // knife-strike action
    special: { damage: '1d4', damageType: 'keen' },
    cost: 5,
    isCustom: false,
  },
  {
    id: 2,
    code: 'longsword',
    name: 'Longsword',
    equipTypeId: 1,
    actionId: 2, // longsword-strike action
    special: { damage: '1d8', damageType: 'keen' },
    cost: 50,
    isCustom: false,
  },
  {
    id: 3,
    code: 'longspear',
    name: 'Longspear',
    equipTypeId: 1,
    actionId: 3, // longspear-strike action
    special: { damage: '1d8', damageType: 'keen', range: '10 ft' },
    cost: 30,
    isCustom: false,
  },
  {
    id: 4,
    code: 'shardblade',
    name: 'Shardblade',
    equipTypeId: 1,
    actionId: 4, // shardblade-strike action
    special: { damage: '2d10', damageType: 'spirit' },
    cost: 0,
    isCustom: false,
  },
  // Armor (equipTypeId 2)
  {
    id: 5,
    code: 'leather',
    name: 'Leather Armor',
    equipTypeId: 2,
    special: { deflect: 1 },
    cost: 20,
    isCustom: false,
  },
  {
    id: 6,
    code: 'chain',
    name: 'Chain Mail',
    equipTypeId: 2,
    special: { deflect: 2 },
    cost: 100,
    isCustom: false,
  },
  {
    id: 7,
    code: 'plate',
    name: 'Plate Armor',
    equipTypeId: 2,
    special: { deflect: 3 },
    cost: 500,
    isCustom: false,
  },
  {
    id: 8,
    code: 'shardplate',
    name: 'Shardplate',
    equipTypeId: 2,
    special: { deflect: 5, charges: 4, maxCharges: 4 },
    cost: 0,
    isCustom: false,
  },
  // Gear (equipTypeId 5)
  {
    id: 9,
    code: 'backpack',
    name: 'Backpack',
    equipTypeId: 5,
    cost: 8,
    isCustom: false,
  },
  {
    id: 10,
    code: 'rope',
    name: 'Rope (50 ft)',
    equipTypeId: 5,
    cost: 30,
    isCustom: false,
  },
  {
    id: 11,
    code: 'waterskin',
    name: 'Waterskin',
    equipTypeId: 5,
    cost: 1,
    isCustom: false,
  },
  {
    id: 12,
    code: 'clothing-common',
    name: 'Common Clothing',
    equipTypeId: 5,
    cost: 2,
    isCustom: false,
  },
  {
    id: 13,
    code: 'clothing-fine',
    name: 'Fine Clothing',
    equipTypeId: 5,
    cost: 50,
    isCustom: false,
  },
  // Consumables (equipTypeId 4)
  {
    id: 14,
    code: 'ration',
    name: 'Rations (1 day)',
    equipTypeId: 4,
    unitId: 3, // pieces
    cost: 0.2,
    isCustom: false,
  },
  {
    id: 15,
    code: 'antiseptic-weak',
    name: 'Antiseptic, Weak (5 doses)',
    equipTypeId: 4,
    cost: 25,
    isCustom: false,
  },
  {
    id: 16,
    code: 'antiseptic-potent',
    name: 'Antiseptic, Potent (5 doses)',
    equipTypeId: 4,
    cost: 50,
    isCustom: false,
  },
  // Fabrials (equipTypeId 3)
  {
    id: 17,
    code: 'spanreed',
    name: 'Spanreed (pair)',
    equipTypeId: 3,
    special: { charges: 3, maxCharges: 3 },
    cost: 100,
    isCustom: false,
  },
  {
    id: 18,
    code: 'heatrial',
    name: 'Heatrial',
    equipTypeId: 3,
    special: { charges: 5, maxCharges: 5 },
    cost: 50,
    isCustom: false,
  },
];

/**
 * Weapon to attribute mapping (which weapons have which traits)
 */
export const equipmentAttributeMaps = [
  { id: 1, equipmentId: 1, attributeId: 13 }, // knife - offhand
  { id: 2, equipmentId: 1, attributeId: 18 }, // knife - thrown
  { id: 3, equipmentId: 2, attributeId: 3 }, // longsword - blocking
  { id: 4, equipmentId: 3, attributeId: 17 }, // longspear - reach
  { id: 5, equipmentId: 3, attributeId: 19 }, // longspear - two-handed
  { id: 6, equipmentId: 4, attributeId: 20 }, // shardblade - unique
  { id: 7, equipmentId: 4, attributeId: 19 }, // shardblade - two-handed
];

// ============================================
// Deprecated exports for backwards compatibility
// ============================================

/**
 * @deprecated Use equipments with equipTypeId=1 instead
 */
export const weapons: Weapon[] = [
  {
    id: 1,
    code: 'knife',
    name: 'Knife',
    category: 'light',
    skillCode: 'light-weaponry',
    damage: '1d4',
    damageType: 'keen',
    traits: ['offhand', 'thrown'],
    cost: 5,
  },
  {
    id: 2,
    code: 'longsword',
    name: 'Longsword',
    category: 'heavy',
    skillCode: 'heavy-weaponry',
    damage: '1d8',
    damageType: 'keen',
    traits: ['blocking'],
    cost: 50,
  },
  {
    id: 3,
    code: 'longspear',
    name: 'Longspear',
    category: 'heavy',
    skillCode: 'heavy-weaponry',
    damage: '1d8',
    damageType: 'keen',
    traits: ['reach', 'two-handed'],
    cost: 30,
  },
  {
    id: 4,
    code: 'shardblade',
    name: 'Shardblade',
    category: 'special',
    skillCode: 'heavy-weaponry',
    damage: '2d10',
    damageType: 'spirit',
    traits: ['unique', 'two-handed'],
    cost: 0,
    description: 'Legendary weapon that cuts through anything',
  },
];

/**
 * @deprecated Use equipments with equipTypeId=2 instead
 */
export const armor: Armor[] = [
  { id: 1, code: 'leather', name: 'Leather Armor', deflect: 1, cost: 20 },
  { id: 2, code: 'chain', name: 'Chain Mail', deflect: 2, cost: 100 },
  { id: 3, code: 'plate', name: 'Plate Armor', deflect: 3, cost: 500 },
  {
    id: 4,
    code: 'shardplate',
    name: 'Shardplate',
    deflect: 5,
    cost: 0,
    description: 'Legendary armor with regenerating charges',
  },
];

/**
 * @deprecated Use equipments instead
 */
export const equipment: Equipment[] = equipments;

/**
 * Helper to get equipment type name from ID
 */
export function getEquipmentTypeName(equipTypeId: number): string {
  return equipmentTypes.find((t) => t.id === equipTypeId)?.name ?? 'Unknown';
}

/**
 * Helper to get equipment by code
 */
export function getEquipmentByCode(code: string): Equipment | undefined {
  return equipments.find((e) => e.code === code);
}

/**
 * Helper to get equipment attributes (traits) for an equipment item
 */
export function getEquipmentTraits(equipmentId: number): EquipmentAttribute[] {
  const attributeIds = equipmentAttributeMaps
    .filter((m) => m.equipmentId === equipmentId)
    .map((m) => m.attributeId);
  return equipmentAttributes.filter((a) => attributeIds.includes(a.id));
}
