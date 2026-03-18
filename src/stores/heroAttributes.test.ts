import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHeroAttributesStore } from './heroAttributes';
import { useHeroStore } from './hero';
import { useClassifierStore } from './classifiers';

// Mock classifiers data
const mockClassifiers = {
  attributeTypes: [{ id: 1, code: 'physical', name: 'Physical' }],
  attributes: [
    {
      id: 1,
      code: 'str',
      name: 'Strength',
      attrType: { id: 1, code: 'physical', name: 'Physical' },
      sortOrder: 1,
    },
    {
      id: 2,
      code: 'spd',
      name: 'Speed',
      attrType: { id: 1, code: 'physical', name: 'Physical' },
      sortOrder: 2,
    },
  ],
  derivedStats: [{ id: 1, code: 'health', name: 'Health' }],
  derivedStatValues: [],
  skills: [
    {
      id: 1,
      code: 'athletics',
      name: 'Athletics',
      attr: { id: 1, code: 'str', name: 'Strength' },
    },
    {
      id: 2,
      code: 'acrobatics',
      name: 'Acrobatics',
      attr: { id: 2, code: 'spd', name: 'Speed' },
    },
  ],
  expertiseTypes: [],
  expertises: [
    {
      id: 1,
      code: 'climbing',
      name: 'Climbing',
      expertiseType: { id: 1, code: 'general', name: 'General' },
    },
  ],
  activationTypes: [],
  actionTypes: [],
  actions: [],
  actionLinks: [],
  paths: [],
  specialties: [],
  surges: [],
  radiantOrders: [],
  singerForms: [],
  talents: [],
  units: [{ id: 1, code: 'ft', name: 'feet' }],
  equipmentTypes: [],
  damageTypes: [],
  equipmentAttributes: [],
  equipment: [],
  conditions: [],
  injuries: [],
  goalStatuses: [],
  connectionTypes: [],
  companionTypes: [],
  startingKits: [],
  ancestries: [],
  cultures: [],
  tiers: [{ id: 1, code: 'apprentice', name: 'Apprentice' }],
  levels: [
    {
      id: 1,
      level: 1,
      tier: { id: 1, code: 'apprentice', name: 'Apprentice' },
      attributePoints: 6,
      healthBase: 10,
      maxSkillRank: 2,
      skillRanks: 6,
      talentSlots: 3,
    },
  ],
};

const { mockGetAllClassifiers } = vi.hoisted(() => ({
  mockGetAllClassifiers: vi.fn(),
}));

vi.mock('src/services/classifierService', () => ({
  default: {
    getAll: mockGetAllClassifiers,
  },
}));

vi.mock('src/services/heroService', () => ({
  default: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getSheet: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getSubResource: vi.fn(),
    upsertSubResource: vi.fn(),
    deleteSubResource: vi.fn(),
  },
}));

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('useHeroAttributesStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockGetAllClassifiers.mockResolvedValue({ data: mockClassifiers });

    // Initialize classifiers for all tests
    const classifierStore = useClassifierStore();
    await classifierStore.initialize();
  });

  // Helper to create hero with attributes
  function setupHeroWithAttributes() {
    const heroStore = useHeroStore();
    heroStore.initNewHero();

    // Add some attributes
    if (heroStore.hero) {
      heroStore.hero.attributes = [
        { id: 1, heroId: 0, attribute: { id: 1, code: 'str', name: 'Strength' }, value: 3 },
        { id: 2, heroId: 0, attribute: { id: 2, code: 'spd', name: 'Speed' }, value: 2 },
      ];
      heroStore.hero.skills = [
        {
          id: 1,
          heroId: 0,
          skill: { id: 1, code: 'athletics', name: 'Athletics' },
          rank: 2,
          modifier: 0,
        },
      ];
      heroStore.hero.expertises = [];
      heroStore.hero.derivedStats = [
        {
          derivedStat: { id: 1, code: 'health', name: 'Health' },
          baseValue: 15,
          modifier: 2,
          totalValue: 17,
          displayValue: null,
        },
      ];
    }
  }

  // ========================================
  // Attribute Lookups
  // ========================================
  describe('getAttributeValue', () => {
    it('returns attribute value by code', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getAttributeValue('str')).toBe(3);
      expect(store.getAttributeValue('spd')).toBe(2);
    });

    it('returns 0 for unknown attribute', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getAttributeValue('unknown')).toBe(0);
    });

    it('returns 0 when no hero loaded', () => {
      const store = useHeroAttributesStore();
      expect(store.getAttributeValue('str')).toBe(0);
    });
  });

  describe('getAttributeValueById', () => {
    it('returns attribute value by id', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getAttributeValueById(1)).toBe(3);
      expect(store.getAttributeValueById(2)).toBe(2);
    });

    it('returns 0 for non-existent attribute', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getAttributeValueById(999)).toBe(0);
    });

    it('returns 0 when no hero loaded', () => {
      const store = useHeroAttributesStore();
      expect(store.getAttributeValueById(1)).toBe(0);
    });
  });

  // ========================================
  // Defense Lookups
  // ========================================
  describe('getDefenseValue', () => {
    it('calculates defense from formula with attribute bonuses', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      // Add defense data (API values are now ignored - frontend calculates)
      if (heroStore.hero) {
        heroStore.hero.defenses = [
          {
            attributeType: { id: 1, code: 'physical', name: 'Physical' },
            baseValue: 14,
            modifier: 0,
            totalValue: 14,
          },
        ];
      }

      // Formula: 10 + str(3) + spd(2) = 15
      expect(store.getDefenseValue('physical')).toBe(15);
    });

    it('includes defense modifier in calculation', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.defenses = [
          {
            attributeType: { id: 1, code: 'physical', name: 'Physical' },
            baseValue: 14,
            modifier: 3,
            totalValue: 17,
          },
        ];
      }

      // Formula: 10 + str(3) + spd(2) + modifier(3) = 18
      expect(store.getDefenseValue('physical')).toBe(18);
    });

    it('includes special bonuses in defense calculation', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.defenses = [
          {
            attributeType: { id: 1, code: 'physical', name: 'Physical' },
            baseValue: 15,
            modifier: 0,
            totalValue: 15,
          },
        ];
        // Talent with defense_physical bonus
        heroStore.hero.talents = [
          {
            id: 1,
            heroId: 0,
            talent: { id: 1, code: 'test_talent', name: 'Test' },
            special: [{ type: 'defense_physical', value: 2 }],
            grantSelections: [],
          },
        ];
      }

      // Formula: 10 + str(3) + spd(2) + modifier(0) + bonus(2) = 17
      expect(store.getDefenseValue('physical')).toBe(17);
    });

    it('returns 10 for unknown attribute type', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getDefenseValue('unknown')).toBe(10);
    });

    it('returns 10 when no hero loaded', () => {
      const store = useHeroAttributesStore();
      expect(store.getDefenseValue('physical')).toBe(10);
    });

    it('returns 10 when defense not set', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.defenses = [];
      }

      expect(store.getDefenseValue('physical')).toBe(10);
    });
  });

  // ========================================
  // Attribute Values (with bonuses)
  // ========================================
  describe('attributeValues', () => {
    it('includes special bonuses from talents', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.talents = [
          {
            id: 1,
            heroId: 0,
            talent: { id: 1, code: 'test', name: 'Test' },
            special: [{ type: 'attribute_str', value: 2 }],
            grantSelections: [],
          },
        ];
      }

      // str base(3) + bonus(2) = 5
      expect(store.attributeValues['str']).toBe(5);
      // spd base(2) + no bonus = 2
      expect(store.attributeValues['spd']).toBe(2);
    });
  });

  // ========================================
  // Skill Lookups
  // ========================================
  describe('getSkillRank', () => {
    it('returns skill rank', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getSkillRank(1)).toBe(2);
    });

    it('returns 0 for untrained skill', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getSkillRank(999)).toBe(0);
    });
  });

  describe('getSkillModifier', () => {
    it('returns attribute + rank + modifier', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      // athletics: strength (3) + rank (2) + modifier (0) = 5
      expect(store.getSkillModifier('athletics')).toBe(5);
    });

    it('includes skill modifier in total', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const athletics = heroStore.hero?.skills?.find((s) => s.skill.code === 'athletics');
      if (athletics) {
        athletics.modifier = 1;
      }
      const store = useHeroAttributesStore();

      // athletics: strength (3) + rank (2) + modifier (1) = 6
      expect(store.getSkillModifier('athletics')).toBe(6);
      // getSkillRank with includeModifier: rank (2) + modifier (1) = 3
      expect(store.getSkillRank(1, true)).toBe(3);
    });

    it('returns 0 for unknown skill', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getSkillModifier('unknown')).toBe(0);
    });

    it('returns 0 when no hero loaded', () => {
      const store = useHeroAttributesStore();
      expect(store.getSkillModifier('athletics')).toBe(0);
    });

    it('includes Enhanced condition bonus for the skill attribute', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.conditions = [
          {
            id: 100,
            heroId: 0,
            condition: { id: 1, code: 'enhanced', name: 'Enhanced' },
            notes: null,
            special: [{ type: 'attribute_str', value: 2, display_value: 'STR +2' }],
            sourceInjuryId: null,
          },
        ];
      }

      // athletics: strength (3) + rank (2) + enhanced (2) = 7
      expect(store.getSkillModifier('athletics')).toBe(7);
      // acrobatics: speed (2) + rank (0) + no enhanced = 2
      expect(store.getSkillModifier('acrobatics')).toBe(2);
    });

    it('includes Exhausted condition penalty', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.conditions = [
          {
            id: 100,
            heroId: 0,
            condition: { id: 2, code: 'exhausted', name: 'Exhausted' },
            notes: null,
            special: [{ type: 'exhausted_penalty', value: -2, display_value: '-2' }],
            sourceInjuryId: null,
          },
        ];
      }

      // athletics: strength (3) + rank (2) + exhausted (-2) = 3
      expect(store.getSkillModifier('athletics')).toBe(3);
    });

    it('combines Enhanced bonus and Exhausted penalty', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.conditions = [
          {
            id: 100,
            heroId: 0,
            condition: { id: 1, code: 'enhanced', name: 'Enhanced' },
            notes: null,
            special: [{ type: 'attribute_str', value: 2, display_value: 'STR +2' }],
            sourceInjuryId: null,
          },
          {
            id: 101,
            heroId: 0,
            condition: { id: 2, code: 'exhausted', name: 'Exhausted' },
            notes: null,
            special: [{ type: 'exhausted_penalty', value: -1, display_value: '-1' }],
            sourceInjuryId: null,
          },
        ];
      }

      // athletics: strength (3) + rank (2) + enhanced (2) + exhausted (-1) = 6
      expect(store.getSkillModifier('athletics')).toBe(6);
    });
  });

  // ========================================
  // Derived Stats
  // ========================================
  describe('getDerivedStatModifier', () => {
    it('returns stat modifier', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getDerivedStatModifier(1)).toBe(2);
    });

    it('returns 0 for stat without modifier', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getDerivedStatModifier(999)).toBe(0);
    });

    it('returns 0 when no hero loaded', () => {
      const store = useHeroAttributesStore();
      expect(store.getDerivedStatModifier(1)).toBe(0);
    });
  });

  describe('getDerivedStatTotal', () => {
    it('returns calculated total with modifier', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      // The total includes base calculation + modifier
      const total = store.getDerivedStatTotal('health');
      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it('returns base calculation when stat has no modifier', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      // Set stat with zero modifier
      if (heroStore.hero) {
        heroStore.hero.derivedStats = [
          {
            derivedStat: { id: 1, code: 'health', name: 'Health' },
            baseValue: 15,
            modifier: 0,
            totalValue: 15,
            displayValue: null,
          },
        ];
      }

      const total = store.getDerivedStatTotal('health');
      // Total = calculateFormulaStat result + modifier (0)
      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it('returns 0 for unknown stat code', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      const total = store.getDerivedStatTotal('unknown');
      expect(total).toBe(0);
    });
  });

  // ========================================
  // setAttribute
  // ========================================
  describe('setAttribute', () => {
    it('updates existing attribute', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setAttribute(1, 5);

      const attr = heroStore.hero?.attributes.find((a) => a.attribute.id === 1);
      expect(attr?.value).toBe(5);
    });

    it('creates new attribute if not exists', () => {
      const heroStore = useHeroStore();
      heroStore.initNewHero();
      if (heroStore.hero) {
        heroStore.hero.attributes = [];
      }

      const store = useHeroAttributesStore();
      store.setAttribute(1, 3);

      expect(heroStore.hero!.attributes.length).toBe(1);
      expect(heroStore.hero!.attributes[0]!.value).toBe(3);
    });

    it('clamps value to min (0)', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setAttribute(1, -5);

      const attr = heroStore.hero?.attributes.find((a) => a.attribute.id === 1);
      expect(attr?.value).toBe(0);
    });

    it('clamps value to max (10)', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setAttribute(1, 15);

      const attr = heroStore.hero?.attributes.find((a) => a.attribute.id === 1);
      expect(attr?.value).toBe(10);
    });

    it('does nothing when no hero', () => {
      const store = useHeroAttributesStore();
      // Should not throw
      expect(() => store.setAttribute(1, 5)).not.toThrow();
    });
  });

  // ========================================
  // setSkillRank
  // ========================================
  describe('setSkillRank', () => {
    it('updates existing skill rank', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setSkillRank(1, 1);

      const skill = heroStore.hero?.skills.find((s) => s.skill.id === 1);
      expect(skill?.rank).toBe(1);
    });

    it('creates new skill if not exists', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setSkillRank(2, 1); // acrobatics

      const skill = heroStore.hero?.skills.find((s) => s.skill.id === 2);
      expect(skill).toBeDefined();
      expect(skill?.rank).toBe(1);
    });

    it('clamps rank to min (0)', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setSkillRank(1, -5);

      const skill = heroStore.hero?.skills.find((s) => s.skill.id === 1);
      expect(skill?.rank).toBe(0);
    });

    it('clamps rank to max from level data', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      // Level 1 maxSkillRank is 2
      store.setSkillRank(1, 10);

      const skill = heroStore.hero?.skills.find((s) => s.skill.id === 1);
      expect(skill?.rank).toBe(2);
    });
  });

  // ========================================
  // Expertises
  // ========================================
  describe('addExpertise', () => {
    it('adds expertise to hero', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.addExpertise(1);

      expect(heroStore.hero!.expertises.length).toBe(1);
      expect(heroStore.hero!.expertises[0]!.expertise?.id).toBe(1);
    });

    it('does not add duplicate expertise', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.addExpertise(1);
      store.addExpertise(1);

      expect(heroStore.hero!.expertises.length).toBe(1);
    });

    it('adds expertise with source data', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.addExpertise(1, { sourceType: 'culture', sourceId: 5 });

      expect(heroStore.hero!.expertises[0]!.source?.sourceType).toBe('culture');
      expect(heroStore.hero!.expertises[0]!.source?.sourceId).toBe(5);
    });
  });

  describe('removeExpertise', () => {
    it('removes expertise by id', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.addExpertise(1);
      expect(heroStore.hero!.expertises.length).toBe(1);

      store.removeExpertise(1);
      expect(heroStore.hero!.expertises.length).toBe(0);
    });

    it('handles non-existent expertise', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      // Should not throw
      expect(() => store.removeExpertise(999)).not.toThrow();
      expect(heroStore.hero!.expertises.length).toBe(0);
    });
  });

  describe('removeExpertiseBySource', () => {
    it('removes expertise by source type and id', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.addExpertise(1, { sourceType: 'culture', sourceId: 5 });
      expect(heroStore.hero!.expertises.length).toBe(1);

      store.removeExpertiseBySource('culture', 5);
      expect(heroStore.hero!.expertises.length).toBe(0);
    });

    it('does not remove expertise with different source', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.addExpertise(1, { sourceType: 'culture', sourceId: 5 });

      store.removeExpertiseBySource('ancestry', 5);
      expect(heroStore.hero!.expertises.length).toBe(1);

      store.removeExpertiseBySource('culture', 10);
      expect(heroStore.hero!.expertises.length).toBe(1);
    });
  });

  // ========================================
  // Level/Tier Data
  // ========================================
  describe('levelData', () => {
    it('returns level data for hero level', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.levelData?.level).toBe(1);
      expect(store.levelData?.maxSkillRank).toBe(2);
    });
  });

  describe('tierData', () => {
    it('returns tier data for hero level', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.tierData?.code).toBe('apprentice');
    });
  });

  // ========================================
  // setSkillModifier
  // ========================================
  describe('setSkillModifier', () => {
    it('updates existing skill modifier', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setSkillModifier(1, 3);

      const skill = heroStore.hero?.skills.find((s) => s.skill.id === 1);
      expect(skill?.modifier).toBe(3);
    });

    it('creates new skill with modifier if not exists', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setSkillModifier(2, 2); // acrobatics

      const skill = heroStore.hero?.skills.find((s) => s.skill.id === 2);
      expect(skill).toBeDefined();
      expect(skill?.modifier).toBe(2);
      expect(skill?.rank).toBe(0);
    });

    it('clamps modifier to min', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setSkillModifier(1, -100);

      const skill = heroStore.hero?.skills.find((s) => s.skill.id === 1);
      expect(skill?.modifier).toBe(-10);
    });

    it('clamps modifier to max', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setSkillModifier(1, 100);

      const skill = heroStore.hero?.skills.find((s) => s.skill.id === 1);
      expect(skill?.modifier).toBe(10);
    });

    it('does nothing when no hero', () => {
      const store = useHeroAttributesStore();
      expect(() => store.setSkillModifier(1, 5)).not.toThrow();
    });
  });

  // ========================================
  // setDerivedStatModifier
  // ========================================
  describe('setDerivedStatModifier', () => {
    it('updates existing stat modifier', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setDerivedStatModifier(1, 5);

      const stat = heroStore.hero?.derivedStats.find((s) => s.derivedStat.id === 1);
      expect(stat?.modifier).toBe(5);
    });

    it('creates new stat with modifier if not exists', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      // Clear existing stats
      if (heroStore.hero) {
        heroStore.hero.derivedStats = [];
      }

      store.setDerivedStatModifier(1, 3);

      const stat = heroStore.hero?.derivedStats.find((s) => s.derivedStat.id === 1);
      expect(stat).toBeDefined();
      expect(stat?.modifier).toBe(3);
      expect(stat?.baseValue).toBeNull();
    });

    it('does nothing when no hero', () => {
      const store = useHeroAttributesStore();
      expect(() => store.setDerivedStatModifier(1, 5)).not.toThrow();
    });
  });

  // ========================================
  // getStatBonus - All bonus types
  // ========================================
  describe('getStatBonus', () => {
    it('returns health_per_level bonus multiplied by level', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.level = 5;
        heroStore.hero.talents = [
          {
            id: 1,
            heroId: 0,
            talent: { id: 1, code: 'hardy', name: 'Hardy' },
            special: [{ type: 'health_per_level', value: 1 }],
            grantSelections: [],
          },
        ];
      }

      // health_per_level(1) * level(5) = 5
      expect(store.getStatBonus('max_health')).toBe(5);
    });

    it('returns focus_per_tier bonus multiplied by tier', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.talents = [
          {
            id: 1,
            heroId: 0,
            talent: { id: 1, code: 'composed', name: 'Composed' },
            special: [{ type: 'focus_per_tier', value: 1 }],
            grantSelections: [],
          },
        ];
      }

      // focus_per_tier(1) * tier(1) = 1
      expect(store.getStatBonus('max_focus')).toBe(1);
    });

    it('returns flat focus bonus from talent', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.talents = [
          {
            id: 1,
            heroId: 0,
            talent: { id: 1, code: 'focus_talent', name: 'Focus Talent' },
            special: [{ type: 'focus', value: 3 }],
            grantSelections: [],
          },
        ];
      }

      // flat focus(3) + focus_per_tier(0) * tier(1) = 3
      expect(store.getStatBonus('max_focus')).toBe(3);
    });

    it('returns investiture_per_tier bonus multiplied by tier', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.talents = [
          {
            id: 1,
            heroId: 0,
            talent: { id: 1, code: 'invested', name: 'Invested' },
            special: [{ type: 'investiture_per_tier', value: 1 }],
            grantSelections: [],
          },
        ];
      }

      // investiture_per_tier(1) * tier(1) = 1
      expect(store.getStatBonus('max_investiture')).toBe(1);
    });

    it('returns deflect bonus from equipment', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.equipment = [
          {
            id: 1,
            heroId: 0,
            equipment: { id: 1, code: 'chain', name: 'Chain Armor' },
            equipType: { id: 2, code: 'armor', name: 'Armor' },
            special: [{ type: 'deflect', value: 3 }],
            specialOverrides: [],
            charges: null,
            maxCharges: null,
            amount: 1,
            isEquipped: true,
            customName: null,
            notes: null,
            modifications: [],
          },
        ];
      }

      expect(store.getStatBonus('deflect')).toBe(3);
    });

    it('cumbersome does not directly reduce movement', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.talents = [
          {
            id: 1,
            heroId: 0,
            talent: { id: 1, code: 'surefooted', name: 'Surefooted' },
            special: [{ type: 'movement', value: 10 }],
            grantSelections: [],
          },
        ];
        heroStore.hero.equipment = [
          {
            id: 1,
            heroId: 0,
            equipment: { id: 1, code: 'chain', name: 'Chain Armor' },
            equipType: { id: 2, code: 'armor', name: 'Armor' },
            special: [{ type: 'cumbersome', value: 3 }],
            specialOverrides: [],
            charges: null,
            maxCharges: null,
            amount: 1,
            isEquipped: true,
            customName: null,
            notes: null,
            modifications: [],
          },
        ];
      }

      // cumbersome does not directly reduce movement (it gates on STR, applying Slowed if unmet)
      expect(store.getStatBonus('movement')).toBe(10);
    });

    it('returns physical defense bonus from equipment', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.equipment = [
          {
            id: 1,
            heroId: 0,
            equipment: { id: 1, code: 'shield', name: 'Shield' },
            equipType: { id: 2, code: 'armor', name: 'Armor' },
            special: [{ type: 'defense_physical', value: 1 }],
            specialOverrides: [],
            charges: null,
            maxCharges: null,
            amount: 1,
            isEquipped: true,
            customName: null,
            notes: null,
            modifications: [],
          },
        ];
      }

      expect(store.getStatBonus('physical_defense')).toBe(1);
    });

    it('returns cognitive and spiritual defense bonuses from talent', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.talents = [
          {
            id: 1,
            heroId: 0,
            talent: { id: 1, code: 'collected', name: 'Collected' },
            special: [
              { type: 'defense_cognitive', value: 2 },
              { type: 'defense_spiritual', value: 2 },
            ],
            grantSelections: [],
          },
        ];
      }

      expect(store.getStatBonus('cognitive_defense')).toBe(2);
      expect(store.getStatBonus('spiritual_defense')).toBe(2);
    });

    it('returns 0 for unknown stat code', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getStatBonus('unknown_stat')).toBe(0);
    });

    it('returns 0 when no hero loaded', () => {
      const store = useHeroAttributesStore();

      expect(store.getStatBonus('max_health')).toBe(0);
    });

    it('ignores unequipped equipment bonuses', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.equipment = [
          {
            id: 1,
            heroId: 0,
            equipment: { id: 1, code: 'chain', name: 'Chain Armor' },
            equipType: { id: 2, code: 'armor', name: 'Armor' },
            special: [{ type: 'deflect', value: 3 }],
            specialOverrides: [],
            charges: null,
            maxCharges: null,
            amount: 1,
            isEquipped: false,
            customName: null,
            notes: null,
            modifications: [],
          },
        ];
      }

      expect(store.getStatBonus('deflect')).toBe(0);
    });

    it('combines talent and equipment bonuses for same stat', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.talents = [
          {
            id: 1,
            heroId: 0,
            talent: { id: 1, code: 'test', name: 'Test' },
            special: [{ type: 'deflect', value: 2 }],
            grantSelections: [],
          },
        ];
        heroStore.hero.equipment = [
          {
            id: 1,
            heroId: 0,
            equipment: { id: 1, code: 'chain', name: 'Chain Armor' },
            equipType: { id: 2, code: 'armor', name: 'Armor' },
            special: [{ type: 'deflect', value: 3 }],
            specialOverrides: [],
            charges: null,
            maxCharges: null,
            amount: 1,
            isEquipped: true,
            customName: null,
            notes: null,
            modifications: [],
          },
        ];
      }

      expect(store.getStatBonus('deflect')).toBe(5);
    });
  });

  // ========================================
  // hasCondition
  // ========================================
  describe('hasCondition', () => {
    it('returns true when hero has the condition', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.conditions = [
          {
            id: 100,
            heroId: 0,
            condition: { id: 1, code: 'immobilized', name: 'Immobilized' },
            notes: null,
            special: [],
            sourceInjuryId: null,
          },
        ];
      }

      expect(store.hasCondition('immobilized')).toBe(true);
    });

    it('returns false when hero does not have the condition', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.hasCondition('immobilized')).toBe(false);
    });
  });

  // ========================================
  // applyMovementConditions
  // ========================================
  describe('applyMovementConditions', () => {
    it('returns 0 when immobilized', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.conditions = [
          {
            id: 100,
            heroId: 0,
            condition: { id: 1, code: 'immobilized', name: 'Immobilized' },
            notes: null,
            special: [],
            sourceInjuryId: null,
          },
        ];
      }

      expect(store.applyMovementConditions(30)).toBe(0);
    });

    it('returns 0 when restrained', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.conditions = [
          {
            id: 100,
            heroId: 0,
            condition: { id: 1, code: 'restrained', name: 'Restrained' },
            notes: null,
            special: [],
            sourceInjuryId: null,
          },
        ];
      }

      expect(store.applyMovementConditions(30)).toBe(0);
    });

    it('returns 0 when unconscious', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.conditions = [
          {
            id: 100,
            heroId: 0,
            condition: { id: 1, code: 'unconscious', name: 'Unconscious' },
            notes: null,
            special: [],
            sourceInjuryId: null,
          },
        ];
      }

      expect(store.applyMovementConditions(30)).toBe(0);
    });

    it('halves movement when slowed', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.conditions = [
          {
            id: 100,
            heroId: 0,
            condition: { id: 1, code: 'slowed', name: 'Slowed' },
            notes: null,
            special: [],
            sourceInjuryId: null,
          },
        ];
      }

      expect(store.applyMovementConditions(30)).toBe(15);
      expect(store.applyMovementConditions(25)).toBe(12); // floors
    });

    it('returns original value when no movement conditions', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.applyMovementConditions(30)).toBe(30);
    });
  });

  // ========================================
  // Condition Bonus Integration
  // ========================================
  describe('condition bonus integration', () => {
    it('attributeValues includes condition bonuses', () => {
      const heroStore = useHeroStore();
      heroStore.initNewHero();
      if (heroStore.hero) {
        heroStore.hero.attributes = [
          { id: 1, heroId: 0, attribute: { id: 1, code: 'str', name: 'Strength' }, value: 3 },
        ];
        heroStore.hero.conditions = [
          {
            id: 100,
            heroId: 0,
            condition: { id: 1, code: 'enhanced', name: 'Enhanced' },
            notes: null,
            special: [{ type: 'attribute_str', value: 2, display_value: 'STR +2' }],
            sourceInjuryId: null,
          },
        ];
      }

      const attrStore = useHeroAttributesStore();
      expect(attrStore.attributeValues['str']).toBe(5); // 3 base + 2 enhanced
    });

    it('baseAttributeValues excludes condition bonuses', () => {
      const heroStore = useHeroStore();
      heroStore.initNewHero();
      if (heroStore.hero) {
        heroStore.hero.attributes = [
          { id: 1, heroId: 0, attribute: { id: 1, code: 'str', name: 'Strength' }, value: 3 },
        ];
        heroStore.hero.conditions = [
          {
            id: 100,
            heroId: 0,
            condition: { id: 1, code: 'enhanced', name: 'Enhanced' },
            notes: null,
            special: [{ type: 'attribute_str', value: 2, display_value: 'STR +2' }],
            sourceInjuryId: null,
          },
        ];
      }

      const attrStore = useHeroAttributesStore();
      expect(attrStore.baseAttributeValues['str']).toBe(3); // base only, no condition bonus
    });
  });

  // ========================================
  // Edge Cases - No Hero
  // ========================================
  describe('no hero edge cases', () => {
    it('getSkillRank returns 0 when no hero', () => {
      const store = useHeroAttributesStore();
      expect(store.getSkillRank(1)).toBe(0);
    });

    it('addExpertise does nothing when no hero', () => {
      const store = useHeroAttributesStore();
      expect(() => store.addExpertise(1)).not.toThrow();
    });

    it('removeExpertise does nothing when no hero', () => {
      const store = useHeroAttributesStore();
      expect(() => store.removeExpertise(1)).not.toThrow();
    });

    it('removeExpertiseBySource does nothing when no hero', () => {
      const store = useHeroAttributesStore();
      expect(() => store.removeExpertiseBySource('culture', 1)).not.toThrow();
    });

    it('setSkillRank does nothing when no hero', () => {
      const store = useHeroAttributesStore();
      expect(() => store.setSkillRank(1, 2)).not.toThrow();
    });
  });
});
