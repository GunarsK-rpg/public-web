import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTalentPrerequisites } from './useTalentPrerequisites';
import { axiosError } from 'src/test-utils/axiosHelpers';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import type { Talent } from 'src/types';

/** Factory helper for building mock Talent objects with sensible defaults */
function createMockTalent(overrides: Partial<Talent> & { id: number }): Talent {
  return {
    code: `talent-${overrides.id}`,
    name: `Talent ${overrides.id}`,
    isKey: false,
    path: null,
    specialties: [],
    ancestry: null,
    radiantOrder: null,
    surge: null,
    ...overrides,
  };
}

// Mock hero data
const mockHero = {
  id: 1,
  userId: 1,
  campaignId: 1,
  ancestry: { id: 1, code: 'human', name: 'Human' },
  startingKit: null,
  activeSingerForm: null,
  radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
  radiantIdeal: 3,
  name: 'Test Hero',
  level: 5,
  currentHealth: 20,
  currentFocus: 10,
  currentInvestiture: 5,
  attributes: [],
  defenses: [],
  derivedStats: [],
  skills: [
    { id: 1, heroId: 1, skill: { id: 1, code: 'athletics', name: 'Athletics' }, rank: 3 },
    { id: 2, heroId: 1, skill: { id: 2, code: 'acrobatics', name: 'Acrobatics' }, rank: 5 },
  ],
  talents: [
    { id: 1, heroId: 1, talent: { id: 100, code: 'power-strike', name: 'Power Strike' } },
    { id: 2, heroId: 1, talent: { id: 101, code: 'quick-dodge', name: 'Quick Dodge' } },
  ],
  expertises: [],
  equipment: [],
  currency: 100,
  conditions: [],
  injuries: [],
  goals: [],
  connections: [],
  companions: [],
  cultures: [],
};

const { mockGetSheet, mockGetAllClassifiers } = vi.hoisted(() => ({
  mockGetSheet: vi.fn(),
  mockGetAllClassifiers: vi.fn(),
}));

vi.mock('src/services/heroService', () => ({
  default: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getSheet: mockGetSheet,
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getSubResource: vi.fn(),
    upsertSubResource: vi.fn(),
    deleteSubResource: vi.fn(),
  },
}));

// Mock classifiers data
const mockClassifiers = {
  attributes: [],
  skills: [
    { id: 1, code: 'athletics', name: 'Athletics' },
    { id: 2, code: 'acrobatics', name: 'Acrobatics' },
    { id: 3, code: 'arcana', name: 'Arcana' },
  ],
  derivedStats: [],
  levelData: [],
  ancestries: [{ id: 1, code: 'human', name: 'Human' }],
  cultures: [],
  startingKits: [],
  equipmentTypes: [],
  equipment: [],
  talents: [
    // Base talents
    {
      id: 100,
      code: 'power-strike',
      name: 'Power Strike',
      path: { id: 1, code: 'warrior', name: 'Warrior' },
      specialties: [],
      ancestry: null,
      radiantOrder: null,
      surge: null,
      isKey: false,
    },
    {
      id: 101,
      code: 'quick-dodge',
      name: 'Quick Dodge',
      path: { id: 1, code: 'warrior', name: 'Warrior' },
      specialties: [],
      ancestry: null,
      radiantOrder: null,
      surge: null,
      isKey: false,
    },
    // Talent with talent prerequisite
    {
      id: 102,
      code: 'mighty-blow',
      name: 'Mighty Blow',
      path: { id: 1, code: 'warrior', name: 'Warrior' },
      specialties: [],
      ancestry: null,
      radiantOrder: null,
      surge: null,
      isKey: false,
      prerequisites: [{ type: 'talent', talentIds: [100] }],
    },
    // Talent with skill prerequisite
    {
      id: 103,
      code: 'expert-climber',
      name: 'Expert Climber',
      path: { id: 1, code: 'warrior', name: 'Warrior' },
      specialties: [],
      ancestry: null,
      radiantOrder: null,
      surge: null,
      isKey: false,
      prerequisites: [{ type: 'skill', skillId: 1, skillRank: 3 }],
    },
    // Talent with ideal prerequisite
    {
      id: 104,
      code: 'radiant-surge',
      name: 'Radiant Surge',
      path: null,
      specialties: [],
      ancestry: null,
      radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
      surge: null,
      isKey: false,
      prerequisites: [{ type: 'ideal', skillRank: 2 }],
    },
    // Talent with level prerequisite
    {
      id: 105,
      code: 'veteran-skill',
      name: 'Veteran Skill',
      path: { id: 1, code: 'warrior', name: 'Warrior' },
      specialties: [],
      ancestry: null,
      radiantOrder: null,
      surge: null,
      isKey: false,
      prerequisites: [{ type: 'level', skillRank: 5 }],
    },
    // Talent with multiple prerequisites (all must be met)
    {
      id: 106,
      code: 'master-warrior',
      name: 'Master Warrior',
      path: { id: 1, code: 'warrior', name: 'Warrior' },
      specialties: [],
      ancestry: null,
      radiantOrder: null,
      surge: null,
      isKey: false,
      prerequisites: [
        { type: 'talent', talentIds: [100, 101] },
        { type: 'skill', skillId: 2, skillRank: 4 },
      ],
    },
    // Key talents
    {
      id: 200,
      code: 'path-key',
      name: 'Path Key Talent',
      path: { id: 1, code: 'warrior', name: 'Warrior' },
      specialties: [],
      ancestry: null,
      radiantOrder: null,
      surge: null,
      isKey: true,
    },
    {
      id: 201,
      code: 'ancestry-key',
      name: 'Ancestry Key',
      path: null,
      specialties: [],
      ancestry: { id: 1, code: 'human', name: 'Human' },
      radiantOrder: null,
      surge: null,
      isKey: true,
    },
    {
      id: 202,
      code: 'order-key',
      name: 'Order Key',
      path: null,
      specialties: [],
      ancestry: null,
      radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
      surge: null,
      isKey: true,
    },
    // Specialty talents
    {
      id: 300,
      code: 'specialty-1',
      name: 'Specialty Talent 1',
      path: { id: 1, code: 'warrior', name: 'Warrior' },
      specialties: [{ id: 10, code: 'berserker', name: 'Berserker' }],
      ancestry: null,
      radiantOrder: null,
      surge: null,
      isKey: false,
    },
    {
      id: 301,
      code: 'specialty-2',
      name: 'Specialty Talent 2',
      path: { id: 1, code: 'warrior', name: 'Warrior' },
      specialties: [{ id: 10, code: 'berserker', name: 'Berserker' }],
      ancestry: null,
      radiantOrder: null,
      surge: null,
      isKey: false,
    },
    // Ancestry talents
    {
      id: 400,
      code: 'human-1',
      name: 'Human Talent 1',
      path: null,
      specialties: [],
      ancestry: { id: 1, code: 'human', name: 'Human' },
      radiantOrder: null,
      surge: null,
      isKey: false,
    },
    {
      id: 401,
      code: 'human-2',
      name: 'Human Talent 2',
      path: null,
      specialties: [],
      ancestry: { id: 1, code: 'human', name: 'Human' },
      radiantOrder: null,
      surge: null,
      isKey: false,
    },
    // Radiant order talents
    {
      id: 500,
      code: 'order-1',
      name: 'Order Talent 1',
      path: null,
      specialties: [],
      ancestry: null,
      radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
      surge: null,
      isKey: false,
    },
    {
      id: 501,
      code: 'order-2',
      name: 'Order Talent 2',
      path: null,
      specialties: [],
      ancestry: null,
      radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
      surge: null,
      isKey: false,
    },
    // Surge talents
    {
      id: 600,
      code: 'surge-1',
      name: 'Surge Talent 1',
      path: null,
      specialties: [],
      ancestry: null,
      radiantOrder: null,
      surge: { id: 5, code: 'gravitation', name: 'Gravitation' },
      isKey: false,
    },
    {
      id: 601,
      code: 'surge-2',
      name: 'Surge Talent 2',
      path: null,
      specialties: [],
      ancestry: null,
      radiantOrder: null,
      surge: { id: 5, code: 'gravitation', name: 'Gravitation' },
      isKey: false,
    },
  ],
  talentTypes: [],
  paths: [{ id: 1, code: 'warrior', name: 'Warrior' }],
  specialties: [
    {
      id: 10,
      path: { id: 1, code: 'warrior', name: 'Warrior' },
      code: 'berserker',
      name: 'Berserker',
    },
    {
      id: 11,
      path: { id: 1, code: 'warrior', name: 'Warrior' },
      code: 'guardian',
      name: 'Guardian',
    },
  ],
  heroicPaths: [],
  radiantOrders: [{ id: 1, code: 'windrunner', name: 'Windrunner' }],
  singerForms: [],
  surges: [{ id: 5, code: 'gravitation', name: 'Gravitation' }],
  connectionTypes: [],
  goalStatuses: [],
  expertises: [],
  actionCategories: [],
  actions: [],
  conditionTypes: [],
  injuryTypes: [],
  derivedStatValueRanges: [],
  defenseTypes: [],
};

vi.mock('src/services/classifierService', () => ({
  default: {
    getAll: mockGetAllClassifiers,
  },
}));

// Mock logger
vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('useTalentPrerequisites', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockGetAllClassifiers.mockResolvedValue({ data: mockClassifiers });
    mockGetSheet.mockImplementation((id: number) => {
      if (id === 1) return Promise.resolve({ data: structuredClone(mockHero) });
      return Promise.reject(axiosError(404));
    });
    // Initialize classifier store with mock data
    const classifierStore = useClassifierStore();
    await classifierStore.initialize();
  });

  // Helper to load hero with skills and talents
  const setupHero = async () => {
    const heroStore = useHeroStore();
    await heroStore.loadHero(1);
    return heroStore;
  };

  // ========================================
  // Computed State
  // ========================================
  describe('computed state', () => {
    it('provides heroTalentIds as Set', async () => {
      await setupHero();
      const { heroTalentIds } = useTalentPrerequisites();

      expect(heroTalentIds.value).toBeInstanceOf(Set);
      expect(heroTalentIds.value.has(100)).toBe(true);
      expect(heroTalentIds.value.has(101)).toBe(true);
      expect(heroTalentIds.value.has(999)).toBe(false);
    });

    it('provides characterSkills as Map', async () => {
      await setupHero();
      const { characterSkills } = useTalentPrerequisites();

      expect(characterSkills.value).toBeInstanceOf(Map);
      expect(characterSkills.value.get(1)).toBe(3); // skillId 1 has rank 3
      expect(characterSkills.value.get(2)).toBe(5); // skillId 2 has rank 5
    });

    it('provides idealLevel from hero', async () => {
      await setupHero();
      const { idealLevel } = useTalentPrerequisites();

      expect(idealLevel.value).toBe(3);
    });

    it('provides heroLevel from hero', async () => {
      await setupHero();
      const { heroLevel } = useTalentPrerequisites();

      expect(heroLevel.value).toBe(5);
    });

    it('returns defaults when no hero loaded', () => {
      const { heroTalentIds, characterSkills, idealLevel, heroLevel } = useTalentPrerequisites();

      expect(heroTalentIds.value.size).toBe(0);
      expect(characterSkills.value.size).toBe(0);
      expect(idealLevel.value).toBe(0);
      expect(heroLevel.value).toBe(1);
    });
  });

  // ========================================
  // checkTalentPrerequisites
  // ========================================
  describe('checkTalentPrerequisites', () => {
    it('returns met=true for talent without prerequisites', async () => {
      await setupHero();
      const { checkTalentPrerequisites } = useTalentPrerequisites();

      const talent = createMockTalent({ id: 100 });
      const result = checkTalentPrerequisites(talent, new Set(), new Map());

      expect(result.met).toBe(true);
      expect(result.unmetPrereqs).toHaveLength(0);
    });

    it('returns met=true for empty prerequisites array', async () => {
      await setupHero();
      const { checkTalentPrerequisites } = useTalentPrerequisites();

      const talent = createMockTalent({ id: 100, prerequisites: [] });
      const result = checkTalentPrerequisites(talent, new Set(), new Map());

      expect(result.met).toBe(true);
    });

    describe('talent prerequisites', () => {
      it('checks if required talent is selected', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 102,
          prerequisites: [{ type: 'talent', talentIds: [100] }],
        });

        // Has talent 100
        const result1 = checkTalentPrerequisites(talent, new Set([100]), new Map());
        expect(result1.met).toBe(true);

        // Doesn't have talent 100
        const result2 = checkTalentPrerequisites(talent, new Set([101]), new Map());
        expect(result2.met).toBe(false);
        expect(result2.unmetPrereqs).toHaveLength(1);
      });

      it('accepts any of multiple talent options', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 999,
          prerequisites: [{ type: 'talent', talentIds: [100, 101, 102] }],
        });

        // Has talent 101 (one of the options)
        const result = checkTalentPrerequisites(talent, new Set([101]), new Map());
        expect(result.met).toBe(true);
      });

      it('handles empty talentIds array', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 999,
          prerequisites: [{ type: 'talent', talentIds: [] }],
        });

        const result = checkTalentPrerequisites(talent, new Set([100]), new Map());
        expect(result.met).toBe(false);
      });
    });

    describe('skill prerequisites', () => {
      it('checks skill rank requirement', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 103,
          prerequisites: [{ type: 'skill', skillId: 1, skillRank: 3 }],
        });

        // Has skill 1 at rank 3
        const skillsWithRank3 = new Map([[1, 3]]);
        const result1 = checkTalentPrerequisites(talent, new Set(), skillsWithRank3);
        expect(result1.met).toBe(true);

        // Has skill 1 at rank 2 (not enough)
        const skillsWithRank2 = new Map([[1, 2]]);
        const result2 = checkTalentPrerequisites(talent, new Set(), skillsWithRank2);
        expect(result2.met).toBe(false);
      });

      it('accepts higher skill rank than required', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 103,
          prerequisites: [{ type: 'skill', skillId: 1, skillRank: 2 }],
        });

        const skillsWithRank5 = new Map([[1, 5]]);
        const result = checkTalentPrerequisites(talent, new Set(), skillsWithRank5);
        expect(result.met).toBe(true);
      });

      it('returns unmet when skill not trained', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 103,
          prerequisites: [{ type: 'skill', skillId: 99, skillRank: 1 }],
        });

        const result = checkTalentPrerequisites(talent, new Set(), new Map());
        expect(result.met).toBe(false);
      });
    });

    describe('ideal prerequisites', () => {
      it('checks radiant ideal level', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 104,
          prerequisites: [{ type: 'ideal', skillRank: 2 }],
        });

        // Hero has ideal level 3, requires 2
        const result = checkTalentPrerequisites(talent, new Set(), new Map());
        expect(result.met).toBe(true);
      });

      it('fails when ideal too low', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 104,
          prerequisites: [{ type: 'ideal', skillRank: 5 }], // Requires 5
        });

        // Hero has ideal level 3
        const result = checkTalentPrerequisites(talent, new Set(), new Map());
        expect(result.met).toBe(false);
      });
    });

    describe('level prerequisites', () => {
      it('checks hero level', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 105,
          prerequisites: [{ type: 'level', skillRank: 5 }],
        });

        // Hero is level 5
        const result = checkTalentPrerequisites(talent, new Set(), new Map());
        expect(result.met).toBe(true);
      });

      it('fails when level too low', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 105,
          prerequisites: [{ type: 'level', skillRank: 10 }], // Requires 10
        });

        // Hero is level 5
        const result = checkTalentPrerequisites(talent, new Set(), new Map());
        expect(result.met).toBe(false);
      });
    });

    describe('multiple prerequisites', () => {
      it('requires all prerequisites to be met', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 106,
          prerequisites: [
            { type: 'talent', talentIds: [100] },
            { type: 'skill', skillId: 1, skillRank: 2 },
          ],
        });

        // Has both: talent 100 and skill 1 at rank 3
        const result = checkTalentPrerequisites(talent, new Set([100]), new Map([[1, 3]]));
        expect(result.met).toBe(true);
      });

      it('fails when any prerequisite is not met', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 106,
          prerequisites: [
            { type: 'talent', talentIds: [100] },
            { type: 'skill', skillId: 1, skillRank: 5 }, // Requires rank 5
          ],
        });

        // Has talent but skill rank is too low
        const result = checkTalentPrerequisites(talent, new Set([100]), new Map([[1, 3]]));
        expect(result.met).toBe(false);
        expect(result.unmetPrereqs).toHaveLength(1);
      });

      it('collects all unmet prerequisites', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 999,
          prerequisites: [
            { type: 'talent', talentIds: [999] }, // Unmet
            { type: 'skill', skillId: 99, skillRank: 5 }, // Unmet
          ],
        });

        const result = checkTalentPrerequisites(talent, new Set(), new Map());
        expect(result.met).toBe(false);
        expect(result.unmetPrereqs).toHaveLength(2);
      });
    });

    describe('unknown prerequisite types', () => {
      it('treats unknown types as met', async () => {
        await setupHero();
        const { checkTalentPrerequisites } = useTalentPrerequisites();

        const talent = createMockTalent({
          id: 999,
          prerequisites: [{ type: 'unknown' }],
        });

        const result = checkTalentPrerequisites(talent, new Set(), new Map());
        expect(result.met).toBe(true);
      });
    });
  });

  // ========================================
  // mapTalentsWithStatus
  // ========================================
  describe('mapTalentsWithStatus', () => {
    it('maps talents to TalentWithStatus', async () => {
      await setupHero();
      const { mapTalentsWithStatus } = useTalentPrerequisites();
      const classifiers = useClassifierStore();

      const talents = classifiers.talents.filter(
        (t) => t.path?.id === 1 && t.specialties.length === 0
      );
      const result = mapTalentsWithStatus(talents);

      expect(result).toBeInstanceOf(Array);
      result.forEach((item) => {
        expect(item).toHaveProperty('talent');
        expect(item).toHaveProperty('available');
        expect(item).toHaveProperty('unmetPrereqs');
      });
    });

    it('marks available talents correctly', async () => {
      await setupHero();
      const { mapTalentsWithStatus } = useTalentPrerequisites();

      // Talent 100 has no prerequisites
      const talents = [
        createMockTalent({
          id: 100,
          code: 'power-strike',
          name: 'Power Strike',
          path: { id: 1, code: 'warrior', name: 'Warrior' },
        }),
      ];

      const result = mapTalentsWithStatus(talents);

      expect(result[0]?.available).toBe(true);
      expect(result[0]?.unmetPrereqs).toHaveLength(0);
    });

    it('marks unavailable talents with unmet prereqs', async () => {
      await setupHero();
      const { mapTalentsWithStatus } = useTalentPrerequisites();

      // Talent requiring skill rank 10 (hero has rank 3)
      const talents = [
        createMockTalent({
          id: 999,
          path: { id: 1, code: 'warrior', name: 'Warrior' },
          prerequisites: [{ type: 'skill', skillId: 1, skillRank: 10 }],
        }),
      ];

      const result = mapTalentsWithStatus(talents);

      expect(result[0]?.available).toBe(false);
      expect(result[0]?.unmetPrereqs).toHaveLength(1);
    });
  });

  // ========================================
  // toggleTalent
  // ========================================
  describe('toggleTalent', () => {
    it('adds talent when not selected and available', async () => {
      await setupHero();
      const { toggleTalent } = useTalentPrerequisites();
      const heroStore = useHeroStore();

      const initialCount = heroStore.hero?.talents.length ?? 0;

      toggleTalent(102, true); // Available - Mighty Blow (exists in mock classifiers)

      expect(heroStore.hero?.talents.length).toBe(initialCount + 1);
    });

    it('removes talent when already selected', async () => {
      await setupHero();
      const { toggleTalent, heroTalentIds } = useTalentPrerequisites();
      const heroStore = useHeroStore();

      const initialCount = heroStore.hero?.talents.length ?? 0;

      // Talent 100 is already selected
      expect(heroTalentIds.value.has(100)).toBe(true);

      toggleTalent(100, true);

      expect(heroStore.hero?.talents.length).toBe(initialCount - 1);
    });

    it('does not add unavailable talent', async () => {
      await setupHero();
      const { toggleTalent } = useTalentPrerequisites();
      const heroStore = useHeroStore();

      const initialCount = heroStore.hero?.talents.length ?? 0;

      toggleTalent(999, false); // Not available

      expect(heroStore.hero?.talents.length).toBe(initialCount);
    });
  });

  // ========================================
  // isTalentSelected
  // ========================================
  describe('isTalentSelected', () => {
    it('returns true for selected talent', async () => {
      await setupHero();
      const { isTalentSelected } = useTalentPrerequisites();

      expect(isTalentSelected(100)).toBe(true);
      expect(isTalentSelected(101)).toBe(true);
    });

    it('returns false for unselected talent', async () => {
      await setupHero();
      const { isTalentSelected } = useTalentPrerequisites();

      expect(isTalentSelected(999)).toBe(false);
    });
  });

  // ========================================
  // Talent Lookup Functions
  // ========================================
  describe('talent lookup functions', () => {
    beforeEach(async () => {
      await setupHero();
    });

    it('getTalentsByPath returns path talents without specialty', () => {
      const { getTalentsByPath } = useTalentPrerequisites();

      const talents = getTalentsByPath(1);

      expect(talents.length).toBeGreaterThan(0);
      talents.forEach((t) => {
        expect(t.path?.id).toBe(1);
        expect(t.specialties.length).toBe(0);
      });
    });

    it('getTalentsBySpecialty returns specialty talents', () => {
      const { getTalentsBySpecialty } = useTalentPrerequisites();

      const talents = getTalentsBySpecialty(10);

      expect(talents).toHaveLength(2);
      talents.forEach((t) => {
        expect(t.specialties.some((s: { id: number }) => s.id === 10)).toBe(true);
      });
    });

    it('getPathKeyTalent returns key talent for path', () => {
      const { getPathKeyTalent } = useTalentPrerequisites();

      const keyTalent = getPathKeyTalent(1);

      expect(keyTalent).toBeDefined();
      expect(keyTalent?.isKey).toBe(true);
      expect(keyTalent?.path?.id).toBe(1);
    });

    it('getTalentsByAncestry returns ancestry talents', () => {
      const { getTalentsByAncestry } = useTalentPrerequisites();

      const talents = getTalentsByAncestry(1);

      // Mock has 3 ancestry talents: 201 (key), 400, 401
      expect(talents).toHaveLength(3);
      talents.forEach((t) => {
        expect(t.ancestry?.id).toBe(1);
      });
    });

    it('getAncestryKeyTalent returns key talent for ancestry', () => {
      const { getAncestryKeyTalent } = useTalentPrerequisites();

      const keyTalent = getAncestryKeyTalent(1);

      expect(keyTalent).toBeDefined();
      expect(keyTalent?.isKey).toBe(true);
      expect(keyTalent?.ancestry?.id).toBe(1);
    });

    it('getTalentsByRadiantOrder returns order talents without surge', () => {
      const { getTalentsByRadiantOrder } = useTalentPrerequisites();

      const talents = getTalentsByRadiantOrder(1);

      // Mock has 4 radiant order talents without surge: 104, 202 (key), 500, 501
      expect(talents).toHaveLength(4);
      talents.forEach((t) => {
        expect(t.radiantOrder?.id).toBe(1);
        expect(t.surge).toBeNull();
      });
    });

    it('getRadiantOrderKeyTalent returns key talent for order', () => {
      const { getRadiantOrderKeyTalent } = useTalentPrerequisites();

      const keyTalent = getRadiantOrderKeyTalent(1);

      expect(keyTalent).toBeDefined();
      expect(keyTalent?.isKey).toBe(true);
      expect(keyTalent?.radiantOrder?.id).toBe(1);
    });

    it('getTalentsBySurge returns surge talents', () => {
      const { getTalentsBySurge } = useTalentPrerequisites();

      const talents = getTalentsBySurge(5);

      expect(talents).toHaveLength(2);
      talents.forEach((t) => {
        expect(t.surge?.id).toBe(5);
      });
    });

    it('getSpecialtiesByPath returns specialties for path', () => {
      const { getSpecialtiesByPath } = useTalentPrerequisites();

      const specialties = getSpecialtiesByPath(1);

      expect(specialties).toHaveLength(2);
      specialties.forEach((s) => {
        expect(s.path.id).toBe(1);
      });
    });
  });

  // ========================================
  // getPrerequisitesArray
  // ========================================
  describe('getPrerequisitesArray', () => {
    it('returns prerequisites array', async () => {
      await setupHero();
      const { getPrerequisitesArray } = useTalentPrerequisites();

      const talent = createMockTalent({
        id: 1,
        prerequisites: [{ type: 'skill', skillId: 1, skillRank: 3 }],
      });

      const result = getPrerequisitesArray(talent);

      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe('skill');
    });

    it('returns empty array when no prerequisites', async () => {
      await setupHero();
      const { getPrerequisitesArray } = useTalentPrerequisites();

      const talent = createMockTalent({ id: 1 });

      const result = getPrerequisitesArray(talent);

      expect(result).toEqual([]);
    });
  });

  // ========================================
  // formatPrereq
  // ========================================
  describe('formatPrereq', () => {
    it('formats skill prerequisite', async () => {
      await setupHero();
      const { formatPrereq } = useTalentPrerequisites();

      const prereq = {
        type: 'skill',
        skillId: 1,
        skillRank: 3,
      };

      const result = formatPrereq(prereq);

      // Should include skill name and rank
      expect(result).toContain('Athletics');
      expect(result).toContain('3');
    });

    it('formats talent prerequisite', async () => {
      await setupHero();
      const { formatPrereq } = useTalentPrerequisites();

      const prereq = {
        type: 'talent',
        talentIds: [100],
      };

      const result = formatPrereq(prereq);

      // Should include talent name
      expect(result).toContain('Power Strike');
    });
  });

  // ========================================
  // findById re-export
  // ========================================
  describe('findById', () => {
    it('is re-exported from composable', async () => {
      await setupHero();
      const { findById } = useTalentPrerequisites();

      const items = [
        { id: 1, name: 'One' },
        { id: 2, name: 'Two' },
      ];

      expect(findById(items, 1)?.name).toBe('One');
      expect(findById(items, 2)?.name).toBe('Two');
      expect(findById(items, 3)).toBeUndefined();
    });
  });
});
