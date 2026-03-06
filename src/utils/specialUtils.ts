import type { SpecialEntry, HeroTalent, HeroEquipment } from 'src/types';
import type { SingerForm } from 'src/types/singerForms';

// Auto-calculable types (value field, frontend sums into derived stats)
export const SPECIAL = {
  // Attribute bonuses
  ATTRIBUTE_STR: 'attribute_str',
  ATTRIBUTE_SPD: 'attribute_spd',
  ATTRIBUTE_INT: 'attribute_int',
  ATTRIBUTE_WIL: 'attribute_wil',
  ATTRIBUTE_AWA: 'attribute_awa',
  ATTRIBUTE_PRE: 'attribute_pre',

  // Derived stat bonuses
  HEALTH_PER_LEVEL: 'health_per_level',
  DEFLECT: 'deflect',
  DEFENSE_PHYSICAL: 'defense_physical',
  DEFENSE_COGNITIVE: 'defense_cognitive',
  DEFENSE_SPIRITUAL: 'defense_spiritual',
  FOCUS: 'focus',
  FOCUS_PER_TIER: 'focus_per_tier',
  INVESTITURE_PER_TIER: 'investiture_per_tier',
  MOVEMENT: 'movement',
  CUMBERSOME: 'cumbersome',

  // Item property types (display_value)
  DAMAGE: 'damage',
  RANGE: 'range',
  SKILL: 'skill',
  REACH: 'reach',
  LOADED: 'loaded',
  RADIUS: 'radius',

  // Action-specific types
  DEFENSE: 'defense',
  COST: 'cost',
  DURATION: 'duration',
  NARRATIVE: 'narrative',
  DAMAGE_SCALING: 'damage_scaling',

  // Flag types (value: 1)
  SPECIALIST: 'specialist',
  PAIRED: 'paired',
  REWARD_ONLY: 'reward_only',
  PERMANENT: 'permanent',
} as const;

/**
 * Resolve a damage_scaling display_value by replacing {dice_size} with the actual die
 * based on the hero's skill rank and the entry's die_progression array.
 */
export function resolveDamageScaling(
  displayValue: string,
  skillRank: number,
  dieProgression: number[]
): string {
  if (!dieProgression.length) return displayValue;
  const index = Math.min(skillRank, dieProgression.length - 1);
  return displayValue.replace('{dice_size}', String(dieProgression[index]));
}

/**
 * Find a special entry by type
 */
export function getSpecialByType(special: SpecialEntry[], type: string): SpecialEntry | undefined {
  return special.find((s) => s.type === type);
}

/**
 * Get total numeric bonus for a type from all hero sources (talents, equipped equipment, singer form).
 */
export function getHeroBonus(
  talents: HeroTalent[],
  equipment: HeroEquipment[],
  singerForm: SingerForm | null,
  type: string
): number {
  let total = 0;
  for (const t of talents) {
    for (const entry of t.special ?? []) {
      if (entry.type === type && entry.value !== undefined) total += entry.value;
    }
  }
  for (const e of equipment) {
    if (!e.isEquipped) continue;
    for (const entry of e.special ?? []) {
      if (entry.type === type && entry.value !== undefined) total += entry.value;
    }
  }
  if (singerForm) {
    for (const entry of singerForm.special ?? []) {
      if (entry.type === type && entry.value !== undefined) total += entry.value;
    }
  }
  return total;
}
