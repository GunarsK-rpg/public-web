import type { DerivedStat } from 'src/types';

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
];

/**
 * Lookup tables for derived stat calculations
 */

// Lifting Capacity by STR
export const liftCapacityTable: Record<number, string> = {
  0: '100 lb',
  1: '200 lb',
  2: '200 lb',
  3: '500 lb',
  4: '500 lb',
  5: '1,000 lb',
  6: '1,000 lb',
  7: '5,000 lb',
  8: '5,000 lb',
  9: '10,000 lb',
};

// Carrying Capacity by STR
export const carryCapacityTable: Record<number, string> = {
  0: '50 lb',
  1: '100 lb',
  2: '100 lb',
  3: '250 lb',
  4: '250 lb',
  5: '500 lb',
  6: '500 lb',
  7: '2,500 lb',
  8: '2,500 lb',
  9: '5,000 lb',
};

// Movement by SPD
export const movementTable: Record<number, string> = {
  0: '20 ft',
  1: '25 ft',
  2: '25 ft',
  3: '30 ft',
  4: '30 ft',
  5: '40 ft',
  6: '40 ft',
  7: '60 ft',
  8: '60 ft',
  9: '80 ft',
};

// Recovery Die by WIL
export const recoveryDieTable: Record<number, string> = {
  0: 'd4',
  1: 'd6',
  2: 'd6',
  3: 'd8',
  4: 'd8',
  5: 'd10',
  6: 'd10',
  7: 'd12',
  8: 'd12',
  9: 'd20',
};

// Senses Range by AWA
export const sensesRangeTable: Record<number, string> = {
  0: '5 ft',
  1: '10 ft',
  2: '10 ft',
  3: '20 ft',
  4: '20 ft',
  5: '50 ft',
  6: '50 ft',
  7: '100 ft',
  8: '100 ft',
  9: 'Unaffected',
};

// Unarmed Damage by STR
export const unarmedDamageTable: Record<number, string> = {
  0: '1d4',
  1: '1d6',
  2: '1d6',
  3: '1d8',
  4: '1d8',
  5: '1d10',
  6: '1d10',
  7: '1d12',
  8: '1d12',
};

/**
 * Helper to get derived stat by code
 */
export function getDerivedStatByCode(code: string): DerivedStat | undefined {
  return derivedStats.find((s) => s.code === code);
}

/**
 * Helper to get lifting capacity for a given STR value
 */
export function getLiftCapacity(str: number): string {
  const key = Math.min(Math.max(str, 0), 9);
  return liftCapacityTable[key] || liftCapacityTable[9] || '10,000 lb';
}

/**
 * Helper to get carrying capacity for a given STR value
 */
export function getCarryCapacity(str: number): string {
  const key = Math.min(Math.max(str, 0), 9);
  return carryCapacityTable[key] || carryCapacityTable[9] || '5,000 lb';
}

/**
 * Helper to get movement rate for a given SPD value
 */
export function getMovement(spd: number): string {
  const key = Math.min(Math.max(spd, 0), 9);
  return movementTable[key] || movementTable[9] || '80 ft';
}

/**
 * Helper to get recovery die for a given WIL value
 */
export function getRecoveryDie(wil: number): string {
  const key = Math.min(Math.max(wil, 0), 9);
  return recoveryDieTable[key] || recoveryDieTable[9] || 'd20';
}

/**
 * Helper to get senses range for a given AWA value
 */
export function getSensesRange(awa: number): string {
  const key = Math.min(Math.max(awa, 0), 9);
  return sensesRangeTable[key] || sensesRangeTable[9] || 'Unaffected';
}

/**
 * Helper to get unarmed damage for a given STR value
 */
export function getUnarmedDamage(str: number): string {
  const key = Math.min(Math.max(str, 0), 8);
  return unarmedDamageTable[key] || unarmedDamageTable[8] || '1d12';
}

/**
 * Calculate max health: 10 + STR + level bonuses
 */
export function calculateMaxHealth(str: number, level: number): number {
  // Base 10 + STR + some level bonus (simplified)
  return 10 + str + Math.floor(level / 2);
}

/**
 * Calculate max focus: 2 + WIL + bonuses
 */
export function calculateMaxFocus(wil: number): number {
  return 2 + wil;
}

/**
 * Calculate max investiture: 2 + max(AWA, PRE) + bonuses
 * Only for Radiants
 */
export function calculateMaxInvestiture(awa: number, pre: number): number {
  return 2 + Math.max(awa, pre);
}

/**
 * Calculate physical defense: 10 + STR + SPD
 */
export function calculatePhysicalDefense(str: number, spd: number): number {
  return 10 + str + spd;
}

/**
 * Calculate cognitive defense: 10 + INT + WIL
 */
export function calculateCognitiveDefense(int: number, wil: number): number {
  return 10 + int + wil;
}

/**
 * Calculate spiritual defense: 10 + AWA + PRE
 */
export function calculateSpiritualDefense(awa: number, pre: number): number {
  return 10 + awa + pre;
}
