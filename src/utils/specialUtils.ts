import type { SpecialEntry, HeroTalent, HeroEquipment, HeroCondition } from 'src/types';
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

  // Modification effect types
  DIE_MODIFIER: 'die_modifier',
  ROLL_MODIFIER: 'roll_modifier',
  CHARGES_MODIFIER: 'charges_modifier',

  // Condition-specific types
  EXHAUSTED_PENALTY: 'exhausted_penalty',
  AFFLICTED_DAMAGE: 'afflicted_damage',
  FOCUSED: 'focused',

  // Flag types (value: 1)
  SPECIALIST: 'specialist',
  PAIRED: 'paired',
  REWARD_ONLY: 'reward_only',
  PERMANENT: 'permanent',

  // Talent grant types
  EXPERTISE_GRANT: 'expertise_grant',
  EXPERTISE_CHOICE: 'expertise_choice',
  EXPERTISE_TYPE_CHOICE: 'expertise_type_choice',
  ITEM_GRANT: 'item_grant',
  ITEM_CHOICE: 'item_choice',
  SKILL_MODIFIER_CHOICE: 'skill_modifier_choice',
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
 * Replace {dice_size} placeholder with the entry's numeric value (e.g. "1d{dice_size}" + 8 -> "1d8").
 */
export function resolveDiceSize(displayValue: string, dieSize: number | undefined): string {
  if (dieSize == null) return displayValue;
  return displayValue.replace('{dice_size}', String(dieSize));
}

/**
 * Prepend the hero's skill modifier to a skill display value (e.g. "Light Weaponry" -> "+4 Light Weaponry").
 */
export function resolveSkillModifier(displayValue: string, skillModifier: number): string {
  const sign = skillModifier >= 0 ? '+' : '';
  return `${sign}${skillModifier} ${displayValue}`;
}

/**
 * Find a special entry by type
 */
export function getSpecialByType(special: SpecialEntry[], type: string): SpecialEntry | undefined {
  return special.find((s) => s.type === type);
}

/**
 * Collect all numeric values for a type from hero sources (talents, equipped equipment, singer form).
 */
function collectHeroValues(
  talents: HeroTalent[],
  equipment: HeroEquipment[],
  singerForm: SingerForm | null,
  type: string
): number[] {
  const values: number[] = [];
  for (const t of talents) {
    for (const entry of t.special ?? []) {
      if (entry.type === type && entry.value !== undefined) values.push(entry.value);
    }
  }
  for (const e of equipment) {
    if (!e.isEquipped) continue;
    // Check overrides first (per-instance stats), fall back to classifier base
    const override = e.specialOverrides?.find((s) => s.type === type);
    const entry = override ?? (e.special ?? []).find((s) => s.type === type);
    if (entry?.value !== undefined) values.push(entry.value);
  }
  if (singerForm) {
    for (const entry of singerForm.special ?? []) {
      if (entry.type === type && entry.value !== undefined) values.push(entry.value);
    }
  }
  return values;
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
  return collectHeroValues(talents, equipment, singerForm, type).reduce((a, b) => a + b, 0);
}

/**
 * Get the highest numeric value for a type across all hero sources.
 * Used for deflect where armor and singer form values don't stack (use highest).
 */
export function getHeroMaxBonus(
  talents: HeroTalent[],
  equipment: HeroEquipment[],
  singerForm: SingerForm | null,
  type: string
): number {
  return Math.max(0, ...collectHeroValues(talents, equipment, singerForm, type));
}

/**
 * Get total numeric bonus for a type from hero condition special arrays.
 * Separate from getHeroBonus so Enhanced attribute bonuses can be excluded
 * from defense/max resource formulas per game rules.
 */
export function getConditionBonus(conditions: HeroCondition[], type: string): number {
  let total = 0;
  for (const c of conditions) {
    for (const entry of c.special ?? []) {
      if (entry.type === type && entry.value !== undefined) total += entry.value;
    }
  }
  return total;
}
