import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHeroAttributesStore } from './heroAttributes';
import { useHeroStore } from './hero';
import { useClassifierStore } from './classifiers';

// Mock classifiers data
const mockClassifiers = {
  attributeTypes: [{ id: 1, code: 'physical', name: 'Physical' }],
  attributes: [
    { id: 1, code: 'strength', name: 'Strength', attributeTypeId: 1, sortOrder: 1 },
    { id: 2, code: 'speed', name: 'Speed', attributeTypeId: 1, sortOrder: 2 },
  ],
  derivedStats: [{ id: 1, code: 'health', name: 'Health', attributeId: 1 }],
  derivedStatValues: [],
  skills: [
    { id: 1, code: 'athletics', name: 'Athletics', attrId: 1 },
    { id: 2, code: 'acrobatics', name: 'Acrobatics', attrId: 2 },
  ],
  expertiseTypes: [],
  expertises: [{ id: 1, code: 'climbing', name: 'Climbing', skillId: 1 }],
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
  levels: [{ id: 1, level: 1, tierId: 1, maxSkillRank: 2 }],
};

vi.mock('src/mock/classifiers', () => ({
  classifiers: mockClassifiers,
}));

vi.mock('src/mock/heroes', () => ({
  heroes: [],
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
        { id: 1, heroId: 0, attrId: 1, value: 3 }, // strength = 3
        { id: 2, heroId: 0, attrId: 2, value: 2 }, // speed = 2
      ];
      heroStore.hero.skills = [
        { id: 1, heroId: 0, skillId: 1, rank: 2, modifier: 0 }, // athletics rank 2
      ];
      heroStore.hero.expertises = [];
      heroStore.hero.derivedStats = [{ id: 1, heroId: 0, statId: 1, value: 15, modifier: 2 }];
    }
  }

  // ========================================
  // Attribute Lookups
  // ========================================
  describe('getAttributeValue', () => {
    it('returns attribute value by code', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getAttributeValue('strength')).toBe(3);
      expect(store.getAttributeValue('speed')).toBe(2);
    });

    it('returns 0 for unknown attribute', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getAttributeValue('unknown')).toBe(0);
    });

    it('returns 0 when no hero loaded', () => {
      const store = useHeroAttributesStore();
      expect(store.getAttributeValue('strength')).toBe(0);
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
    it('returns defense value by attribute type code', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      // Add defense data
      if (heroStore.hero) {
        heroStore.hero.defenses = [{ id: 1, heroId: 0, attrTypeId: 1, value: 14, modifier: 0 }];
      }

      expect(store.getDefenseValue('physical')).toBe(14);
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
    it('returns attribute + rank', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      // athletics: strength (3) + rank (2) = 5
      expect(store.getSkillModifier('athletics')).toBe(5);
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
  });

  // ========================================
  // Derived Stats
  // ========================================
  describe('getDerivedStatValue', () => {
    it('returns stored stat value', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getDerivedStatValue('health')).toBe(15);
    });

    it('returns 0 for unknown stat', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getDerivedStatValue('unknown')).toBe(0);
    });
  });

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
        heroStore.hero.derivedStats = [{ id: 1, heroId: 0, statId: 1, value: 15, modifier: 0 }];
      }

      const total = store.getDerivedStatTotal('health');
      // Total = calculateFormulaStat result + modifier (0)
      // Note: The 'value' field is stored data, not used in total calculation
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

  describe('getDerivedStatDisplay', () => {
    it('returns formatted string with modifier', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      // Set up stat with unit and modifier
      if (heroStore.hero) {
        heroStore.hero.derivedStats = [
          { id: 1, heroId: 0, statId: 1, value: 15, modifier: 2, unitId: 1 },
        ];
      }

      const display = store.getDerivedStatDisplay('health');
      expect(display).toContain('(');
      expect(display).toContain('+');
    });

    it('returns formatted string without modifier', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.derivedStats = [
          { id: 1, heroId: 0, statId: 1, value: 15, modifier: 0, unitId: 1 },
        ];
      }

      const display = store.getDerivedStatDisplay('health');
      expect(display).not.toContain('(');
    });

    it('returns empty string for unknown stat', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();

      expect(store.getDerivedStatDisplay('unknown')).toBe('');
    });

    it('handles stat without unit', () => {
      setupHeroWithAttributes();
      const heroStore = useHeroStore();
      const store = useHeroAttributesStore();

      if (heroStore.hero) {
        heroStore.hero.derivedStats = [{ id: 1, heroId: 0, statId: 1, value: 15, modifier: 0 }];
      }

      const display = store.getDerivedStatDisplay('health');
      expect(typeof display).toBe('string');
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

      const attr = heroStore.hero?.attributes.find((a) => a.attrId === 1);
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

      const attr = heroStore.hero?.attributes.find((a) => a.attrId === 1);
      expect(attr?.value).toBe(0);
    });

    it('clamps value to max (10)', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setAttribute(1, 15);

      const attr = heroStore.hero?.attributes.find((a) => a.attrId === 1);
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

      const skill = heroStore.hero?.skills.find((s) => s.skillId === 1);
      expect(skill?.rank).toBe(1);
    });

    it('creates new skill if not exists', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setSkillRank(2, 1); // acrobatics

      const skill = heroStore.hero?.skills.find((s) => s.skillId === 2);
      expect(skill).toBeDefined();
      expect(skill?.rank).toBe(1);
    });

    it('clamps rank to min (0)', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setSkillRank(1, -5);

      const skill = heroStore.hero?.skills.find((s) => s.skillId === 1);
      expect(skill?.rank).toBe(0);
    });

    it('clamps rank to max from level data', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      // Level 1 maxSkillRank is 2
      store.setSkillRank(1, 10);

      const skill = heroStore.hero?.skills.find((s) => s.skillId === 1);
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
      expect(heroStore.hero!.expertises[0]!.expertiseId).toBe(1);
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

      const skill = heroStore.hero?.skills.find((s) => s.skillId === 1);
      expect(skill?.modifier).toBe(3);
    });

    it('creates new skill with modifier if not exists', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setSkillModifier(2, 2); // acrobatics

      const skill = heroStore.hero?.skills.find((s) => s.skillId === 2);
      expect(skill).toBeDefined();
      expect(skill?.modifier).toBe(2);
      expect(skill?.rank).toBe(0);
    });

    it('clamps modifier to min', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setSkillModifier(1, -100);

      const skill = heroStore.hero?.skills.find((s) => s.skillId === 1);
      expect(skill?.modifier).toBe(0);
    });

    it('clamps modifier to max', () => {
      setupHeroWithAttributes();
      const store = useHeroAttributesStore();
      const heroStore = useHeroStore();

      store.setSkillModifier(1, 100);

      const skill = heroStore.hero?.skills.find((s) => s.skillId === 1);
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

      const stat = heroStore.hero?.derivedStats.find((s) => s.statId === 1);
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

      const stat = heroStore.hero?.derivedStats.find((s) => s.statId === 1);
      expect(stat).toBeDefined();
      expect(stat?.modifier).toBe(3);
      expect(stat?.value).toBe(0);
    });

    it('does nothing when no hero', () => {
      const store = useHeroAttributesStore();
      expect(() => store.setDerivedStatModifier(1, 5)).not.toThrow();
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
