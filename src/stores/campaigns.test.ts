import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCampaignStore } from './campaigns';
import { useAuthStore } from './auth';
import { axiosError } from 'src/test-utils/axiosHelpers';
import type { Campaign } from 'src/types';

// Mock campaign data
const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: 'Campaign One',
    description: 'First campaign',
    userId: 10,
    code: 'abc-123',
    talentsModifier: 0,
    skillsModifier: 0,
    expertisesModifier: 0,
    user: { id: 10, username: 'owner', displayName: 'owner' },
  },
  {
    id: 2,
    name: 'Campaign Two',
    description: 'Second campaign',
    userId: 20,
    code: 'def-456',
    talentsModifier: 0,
    skillsModifier: 0,
    expertisesModifier: 0,
    user: { id: 20, username: 'other', displayName: 'other' },
  },
];

const mockCampaign1 = mockCampaigns[0]!;
const mockCampaign2 = mockCampaigns[1]!;

const mockHeroesCampaign1 = [{ id: 1, name: 'Hero A' }];
const mockHeroesCampaign2 = [
  { id: 2, name: 'Hero B' },
  { id: 3, name: 'Hero C' },
];

const { mockGetAll, mockGetById, mockCreate, mockUpdate, mockDelete, mockHeroGetAll } = vi.hoisted(
  () => ({
    mockGetAll: vi.fn(),
    mockGetById: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
    mockHeroGetAll: vi.fn(),
  })
);

vi.mock('src/services/campaignService', () => ({
  default: {
    getAll: mockGetAll,
    getById: mockGetById,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
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

vi.mock('src/services/auth', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    tokenStatus: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('useCampaignStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockGetAll.mockImplementation(() =>
      Promise.resolve({ data: mockCampaigns.map((c) => ({ ...c })) })
    );
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

    it('starts not saving', () => {
      const store = useCampaignStore();
      expect(store.saving).toBe(false);
    });

    it('isOwner is false when no current campaign', () => {
      const store = useCampaignStore();
      expect(store.isOwner).toBe(false);
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

      expect(store.currentCampaign?.heroes).toEqual(mockHeroesCampaign2);
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
      expect(mockHeroGetAll).toHaveBeenCalledWith(1);
    });
  });

  // ========================================
  // createCampaign
  // ========================================
  describe('createCampaign', () => {
    const newCampaign: Campaign = {
      id: 3,
      name: 'New Campaign',
      description: 'A new one',
      userId: 10,
      code: 'ghi-789',
      talentsModifier: 0,
      skillsModifier: 0,
      expertisesModifier: 0,
      user: { id: 10, username: 'owner', displayName: 'owner' },
    };

    it('creates campaign and prepends to list', async () => {
      mockCreate.mockResolvedValue({ data: newCampaign });
      const store = useCampaignStore();
      await store.fetchCampaigns();

      const result = await store.createCampaign({ name: 'New Campaign', description: 'A new one' });

      expect(result).toEqual(newCampaign);
      expect(store.campaigns[0]!.id).toBe(3);
      expect(store.campaigns.length).toBe(3);
    });

    it('calls campaignService.create with correct data', async () => {
      mockCreate.mockResolvedValue({ data: newCampaign });
      const store = useCampaignStore();

      await store.createCampaign({ name: 'New Campaign', description: 'A new one' });

      expect(mockCreate).toHaveBeenCalledWith({ name: 'New Campaign', description: 'A new one' });
    });

    it('returns null on API error', async () => {
      mockCreate.mockRejectedValue(new Error('Server error'));
      const store = useCampaignStore();

      const result = await store.createCampaign({ name: 'Fail' });

      expect(result).toBeNull();
      expect(store.error).toBe('Failed to create campaign');
    });

    it('sets saving during operation', async () => {
      let resolveFn: (v: unknown) => void;
      mockCreate.mockReturnValue(new Promise((resolve) => (resolveFn = resolve)));
      const store = useCampaignStore();

      const promise = store.createCampaign({ name: 'Test' });
      expect(store.saving).toBe(true);

      resolveFn!({ data: newCampaign });
      await promise;
      expect(store.saving).toBe(false);
    });
  });

  // ========================================
  // updateCampaign
  // ========================================
  describe('updateCampaign', () => {
    const updatedCampaign: Campaign = {
      ...mockCampaign1,
      name: 'Updated Name',
      description: 'Updated desc',
    };

    it('updates campaign in list', async () => {
      mockUpdate.mockResolvedValue({ data: updatedCampaign });
      const store = useCampaignStore();
      await store.fetchCampaigns();

      const result = await store.updateCampaign(1, {
        name: 'Updated Name',
        description: 'Updated desc',
      });

      expect(result).toEqual(updatedCampaign);
      expect(store.campaigns[0]!.name).toBe('Updated Name');
    });

    it('updates currentCampaign if it matches', async () => {
      mockUpdate.mockResolvedValue({ data: updatedCampaign });
      const store = useCampaignStore();
      await store.selectCampaign(1);

      await store.updateCampaign(1, { name: 'Updated Name', description: 'Updated desc' });

      expect(store.currentCampaign?.name).toBe('Updated Name');
    });

    it('does not update currentCampaign if different id', async () => {
      mockUpdate.mockResolvedValue({ data: updatedCampaign });
      const store = useCampaignStore();
      await store.selectCampaign(2);

      await store.updateCampaign(1, { name: 'Updated Name' });

      expect(store.currentCampaign?.name).toBe('Campaign Two');
    });

    it('preserves heroes on currentCampaign update', async () => {
      mockUpdate.mockResolvedValue({ data: updatedCampaign });
      const store = useCampaignStore();
      await store.selectCampaign(1);
      const heroesBefore = store.currentCampaign?.heroes;

      await store.updateCampaign(1, { name: 'Updated Name' });

      expect(store.currentCampaign?.heroes).toEqual(heroesBefore);
    });

    it('returns null on API error', async () => {
      mockUpdate.mockRejectedValue(new Error('Server error'));
      const store = useCampaignStore();

      const result = await store.updateCampaign(1, { name: 'Fail' });

      expect(result).toBeNull();
      expect(store.error).toBe('Failed to update campaign');
    });

    it('sets saving during operation', async () => {
      let resolveFn: (v: unknown) => void;
      mockUpdate.mockReturnValue(new Promise((resolve) => (resolveFn = resolve)));
      const store = useCampaignStore();

      const promise = store.updateCampaign(1, { name: 'Test' });
      expect(store.saving).toBe(true);

      resolveFn!({ data: updatedCampaign });
      await promise;
      expect(store.saving).toBe(false);
    });
  });

  // ========================================
  // deleteCampaign
  // ========================================
  describe('deleteCampaign', () => {
    it('removes campaign from list', async () => {
      mockDelete.mockResolvedValue({});
      const store = useCampaignStore();
      await store.fetchCampaigns();

      const result = await store.deleteCampaign(1);

      expect(result).toBe(true);
      expect(store.campaigns.length).toBe(1);
      expect(store.campaigns[0]!.id).toBe(2);
    });

    it('clears currentCampaign if deleted', async () => {
      mockDelete.mockResolvedValue({});
      const store = useCampaignStore();
      await store.selectCampaign(1);

      await store.deleteCampaign(1);

      expect(store.currentCampaign).toBeNull();
    });

    it('does not clear currentCampaign if different id', async () => {
      mockDelete.mockResolvedValue({});
      const store = useCampaignStore();
      await store.fetchCampaigns();
      await store.selectCampaign(2);

      await store.deleteCampaign(1);

      expect(store.currentCampaign?.id).toBe(2);
    });

    it('returns false on API error', async () => {
      mockDelete.mockRejectedValue(new Error('Server error'));
      const store = useCampaignStore();

      const result = await store.deleteCampaign(1);

      expect(result).toBe(false);
      expect(store.error).toBe('Failed to delete campaign');
    });

    it('sets saving during operation', async () => {
      let resolveFn: (v: unknown) => void;
      mockDelete.mockReturnValue(new Promise((resolve) => (resolveFn = resolve)));
      const store = useCampaignStore();

      const promise = store.deleteCampaign(1);
      expect(store.saving).toBe(true);

      resolveFn!({});
      await promise;
      expect(store.saving).toBe(false);
    });
  });

  // ========================================
  // isOwner
  // ========================================
  describe('isOwner', () => {
    it('returns true when username matches campaign owner', async () => {
      const store = useCampaignStore();
      const authStore = useAuthStore();
      authStore.username = 'owner';
      await store.selectCampaign(1);

      expect(store.isOwner).toBe(true);
    });

    it('returns false when username does not match', async () => {
      const store = useCampaignStore();
      const authStore = useAuthStore();
      authStore.username = 'someone_else';
      await store.selectCampaign(1);

      expect(store.isOwner).toBe(false);
    });

    it('returns false when no current campaign', () => {
      const store = useCampaignStore();
      const authStore = useAuthStore();
      authStore.username = 'owner';

      expect(store.isOwner).toBe(false);
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
