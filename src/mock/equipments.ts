import type { Equipment, EquipmentType, DamageType } from 'src/types';

/**
 * Equipment type classifiers
 */
export const equipmentTypes: EquipmentType[] = [
  { id: 1, code: 'weapon', name: 'Weapon', icon: 'weapon.svg' },
  { id: 2, code: 'armor', name: 'Armor', icon: 'armor.svg' },
  { id: 3, code: 'fabrial', name: 'Fabrial', icon: 'fabrial.svg' },
  { id: 4, code: 'consumable', name: 'Consumable', icon: 'consumable.svg' },
  { id: 5, code: 'gear', name: 'Gear', icon: 'gear.svg' },
];

/**
 * Damage type classifiers
 */
export const damageTypes: DamageType[] = [
  { id: 1, code: 'energy', name: 'Energy', description: 'Effects related to heat and energy' },
  { id: 2, code: 'impact', name: 'Impact', description: 'Effects that crush or bludgeon' },
  { id: 3, code: 'keen', name: 'Keen', description: 'Effects that slice, puncture, or impale' },
  {
    id: 4,
    code: 'spirit',
    name: 'Spirit',
    description: 'Effects that damage physical and spiritual self',
  },
  { id: 5, code: 'vital', name: 'Vital', description: 'Effects that test constitution' },
];

/**
 * Equipment items
 */
export const equipment: Equipment[] = [
  // Weapons (equipTypeId 1)
  {
    id: 1,
    code: 'knife',
    name: 'Knife',
    equipTypeId: 1,
    damageTypeId: 3, // keen
    special: { damage: '1d4' },
    cost: 5,
    isCustom: false,
  },
  {
    id: 2,
    code: 'longsword',
    name: 'Longsword',
    equipTypeId: 1,
    damageTypeId: 3, // keen
    special: { damage: '1d8' },
    cost: 50,
    isCustom: false,
  },
  {
    id: 3,
    code: 'longspear',
    name: 'Longspear',
    equipTypeId: 1,
    damageTypeId: 3, // keen
    special: { damage: '1d8', range: '10 ft' },
    cost: 30,
    isCustom: false,
  },
  {
    id: 4,
    code: 'shardblade',
    name: 'Shardblade',
    equipTypeId: 1,
    damageTypeId: 4, // spirit
    special: { damage: '2d10' },
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
  // More Weapons
  {
    id: 9,
    code: 'sling',
    name: 'Sling',
    equipTypeId: 1,
    damageTypeId: 2, // impact
    special: { damage: '1d4' },
    cost: 2,
    isCustom: false,
  },
  {
    id: 10,
    code: 'staff',
    name: 'Staff',
    equipTypeId: 1,
    damageTypeId: 2, // impact
    special: { damage: '1d6' },
    cost: 5,
    isCustom: false,
  },
  {
    id: 11,
    code: 'hammer',
    name: 'Hammer',
    equipTypeId: 1,
    damageTypeId: 2, // impact
    special: { damage: '1d6' },
    cost: 15,
    isCustom: false,
  },
  // Gear (equipTypeId 5)
  { id: 12, code: 'backpack', name: 'Backpack', equipTypeId: 5, cost: 8, isCustom: false },
  { id: 13, code: 'rope', name: 'Rope (50 ft)', equipTypeId: 5, cost: 30, isCustom: false },
  { id: 14, code: 'waterskin', name: 'Waterskin', equipTypeId: 5, cost: 1, isCustom: false },
  {
    id: 15,
    code: 'clothing-common',
    name: 'Common Clothing',
    equipTypeId: 5,
    cost: 2,
    isCustom: false,
  },
  {
    id: 16,
    code: 'clothing-fine',
    name: 'Fine Clothing',
    equipTypeId: 5,
    cost: 50,
    isCustom: false,
  },
  { id: 17, code: 'uniform', name: 'Uniform', equipTypeId: 5, cost: 10, isCustom: false },
  { id: 18, code: 'writing-kit', name: 'Writing Kit', equipTypeId: 5, cost: 10, isCustom: false },
  { id: 19, code: 'book', name: 'Book', equipTypeId: 5, cost: 25, isCustom: false },
  { id: 20, code: 'toolkit', name: 'Toolkit', equipTypeId: 5, cost: 25, isCustom: false },
  { id: 21, code: 'lantern', name: 'Lantern', equipTypeId: 5, cost: 10, isCustom: false },
  { id: 22, code: 'chest', name: 'Chest', equipTypeId: 5, cost: 15, isCustom: false },
  { id: 23, code: 'bedroll', name: 'Bedroll', equipTypeId: 5, cost: 5, isCustom: false },
  { id: 24, code: 'jewelry', name: 'Jewelry', equipTypeId: 5, cost: 50, isCustom: false },
  { id: 25, code: 'lockpicks', name: 'Lockpicks', equipTypeId: 5, cost: 25, isCustom: false },
  { id: 26, code: 'manacles', name: 'Manacles', equipTypeId: 5, cost: 5, isCustom: false },
  {
    id: 27,
    code: 'clothing-ragged',
    name: 'Ragged Clothing',
    equipTypeId: 5,
    cost: 0,
    isCustom: false,
  },
  { id: 28, code: 'ink-pen', name: 'Ink Pen', equipTypeId: 5, cost: 1, isCustom: false },
  { id: 29, code: 'ink-bottle', name: 'Ink Bottle', equipTypeId: 5, cost: 5, isCustom: false },
  { id: 30, code: 'paper', name: 'Paper (10 sheets)', equipTypeId: 5, cost: 2, isCustom: false },
  { id: 31, code: 'vial-empty', name: 'Empty Vial', equipTypeId: 5, cost: 1, isCustom: false },
  { id: 32, code: 'wax-block', name: 'Wax Block', equipTypeId: 5, cost: 1, isCustom: false },
  // Consumables (equipTypeId 4)
  {
    id: 33,
    code: 'ration',
    name: 'Rations (1 day)',
    equipTypeId: 4,
    unitId: 3,
    cost: 0.2,
    isCustom: false,
  },
  {
    id: 34,
    code: 'antiseptic-weak',
    name: 'Antiseptic, Weak (5 doses)',
    equipTypeId: 4,
    cost: 25,
    isCustom: false,
  },
  {
    id: 35,
    code: 'antiseptic-potent',
    name: 'Antiseptic, Potent (5 doses)',
    equipTypeId: 4,
    cost: 50,
    isCustom: false,
  },
  {
    id: 36,
    code: 'poison-weak',
    name: 'Weak Poison (1 dose)',
    equipTypeId: 4,
    cost: 10,
    isCustom: false,
  },
  // Fabrials (equipTypeId 3)
  {
    id: 37,
    code: 'spanreed',
    name: 'Spanreed (pair)',
    equipTypeId: 3,
    special: { charges: 3, maxCharges: 3 },
    cost: 100,
    isCustom: false,
  },
  {
    id: 38,
    code: 'heatrial',
    name: 'Heatrial',
    equipTypeId: 3,
    special: { charges: 5, maxCharges: 5 },
    cost: 50,
    isCustom: false,
  },
];
