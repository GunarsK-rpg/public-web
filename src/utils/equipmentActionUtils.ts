import type { Action, EquipmentActionInstance } from 'src/types';
import type { ClassifierRef, SpecialEntry } from 'src/types';
import type { HeroEquipment } from 'src/types';
import { SPECIAL } from './specialUtils';

/**
 * Derives the effective dice string for an equipment action instance.
 * Falls back to the classifier action's dice if equipment has no damage entry.
 */
export function getInstanceDice(instance: EquipmentActionInstance): string | null {
  const damageEntry = instance.effectiveSpecial.find((s) => s.type === SPECIAL.DAMAGE);
  if (damageEntry?.display_value) {
    return damageEntry.value != null
      ? damageEntry.display_value.replace('{dice_size}', String(damageEntry.value))
      : damageEntry.display_value;
  }
  return instance.action.dice ?? null;
}

/**
 * Derives the effective action special entries, overlaying equipment instance
 * values where they exist (range, skill, etc.).
 */
export function getInstanceActionSpecial(instance: EquipmentActionInstance): SpecialEntry[] {
  const actionMap = new Map<string, SpecialEntry>();
  for (const entry of instance.action.special ?? []) {
    actionMap.set(entry.type, entry);
  }
  const equipMap = new Map<string, SpecialEntry>();
  for (const entry of instance.effectiveSpecial) {
    equipMap.set(entry.type, entry);
  }
  const types = new Set([...actionMap.keys(), ...equipMap.keys()]);
  return [...types].map((type) => equipMap.get(type) ?? actionMap.get(type)!);
}

/**
 * Collects roll_modifier entries from equipment modifications (e.g., Advantage/Disadvantage).
 */
export function getModRollModifiers(instance: EquipmentActionInstance): SpecialEntry[] {
  const modifiers: SpecialEntry[] = [];
  for (const mod of instance.heroEquipment.modifications) {
    for (const effect of mod.special) {
      if (effect.type === SPECIAL.ROLL_MODIFIER) {
        modifiers.push(effect);
      }
    }
  }
  return modifiers;
}

/**
 * Returns a display name for the equipment instance.
 * Uses customName if set, otherwise falls back to classifier equipment name.
 */
export function getInstanceWeaponLabel(instance: EquipmentActionInstance): string | null {
  return instance.heroEquipment.customName ?? instance.heroEquipment.equipment?.name ?? null;
}

/**
 * Synthesizes a minimal Action for custom (non-classifier) equipment.
 * Uses the hero equipment ID as a stable synthetic action ID.
 */
export function createCustomEquipmentAction(
  heroEquipment: HeroEquipment,
  actionType: ClassifierRef,
  activationType: ClassifierRef
): Action {
  return {
    id: heroEquipment.id,
    code: `custom-${heroEquipment.id}`,
    name: heroEquipment.customName ?? 'Attack',
    description: heroEquipment.notes ?? '',
    actionType,
    activationType,
    damageType: null,
    special: [],
    dice: null,
    focusCost: 0,
    investitureCost: 0,
  };
}
