import type { DerivedStat, DerivedStatValue } from 'src/types';

// Attribute IDs (matching mock/attributes.ts)
const ATTR_STR = 1;
const ATTR_SPD = 2;
const ATTR_WIL = 4;
const ATTR_AWA = 5;

// Derived stat IDs
const STAT_MOVEMENT = 4;
const STAT_RECOVERY_DIE = 5;
const STAT_LIFT_CAPACITY = 6;
const STAT_CARRY_CAPACITY = 7;
const STAT_SENSES_RANGE = 8;

/**
 * Derived stat classifiers - calculated statistics
 */
export const derivedStats: DerivedStat[] = [
  { id: 1, code: 'max_health', name: 'Maximum Health' },
  { id: 2, code: 'max_focus', name: 'Maximum Focus' },
  { id: 3, code: 'max_investiture', name: 'Maximum Investiture' },
  { id: 4, code: 'movement', name: 'Movement Rate' },
  { id: 5, code: 'recovery_die', name: 'Recovery Die' },
  { id: 6, code: 'lift_capacity', name: 'Lifting Capacity' },
  { id: 7, code: 'carry_capacity', name: 'Carrying Capacity' },
  { id: 8, code: 'senses_range', name: 'Senses Range' },
  { id: 9, code: 'unarmed_damage', name: 'Unarmed Damage' },
  { id: 10, code: 'deflect', name: 'Deflect' },
];

/**
 * Derived stat value lookup table (cl_derived_stat_values)
 * Maps attribute values to derived stat values
 */
export const derivedStatValues: DerivedStatValue[] = [
  // Movement by SPD (each point = 5 ft)
  { id: 1, derivedStatId: STAT_MOVEMENT, attrId: ATTR_SPD, attrMin: 0, attrMax: 0, value: 20 },
  { id: 2, derivedStatId: STAT_MOVEMENT, attrId: ATTR_SPD, attrMin: 1, attrMax: 1, value: 25 },
  { id: 3, derivedStatId: STAT_MOVEMENT, attrId: ATTR_SPD, attrMin: 2, attrMax: 2, value: 30 },
  { id: 4, derivedStatId: STAT_MOVEMENT, attrId: ATTR_SPD, attrMin: 3, attrMax: 3, value: 35 },
  { id: 5, derivedStatId: STAT_MOVEMENT, attrId: ATTR_SPD, attrMin: 4, attrMax: 4, value: 40 },
  { id: 6, derivedStatId: STAT_MOVEMENT, attrId: ATTR_SPD, attrMin: 5, attrMax: 5, value: 45 },
  { id: 7, derivedStatId: STAT_MOVEMENT, attrId: ATTR_SPD, attrMin: 6, attrMax: 6, value: 50 },
  { id: 8, derivedStatId: STAT_MOVEMENT, attrId: ATTR_SPD, attrMin: 7, attrMax: 7, value: 55 },
  { id: 9, derivedStatId: STAT_MOVEMENT, attrId: ATTR_SPD, attrMin: 8, attrMax: 8, value: 60 },
  { id: 10, derivedStatId: STAT_MOVEMENT, attrId: ATTR_SPD, attrMin: 9, attrMax: null, value: 65 },

  // Lifting Capacity by STR
  {
    id: 11,
    derivedStatId: STAT_LIFT_CAPACITY,
    attrId: ATTR_STR,
    attrMin: 0,
    attrMax: 0,
    value: 100,
  },
  {
    id: 12,
    derivedStatId: STAT_LIFT_CAPACITY,
    attrId: ATTR_STR,
    attrMin: 1,
    attrMax: 2,
    value: 200,
  },
  {
    id: 13,
    derivedStatId: STAT_LIFT_CAPACITY,
    attrId: ATTR_STR,
    attrMin: 3,
    attrMax: 4,
    value: 500,
  },
  {
    id: 14,
    derivedStatId: STAT_LIFT_CAPACITY,
    attrId: ATTR_STR,
    attrMin: 5,
    attrMax: 6,
    value: 1000,
  },
  {
    id: 15,
    derivedStatId: STAT_LIFT_CAPACITY,
    attrId: ATTR_STR,
    attrMin: 7,
    attrMax: 8,
    value: 5000,
  },
  {
    id: 16,
    derivedStatId: STAT_LIFT_CAPACITY,
    attrId: ATTR_STR,
    attrMin: 9,
    attrMax: null,
    value: 10000,
  },

  // Carrying Capacity by STR
  {
    id: 17,
    derivedStatId: STAT_CARRY_CAPACITY,
    attrId: ATTR_STR,
    attrMin: 0,
    attrMax: 0,
    value: 50,
  },
  {
    id: 18,
    derivedStatId: STAT_CARRY_CAPACITY,
    attrId: ATTR_STR,
    attrMin: 1,
    attrMax: 2,
    value: 100,
  },
  {
    id: 19,
    derivedStatId: STAT_CARRY_CAPACITY,
    attrId: ATTR_STR,
    attrMin: 3,
    attrMax: 4,
    value: 250,
  },
  {
    id: 20,
    derivedStatId: STAT_CARRY_CAPACITY,
    attrId: ATTR_STR,
    attrMin: 5,
    attrMax: 6,
    value: 500,
  },
  {
    id: 21,
    derivedStatId: STAT_CARRY_CAPACITY,
    attrId: ATTR_STR,
    attrMin: 7,
    attrMax: 8,
    value: 2500,
  },
  {
    id: 22,
    derivedStatId: STAT_CARRY_CAPACITY,
    attrId: ATTR_STR,
    attrMin: 9,
    attrMax: null,
    value: 5000,
  },

  // Recovery Die by WIL (value = die sides: 6=d6, 8=d8, etc.)
  { id: 23, derivedStatId: STAT_RECOVERY_DIE, attrId: ATTR_WIL, attrMin: 0, attrMax: 0, value: 6 },
  { id: 24, derivedStatId: STAT_RECOVERY_DIE, attrId: ATTR_WIL, attrMin: 1, attrMax: 1, value: 8 },
  { id: 25, derivedStatId: STAT_RECOVERY_DIE, attrId: ATTR_WIL, attrMin: 2, attrMax: 2, value: 10 },
  { id: 26, derivedStatId: STAT_RECOVERY_DIE, attrId: ATTR_WIL, attrMin: 3, attrMax: 3, value: 12 },
  {
    id: 27,
    derivedStatId: STAT_RECOVERY_DIE,
    attrId: ATTR_WIL,
    attrMin: 4,
    attrMax: null,
    value: 12,
  },

  // Senses Range by AWA (-1 = Unaffected by obscured senses)
  { id: 28, derivedStatId: STAT_SENSES_RANGE, attrId: ATTR_AWA, attrMin: 0, attrMax: 0, value: 5 },
  { id: 29, derivedStatId: STAT_SENSES_RANGE, attrId: ATTR_AWA, attrMin: 1, attrMax: 2, value: 10 },
  { id: 30, derivedStatId: STAT_SENSES_RANGE, attrId: ATTR_AWA, attrMin: 3, attrMax: 4, value: 20 },
  { id: 31, derivedStatId: STAT_SENSES_RANGE, attrId: ATTR_AWA, attrMin: 5, attrMax: 6, value: 50 },
  {
    id: 32,
    derivedStatId: STAT_SENSES_RANGE,
    attrId: ATTR_AWA,
    attrMin: 7,
    attrMax: 8,
    value: 100,
  },
  {
    id: 33,
    derivedStatId: STAT_SENSES_RANGE,
    attrId: ATTR_AWA,
    attrMin: 9,
    attrMax: null,
    value: -1,
  },
];

/**
 * Helper to get derived stat by code
 */
export function getDerivedStatByCode(code: string): DerivedStat | undefined {
  return derivedStats.find((s) => s.code === code);
}

/**
 * Lookup a derived stat value from the derivedStatValues table
 */
export function lookupDerivedStatValue(
  derivedStatId: number,
  attrId: number,
  attrValue: number
): number | undefined {
  const entry = derivedStatValues.find(
    (v) =>
      v.derivedStatId === derivedStatId &&
      v.attrId === attrId &&
      attrValue >= v.attrMin &&
      (v.attrMax === null || attrValue <= v.attrMax)
  );
  return entry?.value;
}

/**
 * Helper to get lifting capacity for a given STR value
 */
export function getLiftCapacity(str: number): number {
  return lookupDerivedStatValue(STAT_LIFT_CAPACITY, ATTR_STR, str) ?? 10000;
}

/**
 * Helper to get carrying capacity for a given STR value
 */
export function getCarryCapacity(str: number): number {
  return lookupDerivedStatValue(STAT_CARRY_CAPACITY, ATTR_STR, str) ?? 5000;
}

/**
 * Helper to get movement rate for a given SPD value
 */
export function getMovement(spd: number): number {
  return lookupDerivedStatValue(STAT_MOVEMENT, ATTR_SPD, spd) ?? 65;
}

/**
 * Helper to get recovery die sides for a given WIL value
 */
export function getRecoveryDie(wil: number): number {
  return lookupDerivedStatValue(STAT_RECOVERY_DIE, ATTR_WIL, wil) ?? 12;
}

/**
 * Helper to get senses range for a given AWA value
 * Returns -1 for "Unaffected by obscured senses"
 */
export function getSensesRange(awa: number): number {
  return lookupDerivedStatValue(STAT_SENSES_RANGE, ATTR_AWA, awa) ?? -1;
}
