import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHeroTalentsStore } from './heroTalents';
import { useHeroStore } from './hero';
import { useClassifierStore } from './classifiers';

// Mock classifiers data
const mockClassifiers = {
  attributeTypes: [],
  attributes: [],
  derivedStats: [],
  derivedStatValues: [],
  skills: [],
  expertiseTypes: [],
  expertises: [
    { id: 1, code: 'alethi_culture', name: 'Alethi Culture', skillId: 1 },
    { id: 2, code: 'thaylen_culture', name: 'Thaylen Culture', skillId: 1 },
  ],
  activationTypes: [],
  actionTypes: [],
  actions: [],
  actionLinks: [],
  paths: [
    { id: 1, code: 'warrior', name: 'Warrior' },
    { id: 2, code: 'scholar', name: 'Scholar' },
  ],
  specialties: [],
  surges: [
    { id: 1, code: 'gravitation', name: 'Gravitation' },
    { id: 2, code: 'adhesion', name: 'Adhesion' },
    { id: 3, code: 'division', name: 'Division' },
  ],
  radiantOrders: [
    { id: 1, code: 'windrunner', name: 'Windrunner', surge1Id: 1, surge2Id: 2 },
    { id: 2, code: 'dustbringer', name: 'Dustbringer', surge1Id: 3, surge2Id: 1 },
  ],
  singerForms: [
    { id: 1, code: 'warform', name: 'Warform' },
    { id: 2, code: 'workform', name: 'Workform' },
  ],
  talents: [
    { id: 1, code: 'warrior_key', name: 'Warrior Key', pathId: 1, isKey: true },
    { id: 2, code: 'warrior_talent', name: 'Warrior Talent', pathId: 1, isKey: false },
    { id: 3, code: 'scholar_key', name: 'Scholar Key', pathId: 2, isKey: true },
    { id: 4, code: 'windrunner_key', name: 'Windrunner Key', radiantOrderId: 1, isKey: true },
    { id: 5, code: 'gravitation_talent', name: 'Gravitation Talent', surgeId: 1 },
    { id: 6, code: 'adhesion_talent', name: 'Adhesion Talent', surgeId: 2 },
    { id: 7, code: 'singer_key', name: 'Singer Key', ancestryId: 2, isKey: true },
    { id: 8, code: 'human_talent', name: 'Human Talent', ancestryId: 1 },
  ],
  units: [],
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
  ancestries: [
    { id: 1, code: 'human', name: 'Human' },
    { id: 2, code: 'singer', name: 'Singer' },
  ],
  cultures: [
    { id: 1, code: 'alethi', name: 'Alethi', expertiseId: 1 },
    { id: 2, code: 'thaylen', name: 'Thaylen', expertiseId: 2 },
  ],
  tiers: [],
  levels: [],
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

describe('useHeroTalentsStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    // Initialize classifiers and hero for all tests
    const classifierStore = useClassifierStore();
    await classifierStore.initialize();

    const heroStore = useHeroStore();
    heroStore.initNewHero();
  });

  // ========================================
  // Computed Properties
  // ========================================
  describe('computed properties', () => {
    it('isSinger returns false for human ancestry', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      heroStore.hero!.ancestryId = 1; // human

      expect(store.isSinger).toBe(false);
    });

    it('isSinger returns true for singer ancestry', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      heroStore.hero!.ancestryId = 2; // singer

      expect(store.isSinger).toBe(true);
    });

    it('isRadiant returns false when no radiant order', () => {
      const store = useHeroTalentsStore();

      expect(store.isRadiant).toBe(false);
    });

    it('isRadiant returns true when radiant order set', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      heroStore.hero!.radiantOrderId = 1;

      expect(store.isRadiant).toBe(true);
    });

    it('radiantOrderId returns null when not set', () => {
      const store = useHeroTalentsStore();

      expect(store.radiantOrderId).toBeNull();
    });

    it('radiantOrderId returns order id when set', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      heroStore.hero!.radiantOrderId = 1;

      expect(store.radiantOrderId).toBe(1);
    });

    it('radiantIdeal returns 0 when not set', () => {
      const store = useHeroTalentsStore();

      expect(store.radiantIdeal).toBe(0);
    });

    it('radiantIdeal returns value when set', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      heroStore.hero!.radiantIdeal = 3;

      expect(store.radiantIdeal).toBe(3);
    });
  });

  // ========================================
  // Ancestry
  // ========================================
  describe('setAncestry', () => {
    it('sets ancestry id', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setAncestry(1);

      expect(heroStore.hero?.ancestryId).toBe(1);
    });

    it('adds singer key talent when setting singer ancestry', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setAncestry(2); // singer

      const hasSingerKey = heroStore.hero!.talents.some((t) => t.talentId === 7);
      expect(hasSingerKey).toBe(true);
    });

    it('resets singer form when changing from singer to human', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setAncestry(2); // singer
      heroStore.hero!.activeSingerFormId = 1;

      store.setAncestry(1); // human

      expect(heroStore.hero?.activeSingerFormId).toBeNull();
    });

    it('removes previous ancestry talents when changing ancestry', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setAncestry(2); // singer - adds singer key talent
      expect(heroStore.hero!.talents.some((t) => t.talentId === 7)).toBe(true);

      store.setAncestry(1); // human - should remove singer talents

      expect(heroStore.hero!.talents.some((t) => t.talentId === 7)).toBe(false);
    });
  });

  describe('setSingerForm', () => {
    it('sets singer form id', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setSingerForm(1);

      expect(heroStore.hero?.activeSingerFormId).toBe(1);
    });

    it('clears singer form when set to null', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setSingerForm(1);
      store.setSingerForm(null);

      expect(heroStore.hero?.activeSingerFormId).toBeNull();
    });
  });

  // ========================================
  // Culture
  // ========================================
  describe('addCulture', () => {
    it('adds culture to hero', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.addCulture(1);

      expect(heroStore.hero!.cultures.length).toBe(1);
      expect(heroStore.hero!.cultures[0]!.cultureId).toBe(1);
    });

    it('does not duplicate culture', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.addCulture(1);
      store.addCulture(1);

      expect(heroStore.hero!.cultures.length).toBe(1);
    });

    it('adds cultural expertise', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.addCulture(1); // Alethi has expertiseId 1

      const hasExpertise = heroStore.hero!.expertises.some(
        (e) => e.expertiseId === 1 && e.source?.sourceType === 'culture'
      );
      expect(hasExpertise).toBe(true);
    });

    it('generates temp id for culture', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.addCulture(1);

      expect(heroStore.hero!.cultures[0]!.id).toBe(-1);
    });
  });

  describe('removeCulture', () => {
    it('removes culture from hero', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.addCulture(1);
      store.addCulture(2);
      expect(heroStore.hero!.cultures.length).toBe(2);

      store.removeCulture(1);

      expect(heroStore.hero!.cultures.length).toBe(1);
      expect(heroStore.hero!.cultures[0]!.cultureId).toBe(2);
    });

    it('removes cultural expertise', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.addCulture(1);
      expect(heroStore.hero!.expertises.some((e) => e.source?.sourceType === 'culture')).toBe(true);

      store.removeCulture(1);

      expect(heroStore.hero!.expertises.some((e) => e.source?.sourceType === 'culture')).toBe(
        false
      );
    });
  });

  // ========================================
  // Talents
  // ========================================
  describe('addTalent', () => {
    it('adds talent to hero', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.addTalent(1);

      expect(heroStore.hero!.talents.length).toBe(1);
      expect(heroStore.hero!.talents[0]!.talentId).toBe(1);
    });

    it('does not duplicate talent', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.addTalent(1);
      store.addTalent(1);

      expect(heroStore.hero!.talents.length).toBe(1);
    });

    it('generates temp id', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.addTalent(1);

      expect(heroStore.hero!.talents[0]!.id).toBe(-1);
    });
  });

  describe('removeTalent', () => {
    it('removes talent from hero', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.addTalent(1);
      store.addTalent(2);
      expect(heroStore.hero!.talents.length).toBe(2);

      store.removeTalent(1);

      expect(heroStore.hero!.talents.length).toBe(1);
      expect(heroStore.hero!.talents[0]!.talentId).toBe(2);
    });
  });

  describe('addKeyTalentForPath', () => {
    it('adds key talent for path', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.addKeyTalentForPath(1); // warrior path

      expect(heroStore.hero!.talents.some((t) => t.talentId === 1)).toBe(true);
    });

    it('does nothing for path without key talent', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.addKeyTalentForPath(999);

      expect(heroStore.hero!.talents.length).toBe(0);
    });
  });

  // ========================================
  // Radiant
  // ========================================
  describe('setRadiantOrder', () => {
    it('sets radiant order id', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setRadiantOrder(1);

      expect(heroStore.hero?.radiantOrderId).toBe(1);
    });

    it('adds radiant key talent', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setRadiantOrder(1); // windrunner

      expect(heroStore.hero!.talents.some((t) => t.talentId === 4)).toBe(true);
    });

    it('clears radiant order when set to null', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setRadiantOrder(1);
      store.setRadiantOrder(null);

      expect(heroStore.hero?.radiantOrderId).toBeNull();
    });

    it('resets radiant ideal to 0 when clearing order', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setRadiantOrder(1);
      heroStore.hero!.radiantIdeal = 3;

      store.setRadiantOrder(null);

      expect(heroStore.hero?.radiantIdeal).toBe(0);
    });

    it('removes previous order talents when changing order', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setRadiantOrder(1); // windrunner - adds windrunner key (id 4)
      expect(heroStore.hero!.talents.some((t) => t.talentId === 4)).toBe(true);

      store.setRadiantOrder(2); // dustbringer - should remove windrunner talents

      expect(heroStore.hero!.talents.some((t) => t.talentId === 4)).toBe(false);
    });

    it('removes surge talents from previous order', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setRadiantOrder(1); // windrunner has gravitation and adhesion
      store.addTalent(5); // gravitation talent
      store.addTalent(6); // adhesion talent

      store.setRadiantOrder(null);

      // Should remove surge talents
      expect(heroStore.hero!.talents.some((t) => t.talentId === 5)).toBe(false);
      expect(heroStore.hero!.talents.some((t) => t.talentId === 6)).toBe(false);
    });
  });

  describe('setRadiantIdeal', () => {
    it('sets radiant ideal level', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setRadiantIdeal(3);

      expect(heroStore.hero?.radiantIdeal).toBe(3);
    });

    it('clamps to minimum 0', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setRadiantIdeal(-5);

      expect(heroStore.hero?.radiantIdeal).toBe(0);
    });

    it('clamps to maximum 5', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      store.setRadiantIdeal(10);

      expect(heroStore.hero?.radiantIdeal).toBe(5);
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('does not duplicate singer key talent when set to singer twice', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      // Set to singer first time
      store.setAncestry(2);
      const talentCount1 = heroStore.hero!.talents.length;

      // Set to singer again - should not duplicate key talent
      store.setAncestry(2);
      const talentCount2 = heroStore.hero!.talents.length;

      expect(talentCount1).toBe(talentCount2);
    });

    it('handles setAncestry when hero is null', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      // Should not throw
      store.setAncestry(1);

      expect(heroStore.hero).toBeNull();
    });

    it('handles setSingerForm when hero is null', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      // Should not throw
      store.setSingerForm(1);

      expect(heroStore.hero).toBeNull();
    });

    it('handles addCulture when hero is null', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      // Should not throw
      store.addCulture(1);

      expect(heroStore.hero).toBeNull();
    });

    it('handles removeCulture when hero is null', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      // Should not throw
      store.removeCulture(1);

      expect(heroStore.hero).toBeNull();
    });

    it('handles addTalent when hero is null', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      // Should not throw
      store.addTalent(1);

      expect(heroStore.hero).toBeNull();
    });

    it('handles removeTalent when hero is null', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      // Should not throw
      store.removeTalent(1);

      expect(heroStore.hero).toBeNull();
    });

    it('handles setRadiantOrder when hero is null', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      // Should not throw
      store.setRadiantOrder(1);

      expect(heroStore.hero).toBeNull();
    });

    it('handles setRadiantIdeal when hero is null', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      // Should not throw
      store.setRadiantIdeal(3);

      expect(heroStore.hero).toBeNull();
    });

    it('handles addKeyTalentForPath when hero is null', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      // Should not throw
      store.addKeyTalentForPath(1);

      expect(heroStore.hero).toBeNull();
    });

    it('isSinger returns false when hero is null', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      expect(store.isSinger).toBe(false);
    });

    it('isRadiant returns false when hero is null', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();
      heroStore.clearHero();

      expect(store.isRadiant).toBe(false);
    });

    it('warns when singer ancestry not found in classifiers', () => {
      const store = useHeroTalentsStore();
      const classifierStore = useClassifierStore();

      // Temporarily remove singer ancestry from classifiers
      const originalAncestries = [...classifierStore.ancestries];
      classifierStore.ancestries.length = 0;
      classifierStore.ancestries.push({ id: 1, code: 'human', name: 'Human' });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      store.setAncestry(1);

      expect(warnSpy).toHaveBeenCalledWith('Singer ancestry not found in classifiers');

      // Restore ancestries
      classifierStore.ancestries.length = 0;
      originalAncestries.forEach((a) => classifierStore.ancestries.push(a));
      warnSpy.mockRestore();
    });

    it('does not add duplicate singer key talent when already present', () => {
      const store = useHeroTalentsStore();
      const heroStore = useHeroStore();

      // Manually add the singer key talent first
      heroStore.hero!.talents.push({
        id: -999,
        heroId: heroStore.hero!.id,
        talentId: 7, // singer key talent
      });

      const initialCount = heroStore.hero!.talents.length;

      // Set to singer - should NOT add duplicate
      store.setAncestry(2);

      // Count singer key talents
      const singerKeyTalents = heroStore.hero!.talents.filter((t) => t.talentId === 7);
      expect(singerKeyTalents.length).toBe(1);
      expect(heroStore.hero!.talents.length).toBe(initialCount);
    });
  });
});
