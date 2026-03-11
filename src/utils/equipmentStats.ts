import type { SpecialEntry, HeroEquipment, AppliedModification } from 'src/types';
import { SPECIAL } from './specialUtils';

export const DIE_SIZES = [4, 6, 8, 10, 12, 20];

/**
 * Sum the accumulated delta for a given modifier type across all classifier mods.
 */
export function getModifierDelta(modifications: AppliedModification[], type: string): number {
  let delta = 0;
  for (const mod of modifications) {
    if (!mod.modification) continue;
    for (const effect of mod.special) {
      if (effect.type === type) {
        delta += effect.value ?? 0;
      }
    }
  }
  return delta;
}

/**
 * Returns effective special entries for a hero equipment instance.
 * Priority: specialOverrides entry > classifier special entry (per type).
 */
export function mergeSpecial(
  classifierSpecial: SpecialEntry[],
  overrides: SpecialEntry[]
): SpecialEntry[] {
  if (!overrides.length) return classifierSpecial;
  if (!classifierSpecial.length) return overrides;

  const merged = new Map<string, SpecialEntry>();
  for (const entry of classifierSpecial) {
    merged.set(entry.type, entry);
  }
  for (const entry of overrides) {
    merged.set(entry.type, entry);
  }
  return [...merged.values()];
}

/**
 * Recalculates specialOverrides by applying all classifier modification effects
 * on top of the classifier base special.
 * Returns the new specialOverrides array (sparse — only changed entries).
 */
export function recalculateSpecialFromMods(
  classifierSpecial: SpecialEntry[],
  modifications: AppliedModification[]
): SpecialEntry[] {
  const classifierMods = modifications.filter((m) => m.modification !== null);
  if (!classifierMods.length) return [];

  // Build working map from base
  const working = new Map<string, SpecialEntry>();
  for (const entry of classifierSpecial) {
    working.set(entry.type, { ...entry });
  }

  // Apply absolute replacement effects (skip delta-based modifiers)
  for (const mod of classifierMods) {
    for (const effect of mod.special) {
      if (effect.type !== SPECIAL.DIE_MODIFIER && effect.type !== SPECIAL.CHARGES_MODIFIER) {
        working.set(effect.type, { ...effect });
      }
    }
  }

  // Apply accumulated die modifier to damage entry
  const dieDelta = getModifierDelta(modifications, SPECIAL.DIE_MODIFIER);
  if (dieDelta !== 0) {
    const damageEntry = working.get(SPECIAL.DAMAGE);
    if (damageEntry && damageEntry.value !== undefined) {
      const currentIndex = DIE_SIZES.indexOf(damageEntry.value);
      if (currentIndex !== -1) {
        const newIndex = Math.max(0, Math.min(DIE_SIZES.length - 1, currentIndex + dieDelta));
        damageEntry.value = DIE_SIZES[newIndex]!;
      }
    }
  }

  // Build sparse overrides: only entries that differ from base
  const baseMap = new Map<string, SpecialEntry>();
  for (const entry of classifierSpecial) {
    baseMap.set(entry.type, entry);
  }

  const overrides: SpecialEntry[] = [];
  for (const [, entry] of working) {
    const base = baseMap.get(entry.type);
    if (!base || JSON.stringify(base) !== JSON.stringify(entry)) {
      overrides.push(entry);
    }
  }

  return overrides;
}

/**
 * Convenience wrapper: returns effective special for a hero equipment instance.
 */
export function getEffectiveSpecial(heroEquipment: HeroEquipment): SpecialEntry[] {
  return mergeSpecial(heroEquipment.special, heroEquipment.specialOverrides);
}
