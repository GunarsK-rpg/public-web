import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useClassifierStore } from './classifiers';

// Mock classifier data
const mockClassifiers = {
  attributeTypes: [{ id: 1, code: 'physical', name: 'Physical' }],
  attributes: [
    {
      id: 1,
      code: 'strength',
      name: 'Strength',
      attrType: { id: 1, code: 'physical', name: 'Physical' },
    },
    {
      id: 2,
      code: 'speed',
      name: 'Speed',
      attrType: { id: 1, code: 'physical', name: 'Physical' },
    },
  ],
  derivedStats: [
    { id: 1, code: 'health', name: 'Health' },
    { id: 2, code: 'focus', name: 'Focus' },
    { id: 3, code: 'special', name: 'Special' },
  ],
  derivedStatValues: [
    {
      id: 1,
      derivedStat: { id: 1, code: 'health', name: 'Health' },
      attr: { id: 1, code: 'strength', name: 'Strength' },
      attrMin: 0,
      attrMax: 2,
      value: 10,
    },
    {
      id: 2,
      derivedStat: { id: 1, code: 'health', name: 'Health' },
      attr: { id: 1, code: 'strength', name: 'Strength' },
      attrMin: 3,
      attrMax: 5,
      value: 15,
    },
    {
      id: 3,
      derivedStat: { id: 1, code: 'health', name: 'Health' },
      attr: { id: 1, code: 'strength', name: 'Strength' },
      attrMin: 6,
      attrMax: 10,
      value: 20,
    },
    {
      id: 4,
      derivedStat: { id: 2, code: 'focus', name: 'Focus' },
      attr: { id: 2, code: 'speed', name: 'Speed' },
      attrMin: 0,
      attrMax: 4,
      value: 5,
    },
    {
      id: 5,
      derivedStat: { id: 2, code: 'focus', name: 'Focus' },
      attr: { id: 2, code: 'speed', name: 'Speed' },
      attrMin: 5,
      attrMax: 10,
      value: 10,
    },
    // Entry with null attrMax (should default to MAX_ATTRIBUTE_VALUE=10)
    {
      id: 6,
      derivedStat: { id: 3, code: 'special', name: 'Special' },
      attr: { id: 1, code: 'strength', name: 'Strength' },
      attrMin: 0,
      attrMax: null,
      value: 100,
    },
  ],
  skills: [
    {
      id: 1,
      code: 'athletics',
      name: 'Athletics',
      attr: { id: 1, code: 'strength', name: 'Strength' },
    },
  ],
  expertiseTypes: [{ id: 1, code: 'general', name: 'General' }],
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
  units: [],
  equipmentTypes: [],
  damageTypes: [],
  equipmentAttributes: [],
  equipment: [],
  conditions: [],
  injuries: [],
  goalStatuses: [],
  connectionTypes: [],
  startingKits: [],
  ancestries: [{ id: 1, code: 'human', name: 'Human' }],
  cultures: [{ id: 1, code: 'alethi', name: 'Alethi' }],
  tiers: [],
  levels: [],
};

const { mockGetAll } = vi.hoisted(() => ({
  mockGetAll: vi.fn(),
}));

vi.mock('src/services/classifierService', () => ({
  default: {
    getAll: mockGetAll,
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

describe('useClassifierStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockGetAll.mockResolvedValue({ data: mockClassifiers });
  });

  // ========================================
  // Initial State
  // ========================================
  describe('initial state', () => {
    it('starts with null data', () => {
      const store = useClassifierStore();
      expect(store.data).toBeNull();
    });

    it('starts not loading', () => {
      const store = useClassifierStore();
      expect(store.loading).toBe(false);
    });

    it('starts with no error', () => {
      const store = useClassifierStore();
      expect(store.error).toBeNull();
    });

    it('starts not initialized', () => {
      const store = useClassifierStore();
      expect(store.initialized).toBe(false);
    });
  });

  // ========================================
  // Computed Getters (before init)
  // ========================================
  describe('computed getters before initialization', () => {
    it('returns empty arrays when not initialized', () => {
      const store = useClassifierStore();

      expect(store.attributes).toEqual([]);
      expect(store.skills).toEqual([]);
      expect(store.expertises).toEqual([]);
      expect(store.ancestries).toEqual([]);
      expect(store.cultures).toEqual([]);
    });
  });

  // ========================================
  // Initialize
  // ========================================
  describe('initialize', () => {
    it('loads classifier data', async () => {
      const store = useClassifierStore();
      await store.initialize();

      expect(store.data).not.toBeNull();
      expect(store.initialized).toBe(true);
      expect(mockGetAll).toHaveBeenCalledOnce();
    });

    it('sets loading state during load', async () => {
      const store = useClassifierStore();

      // Start init but don't await
      const promise = store.initialize();

      // After await, loading should be false
      await promise;
      expect(store.loading).toBe(false);
    });

    it('returns early if already initialized', async () => {
      const store = useClassifierStore();

      await store.initialize();
      expect(store.initialized).toBe(true);

      // Call again - should return immediately
      await store.initialize();
      expect(store.initialized).toBe(true);
      expect(mockGetAll).toHaveBeenCalledOnce();
    });

    it('handles concurrent calls (concurrency lock)', async () => {
      const store = useClassifierStore();

      // Start multiple concurrent calls
      const p1 = store.initialize();
      const p2 = store.initialize();
      const p3 = store.initialize();

      await Promise.all([p1, p2, p3]);

      // Should only have loaded once
      expect(store.initialized).toBe(true);
      expect(mockGetAll).toHaveBeenCalledOnce();
    });
  });

  // ========================================
  // Computed Getters (after init)
  // ========================================
  describe('computed getters after initialization', () => {
    beforeEach(async () => {
      const store = useClassifierStore();
      await store.initialize();
    });

    it('returns attributes', () => {
      const store = useClassifierStore();
      expect(store.attributes.length).toBe(2);
      expect(store.attributes[0]!.code).toBe('strength');
    });

    it('returns skills', () => {
      const store = useClassifierStore();
      expect(store.skills.length).toBe(1);
      expect(store.skills[0]!.code).toBe('athletics');
    });

    it('returns expertises', () => {
      const store = useClassifierStore();
      expect(store.expertises.length).toBe(1);
      expect(store.expertises[0]!.code).toBe('climbing');
    });

    it('returns ancestries', () => {
      const store = useClassifierStore();
      expect(store.ancestries.length).toBe(1);
      expect(store.ancestries[0]!.code).toBe('human');
    });

    it('returns cultures', () => {
      const store = useClassifierStore();
      expect(store.cultures.length).toBe(1);
      expect(store.cultures[0]!.code).toBe('alethi');
    });

    it('returns derivedStats', () => {
      const store = useClassifierStore();
      expect(store.derivedStats.length).toBe(3);
    });

    it('returns derivedStatValues', () => {
      const store = useClassifierStore();
      expect(store.derivedStatValues.length).toBe(6);
    });
  });

  // ========================================
  // getDerivedStatValue
  // ========================================
  describe('getDerivedStatValue', () => {
    beforeEach(async () => {
      const store = useClassifierStore();
      await store.initialize();
    });

    it('returns correct value for attribute in range', () => {
      const store = useClassifierStore();

      // derivedStatId 1 (health): attr 0-2 = 10, attr 3-5 = 15, attr 6-10 = 20
      expect(store.getDerivedStatValue(1, 0)).toBe(10);
      expect(store.getDerivedStatValue(1, 2)).toBe(10);
      expect(store.getDerivedStatValue(1, 3)).toBe(15);
      expect(store.getDerivedStatValue(1, 5)).toBe(15);
      expect(store.getDerivedStatValue(1, 6)).toBe(20);
      expect(store.getDerivedStatValue(1, 10)).toBe(20);
    });

    it('returns correct value for second derived stat', () => {
      const store = useClassifierStore();

      // derivedStatId 2 (focus): attr 0-4 = 5, attr 5-10 = 10
      expect(store.getDerivedStatValue(2, 0)).toBe(5);
      expect(store.getDerivedStatValue(2, 4)).toBe(5);
      expect(store.getDerivedStatValue(2, 5)).toBe(10);
      expect(store.getDerivedStatValue(2, 10)).toBe(10);
    });

    it('returns undefined for non-existent derived stat', () => {
      const store = useClassifierStore();
      expect(store.getDerivedStatValue(999, 5)).toBeUndefined();
    });

    it('returns undefined for null derived stat id', () => {
      const store = useClassifierStore();
      expect(store.getDerivedStatValue(null, 5)).toBeUndefined();
    });

    it('returns undefined for undefined derived stat id', () => {
      const store = useClassifierStore();
      expect(store.getDerivedStatValue(undefined, 5)).toBeUndefined();
    });

    it('returns undefined for attribute value outside range', () => {
      const store = useClassifierStore();
      // No values defined for attr > 10
      expect(store.getDerivedStatValue(1, 11)).toBeUndefined();
    });

    it('handles null attrMax by defaulting to MAX_ATTRIBUTE_VALUE', () => {
      const store = useClassifierStore();
      // derivedStatId 3 has attrMax: null, should default to 10
      expect(store.getDerivedStatValue(3, 0)).toBe(100);
      expect(store.getDerivedStatValue(3, 5)).toBe(100);
      expect(store.getDerivedStatValue(3, 10)).toBe(100);
      expect(store.getDerivedStatValue(3, 11)).toBeUndefined();
    });
  });

  // ========================================
  // Reset
  // ========================================
  describe('reset', () => {
    it('clears data', async () => {
      const store = useClassifierStore();
      await store.initialize();
      expect(store.data).not.toBeNull();

      store.reset();
      expect(store.data).toBeNull();
    });

    it('sets initialized to false', async () => {
      const store = useClassifierStore();
      await store.initialize();
      expect(store.initialized).toBe(true);

      store.reset();
      expect(store.initialized).toBe(false);
    });

    it('clears error', () => {
      const store = useClassifierStore();
      // Manually set error for test
      store.error = 'test error';

      store.reset();
      expect(store.error).toBeNull();
    });

    it('allows re-initialization after reset', async () => {
      const store = useClassifierStore();
      await store.initialize();
      store.reset();

      await store.initialize();
      expect(store.initialized).toBe(true);
      expect(store.data).not.toBeNull();
    });
  });

  // ========================================
  // derivedStatValueCache
  // ========================================
  describe('derivedStatValueCache', () => {
    beforeEach(async () => {
      const store = useClassifierStore();
      await store.initialize();
    });

    it('returns consistent values across multiple lookups', () => {
      const store = useClassifierStore();

      // Multiple lookups should return the same cached value
      const val1 = store.getDerivedStatValue(1, 5);
      const val2 = store.getDerivedStatValue(1, 5);
      const val3 = store.getDerivedStatValue(1, 5);

      expect(val1).toBe(15);
      expect(val2).toBe(15);
      expect(val3).toBe(15);
    });
  });

  // ========================================
  // All Computed Getters Fallback
  // ========================================
  describe('all computed getters return empty arrays when data is null', () => {
    it('returns empty attributeTypes', () => {
      const store = useClassifierStore();
      expect(store.attributeTypes).toEqual([]);
    });

    it('returns empty derivedStats', () => {
      const store = useClassifierStore();
      expect(store.derivedStats).toEqual([]);
    });

    it('returns empty derivedStatValues', () => {
      const store = useClassifierStore();
      expect(store.derivedStatValues).toEqual([]);
    });

    it('returns empty expertiseTypes', () => {
      const store = useClassifierStore();
      expect(store.expertiseTypes).toEqual([]);
    });

    it('returns empty activationTypes', () => {
      const store = useClassifierStore();
      expect(store.activationTypes).toEqual([]);
    });

    it('returns empty actionTypes', () => {
      const store = useClassifierStore();
      expect(store.actionTypes).toEqual([]);
    });

    it('returns empty actions', () => {
      const store = useClassifierStore();
      expect(store.actions).toEqual([]);
    });

    it('returns empty actionLinks', () => {
      const store = useClassifierStore();
      expect(store.actionLinks).toEqual([]);
    });

    it('returns empty paths', () => {
      const store = useClassifierStore();
      expect(store.paths).toEqual([]);
    });

    it('returns empty specialties', () => {
      const store = useClassifierStore();
      expect(store.specialties).toEqual([]);
    });

    it('returns empty surges', () => {
      const store = useClassifierStore();
      expect(store.surges).toEqual([]);
    });

    it('returns empty radiantOrders', () => {
      const store = useClassifierStore();
      expect(store.radiantOrders).toEqual([]);
    });

    it('returns empty singerForms', () => {
      const store = useClassifierStore();
      expect(store.singerForms).toEqual([]);
    });

    it('returns empty talents', () => {
      const store = useClassifierStore();
      expect(store.talents).toEqual([]);
    });

    it('returns empty units', () => {
      const store = useClassifierStore();
      expect(store.units).toEqual([]);
    });

    it('returns empty equipmentTypes', () => {
      const store = useClassifierStore();
      expect(store.equipmentTypes).toEqual([]);
    });

    it('returns empty damageTypes', () => {
      const store = useClassifierStore();
      expect(store.damageTypes).toEqual([]);
    });

    it('returns empty equipmentAttributes', () => {
      const store = useClassifierStore();
      expect(store.equipmentAttributes).toEqual([]);
    });

    it('returns empty equipment', () => {
      const store = useClassifierStore();
      expect(store.equipment).toEqual([]);
    });

    it('returns empty conditions', () => {
      const store = useClassifierStore();
      expect(store.conditions).toEqual([]);
    });

    it('returns empty injuries', () => {
      const store = useClassifierStore();
      expect(store.injuries).toEqual([]);
    });

    it('returns empty goalStatuses', () => {
      const store = useClassifierStore();
      expect(store.goalStatuses).toEqual([]);
    });

    it('returns empty connectionTypes', () => {
      const store = useClassifierStore();
      expect(store.connectionTypes).toEqual([]);
    });

    it('returns empty startingKits', () => {
      const store = useClassifierStore();
      expect(store.startingKits).toEqual([]);
    });

    it('returns empty tiers', () => {
      const store = useClassifierStore();
      expect(store.tiers).toEqual([]);
    });

    it('returns empty levels', () => {
      const store = useClassifierStore();
      expect(store.levels).toEqual([]);
    });
  });

  // ========================================
  // Initialize Error Handling
  // ========================================
  describe('initialize error handling', () => {
    it('sets error on API failure', async () => {
      mockGetAll.mockRejectedValue(new Error('Network error'));
      const store = useClassifierStore();

      await store.initialize();

      expect(store.error).toBe('Failed to load classifiers');
      expect(store.initialized).toBe(false);
    });

    it('allows retry after failure', async () => {
      mockGetAll.mockRejectedValueOnce(new Error('Network error'));
      const store = useClassifierStore();

      await store.initialize();
      expect(store.error).toBe('Failed to load classifiers');
      expect(store.initialized).toBe(false);

      // Retry should work
      mockGetAll.mockResolvedValue({ data: mockClassifiers });
      await store.initialize();

      expect(store.initialized).toBe(true);
    });
  });
});
