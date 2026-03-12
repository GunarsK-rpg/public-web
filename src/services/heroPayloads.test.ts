import { describe, it, expect } from 'vitest';
import {
  buildHeroCorePayload,
  buildAttributePayload,
  buildSkillPayload,
  buildExpertisePayload,
  buildTalentPayload,
  buildCulturePayload,
  buildEquipmentPayload,
  buildGoalPayload,
  buildConnectionPayload,
  buildCompanionPayload,
} from './heroPayloads';
import type { HeroSheet } from 'src/types/heroes';
import type { HeroAttribute } from 'src/types/attributes';
import type { HeroSkill } from 'src/types/skills';
import type { HeroExpertise } from 'src/types/expertises';
import type { HeroTalent } from 'src/types/talents';
import type { HeroCulture } from 'src/types/culture';
import type { HeroEquipment } from 'src/types/equipments';
import type { HeroGoal, HeroConnection } from 'src/types/goals';
import type { HeroCompanion } from 'src/types/companions';

function makeHero(overrides: Partial<HeroSheet> = {}): HeroSheet {
  return {
    id: 0,
    userId: 0,
    user: { id: 0, username: '' },
    campaignId: null,
    campaign: { id: 1, code: 'test-campaign', name: 'Test Campaign' },
    ancestry: { id: 2, code: 'human', name: 'Human' },
    startingKit: null,
    activeSingerForm: null,
    radiantOrder: null,
    radiantIdeal: 0,
    name: 'Kaladin',
    level: 1,
    currentHealth: 10,
    currentFocus: 5,
    currentInvestiture: 0,
    currency: 50,
    attributes: [],
    defenses: [],
    derivedStats: [],
    skills: [],
    talents: [],
    expertises: [],
    equipment: [],
    conditions: [],
    injuries: [],
    goals: [],
    connections: [],
    companions: [],
    cultures: [],
    favoriteActions: [],
    ...overrides,
  };
}

// ========================================
// buildHeroCorePayload
// ========================================
describe('buildHeroCorePayload', () => {
  it('maps required fields', () => {
    const hero = makeHero();
    const payload = buildHeroCorePayload(hero);

    expect(payload.name).toBe('Kaladin');
    expect(payload.level).toBe(1);
    expect(payload.radiantIdeal).toBe(0);
    expect(payload.currentHealth).toBe(10);
    expect(payload.currentFocus).toBe(5);
    expect(payload.currentInvestiture).toBe(0);
    expect(payload.currency).toBe(50);
  });

  it('maps ClassifierRef to ClassifierInput for campaign', () => {
    const hero = makeHero();
    const payload = buildHeroCorePayload(hero);

    expect(payload.campaign).toEqual({ code: 'test-campaign' });
  });

  it('maps ClassifierRef to ClassifierInput for ancestry', () => {
    const hero = makeHero();
    const payload = buildHeroCorePayload(hero);

    expect(payload.ancestry).toEqual({ code: 'human' });
  });

  it('omits id for new hero (id = 0)', () => {
    const hero = makeHero({ id: 0 });
    const payload = buildHeroCorePayload(hero);

    expect(payload.id).toBeUndefined();
  });

  it('includes id for existing hero (id > 0)', () => {
    const hero = makeHero({ id: 42 });
    const payload = buildHeroCorePayload(hero);

    expect(payload.id).toBe(42);
  });

  it('maps optional ClassifierRef fields to null when absent', () => {
    const hero = makeHero({
      startingKit: null,
      activeSingerForm: null,
      radiantOrder: null,
    });
    const payload = buildHeroCorePayload(hero);

    expect(payload.startingKit).toBeNull();
    expect(payload.activeSingerForm).toBeNull();
    expect(payload.radiantOrder).toBeNull();
  });

  it('maps optional ClassifierRef fields to ClassifierInput when present', () => {
    const hero = makeHero({
      startingKit: { id: 3, code: 'warrior-kit', name: 'Warrior Kit' },
      activeSingerForm: { id: 4, code: 'dullform', name: 'Dullform' },
      radiantOrder: { id: 5, code: 'windrunner', name: 'Windrunner' },
    });
    const payload = buildHeroCorePayload(hero);

    expect(payload.startingKit).toEqual({ code: 'warrior-kit' });
    expect(payload.activeSingerForm).toEqual({ code: 'dullform' });
    expect(payload.radiantOrder).toEqual({ code: 'windrunner' });
  });

  it('normalizes undefined text fields to null', () => {
    const hero = makeHero();
    // HeroSheet from createEmptyHero has no appearance/biography/notes
    const payload = buildHeroCorePayload(hero);

    expect(payload.appearance).toBeNull();
    expect(payload.biography).toBeNull();
    expect(payload.notes).toBeNull();
  });
});

// ========================================
// buildAttributePayload
// ========================================
describe('buildAttributePayload', () => {
  it('maps attribute to ClassifierInput', () => {
    const attr: HeroAttribute = {
      id: 10,
      heroId: 1,
      attribute: { id: 3, code: 'str', name: 'Strength' },
      value: 4,
    };
    const payload = buildAttributePayload(1, attr);

    expect(payload).toEqual({
      heroId: 1,
      attribute: { code: 'str' },
      value: 4,
    });
  });

  it('does not include id (code-based upsert)', () => {
    const attr: HeroAttribute = {
      id: 10,
      heroId: 1,
      attribute: { id: 3, code: 'str', name: 'Strength' },
      value: 2,
    };
    const payload = buildAttributePayload(1, attr);

    expect(payload.id).toBeUndefined();
  });
});

// ========================================
// buildSkillPayload
// ========================================
describe('buildSkillPayload', () => {
  it('maps skill to ClassifierInput', () => {
    const skill: HeroSkill = {
      id: 20,
      heroId: 1,
      skill: { id: 5, code: 'athletics', name: 'Athletics' },
      rank: 3,
      modifier: 1,
    };
    const payload = buildSkillPayload(1, skill);

    expect(payload).toEqual({
      heroId: 1,
      skill: { code: 'athletics' },
      rank: 3,
      modifier: 1,
    });
  });
});

// ========================================
// buildExpertisePayload
// ========================================
describe('buildExpertisePayload', () => {
  it('maps classifier expertise to ClassifierInput', () => {
    const exp: HeroExpertise = {
      id: 30,
      heroId: 1,
      expertise: { id: 7, code: 'climbing', name: 'Climbing' },
      expertiseType: { id: 1, code: 'utility', name: 'Utility' },
      notes: 'Expert climber',
      source: { sourceType: 'culture', sourceId: 1 },
    };
    const payload = buildExpertisePayload(1, exp);

    expect(payload).toEqual({
      heroId: 1,
      expertise: { code: 'climbing' },
      notes: 'Expert climber',
      source: { sourceType: 'culture', sourceId: 1 },
    });
  });

  it('normalizes null notes and source', () => {
    const exp: HeroExpertise = {
      id: 30,
      heroId: 1,
      expertise: { id: 7, code: 'climbing', name: 'Climbing' },
      expertiseType: { id: 1, code: 'utility', name: 'Utility' },
    };
    const payload = buildExpertisePayload(1, exp);

    expect(payload.notes).toBeNull();
    expect(payload.source).toBeNull();
  });

  it('maps custom expertise to expertiseType + customName', () => {
    const exp: HeroExpertise = {
      id: 31,
      heroId: 1,
      expertise: null,
      expertiseType: { id: 3, code: 'cultural', name: 'Cultural' },
      customName: 'Unkalaki Politics',
      source: { sourceType: 'intellect' },
    };
    const payload = buildExpertisePayload(1, exp);

    expect(payload).toEqual({
      heroId: 1,
      expertiseType: { code: 'cultural' },
      customName: 'Unkalaki Politics',
      notes: null,
      source: { sourceType: 'intellect' },
    });
  });
});

// ========================================
// buildTalentPayload
// ========================================
describe('buildTalentPayload', () => {
  it('maps talent to ClassifierInput', () => {
    const talent: HeroTalent = {
      id: 40,
      heroId: 1,
      talent: { id: 9, code: 'shield-mastery', name: 'Shield Mastery' },
      notes: 'Favorite ability',
      special: [],
      grantSelections: [],
    };
    const payload = buildTalentPayload(1, talent);

    expect(payload).toEqual({
      heroId: 1,
      talent: { code: 'shield-mastery' },
      notes: 'Favorite ability',
      special: [],
    });
  });

  it('includes grant selections in special field', () => {
    const talent: HeroTalent = {
      id: 41,
      heroId: 1,
      talent: { id: 10, code: 'erudition', name: 'Erudition' },
      special: [{ type: 'skill_modifier_choice', codes: ['int', 'wil'], value: 2 }],
      grantSelections: [{ type: 'skill_modifier_choice', codes: ['diplomacy', 'investigation'] }],
    };
    const payload = buildTalentPayload(1, talent);

    expect(payload.special).toEqual([
      { type: 'skill_modifier_choice', codes: ['diplomacy', 'investigation'] },
    ]);
  });
});

// ========================================
// buildCulturePayload
// ========================================
describe('buildCulturePayload', () => {
  it('maps culture to ClassifierInput', () => {
    const culture: HeroCulture = {
      id: 50,
      heroId: 1,
      culture: { id: 11, code: 'alethi', name: 'Alethi' },
    };
    const payload = buildCulturePayload(1, culture);

    expect(payload).toEqual({
      heroId: 1,
      culture: { code: 'alethi' },
    });
  });
});

// ========================================
// buildEquipmentPayload (ID-based upsert)
// ========================================
describe('buildEquipmentPayload', () => {
  it('includes id for real DB items (id > 0)', () => {
    const equip: HeroEquipment = {
      id: 60,
      heroId: 1,
      equipment: { id: 13, code: 'longsword', name: 'Longsword' },
      equipType: { id: 1, code: 'weapon', name: 'Weapon' },
      amount: 1,
      isEquipped: true,
      notes: null,
      customName: 'Blade of Honor',
      special: [],
      specialOverrides: [],
      charges: null,
      maxCharges: null,
      modifications: [],
    };
    const payload = buildEquipmentPayload(1, equip);

    expect(payload.id).toBe(60);
    expect(payload.equipment).toEqual({ code: 'longsword' });
    expect(payload.customName).toBe('Blade of Honor');
  });

  it('omits id for temp items (id < 0)', () => {
    const equip: HeroEquipment = {
      id: -1,
      heroId: 1,
      equipment: { id: 13, code: 'longsword', name: 'Longsword' },
      equipType: { id: 1, code: 'weapon', name: 'Weapon' },
      amount: 1,
      isEquipped: false,
      special: [],
      specialOverrides: [],
      charges: null,
      maxCharges: null,
      modifications: [],
    };
    const payload = buildEquipmentPayload(1, equip);

    expect(payload.id).toBeUndefined();
  });

  it('handles custom equipment with null equipment ref', () => {
    const equip: HeroEquipment = {
      id: 70,
      heroId: 1,
      equipment: null,
      equipType: { id: 2, code: 'gear', name: 'Gear' },
      amount: 1,
      isEquipped: false,
      notes: 'Hand-crafted',
      customName: 'Mystery Gadget',
      special: [],
      specialOverrides: [],
      charges: null,
      maxCharges: null,
      modifications: [],
    };
    const payload = buildEquipmentPayload(1, equip);

    expect(payload.id).toBe(70);
    expect(payload.equipment).toBeNull();
    expect(payload.customName).toBe('Mystery Gadget');
    expect(payload.notes).toBe('Hand-crafted');
  });

  it('includes specialOverrides when non-empty', () => {
    const overrides = [{ type: 'damage', value: 8, display_value: '{dice_size}' }];
    const equip: HeroEquipment = {
      id: 80,
      heroId: 1,
      equipment: { id: 13, code: 'longsword', name: 'Longsword' },
      equipType: { id: 1, code: 'weapon', name: 'Weapon' },
      amount: 1,
      isEquipped: true,
      notes: null,
      customName: null,
      special: [{ type: 'damage', value: 6, display_value: '{dice_size}' }],
      specialOverrides: overrides,
      charges: null,
      maxCharges: null,
      modifications: [],
    };
    const payload = buildEquipmentPayload(1, equip);

    expect(payload.specialOverrides).toEqual(overrides);
  });

  it('omits specialOverrides when empty', () => {
    const equip: HeroEquipment = {
      id: 60,
      heroId: 1,
      equipment: { id: 13, code: 'longsword', name: 'Longsword' },
      equipType: { id: 1, code: 'weapon', name: 'Weapon' },
      amount: 1,
      isEquipped: true,
      notes: null,
      customName: null,
      special: [],
      specialOverrides: [],
      charges: null,
      maxCharges: null,
      modifications: [],
    };
    const payload = buildEquipmentPayload(1, equip);

    expect(payload.specialOverrides).toBeUndefined();
  });
});

// ========================================
// buildGoalPayload (ID-based upsert)
// ========================================
describe('buildGoalPayload', () => {
  it('includes id for real DB items', () => {
    const goal: HeroGoal = {
      id: 70,
      heroId: 1,
      status: { id: 1, code: 'active', name: 'Active' },
      name: 'Protect Dalinar',
      description: 'Guard the king',
      notes: null,
      value: 3,
    };
    const payload = buildGoalPayload(1, goal);

    expect(payload.id).toBe(70);
    expect(payload.status).toEqual({ code: 'active' });
    expect(payload.name).toBe('Protect Dalinar');
    expect(payload.value).toBe(3);
  });

  it('omits id for temp items', () => {
    const goal: HeroGoal = {
      id: -2,
      heroId: 1,
      status: { id: 1, code: 'active', name: 'Active' },
      name: 'New Goal',
      value: 1,
    };
    const payload = buildGoalPayload(1, goal);

    expect(payload.id).toBeUndefined();
  });
});

// ========================================
// buildConnectionPayload (ID-based upsert)
// ========================================
describe('buildConnectionPayload', () => {
  it('includes id for real DB items', () => {
    const conn: HeroConnection = {
      id: 80,
      heroId: 1,
      connectionType: { id: 2, code: 'ally', name: 'Ally' },
      description: 'Bridge Four',
      notes: null,
    };
    const payload = buildConnectionPayload(1, conn);

    expect(payload.id).toBe(80);
    expect(payload.connectionType).toEqual({ code: 'ally' });
    expect(payload.description).toBe('Bridge Four');
  });

  it('omits id for temp items', () => {
    const conn: HeroConnection = {
      id: -3,
      heroId: 1,
      connectionType: { id: 2, code: 'ally', name: 'Ally' },
    };
    const payload = buildConnectionPayload(1, conn);

    expect(payload.id).toBeUndefined();
  });
});

// ========================================
// buildCompanionPayload (ID-based upsert)
// ========================================
describe('buildCompanionPayload', () => {
  it('includes id for real DB items', () => {
    const comp: HeroCompanion = {
      id: 90,
      heroId: 1,
      companionType: { id: 3, code: 'spren', name: 'Spren' },
      description: 'Syl',
      notes: 'Honorspren',
    };
    const payload = buildCompanionPayload(1, comp);

    expect(payload.id).toBe(90);
    expect(payload.companionType).toEqual({ code: 'spren' });
    expect(payload.description).toBe('Syl');
  });

  it('omits id for temp items', () => {
    const comp: HeroCompanion = {
      id: -4,
      heroId: 1,
      companionType: { id: 3, code: 'spren', name: 'Spren' },
    };
    const payload = buildCompanionPayload(1, comp);

    expect(payload.id).toBeUndefined();
  });
});
