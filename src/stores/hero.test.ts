import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHeroStore } from './hero';

// Control flag for import failure tests
let shouldFailImport = false;

// Mock the heroes module
vi.mock('src/mock/heroes', () => {
  return {
    get heroes() {
      if (shouldFailImport) {
        throw new Error('Import failed');
      }
      return [
        {
          id: 1,
          userId: 1,
          campaignId: 1,
          ancestryId: 1,
          startingKitId: null,
          activeSingerFormId: null,
          radiantOrderId: null,
          radiantIdeal: 0,
          name: 'Test Hero',
          level: 5,
          currentHealth: 20,
          currentFocus: 10,
          currentInvestiture: 5,
          attributes: [],
          defenses: [],
          derivedStats: [],
          skills: [],
          talents: [],
          expertises: [],
          equipment: [],
          currency: 100,
          conditions: [],
          injuries: [],
          goals: [],
          connections: [],
          companions: [],
          cultures: [],
        },
      ];
    },
  };
});

// Mock logger to suppress output during tests
vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('useHeroStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  // ========================================
  // Initial State
  // ========================================
  describe('initial state', () => {
    it('initializes with null hero', () => {
      const store = useHeroStore();
      expect(store.hero).toBeNull();
    });

    it('initializes with loading false', () => {
      const store = useHeroStore();
      expect(store.loading).toBe(false);
    });

    it('initializes with saving false', () => {
      const store = useHeroStore();
      expect(store.saving).toBe(false);
    });

    it('initializes with null error', () => {
      const store = useHeroStore();
      expect(store.error).toBeNull();
    });

    it('isLoaded returns false when no hero', () => {
      const store = useHeroStore();
      expect(store.isLoaded).toBe(false);
    });
  });

  // ========================================
  // initNewHero
  // ========================================
  describe('initNewHero', () => {
    it('creates empty hero with default values', () => {
      const store = useHeroStore();
      store.initNewHero();

      expect(store.hero).not.toBeNull();
      expect(store.hero?.id).toBe(0);
      expect(store.hero?.name).toBe('');
      expect(store.hero?.level).toBe(1);
    });

    it('sets campaignId when provided', () => {
      const store = useHeroStore();
      store.initNewHero(42);

      expect(store.hero?.campaignId).toBe(42);
    });

    it('sets isLoaded to true', () => {
      const store = useHeroStore();
      store.initNewHero();

      expect(store.isLoaded).toBe(true);
    });

    it('sets isNew to true for new hero', () => {
      const store = useHeroStore();
      store.initNewHero();

      expect(store.isNew).toBe(true);
    });

    it('resets temp id counter', () => {
      const store = useHeroStore();
      store.initNewHero();

      // First temp id should be -1
      expect(store.nextTempId()).toBe(-1);
    });
  });

  // ========================================
  // loadHero
  // ========================================
  describe('loadHero', () => {
    it('loads hero by id', async () => {
      const store = useHeroStore();
      await store.loadHero(1);

      expect(store.hero).not.toBeNull();
      expect(store.hero?.id).toBe(1);
      expect(store.hero?.name).toBe('Test Hero');
      expect(store.hero?.level).toBe(5);
    });

    it('sets loading state during load', async () => {
      const store = useHeroStore();
      const loadPromise = store.loadHero(1);

      // Can't reliably test loading=true during async, but we can verify it's false after
      await loadPromise;
      expect(store.loading).toBe(false);
    });

    it('sets error when hero not found', async () => {
      const store = useHeroStore();
      await store.loadHero(999);

      expect(store.hero).toBeNull();
      expect(store.error).toBe('Hero not found');
    });

    it('clears existing hero before loading', async () => {
      const store = useHeroStore();
      store.initNewHero();
      expect(store.hero).not.toBeNull();

      // Start loading - hero should be cleared immediately
      const loadPromise = store.loadHero(1);
      await loadPromise;

      expect(store.hero?.id).toBe(1);
    });

    it('sets isNew to false for loaded hero', async () => {
      const store = useHeroStore();
      await store.loadHero(1);

      expect(store.isNew).toBe(false);
    });

    it('handles race conditions by ignoring stale requests', async () => {
      const store = useHeroStore();

      // Start two loads rapidly
      const load1 = store.loadHero(1);
      const load2 = store.loadHero(1);

      await Promise.all([load1, load2]);

      // Should still have a valid result
      expect(store.hero?.id).toBe(1);
      expect(store.loading).toBe(false);
    });

    it('sets error on import failure', async () => {
      const store = useHeroStore();

      // Enable import failure
      shouldFailImport = true;

      await store.loadHero(1);

      expect(store.hero).toBeNull();
      expect(store.error).toBe('Failed to load hero');

      // Reset for other tests
      shouldFailImport = false;
    });
  });

  // ========================================
  // clearHero
  // ========================================
  describe('clearHero', () => {
    it('clears hero state', () => {
      const store = useHeroStore();
      store.initNewHero();
      expect(store.hero).not.toBeNull();

      store.clearHero();
      expect(store.hero).toBeNull();
    });

    it('clears error state', () => {
      const store = useHeroStore();
      store.setError('test error');
      expect(store.error).toBe('test error');

      store.clearHero();
      expect(store.error).toBeNull();
    });

    it('resets temp id counter', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.nextTempId(); // -1
      store.nextTempId(); // -2

      store.clearHero();
      store.initNewHero();

      expect(store.nextTempId()).toBe(-1);
    });
  });

  // ========================================
  // setName
  // ========================================
  describe('setName', () => {
    it('sets hero name', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.setName('Kaladin');

      expect(store.hero?.name).toBe('Kaladin');
    });

    it('trims whitespace', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.setName('  Kaladin  ');

      expect(store.hero?.name).toBe('Kaladin');
    });

    it('truncates to 100 characters', () => {
      const store = useHeroStore();
      store.initNewHero();
      const longName = 'A'.repeat(150);
      store.setName(longName);

      expect(store.hero?.name).toBe('A'.repeat(100));
    });

    it('does nothing when no hero loaded', () => {
      const store = useHeroStore();
      store.setName('Test');

      expect(store.hero).toBeNull();
    });

    it('handles empty string', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.setName('Kaladin');
      store.setName('');

      expect(store.hero?.name).toBe('');
    });

    it('rejects non-string name', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.setName('Valid');
      // @ts-expect-error testing invalid input
      store.setName(123);

      expect(store.hero?.name).toBe('Valid'); // unchanged
    });
  });

  // ========================================
  // setLevel
  // ========================================
  describe('setLevel', () => {
    it('sets valid level', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.setLevel(10);

      expect(store.hero?.level).toBe(10);
    });

    it('rejects level below 1', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.setLevel(0);

      expect(store.hero?.level).toBe(1); // unchanged
    });

    it('rejects level above 20', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.setLevel(21);

      expect(store.hero?.level).toBe(1); // unchanged
    });

    it('rejects non-integer level', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.setLevel(5.5);

      expect(store.hero?.level).toBe(1); // unchanged
    });

    it('does nothing when no hero loaded', () => {
      const store = useHeroStore();
      store.setLevel(10);

      expect(store.hero).toBeNull();
    });
  });

  // ========================================
  // updateResources
  // ========================================
  describe('updateResources', () => {
    it('updates health', () => {
      const store = useHeroStore();
      store.initNewHero();
      const result = store.updateResources({ currentHealth: 15 });

      expect(result.success).toBe(true);
      expect(store.hero?.currentHealth).toBe(15);
    });

    it('updates focus', () => {
      const store = useHeroStore();
      store.initNewHero();
      const result = store.updateResources({ currentFocus: 8 });

      expect(result.success).toBe(true);
      expect(store.hero?.currentFocus).toBe(8);
    });

    it('updates investiture', () => {
      const store = useHeroStore();
      store.initNewHero();
      const result = store.updateResources({ currentInvestiture: 3 });

      expect(result.success).toBe(true);
      expect(store.hero?.currentInvestiture).toBe(3);
    });

    it('updates multiple resources at once', () => {
      const store = useHeroStore();
      store.initNewHero();
      const result = store.updateResources({
        currentHealth: 20,
        currentFocus: 10,
        currentInvestiture: 5,
      });

      expect(result.success).toBe(true);
      expect(store.hero?.currentHealth).toBe(20);
      expect(store.hero?.currentFocus).toBe(10);
      expect(store.hero?.currentInvestiture).toBe(5);
    });

    it('clamps negative values to 0', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.updateResources({ currentHealth: -5 });

      expect(store.hero?.currentHealth).toBe(0);
    });

    it('floors decimal values', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.updateResources({ currentHealth: 10.7 });

      expect(store.hero?.currentHealth).toBe(10);
    });

    it('returns error when no hero loaded', () => {
      const store = useHeroStore();
      const result = store.updateResources({ currentHealth: 15 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('No hero loaded');
    });

    it('handles exception during update', () => {
      const store = useHeroStore();
      store.initNewHero();

      // Make currentHealth a getter that throws
      Object.defineProperty(store.hero!, 'currentHealth', {
        set: () => {
          throw new Error('Update failed');
        },
        get: () => 0,
      });

      const result = store.updateResources({ currentHealth: 15 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update resources');
    });
  });

  // ========================================
  // nextTempId
  // ========================================
  describe('nextTempId', () => {
    it('returns negative ids', () => {
      const store = useHeroStore();
      store.initNewHero();

      expect(store.nextTempId()).toBe(-1);
    });

    it('decrements counter each call', () => {
      const store = useHeroStore();
      store.initNewHero();

      expect(store.nextTempId()).toBe(-1);
      expect(store.nextTempId()).toBe(-2);
      expect(store.nextTempId()).toBe(-3);
    });
  });

  // ========================================
  // Array Getters
  // ========================================
  describe('array getters', () => {
    it('returns empty arrays when no hero', () => {
      const store = useHeroStore();

      expect(store.talents).toEqual([]);
      expect(store.skills).toEqual([]);
      expect(store.expertises).toEqual([]);
      expect(store.equipment).toEqual([]);
      expect(store.goals).toEqual([]);
      expect(store.connections).toEqual([]);
      expect(store.companions).toEqual([]);
      expect(store.conditions).toEqual([]);
      expect(store.injuries).toEqual([]);
      expect(store.cultures).toEqual([]);
    });

    it('returns hero arrays when loaded', () => {
      const store = useHeroStore();
      store.initNewHero();

      // All arrays start empty on new hero
      expect(store.talents).toEqual([]);
      expect(store.skills).toEqual([]);
    });
  });

  // ========================================
  // setError
  // ========================================
  describe('setError', () => {
    it('sets error message', () => {
      const store = useHeroStore();
      store.setError('Something went wrong');

      expect(store.error).toBe('Something went wrong');
    });
  });

  // ========================================
  // setCampaignId
  // ========================================
  describe('setCampaignId', () => {
    it('sets campaign id', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.setCampaignId(5);

      expect(store.hero?.campaignId).toBe(5);
    });

    it('sets campaign id to null', () => {
      const store = useHeroStore();
      store.initNewHero(10);
      store.setCampaignId(null);

      expect(store.hero?.campaignId).toBeNull();
    });

    it('does nothing when no hero loaded', () => {
      const store = useHeroStore();
      store.setCampaignId(5);

      expect(store.hero).toBeNull();
    });
  });
});
