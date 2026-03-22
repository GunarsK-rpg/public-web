import { describe, it, expect } from 'vitest';
import {
  getSpecialByType,
  getHeroBonus,
  getHeroMaxBonus,
  getConditionBonus,
  resolveSkillModifier,
  SPECIAL,
} from './specialUtils';
import type { SpecialEntry, HeroTalent, HeroEquipment, HeroCondition } from 'src/types';
import type { SingerForm } from 'src/types/singerForms';

// =============================================================================
// Test Fixtures
// =============================================================================

function createHeroTalent(special: SpecialEntry[], code = 'test'): HeroTalent {
  return {
    id: 1,
    heroId: 0,
    talent: { id: 1, code, name: 'Test Talent' },
    special,
    grantSelections: [],
  };
}

function createHeroEquipment(special: SpecialEntry[], isEquipped = true): HeroEquipment {
  return {
    id: 1,
    heroId: 0,
    equipment: { id: 1, code: 'test_eq', name: 'Test Equipment' },
    equipType: { id: 1, code: 'weapon', name: 'Weapon' },
    special,
    specialOverrides: [],
    charges: null,
    maxCharges: null,
    amount: 1,
    isEquipped,
    customName: null,
    notes: null,
    modifications: [],
  };
}

function createHeroCondition(code: string, special?: SpecialEntry[]): HeroCondition {
  return {
    id: 1,
    heroId: 0,
    condition: { id: 1, code, name: code },
    notes: null,
    special: special ?? null,
    sourceInjuryId: null,
  };
}

function createSingerForm(special: SpecialEntry[]): SingerForm {
  return {
    id: 1,
    code: 'warform',
    name: 'Warform',
    description: 'Test form',
    talent: null,
    special,
  };
}

// =============================================================================
// SPECIAL constants
// =============================================================================

describe('SPECIAL constants', () => {
  it('has attribute bonus constants', () => {
    expect(SPECIAL.ATTRIBUTE_STR).toBe('attribute_str');
    expect(SPECIAL.ATTRIBUTE_SPD).toBe('attribute_spd');
    expect(SPECIAL.ATTRIBUTE_INT).toBe('attribute_int');
    expect(SPECIAL.ATTRIBUTE_WIL).toBe('attribute_wil');
    expect(SPECIAL.ATTRIBUTE_AWA).toBe('attribute_awa');
    expect(SPECIAL.ATTRIBUTE_PRE).toBe('attribute_pre');
  });

  it('has derived stat bonus constants', () => {
    expect(SPECIAL.HEALTH_PER_LEVEL).toBe('health_per_level');
    expect(SPECIAL.DEFLECT).toBe('deflect');
    expect(SPECIAL.DEFENSE_PHYSICAL).toBe('defense_physical');
    expect(SPECIAL.DEFENSE_COGNITIVE).toBe('defense_cognitive');
    expect(SPECIAL.DEFENSE_SPIRITUAL).toBe('defense_spiritual');
    expect(SPECIAL.FOCUS).toBe('focus');
    expect(SPECIAL.FOCUS_PER_TIER).toBe('focus_per_tier');
    expect(SPECIAL.INVESTITURE_PER_TIER).toBe('investiture_per_tier');
    expect(SPECIAL.MOVEMENT).toBe('movement');
    expect(SPECIAL.CUMBERSOME).toBe('cumbersome');
  });

  it('has item property constants', () => {
    expect(SPECIAL.DAMAGE).toBe('damage');
    expect(SPECIAL.RANGE).toBe('range');
    expect(SPECIAL.SKILL).toBe('skill');
  });

  it('has flag constants', () => {
    expect(SPECIAL.SPECIALIST).toBe('specialist');
    expect(SPECIAL.PAIRED).toBe('paired');
    expect(SPECIAL.REWARD_ONLY).toBe('reward_only');
    expect(SPECIAL.PERMANENT).toBe('permanent');
  });
});

// =============================================================================
// resolveSkillModifier
// =============================================================================

describe('resolveSkillModifier', () => {
  it('prepends positive modifier to display value', () => {
    expect(resolveSkillModifier('Light Weaponry', 4)).toBe('+4 Light Weaponry');
  });

  it('prepends zero modifier', () => {
    expect(resolveSkillModifier('Heavy Weaponry', 0)).toBe('+0 Heavy Weaponry');
  });

  it('prepends negative modifier', () => {
    expect(resolveSkillModifier('Athletics', -1)).toBe('-1 Athletics');
  });
});

// =============================================================================
// getSpecialByType
// =============================================================================

describe('getSpecialByType', () => {
  it('finds entry by type', () => {
    const special: SpecialEntry[] = [
      { type: 'damage', display_value: '1d6' },
      { type: 'range', display_value: 'melee' },
    ];

    const result = getSpecialByType(special, 'damage');

    expect(result).toEqual({ type: 'damage', display_value: '1d6' });
  });

  it('returns undefined for missing type', () => {
    const special: SpecialEntry[] = [{ type: 'damage', display_value: '1d6' }];

    expect(getSpecialByType(special, 'deflect')).toBeUndefined();
  });

  it('returns first match when multiple entries of same type', () => {
    const special: SpecialEntry[] = [
      { type: 'deflect', value: 2 },
      { type: 'deflect', value: 3 },
    ];

    expect(getSpecialByType(special, 'deflect')?.value).toBe(2);
  });

  it('handles empty array', () => {
    expect(getSpecialByType([], 'damage')).toBeUndefined();
  });
});

// =============================================================================
// getHeroBonus
// =============================================================================

describe('getHeroBonus', () => {
  // ---------------------------------------------------------------------------
  // Talent bonuses
  // ---------------------------------------------------------------------------
  describe('talent bonuses', () => {
    it('sums numeric values from talent specials', () => {
      const talents = [createHeroTalent([{ type: 'defense_cognitive', value: 2 }], 'collected')];

      expect(getHeroBonus(talents, [], null, 'defense_cognitive')).toBe(2);
    });

    it('sums bonuses from multiple talents', () => {
      const talents = [
        createHeroTalent([{ type: 'defense_physical', value: 2 }], 'talent_a'),
        createHeroTalent([{ type: 'defense_physical', value: 1 }], 'talent_b'),
      ];

      expect(getHeroBonus(talents, [], null, 'defense_physical')).toBe(3);
    });

    it('ignores entries with only display_value (conditional bonuses)', () => {
      const talents = [
        createHeroTalent(
          [{ type: 'defense_physical', display_value: '+1 while in stance' }],
          'vinestance'
        ),
      ];

      expect(getHeroBonus(talents, [], null, 'defense_physical')).toBe(0);
    });

    it('uses value even when display_value also present', () => {
      const talents = [
        createHeroTalent(
          [{ type: 'defense_physical', value: 2, display_value: '+2 while wearing armor' }],
          'customary_garb'
        ),
      ];

      expect(getHeroBonus(talents, [], null, 'defense_physical')).toBe(2);
    });

    it('handles talents with empty special arrays', () => {
      const talents = [createHeroTalent([], 'no_bonus')];

      expect(getHeroBonus(talents, [], null, 'deflect')).toBe(0);
    });

    it('handles talents with undefined special', () => {
      const talent: HeroTalent = {
        id: 1,
        heroId: 0,
        talent: { id: 1, code: 'test', name: 'Test' },
        special: undefined as unknown as SpecialEntry[],
        grantSelections: [],
      };

      expect(getHeroBonus([talent], [], null, 'deflect')).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Equipment bonuses
  // ---------------------------------------------------------------------------
  describe('equipment bonuses', () => {
    it('sums bonuses from equipped items', () => {
      const equipment = [createHeroEquipment([{ type: 'deflect', value: 3 }], true)];

      expect(getHeroBonus([], equipment, null, 'deflect')).toBe(3);
    });

    it('ignores unequipped items', () => {
      const equipment = [createHeroEquipment([{ type: 'deflect', value: 3 }], false)];

      expect(getHeroBonus([], equipment, null, 'deflect')).toBe(0);
    });

    it('uses specialOverrides over base special', () => {
      const eq = createHeroEquipment([{ type: 'deflect', value: 2 }], true);
      eq.specialOverrides = [{ type: 'deflect', value: 5 }];

      expect(getHeroBonus([], [eq], null, 'deflect')).toBe(5);
    });

    it('falls back to base special when no override for type', () => {
      const eq = createHeroEquipment([{ type: 'deflect', value: 3 }], true);
      eq.specialOverrides = [{ type: 'damage', display_value: '1d{dice_size}', value: 10 }];

      expect(getHeroBonus([], [eq], null, 'deflect')).toBe(3);
    });

    it('sums from multiple equipped items', () => {
      const equipment = [
        createHeroEquipment([{ type: 'attribute_str', value: 2 }], true),
        { ...createHeroEquipment([{ type: 'attribute_str', value: 1 }], true), id: 2 },
      ];

      expect(getHeroBonus([], equipment, null, 'attribute_str')).toBe(3);
    });
  });

  // ---------------------------------------------------------------------------
  // Singer form bonuses
  // ---------------------------------------------------------------------------
  describe('singer form bonuses', () => {
    it('sums bonuses from active singer form', () => {
      const form = createSingerForm([
        { type: 'attribute_str', value: 1 },
        { type: 'deflect', value: 1 },
      ]);

      expect(getHeroBonus([], [], form, 'attribute_str')).toBe(1);
      expect(getHeroBonus([], [], form, 'deflect')).toBe(1);
    });

    it('returns 0 when no singer form', () => {
      expect(getHeroBonus([], [], null, 'attribute_str')).toBe(0);
    });

    it('handles singer form with undefined special', () => {
      const form = {
        ...createSingerForm([]),
        special: undefined as unknown as SpecialEntry[],
      };

      expect(getHeroBonus([], [], form, 'attribute_str')).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Combined sources
  // ---------------------------------------------------------------------------
  describe('combined sources', () => {
    it('sums bonuses from all three sources', () => {
      const talents = [createHeroTalent([{ type: 'deflect', value: 2 }])];
      const equipment = [createHeroEquipment([{ type: 'deflect', value: 3 }])];
      const form = createSingerForm([{ type: 'deflect', value: 1 }]);

      expect(getHeroBonus(talents, equipment, form, 'deflect')).toBe(6);
    });

    it('returns 0 when no sources match the type', () => {
      const talents = [createHeroTalent([{ type: 'movement', value: 10 }])];
      const equipment = [createHeroEquipment([{ type: 'damage', display_value: '1d6' }])];
      const form = createSingerForm([{ type: 'attribute_str', value: 1 }]);

      expect(getHeroBonus(talents, equipment, form, 'defense_physical')).toBe(0);
    });

    it('returns 0 when all sources are empty', () => {
      expect(getHeroBonus([], [], null, 'deflect')).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Real game data patterns
  // ---------------------------------------------------------------------------
  describe('real game data patterns', () => {
    it('handles hardy talent (health_per_level)', () => {
      const talents = [createHeroTalent([{ type: 'health_per_level', value: 1 }], 'hardy')];

      expect(getHeroBonus(talents, [], null, 'health_per_level')).toBe(1);
    });

    it('handles collected talent (multiple defense bonuses)', () => {
      const talents = [
        createHeroTalent(
          [
            { type: 'defense_cognitive', value: 2 },
            { type: 'defense_spiritual', value: 2 },
          ],
          'collected'
        ),
      ];

      expect(getHeroBonus(talents, [], null, 'defense_cognitive')).toBe(2);
      expect(getHeroBonus(talents, [], null, 'defense_spiritual')).toBe(2);
      expect(getHeroBonus(talents, [], null, 'defense_physical')).toBe(0);
    });

    it('handles invested talent (investiture_per_tier)', () => {
      const talents = [
        createHeroTalent([{ type: 'investiture_per_tier', value: 1 }], 'invested_windrunner'),
      ];

      expect(getHeroBonus(talents, [], null, 'investiture_per_tier')).toBe(1);
    });

    it('handles warform singer form (attribute + deflect)', () => {
      const form = createSingerForm([
        { type: 'attribute_str', value: 1 },
        { type: 'deflect', value: 1 },
      ]);

      expect(getHeroBonus([], [], form, 'attribute_str')).toBe(1);
      expect(getHeroBonus([], [], form, 'deflect')).toBe(1);
      expect(getHeroBonus([], [], form, 'attribute_spd')).toBe(0);
    });

    it('handles chain armor (deflect + cumbersome)', () => {
      const equipment = [
        createHeroEquipment([
          { type: 'deflect', value: 2 },
          { type: 'cumbersome', value: 3 },
        ]),
      ];

      expect(getHeroBonus([], equipment, null, 'deflect')).toBe(2);
      expect(getHeroBonus([], equipment, null, 'cumbersome')).toBe(3);
    });
  });
});

// =============================================================================
// getHeroMaxBonus
// =============================================================================

describe('getHeroMaxBonus', () => {
  it('returns highest value across all sources', () => {
    const talents = [createHeroTalent([{ type: 'deflect', value: 2 }])];
    const equipment = [createHeroEquipment([{ type: 'deflect', value: 3 }])];
    const form = createSingerForm([{ type: 'deflect', value: 1 }]);

    expect(getHeroMaxBonus(talents, equipment, form, 'deflect')).toBe(3);
  });

  it('returns equipment value when highest', () => {
    const equipment = [createHeroEquipment([{ type: 'deflect', value: 4 }])];
    const form = createSingerForm([{ type: 'deflect', value: 1 }]);

    expect(getHeroMaxBonus([], equipment, form, 'deflect')).toBe(4);
  });

  it('returns singer form value when highest', () => {
    const equipment = [createHeroEquipment([{ type: 'deflect', value: 1 }])];
    const form = createSingerForm([{ type: 'deflect', value: 2 }]);

    expect(getHeroMaxBonus([], equipment, form, 'deflect')).toBe(2);
  });

  it('returns 0 when no sources match', () => {
    expect(getHeroMaxBonus([], [], null, 'deflect')).toBe(0);
  });

  it('ignores unequipped items', () => {
    const equipment = [createHeroEquipment([{ type: 'deflect', value: 5 }], false)];

    expect(getHeroMaxBonus([], equipment, null, 'deflect')).toBe(0);
  });

  it('uses specialOverrides over base special', () => {
    const eq = createHeroEquipment([{ type: 'deflect', value: 2 }], true);
    eq.specialOverrides = [{ type: 'deflect', value: 5 }];

    expect(getHeroMaxBonus([], [eq], null, 'deflect')).toBe(5);
  });

  it('ignores entries with only display_value', () => {
    const talents = [
      createHeroTalent([{ type: 'deflect', display_value: '+1 while in stance' }], 'stonestance'),
    ];

    expect(getHeroMaxBonus(talents, [], null, 'deflect')).toBe(0);
  });

  it('handles singer form with undefined special', () => {
    const form = {
      ...createSingerForm([]),
      special: undefined as unknown as SpecialEntry[],
    };

    expect(getHeroMaxBonus([], [], form, 'deflect')).toBe(0);
  });
});

// =============================================================================
// getConditionBonus
// =============================================================================

describe('getConditionBonus', () => {
  it('returns 0 for empty conditions array', () => {
    expect(getConditionBonus([], 'attribute_str')).toBe(0);
  });

  it('sums matching entries from condition special arrays', () => {
    const conditions = [createHeroCondition('enhanced', [{ type: 'attribute_str', value: 2 }])];
    expect(getConditionBonus(conditions, 'attribute_str')).toBe(2);
  });

  it('sums across multiple condition rows (stacked Enhanced)', () => {
    const conditions = [
      createHeroCondition('enhanced', [{ type: 'attribute_str', value: 2 }]),
      { ...createHeroCondition('enhanced', [{ type: 'attribute_spd', value: 1 }]), id: 2 },
    ];
    expect(getConditionBonus(conditions, 'attribute_str')).toBe(2);
    expect(getConditionBonus(conditions, 'attribute_spd')).toBe(1);
  });

  it('ignores conditions with null special', () => {
    const conditions = [createHeroCondition('slowed')];
    expect(getConditionBonus(conditions, 'attribute_str')).toBe(0);
  });

  it('ignores entries without numeric value', () => {
    const conditions = [
      createHeroCondition('afflicted', [{ type: 'afflicted_damage', display_value: '1d4 vital' }]),
    ];
    expect(getConditionBonus(conditions, 'afflicted_damage')).toBe(0);
  });

  it('returns non-matching type as 0', () => {
    const conditions = [createHeroCondition('enhanced', [{ type: 'attribute_str', value: 2 }])];
    expect(getConditionBonus(conditions, 'attribute_spd')).toBe(0);
  });
});
