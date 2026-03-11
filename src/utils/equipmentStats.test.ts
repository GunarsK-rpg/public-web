import { describe, it, expect } from 'vitest';
import {
  getModifierDelta,
  mergeSpecial,
  recalculateSpecialFromMods,
  getEffectiveSpecial,
} from './equipmentStats';
import type { SpecialEntry, HeroEquipment, AppliedModification } from 'src/types';

// =============================================================================
// Test Fixtures
// =============================================================================

function createHeroEquipment(
  special: SpecialEntry[],
  specialOverrides: SpecialEntry[],
  modifications: AppliedModification[] = []
): HeroEquipment {
  return {
    id: 1,
    heroId: 1,
    equipment: { id: 1, code: 'longsword', name: 'Longsword' },
    equipType: { id: 1, code: 'weapon', name: 'Weapon' },
    special,
    specialOverrides,
    charges: null,
    maxCharges: null,
    amount: 1,
    isEquipped: true,
    customName: null,
    notes: null,
    modifications,
  };
}

// =============================================================================
// getModifierDelta
// =============================================================================

describe('getModifierDelta', () => {
  it('returns 0 when no modifications', () => {
    expect(getModifierDelta([], 'die_modifier')).toBe(0);
  });

  it('sums die_modifier across multiple mods', () => {
    const mods: AppliedModification[] = [
      {
        id: 1,
        modType: 'upgrade',
        modification: { id: 10, code: 'greater_damage', name: 'Greater Damage' },
        special: [{ type: 'die_modifier', value: 1 }],
        customText: null,
      },
      {
        id: 2,
        modType: 'drawback',
        modification: { id: 11, code: 'lesser_damage', name: 'Lesser Damage' },
        special: [{ type: 'die_modifier', value: -1 }],
        customText: null,
      },
    ];

    expect(getModifierDelta(mods, 'die_modifier')).toBe(0);
  });

  it('returns charges_modifier delta', () => {
    const mods: AppliedModification[] = [
      {
        id: 1,
        modType: 'upgrade',
        modification: { id: 10, code: 'higher_capacity', name: 'Higher Capacity' },
        special: [{ type: 'charges_modifier', value: 1 }],
        customText: null,
      },
    ];

    expect(getModifierDelta(mods, 'charges_modifier')).toBe(1);
  });

  it('skips custom text modifications', () => {
    const mods: AppliedModification[] = [
      {
        id: 1,
        modType: 'drawback',
        modification: null,
        special: [],
        customText: 'GM cursed this item',
      },
    ];

    expect(getModifierDelta(mods, 'die_modifier')).toBe(0);
  });
});

// =============================================================================
// mergeSpecial
// =============================================================================

describe('mergeSpecial', () => {
  it('returns classifier base when no overrides', () => {
    const base: SpecialEntry[] = [
      { type: 'damage', display_value: '1d{dice_size}', value: 8 },
      { type: 'range', display_value: 'Melee' },
    ];

    const result = mergeSpecial(base, []);

    expect(result).toEqual(base);
  });

  it('replaces matching type with override', () => {
    const base: SpecialEntry[] = [{ type: 'damage', display_value: '1d{dice_size}', value: 8 }];
    const overrides: SpecialEntry[] = [
      { type: 'damage', display_value: '1d{dice_size}', value: 10 },
    ];

    const result = mergeSpecial(base, overrides);

    expect(result).toEqual([{ type: 'damage', display_value: '1d{dice_size}', value: 10 }]);
  });

  it('adds new type not in base', () => {
    const base: SpecialEntry[] = [{ type: 'damage', display_value: '1d{dice_size}', value: 8 }];
    const overrides: SpecialEntry[] = [
      { type: 'narrative', display_value: 'Glows faintly in the dark' },
    ];

    const result = mergeSpecial(base, overrides);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      type: 'narrative',
      display_value: 'Glows faintly in the dark',
    });
  });

  it('applies multiple overrides correctly', () => {
    const base: SpecialEntry[] = [
      { type: 'damage', display_value: '1d{dice_size}', value: 8 },
      { type: 'range', display_value: 'Melee' },
      { type: 'deflect', value: 2 },
    ];
    const overrides: SpecialEntry[] = [
      { type: 'damage', display_value: '1d{dice_size}', value: 10 },
      { type: 'deflect', value: 3 },
    ];

    const result = mergeSpecial(base, overrides);

    expect(result).toHaveLength(3);
    expect(result.find((s) => s.type === 'damage')?.value).toBe(10);
    expect(result.find((s) => s.type === 'range')?.display_value).toBe('Melee');
    expect(result.find((s) => s.type === 'deflect')?.value).toBe(3);
  });

  it('returns overrides only for custom items (empty base)', () => {
    const overrides: SpecialEntry[] = [
      { type: 'damage', display_value: '1d{dice_size}', value: 6 },
      { type: 'range', display_value: '30/120' },
    ];

    const result = mergeSpecial([], overrides);

    expect(result).toEqual(overrides);
  });
});

// =============================================================================
// recalculateSpecialFromMods
// =============================================================================

describe('recalculateSpecialFromMods', () => {
  it('returns empty array when no modifications', () => {
    const base: SpecialEntry[] = [{ type: 'damage', display_value: '1d{dice_size}', value: 8 }];

    const result = recalculateSpecialFromMods(base, []);

    expect(result).toEqual([]);
  });

  it('applies die_modifier to damage value', () => {
    const base: SpecialEntry[] = [{ type: 'damage', display_value: '1d{dice_size}', value: 8 }];
    const mods: AppliedModification[] = [
      {
        id: 1,
        modType: 'upgrade',
        modification: { id: 10, code: 'greater_damage', name: 'Greater Damage' },
        special: [{ type: 'die_modifier', value: 1 }],
        customText: null,
      },
    ];

    const result = recalculateSpecialFromMods(base, mods);

    // d8 + 1 step = d10
    const damage = result.find((s) => s.type === 'damage');
    expect(damage?.value).toBe(10);
  });

  it('applies negative die_modifier', () => {
    const base: SpecialEntry[] = [{ type: 'damage', display_value: '1d{dice_size}', value: 8 }];
    const mods: AppliedModification[] = [
      {
        id: 1,
        modType: 'drawback',
        modification: { id: 10, code: 'lesser_damage', name: 'Lesser Damage' },
        special: [{ type: 'die_modifier', value: -1 }],
        customText: null,
      },
    ];

    const result = recalculateSpecialFromMods(base, mods);

    // d8 - 1 step = d6
    const damage = result.find((s) => s.type === 'damage');
    expect(damage?.value).toBe(6);
  });

  it('clamps die_modifier to array bounds', () => {
    const base: SpecialEntry[] = [{ type: 'damage', display_value: '1d{dice_size}', value: 12 }];
    const mods: AppliedModification[] = [
      {
        id: 1,
        modType: 'upgrade',
        modification: { id: 10, code: 'greater_damage', name: 'Greater Damage' },
        special: [{ type: 'die_modifier', value: 5 }],
        customText: null,
      },
    ];

    const result = recalculateSpecialFromMods(base, mods);

    // d12 + 5 steps clamps to d20 (max)
    const damage = result.find((s) => s.type === 'damage');
    expect(damage?.value).toBe(20);
  });

  it('adds narrative special from mod', () => {
    const base: SpecialEntry[] = [{ type: 'damage', display_value: '1d{dice_size}', value: 8 }];
    const mods: AppliedModification[] = [
      {
        id: 1,
        modType: 'upgrade',
        modification: { id: 10, code: 'sturdy', name: 'Sturdy' },
        special: [{ type: 'narrative', display_value: 'Ignores Complication damage' }],
        customText: null,
      },
    ];

    const result = recalculateSpecialFromMods(base, mods);

    expect(result).toContainEqual({
      type: 'narrative',
      display_value: 'Ignores Complication damage',
    });
  });

  it('applies roll_modifier from mod', () => {
    const base: SpecialEntry[] = [{ type: 'damage', display_value: '1d{dice_size}', value: 8 }];
    const mods: AppliedModification[] = [
      {
        id: 1,
        modType: 'upgrade',
        modification: { id: 10, code: 'amplified', name: 'Amplified' },
        special: [{ type: 'roll_modifier', display_value: 'Advantage' }],
        customText: null,
      },
    ];

    const result = recalculateSpecialFromMods(base, mods);

    expect(result).toContainEqual({ type: 'roll_modifier', display_value: 'Advantage' });
  });

  it('skips custom text modifications', () => {
    const base: SpecialEntry[] = [{ type: 'damage', display_value: '1d{dice_size}', value: 8 }];
    const mods: AppliedModification[] = [
      {
        id: 1,
        modType: 'drawback',
        modification: null,
        special: [],
        customText: 'GM cursed this item',
      },
    ];

    const result = recalculateSpecialFromMods(base, mods);

    expect(result).toEqual([]);
  });

  it('returns only entries that differ from base', () => {
    const base: SpecialEntry[] = [
      { type: 'damage', display_value: '1d{dice_size}', value: 8 },
      { type: 'range', display_value: 'Melee' },
    ];
    const mods: AppliedModification[] = [
      {
        id: 1,
        modType: 'upgrade',
        modification: { id: 10, code: 'greater_damage', name: 'Greater Damage' },
        special: [{ type: 'die_modifier', value: 1 }],
        customText: null,
      },
    ];

    const result = recalculateSpecialFromMods(base, mods);

    // Only damage should be in overrides (range unchanged)
    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe('damage');
  });
});

// =============================================================================
// getEffectiveSpecial
// =============================================================================

describe('getEffectiveSpecial', () => {
  it('merges overrides over classifier base', () => {
    const eq = createHeroEquipment(
      [{ type: 'damage', display_value: '1d{dice_size}', value: 8 }],
      [{ type: 'damage', display_value: '1d{dice_size}', value: 10 }]
    );

    const result = getEffectiveSpecial(eq);

    expect(result).toEqual([{ type: 'damage', display_value: '1d{dice_size}', value: 10 }]);
  });

  it('returns base when no overrides', () => {
    const eq = createHeroEquipment(
      [
        { type: 'damage', display_value: '1d{dice_size}', value: 8 },
        { type: 'range', display_value: 'Melee' },
      ],
      []
    );

    const result = getEffectiveSpecial(eq);

    expect(result).toHaveLength(2);
    expect(result.find((s) => s.type === 'damage')?.value).toBe(8);
  });
});
