import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCampaignStore } from './campaigns';
import { axiosError } from 'src/test-utils/axiosHelpers';

// Mock campaign data
const mockCampaigns = [
  { id: 1, name: 'Campaign One', description: 'First campaign' },
  { id: 2, name: 'Campaign Two', description: 'Second campaign' },
];

const mockCampaign1 = {
  id: 1,
  name: 'Campaign One',
  description: 'First campaign',
};

const mockCampaign2 = {
  id: 2,
  name: 'Campaign Two',
  description: 'Second campaign',
};

const mockHeroesCampaign1 = [{ id: 1, name: 'Hero A' }];
const mockHeroesCampaign2 = [
  { id: 2, name: 'Hero B' },
  { id: 3, name: 'Hero C' },
];

const { mockGetAll, mockGetById, mockHeroGetAll } = vi.hoisted(() => ({
  mockGetAll: vi.fn(),
  mockGetById: vi.fn(),
  mockHeroGetAll: vi.fn(),
}));

vi.mock('src/services/campaignService', () => ({
  default: {
    getAll: mockGetAll,
    getById: mockGetById,
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('src/services/heroService', () => ({
  default: {
    getAll: mockHeroGetAll,
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

describe('useCampaignStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockGetAll.mockResolvedValue({ data: mockCampaigns });
    mockGetById.mockImplementation((id: number) => {
      if (id === 1) return Promise.resolve({ data: mockCampaign1 });
      if (id === 2) return Promise.resolve({ data: mockCampaign2 });
      return Promise.reject(axiosError(404));
    });
    mockHeroGetAll.mockImplementation((campaignId: number) => {
      if (campaignId === 1)
        return Promise.resolve({ data: { data: mockHeroesCampaign1, total: 1 } });
      if (campaignId === 2)
        return Promise.resolve({ data: { data: mockHeroesCampaign2, total: 2 } });
      return Promise.resolve({ data: { data: [], total: 0 } });
    });
  });

  // ========================================
  // Initial State
  // ========================================
  describe('initial state', () => {
    it('starts with empty campaigns', () => {
      const store = useCampaignStore();
      expect(store.campaigns).toEqual([]);
    });

    it('starts with null currentCampaign', () => {
      const store = useCampaignStore();
      expect(store.currentCampaign).toBeNull();
    });

    it('starts not loading', () => {
      const store = useCampaignStore();
      expect(store.loading).toBe(false);
    });

    it('starts with no error', () => {
      const store = useCampaignStore();
      expect(store.error).toBeNull();
    });

    it('hasCampaigns is false when empty', () => {
      const store = useCampaignStore();
      expect(store.hasCampaigns).toBe(false);
    });
  });

  // ========================================
  // fetchCampaigns
  // ========================================
  describe('fetchCampaigns', () => {
    it('loads campaigns', async () => {
      const store = useCampaignStore();
      await store.fetchCampaigns();

      expect(store.campaigns.length).toBe(2);
      expect(store.campaigns[0]!.name).toBe('Campaign One');
    });

    it('sets hasCampaigns to true after loading', async () => {
      const store = useCampaignStore();
      await store.fetchCampaigns();

      expect(store.hasCampaigns).toBe(true);
    });

    it('sets loading false after completion', async () => {
      const store = useCampaignStore();
      await store.fetchCampaigns();

      expect(store.loading).toBe(false);
    });

    it('clears error on new fetch', async () => {
      const store = useCampaignStore();
      store.setError('previous error');

      await store.fetchCampaigns();

      expect(store.error).toBeNull();
    });

    it('handles race conditions by ignoring stale requests', async () => {
      const store = useCampaignStore();

      // Start two fetches rapidly
      const fetch1 = store.fetchCampaigns();
      const fetch2 = store.fetchCampaigns();

      await Promise.all([fetch1, fetch2]);

      // Should still have campaigns from the latest request
      expect(store.campaigns.length).toBe(2);
      expect(store.loading).toBe(false);
    });

    it('sets error on API failure', async () => {
      mockGetAll.mockRejectedValue(new Error('Network error'));
      const store = useCampaignStore();

      await store.fetchCampaigns();

      expect(store.campaigns).toEqual([]);
      expect(store.error).toBe('Failed to load campaigns');
    });
  });

  // ========================================
  // selectCampaign
  // ========================================
  describe('selectCampaign', () => {
    it('selects campaign by id', async () => {
      const store = useCampaignStore();
      await store.selectCampaign(1);

      expect(store.currentCampaign).not.toBeNull();
      expect(store.currentCampaign?.id).toBe(1);
      expect(store.currentCampaign?.name).toBe('Campaign One');
    });

    it('includes heroes in selected campaign', async () => {
      const store = useCampaignStore();
      await store.selectCampaign(2);

      expect(store.currentCampaign?.heroes.length).toBe(2);
    });

    it('sets error when campaign not found', async () => {
      const store = useCampaignStore();
      await store.selectCampaign(999);

      expect(store.currentCampaign).toBeNull();
      expect(store.error).toBe('Campaign not found');
    });

    it('sets loading false after completion', async () => {
      const store = useCampaignStore();
      await store.selectCampaign(1);

      expect(store.loading).toBe(false);
    });

    it('handles race conditions by ignoring stale requests', async () => {
      const store = useCampaignStore();

      // Start two selects rapidly
      const select1 = store.selectCampaign(1);
      const select2 = store.selectCampaign(2);

      await Promise.all([select1, select2]);

      // Should have the campaign from the latest request
      expect(store.currentCampaign?.id).toBe(2);
      expect(store.loading).toBe(false);
    });

    it('sets error on API failure', async () => {
      mockGetById.mockRejectedValue(new Error('Network error'));
      const store = useCampaignStore();

      await store.selectCampaign(1);

      expect(store.currentCampaign).toBeNull();
      expect(store.error).toBe('Failed to load campaign');
    });

    it('still loads campaign when hero fetch fails', async () => {
      mockHeroGetAll.mockRejectedValue(new Error('Hero service down'));
      const store = useCampaignStore();

      await store.selectCampaign(1);

      expect(store.currentCampaign).not.toBeNull();
      expect(store.currentCampaign?.id).toBe(1);
      expect(store.currentCampaign?.heroes).toEqual([]);
      expect(store.error).toBeNull();
    });
  });

  // ========================================
  // clearCurrentCampaign
  // ========================================
  describe('clearCurrentCampaign', () => {
    it('clears current campaign', async () => {
      const store = useCampaignStore();
      await store.selectCampaign(1);
      expect(store.currentCampaign).not.toBeNull();

      store.clearCurrentCampaign();

      expect(store.currentCampaign).toBeNull();
    });
  });

  // ========================================
  // setError
  // ========================================
  describe('setError', () => {
    it('sets error message', () => {
      const store = useCampaignStore();
      store.setError('Something went wrong');

      expect(store.error).toBe('Something went wrong');
    });
  });

  // ========================================
  // reset
  // ========================================
  describe('reset', () => {
    it('clears campaigns', async () => {
      const store = useCampaignStore();
      await store.fetchCampaigns();

      store.reset();

      expect(store.campaigns).toEqual([]);
    });

    it('clears currentCampaign', async () => {
      const store = useCampaignStore();
      await store.selectCampaign(1);

      store.reset();

      expect(store.currentCampaign).toBeNull();
    });

    it('clears error', () => {
      const store = useCampaignStore();
      store.setError('error');

      store.reset();

      expect(store.error).toBeNull();
    });

    it('sets loading to false', () => {
      const store = useCampaignStore();

      store.reset();

      expect(store.loading).toBe(false);
    });
  });
});
