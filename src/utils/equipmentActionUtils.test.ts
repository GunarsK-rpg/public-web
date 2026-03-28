import { describe, it, expect } from 'vitest';
import type { EquipmentActionInstance, Action } from 'src/types/actions';
import type { HeroEquipment } from 'src/types/equipments';
import type { ClassifierRef, SpecialEntry } from 'src/types/shared';
import {
  getInstanceDice,
  getInstanceActionSpecial,
  getModRollModifiers,
  getInstanceWeaponLabel,
  createCustomEquipmentAction,
} from './equipmentActionUtils';

const ref = (code: string): ClassifierRef => ({ id: 1, code, name: code });

function makeAction(overrides?: Partial<Action>): Action {
  return {
    id: 1,
    code: 'strike',
    name: 'Strike',
    actionType: ref('attack'),
    activationType: ref('fast'),
    damageType: null,
    special: [],
    dice: null,
    focusCost: 0,
    investitureCost: 0,
    ...overrides,
  };
}

function makeHeroEquipment(overrides?: Partial<HeroEquipment>): HeroEquipment {
  return {
    id: 10,
    heroId: 1,
    equipment: ref('sword'),
    equipType: ref('weapon'),
    amount: 1,
    isEquipped: true,
    notes: null,
    customName: null,
    charges: null,
    maxCharges: null,
    special: [],
    specialOverrides: [],
    modifications: [],
    ...overrides,
  };
}

function makeInstance(overrides?: Partial<EquipmentActionInstance>): EquipmentActionInstance {
  return {
    action: makeAction(),
    heroEquipment: makeHeroEquipment(),
    effectiveSpecial: [],
    ...overrides,
  };
}

// ============================================================
// getInstanceDice
// ============================================================

describe('getInstanceDice', () => {
  it('returns null when no damage entry and no action dice', () => {
    expect(getInstanceDice(makeInstance())).toBeNull();
  });

  it('falls back to action dice when no damage entry', () => {
    const instance = makeInstance({ action: makeAction({ dice: '2d6' }) });
    expect(getInstanceDice(instance)).toBe('2d6');
  });

  it('uses damage entry display_value', () => {
    const instance = makeInstance({
      effectiveSpecial: [{ type: 'damage', display_value: '3d8' }],
    });
    expect(getInstanceDice(instance)).toBe('3d8');
  });

  it('substitutes dice_size placeholder with value', () => {
    const instance = makeInstance({
      effectiveSpecial: [{ type: 'damage', display_value: '2d{dice_size}', value: 10 }],
    });
    expect(getInstanceDice(instance)).toBe('2d10');
  });
});

// ============================================================
// getInstanceActionSpecial
// ============================================================

describe('getInstanceActionSpecial', () => {
  it('returns empty array when no special entries', () => {
    expect(getInstanceActionSpecial(makeInstance())).toEqual([]);
  });

  it('returns action special when no equipment overrides', () => {
    const actionSpecial: SpecialEntry[] = [{ type: 'range', display_value: '30 ft', value: 30 }];
    const instance = makeInstance({ action: makeAction({ special: actionSpecial }) });

    const result = getInstanceActionSpecial(instance);
    expect(result).toHaveLength(1);
    expect(result[0]!.display_value).toBe('30 ft');
  });

  it('equipment entries override action entries of same type', () => {
    const actionSpecial: SpecialEntry[] = [{ type: 'range', display_value: '30 ft', value: 30 }];
    const equipSpecial: SpecialEntry[] = [{ type: 'range', display_value: '60 ft', value: 60 }];

    const instance = makeInstance({
      action: makeAction({ special: actionSpecial }),
      effectiveSpecial: equipSpecial,
    });

    const result = getInstanceActionSpecial(instance);
    expect(result).toHaveLength(1);
    expect(result[0]!.display_value).toBe('60 ft');
  });

  it('merges entries from both sources', () => {
    const actionSpecial: SpecialEntry[] = [{ type: 'range', display_value: '30 ft', value: 30 }];
    const equipSpecial: SpecialEntry[] = [{ type: 'damage', display_value: '2d6' }];

    const instance = makeInstance({
      action: makeAction({ special: actionSpecial }),
      effectiveSpecial: equipSpecial,
    });

    const result = getInstanceActionSpecial(instance);
    expect(result).toHaveLength(2);
    const types = result.map((r) => r.type);
    expect(types).toContain('range');
    expect(types).toContain('damage');
  });
});

// ============================================================
// getModRollModifiers
// ============================================================

describe('getModRollModifiers', () => {
  it('returns empty array when no modifications', () => {
    expect(getModRollModifiers(makeInstance())).toEqual([]);
  });

  it('collects roll_modifier entries from modifications', () => {
    const instance = makeInstance({
      heroEquipment: makeHeroEquipment({
        modifications: [
          {
            id: 1,
            modType: 'upgrade',
            tier: 'basic',
            modification: ref('keen'),
            customText: null,
            special: [
              { type: 'roll_modifier', display_value: 'Advantage' },
              { type: 'damage', display_value: '+1', value: 1 },
            ],
          },
        ],
      }),
    });

    const result = getModRollModifiers(instance);
    expect(result).toHaveLength(1);
    expect(result[0]!.display_value).toBe('Advantage');
  });

  it('collects from multiple modifications', () => {
    const instance = makeInstance({
      heroEquipment: makeHeroEquipment({
        modifications: [
          {
            id: 1,
            modType: 'upgrade',
            tier: 'basic',
            modification: ref('keen'),
            customText: null,
            special: [{ type: 'roll_modifier', display_value: 'Advantage' }],
          },
          {
            id: 2,
            modType: 'drawback',
            tier: null,
            modification: ref('heavy'),
            customText: null,
            special: [{ type: 'roll_modifier', display_value: 'Disadvantage' }],
          },
        ],
      }),
    });

    const result = getModRollModifiers(instance);
    expect(result).toHaveLength(2);
    expect(result[0]!.type).toBe('roll_modifier');
    expect(result[0]!.display_value).toBe('Advantage');
    expect(result[1]!.type).toBe('roll_modifier');
    expect(result[1]!.display_value).toBe('Disadvantage');
  });
});

// ============================================================
// getInstanceWeaponLabel
// ============================================================

describe('getInstanceWeaponLabel', () => {
  it('returns customName when set', () => {
    const instance = makeInstance({
      heroEquipment: makeHeroEquipment({ customName: 'Stormbringer' }),
    });
    expect(getInstanceWeaponLabel(instance)).toBe('Stormbringer');
  });

  it('falls back to equipment classifier name', () => {
    expect(getInstanceWeaponLabel(makeInstance())).toBe('sword');
  });

  it('returns null when no customName and no equipment', () => {
    const instance = makeInstance({
      heroEquipment: makeHeroEquipment({ customName: null, equipment: null }),
    });
    expect(getInstanceWeaponLabel(instance)).toBeNull();
  });
});

// ============================================================
// createCustomEquipmentAction
// ============================================================

describe('createCustomEquipmentAction', () => {
  it('creates action with hero equipment ID', () => {
    const equip = makeHeroEquipment({ id: 42, customName: 'Mystic Blade', notes: 'Glows blue' });
    const result = createCustomEquipmentAction(equip, ref('attack'), ref('fast'));

    expect(result.id).toBe(42);
    expect(result.code).toBe('custom-42');
    expect(result.name).toBe('Mystic Blade');
    expect(result.description).toBe('Glows blue');
    expect(result.actionType).toEqual(ref('attack'));
    expect(result.activationType).toEqual(ref('fast'));
    expect(result.special).toEqual([]);
    expect(result.dice).toBeNull();
    expect(result.focusCost).toBe(0);
    expect(result.investitureCost).toBe(0);
  });

  it('defaults name to Attack when no customName', () => {
    const equip = makeHeroEquipment({ customName: null, notes: null });
    const actionRef = ref('attack');
    const activationRef = ref('fast');
    const result = createCustomEquipmentAction(equip, actionRef, activationRef);

    expect(result.name).toBe('Attack');
    expect(result.description).toBe('');
    expect(result.actionType).toEqual(actionRef);
    expect(result.activationType).toEqual(activationRef);
    expect(result.focusCost).toBe(0);
    expect(result.investitureCost).toBe(0);
  });
});
