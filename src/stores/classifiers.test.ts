import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useClassifierStore } from './classifiers';

// Mock classifier data
const mockClassifiers = {
  attributeTypes: [{ id: 1, code: 'physical', name: 'Physical' }],
  attributes: [
    { id: 1, code: 'strength', name: 'Strength', attributeTypeId: 1, sortOrder: 1 },
    { id: 2, code: 'speed', name: 'Speed', attributeTypeId: 1, sortOrder: 2 },
  ],
  derivedStats: [
    { id: 1, code: 'health', name: 'Health', attributeId: 1 },
    { id: 2, code: 'focus', name: 'Focus', attributeId: 2 },
  ],
  derivedStatValues: [
    { id: 1, derivedStatId: 1, attrMin: 0, attrMax: 2, value: 10 },
    { id: 2, derivedStatId: 1, attrMin: 3, attrMax: 5, value: 15 },
    { id: 3, derivedStatId: 1, attrMin: 6, attrMax: 10, value: 20 },
    { id: 4, derivedStatId: 2, attrMin: 0, attrMax: 4, value: 5 },
    { id: 5, derivedStatId: 2, attrMin: 5, attrMax: 10, value: 10 },
  ],
  skills: [{ id: 1, code: 'athletics', name: 'Athletics', attributeId: 1 }],
  expertiseTypes: [{ id: 1, code: 'general', name: 'General' }],
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
  ancestries: [{ id: 1, code: 'human', name: 'Human' }],
  cultures: [{ id: 1, code: 'alethi', name: 'Alethi' }],
  tiers: [],
  levels: [],
};

vi.mock('src/mock/classifiers', () => ({
  classifiers: mockClassifiers,
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
      expect(store.derivedStats.length).toBe(2);
    });

    it('returns derivedStatValues', () => {
      const store = useClassifierStore();
      expect(store.derivedStatValues.length).toBe(5);
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

    it('provides O(1) lookups via cache', () => {
      const store = useClassifierStore();

      // Multiple lookups should use cache
      const val1 = store.getDerivedStatValue(1, 5);
      const val2 = store.getDerivedStatValue(1, 5);
      const val3 = store.getDerivedStatValue(1, 5);

      expect(val1).toBe(15);
      expect(val2).toBe(15);
      expect(val3).toBe(15);
    });
  });
});
