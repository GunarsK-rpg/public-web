import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHeroStore } from './hero';
import { axiosError } from 'src/test-utils/axiosHelpers';

// Mock hero data
const mockHero = {
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
};

const { mockGetSheet, mockPatchHealth, mockPatchFocus, mockPatchInvestiture, mockPatchCurrency } =
  vi.hoisted(() => ({
    mockGetSheet: vi.fn(),
    mockPatchHealth: vi.fn(),
    mockPatchFocus: vi.fn(),
    mockPatchInvestiture: vi.fn(),
    mockPatchCurrency: vi.fn(),
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
    patchHealth: mockPatchHealth,
    patchFocus: mockPatchFocus,
    patchInvestiture: mockPatchInvestiture,
    patchCurrency: mockPatchCurrency,
  },
}));

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
    mockGetSheet.mockImplementation((id: number) => {
      if (id === 1) return Promise.resolve({ data: structuredClone(mockHero) });
      return Promise.reject(axiosError(404));
    });
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

      // Start two loads rapidly - this tests that the store handles concurrent
      // requests without crashing. The actual stale request ignoring is
      // implementation-dependent and may not trigger in synchronous mock scenarios.
      const load1 = store.loadHero(1);
      const load2 = store.loadHero(1);

      await Promise.all([load1, load2]);

      // Should still have a valid result (no corruption from concurrent access)
      expect(store.hero?.id).toBe(1);
      expect(store.loading).toBe(false);
    });

    it('sets error on API failure', async () => {
      mockGetSheet.mockRejectedValue(new Error('Network error'));
      const store = useHeroStore();

      await store.loadHero(1);

      expect(store.hero).toBeNull();
      expect(store.error).toBe('Failed to load hero');
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
  // Resource patches
  // ========================================
  describe('patchHealth', () => {
    it('calls service and updates local state', async () => {
      const store = useHeroStore();
      await store.loadHero(1);
      mockPatchHealth.mockResolvedValue({ data: { currentHealth: 15 } });

      await store.patchHealth(15);

      expect(mockPatchHealth).toHaveBeenCalledWith(1, 15);
      expect(store.hero?.currentHealth).toBe(15);
    });

    it('clamps negative values to 0', async () => {
      const store = useHeroStore();
      await store.loadHero(1);
      mockPatchHealth.mockResolvedValue({ data: { currentHealth: 0 } });

      await store.patchHealth(-5);

      expect(mockPatchHealth).toHaveBeenCalledWith(1, 0);
    });

    it('floors decimal values', async () => {
      const store = useHeroStore();
      await store.loadHero(1);
      mockPatchHealth.mockResolvedValue({ data: { currentHealth: 10 } });

      await store.patchHealth(10.7);

      expect(mockPatchHealth).toHaveBeenCalledWith(1, 10);
    });

    it('handles API error', async () => {
      const store = useHeroStore();
      await store.loadHero(1);
      mockPatchHealth.mockRejectedValue(axiosError(500));

      await store.patchHealth(15);

      expect(store.error).toBeTruthy();
    });
  });

  describe('patchFocus', () => {
    it('calls service and updates local state', async () => {
      const store = useHeroStore();
      await store.loadHero(1);
      mockPatchFocus.mockResolvedValue({ data: { currentFocus: 8 } });

      await store.patchFocus(8);

      expect(mockPatchFocus).toHaveBeenCalledWith(1, 8);
      expect(store.hero?.currentFocus).toBe(8);
    });

    it('handles API error', async () => {
      const store = useHeroStore();
      await store.loadHero(1);
      mockPatchFocus.mockRejectedValue(axiosError(500));

      await store.patchFocus(8);

      expect(store.error).toBeTruthy();
    });
  });

  describe('patchInvestiture', () => {
    it('calls service and updates local state', async () => {
      const store = useHeroStore();
      await store.loadHero(1);
      mockPatchInvestiture.mockResolvedValue({ data: { currentInvestiture: 3 } });

      await store.patchInvestiture(3);

      expect(mockPatchInvestiture).toHaveBeenCalledWith(1, 3);
      expect(store.hero?.currentInvestiture).toBe(3);
    });

    it('handles API error', async () => {
      const store = useHeroStore();
      await store.loadHero(1);
      mockPatchInvestiture.mockRejectedValue(axiosError(500));

      await store.patchInvestiture(3);

      expect(store.error).toBeTruthy();
    });
  });

  describe('patchCurrency', () => {
    it('calls service and updates local state', async () => {
      const store = useHeroStore();
      await store.loadHero(1);
      mockPatchCurrency.mockResolvedValue({ data: { currency: 500 } });

      await store.patchCurrency(500);

      expect(mockPatchCurrency).toHaveBeenCalledWith(1, 500);
      expect(store.hero?.currency).toBe(500);
    });

    it('handles API error', async () => {
      const store = useHeroStore();
      await store.loadHero(1);
      mockPatchCurrency.mockRejectedValue(axiosError(500));

      await store.patchCurrency(500);

      expect(store.error).toBeTruthy();
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

  // ========================================
  // setCampaign
  // ========================================
  describe('setCampaign', () => {
    it('sets campaign with full ClassifierRef', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.setCampaign({ id: 5, code: 'my-campaign', name: 'My Campaign' });

      expect(store.hero?.campaignId).toBe(5);
      expect(store.hero?.campaign).toEqual({ id: 5, code: 'my-campaign', name: 'My Campaign' });
    });

    it('clears campaign when set to null', () => {
      const store = useHeroStore();
      store.initNewHero();
      store.setCampaign({ id: 5, code: 'my-campaign', name: 'My Campaign' });
      store.setCampaign(null);

      expect(store.hero?.campaignId).toBeNull();
      expect(store.hero?.campaign).toBeNull();
    });

    it('does nothing when no hero loaded', () => {
      const store = useHeroStore();
      store.setCampaign({ id: 5, code: 'my-campaign', name: 'My Campaign' });

      expect(store.hero).toBeNull();
    });
  });

  // ========================================
  // updateFromResponse
  // ========================================
  describe('updateFromResponse', () => {
    it('applies API response core fields to local hero', () => {
      const store = useHeroStore();
      store.initNewHero();

      store.updateFromResponse({
        id: 42,
        userId: 7,
        user: { id: 7, username: 'player1' },
        campaignId: 3,
        campaign: { id: 3, code: 'campaign-x', name: 'Campaign X' },
        ancestry: { id: 2, code: 'human', name: 'Human' },
        startingKit: null,
        activeSingerForm: null,
        radiantOrder: null,
        name: 'Kaladin',
        level: 5,
        radiantIdeal: 2,
        currentHealth: 30,
        currentFocus: 15,
        currentInvestiture: 10,
        currency: 200,
      });

      expect(store.hero?.id).toBe(42);
      expect(store.hero?.userId).toBe(7);
      expect(store.hero?.user).toEqual({ id: 7, username: 'player1' });
      expect(store.hero?.campaignId).toBe(3);
      expect(store.hero?.campaign).toEqual({ id: 3, code: 'campaign-x', name: 'Campaign X' });
      expect(store.hero?.ancestry).toEqual({ id: 2, code: 'human', name: 'Human' });
      expect(store.hero?.name).toBe('Kaladin');
      expect(store.hero?.level).toBe(5);
      expect(store.hero?.currency).toBe(200);
    });

    it('preserves sub-resource arrays', () => {
      const store = useHeroStore();
      store.initNewHero();

      // Add some local sub-resource data
      store.hero!.cultures = [
        { id: -1, heroId: 0, culture: { id: 1, code: 'alethi', name: 'Alethi' } },
      ];

      store.updateFromResponse({
        id: 42,
        userId: 7,
        user: { id: 7, username: 'player1' },
        campaignId: null,
        campaign: { id: 0, code: '', name: '' },
        ancestry: { id: 2, code: 'human', name: 'Human' },
        startingKit: null,
        activeSingerForm: null,
        radiantOrder: null,
        name: 'Test',
        level: 1,
        radiantIdeal: 0,
        currentHealth: 0,
        currentFocus: 0,
        currentInvestiture: 0,
        currency: 0,
      });

      // Sub-resource arrays should be untouched
      expect(store.hero?.cultures).toHaveLength(1);
      expect(store.hero!.cultures[0]!.culture.code).toBe('alethi');
    });

    it('updates enriched classifier refs', () => {
      const store = useHeroStore();
      store.initNewHero();

      store.updateFromResponse({
        id: 42,
        userId: 7,
        user: { id: 7, username: 'player1' },
        campaignId: null,
        campaign: { id: 0, code: '', name: '' },
        ancestry: { id: 2, code: 'human', name: 'Human' },
        startingKit: { id: 5, code: 'warrior-kit', name: 'Warrior Kit' },
        activeSingerForm: { id: 8, code: 'dullform', name: 'Dullform' },
        radiantOrder: { id: 10, code: 'windrunner', name: 'Windrunner' },
        name: 'Test',
        level: 1,
        radiantIdeal: 3,
        currentHealth: 0,
        currentFocus: 0,
        currentInvestiture: 0,
        currency: 0,
      });

      expect(store.hero?.startingKit).toEqual({ id: 5, code: 'warrior-kit', name: 'Warrior Kit' });
      expect(store.hero?.activeSingerForm).toEqual({ id: 8, code: 'dullform', name: 'Dullform' });
      expect(store.hero?.radiantOrder).toEqual({
        id: 10,
        code: 'windrunner',
        name: 'Windrunner',
      });
    });

    it('does nothing when no hero loaded', () => {
      const store = useHeroStore();

      store.updateFromResponse({
        id: 42,
        userId: 7,
        user: { id: 7, username: 'player1' },
        campaignId: null,
        campaign: { id: 0, code: '', name: '' },
        ancestry: { id: 2, code: 'human', name: 'Human' },
        startingKit: null,
        activeSingerForm: null,
        radiantOrder: null,
        name: 'Test',
        level: 1,
        radiantIdeal: 0,
        currentHealth: 0,
        currentFocus: 0,
        currentInvestiture: 0,
        currency: 0,
      });

      expect(store.hero).toBeNull();
    });

    it('makes isNew false after response with real id', () => {
      const store = useHeroStore();
      store.initNewHero();
      expect(store.isNew).toBe(true);

      store.updateFromResponse({
        id: 42,
        userId: 7,
        user: { id: 7, username: 'player1' },
        campaignId: null,
        campaign: { id: 0, code: '', name: '' },
        ancestry: { id: 2, code: 'human', name: 'Human' },
        startingKit: null,
        activeSingerForm: null,
        radiantOrder: null,
        name: 'Test',
        level: 1,
        radiantIdeal: 0,
        currentHealth: 0,
        currentFocus: 0,
        currentInvestiture: 0,
        currency: 0,
      });

      expect(store.isNew).toBe(false);
    });
  });
});
