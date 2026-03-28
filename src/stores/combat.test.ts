import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCombatStore } from './combat';
import { axiosError } from 'src/test-utils/axiosHelpers';
import type { Combat, CombatDetail, NpcInstance, NpcOption, Npc } from 'src/types';

// ============================================================
// Mock data
// ============================================================

const mockTier = { id: 1, code: 'common', name: 'Common' };

const mockNpcOptions: NpcOption[] = [
  { id: 1, campaignId: 10, name: 'Goblin', tier: mockTier, type: 'minion' },
  { id: 2, campaignId: 10, name: 'Dragon', tier: mockTier, type: 'boss' },
];

const mockNpc: Npc = {
  id: 1,
  campaignId: 10,
  name: 'Goblin',
  tier: mockTier,
  type: 'minion',
  isCompanion: false,
  createdBy: 1,
  size: 'Medium',
  languages: null,
  description: null,
  tactics: null,
  immunities: null,
  attributes: [],
  defenses: [],
  skills: [],
  derivedStats: [],
  features: [],
  actions: [],
  opportunities: [],
};

const mockNpcInstance: NpcInstance = {
  id: 100,
  npcId: 1,
  combatId: 1,
  heroId: null,
  userId: null,
  name: 'Goblin',
  tier: mockTier,
  type: 'minion',
  displayName: null,
  notes: null,
  avatarKey: null,
  sortOrder: null,
  side: 'enemy',
  turnSpeed: null,
  currentHp: 10,
  currentFocus: 5,
  currentInvestiture: 0,
  derivedStats: [],
};

const mockCombats: Combat[] = [
  {
    id: 1,
    campaignId: 10,
    name: 'Battle at the Bridge',
    description: null,
    isActive: true,
    round: 1,
    notes: null,
    turnPhase: 'fast',
  },
  {
    id: 2,
    campaignId: 10,
    name: 'Ambush in the Forest',
    description: 'Surprise attack',
    isActive: false,
    round: 3,
    notes: null,
    turnPhase: 'fast',
  },
];

const mockCombatDetail: CombatDetail = {
  ...mockCombats[0]!,
  npcs: [{ ...mockNpcInstance }],
};

// ============================================================
// Service mocks
// ============================================================

const {
  mockGetCombats,
  mockGetCombat,
  mockCreateCombat,
  mockUpdateCombat,
  mockDeleteCombat,
  mockGetNpcOptions,
  mockGetNpc,
  mockCreateNpc,
  mockUpdateNpc,
  mockDeleteNpc,
  mockEndRound,
  mockInstanceCreate,
  mockInstancePatch,
  mockInstancePatchResource,
  mockInstanceDelete,
} = vi.hoisted(() => ({
  mockGetCombats: vi.fn(),
  mockGetCombat: vi.fn(),
  mockCreateCombat: vi.fn(),
  mockUpdateCombat: vi.fn(),
  mockDeleteCombat: vi.fn(),
  mockGetNpcOptions: vi.fn(),
  mockGetNpc: vi.fn(),
  mockCreateNpc: vi.fn(),
  mockUpdateNpc: vi.fn(),
  mockDeleteNpc: vi.fn(),
  mockEndRound: vi.fn(),
  mockInstanceCreate: vi.fn(),
  mockInstancePatch: vi.fn(),
  mockInstancePatchResource: vi.fn(),
  mockInstanceDelete: vi.fn(),
}));

vi.mock('src/services/combatService', () => ({
  default: {
    getCombats: mockGetCombats,
    getCombat: mockGetCombat,
    createCombat: mockCreateCombat,
    updateCombat: mockUpdateCombat,
    deleteCombat: mockDeleteCombat,
    getNpcOptions: mockGetNpcOptions,
    getNpc: mockGetNpc,
    createNpc: mockCreateNpc,
    updateNpc: mockUpdateNpc,
    deleteNpc: mockDeleteNpc,
    endRound: mockEndRound,
  },
}));

vi.mock('src/services/npcInstanceService', () => ({
  default: {
    create: mockInstanceCreate,
    patch: mockInstancePatch,
    patchResource: mockInstancePatchResource,
    delete: mockInstanceDelete,
  },
}));

vi.mock('src/utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('src/composables/useErrorHandler', () => ({
  useErrorHandler: () => ({ handleError: vi.fn() }),
}));

// ============================================================
// Tests
// ============================================================

describe('useCombatStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  // ========================================
  // Initial State
  // ========================================
  describe('initial state', () => {
    it('starts with empty state', () => {
      const store = useCombatStore();
      expect(store.combats).toEqual([]);
      expect(store.currentCombat).toBeNull();
      expect(store.currentNpc).toBeNull();
      expect(store.npcOptions).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.saving).toBe(false);
      expect(store.hasCombats).toBe(false);
      expect(store.allies).toEqual([]);
      expect(store.enemies).toEqual([]);
    });
  });

  // ========================================
  // Fetch Combats
  // ========================================
  describe('fetchCombats', () => {
    it('loads combats and sets state', async () => {
      mockGetCombats.mockResolvedValue({ data: [...mockCombats] });
      const store = useCombatStore();

      await store.fetchCombats(10);

      expect(mockGetCombats).toHaveBeenCalledWith(10);
      expect(store.combats).toHaveLength(2);
      expect(store.combats[0]!.name).toBe('Battle at the Bridge');
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.hasCombats).toBe(true);
    });

    it('sets loading during fetch', async () => {
      let resolvePromise: (v: unknown) => void;
      mockGetCombats.mockReturnValue(
        new Promise((r) => {
          resolvePromise = r;
        })
      );
      const store = useCombatStore();

      const promise = store.fetchCombats(10);
      expect(store.loading).toBe(true);

      resolvePromise!({ data: [] });
      await promise;
      expect(store.loading).toBe(false);
    });

    it('sets error on failure', async () => {
      mockGetCombats.mockRejectedValue(axiosError(500));
      const store = useCombatStore();

      await store.fetchCombats(10);

      expect(store.error).toBe('Failed to load combats');
      expect(store.loading).toBe(false);
    });

    it('ignores stale responses (race condition)', async () => {
      let resolveFirst: (v: unknown) => void;
      mockGetCombats
        .mockReturnValueOnce(
          new Promise((r) => {
            resolveFirst = r;
          })
        )
        .mockResolvedValueOnce({ data: [mockCombats[1]] });

      const store = useCombatStore();
      const first = store.fetchCombats(10);
      const second = store.fetchCombats(10);

      resolveFirst!({ data: [mockCombats[0]] });
      await first;
      await second;

      expect(store.combats).toHaveLength(1);
      expect(store.combats[0]!.name).toBe('Ambush in the Forest');
    });
  });

  // ========================================
  // Select Combat
  // ========================================
  describe('selectCombat', () => {
    it('loads combat detail', async () => {
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      const store = useCombatStore();

      await store.selectCombat(10, 1);

      expect(mockGetCombat).toHaveBeenCalledWith(10, 1);
      expect(store.currentCombat).not.toBeNull();
      expect(store.currentCombat!.name).toBe('Battle at the Bridge');
      expect(store.currentCombat!.npcs).toHaveLength(1);
      expect(store.loading).toBe(false);
    });

    it('resets turnDoneIds when selecting a different combat', async () => {
      mockGetCombat
        .mockResolvedValueOnce({ data: { ...mockCombatDetail, id: 1, npcs: [] } })
        .mockResolvedValueOnce({ data: { ...mockCombatDetail, id: 2, npcs: [] } });

      const store = useCombatStore();
      await store.selectCombat(10, 1);
      store.toggleTurnDone(100);
      expect(store.turnDoneIds.size).toBe(1);

      await store.selectCombat(10, 2);
      expect(store.turnDoneIds.size).toBe(0);
    });

    it('keeps turnDoneIds when re-selecting the same combat', async () => {
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      const store = useCombatStore();

      await store.selectCombat(10, 1);
      store.toggleTurnDone(100);
      expect(store.turnDoneIds.size).toBe(1);

      await store.selectCombat(10, 1);
      expect(store.turnDoneIds.size).toBe(1);
    });

    it('clears currentCombat on 404', async () => {
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      const store = useCombatStore();
      await store.selectCombat(10, 1);
      expect(store.currentCombat).not.toBeNull();

      mockGetCombat.mockRejectedValue(axiosError(404));
      await store.selectCombat(10, 99);
      expect(store.currentCombat).toBeNull();
    });

    it('ignores stale responses', async () => {
      let resolveFirst: (v: unknown) => void;
      mockGetCombat
        .mockReturnValueOnce(
          new Promise((r) => {
            resolveFirst = r;
          })
        )
        .mockResolvedValueOnce({ data: { ...mockCombatDetail, id: 2, name: 'Second' } });

      const store = useCombatStore();
      const first = store.selectCombat(10, 1);
      const second = store.selectCombat(10, 2);

      resolveFirst!({ data: { ...mockCombatDetail, id: 1, name: 'First' } });
      await first;
      await second;

      expect(store.currentCombat!.name).toBe('Second');
    });
  });

  // ========================================
  // Combat CRUD
  // ========================================
  describe('createCombat', () => {
    it('creates combat and prepends to list', async () => {
      const newCombat: Combat = { ...mockCombats[0]!, id: 99, name: 'New Fight' };
      mockCreateCombat.mockResolvedValue({ data: newCombat });
      const store = useCombatStore();

      const result = await store.createCombat({ campaignId: 10, name: 'New Fight' });

      expect(result).not.toBeNull();
      expect(result!.id).toBe(99);
      expect(store.combats[0]!.name).toBe('New Fight');
      expect(store.saving).toBe(false);
    });

    it('returns null on error', async () => {
      mockCreateCombat.mockRejectedValue(axiosError(500));
      const store = useCombatStore();

      const result = await store.createCombat({ campaignId: 10, name: 'Fail' });

      expect(result).toBeNull();
      expect(store.error).toBe('Failed to create combat');
    });
  });

  describe('updateCombat', () => {
    it('updates combat in list and current detail', async () => {
      mockGetCombats.mockResolvedValue({ data: [...mockCombats] });
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      const updated: Combat = { ...mockCombats[0]!, name: 'Renamed Battle' };
      mockUpdateCombat.mockResolvedValue({ data: updated });

      const store = useCombatStore();
      await store.fetchCombats(10);
      await store.selectCombat(10, 1);

      const result = await store.updateCombat({ id: 1, campaignId: 10, name: 'Renamed Battle' });

      expect(result!.name).toBe('Renamed Battle');
      expect(store.combats[0]!.name).toBe('Renamed Battle');
      expect(store.currentCombat!.name).toBe('Renamed Battle');
    });

    it('returns null on error', async () => {
      mockUpdateCombat.mockRejectedValue(axiosError(500));
      const store = useCombatStore();

      const result = await store.updateCombat({ id: 1, campaignId: 10, name: 'Fail' });

      expect(result).toBeNull();
      expect(store.error).toBe('Failed to update combat');
    });
  });

  describe('deleteCombat', () => {
    it('removes combat from list and clears current if selected', async () => {
      mockGetCombats.mockResolvedValue({ data: [...mockCombats] });
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      mockDeleteCombat.mockResolvedValue({});

      const store = useCombatStore();
      await store.fetchCombats(10);
      await store.selectCombat(10, 1);

      const result = await store.deleteCombat(10, 1);

      expect(result).toBe(true);
      expect(store.combats).toHaveLength(1);
      expect(store.currentCombat).toBeNull();
    });

    it('does not clear currentCombat if deleting a different combat', async () => {
      mockGetCombats.mockResolvedValue({ data: [...mockCombats] });
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      mockDeleteCombat.mockResolvedValue({});

      const store = useCombatStore();
      await store.fetchCombats(10);
      await store.selectCombat(10, 1);

      await store.deleteCombat(10, 2);

      expect(store.currentCombat).not.toBeNull();
      expect(store.combats).toHaveLength(1);
    });

    it('returns false on error', async () => {
      mockDeleteCombat.mockRejectedValue(axiosError(500));
      const store = useCombatStore();

      const result = await store.deleteCombat(10, 1);

      expect(result).toBe(false);
      expect(store.error).toBe('Failed to delete combat');
    });
  });

  // ========================================
  // NPC Template CRUD
  // ========================================
  describe('fetchNpcOptions', () => {
    it('loads NPC options', async () => {
      mockGetNpcOptions.mockResolvedValue({ data: [...mockNpcOptions] });
      const store = useCombatStore();

      await store.fetchNpcOptions(10);

      expect(store.npcOptions).toHaveLength(2);
      expect(store.loading).toBe(false);
    });

    it('sets error on failure', async () => {
      mockGetNpcOptions.mockRejectedValue(axiosError(500));
      const store = useCombatStore();

      await store.fetchNpcOptions(10);

      expect(store.error).toBe('Failed to load NPC options');
    });
  });

  describe('fetchNpc', () => {
    it('loads NPC detail and sets currentNpc', async () => {
      mockGetNpc.mockResolvedValue({ data: { ...mockNpc } });
      const store = useCombatStore();

      const result = await store.fetchNpc(10, 1);

      expect(result).not.toBeNull();
      expect(store.currentNpc!.name).toBe('Goblin');
    });

    it('ignores stale responses', async () => {
      let resolveFirst: (v: unknown) => void;
      mockGetNpc
        .mockReturnValueOnce(
          new Promise((r) => {
            resolveFirst = r;
          })
        )
        .mockResolvedValueOnce({ data: { ...mockNpc, id: 2, name: 'Dragon' } });

      const store = useCombatStore();
      const first = store.fetchNpc(10, 1);
      const second = store.fetchNpc(10, 2);

      resolveFirst!({ data: { ...mockNpc } });
      await first;
      await second;

      expect(store.currentNpc!.name).toBe('Dragon');
    });
  });

  describe('createNpc', () => {
    it('creates NPC and adds to options list', async () => {
      mockCreateNpc.mockResolvedValue({ data: { ...mockNpc, id: 99, name: 'New Troll' } });
      const store = useCombatStore();

      const result = await store.createNpc({
        campaignId: 10,
        name: 'New Troll',
        tier: { code: 'common' },
        type: 'minion',
        size: 'Large',
        features: [],
        actions: [],
        opportunities: [],
        attributes: [],
        defenses: [],
        skills: [],
        derivedStats: [],
      });

      expect(result!.name).toBe('New Troll');
      expect(store.npcOptions).toHaveLength(1);
      expect(store.currentNpc!.name).toBe('New Troll');
    });
  });

  describe('updateNpc', () => {
    it('updates NPC and syncs options list', async () => {
      mockGetNpcOptions.mockResolvedValue({ data: [...mockNpcOptions] });
      mockUpdateNpc.mockResolvedValue({ data: { ...mockNpc, name: 'Renamed Goblin' } });

      const store = useCombatStore();
      await store.fetchNpcOptions(10);

      const result = await store.updateNpc({
        id: 1,
        campaignId: 10,
        name: 'Renamed Goblin',
        tier: { code: 'common' },
        type: 'minion',
        size: 'Medium',
        features: [],
        actions: [],
        opportunities: [],
        attributes: [],
        defenses: [],
        skills: [],
        derivedStats: [],
      });

      expect(result!.name).toBe('Renamed Goblin');
      expect(store.npcOptions[0]!.name).toBe('Renamed Goblin');
      expect(store.currentNpc!.name).toBe('Renamed Goblin');
    });
  });

  describe('deleteNpc', () => {
    it('removes NPC from options and clears currentNpc', async () => {
      mockGetNpcOptions.mockResolvedValue({ data: [...mockNpcOptions] });
      mockGetNpc.mockResolvedValue({ data: { ...mockNpc } });
      mockDeleteNpc.mockResolvedValue({});

      const store = useCombatStore();
      await store.fetchNpcOptions(10);
      await store.fetchNpc(10, 1);

      const result = await store.deleteNpc(10, 1);

      expect(result).toBe(true);
      expect(store.npcOptions).toHaveLength(1);
      expect(store.currentNpc).toBeNull();
    });

    it('surfaces API error message on delete failure', async () => {
      mockDeleteNpc.mockRejectedValue({
        isAxiosError: true,
        response: { status: 400, data: { error: 'NPC is in active combat' } },
      });

      const store = useCombatStore();
      const result = await store.deleteNpc(10, 1);

      expect(result).toBe(false);
      expect(store.error).toBe('NPC is in active combat');
    });

    it('uses fallback message when API error has no message', async () => {
      mockDeleteNpc.mockRejectedValue(axiosError(500));

      const store = useCombatStore();
      const result = await store.deleteNpc(10, 1);

      expect(result).toBe(false);
      expect(store.error).toBe('Failed to delete NPC');
    });
  });

  // ========================================
  // NPC Instance Management
  // ========================================
  describe('addNpcInstance', () => {
    it('adds NPC instance to current combat', async () => {
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail, npcs: [] } });
      const newInstance: NpcInstance = { ...mockNpcInstance, id: 200 };
      mockInstanceCreate.mockResolvedValue({ data: newInstance });

      const store = useCombatStore();
      await store.selectCombat(10, 1);

      const result = await store.addNpcInstance({ npcId: 1, combatId: 1, side: 'enemy' });

      expect(result).not.toBeNull();
      expect(store.currentCombat!.npcs).toHaveLength(1);
    });

    it('auto-numbers duplicate NPCs', async () => {
      const existingInstance: NpcInstance = { ...mockNpcInstance, id: 100 };
      mockGetCombat.mockResolvedValue({
        data: { ...mockCombatDetail, npcs: [existingInstance] },
      });
      const newInstance: NpcInstance = { ...mockNpcInstance, id: 200 };
      mockInstanceCreate.mockResolvedValue({ data: newInstance });

      const store = useCombatStore();
      await store.selectCombat(10, 1);

      await store.addNpcInstance({ npcId: 1, combatId: 1, side: 'enemy' });

      expect(mockInstanceCreate).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: 'Goblin 2' })
      );
    });

    it('uses custom displayName without auto-numbering', async () => {
      const existingInstance: NpcInstance = { ...mockNpcInstance, id: 100 };
      mockGetCombat.mockResolvedValue({
        data: { ...mockCombatDetail, npcs: [existingInstance] },
      });
      const newInstance: NpcInstance = { ...mockNpcInstance, id: 200 };
      mockInstanceCreate.mockResolvedValue({ data: newInstance });

      const store = useCombatStore();
      await store.selectCombat(10, 1);

      await store.addNpcInstance({
        npcId: 1,
        combatId: 1,
        displayName: 'Custom Name',
        side: 'enemy',
      });

      expect(mockInstanceCreate).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: 'Custom Name' })
      );
    });

    it('returns null when no currentCombat', async () => {
      const store = useCombatStore();
      const result = await store.addNpcInstance({ npcId: 1, combatId: 1, side: 'enemy' });
      expect(result).toBeNull();
    });
  });

  describe('updateNpcInstance', () => {
    it('updates NPC instance in current combat', async () => {
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      const updated: NpcInstance = { ...mockNpcInstance, notes: 'Injured' };
      mockInstancePatch.mockResolvedValue({ data: updated });

      const store = useCombatStore();
      await store.selectCombat(10, 1);

      const result = await store.updateNpcInstance(100, { notes: 'Injured' });

      expect(result!.notes).toBe('Injured');
      expect(store.currentCombat!.npcs[0]!.notes).toBe('Injured');
    });

    it('returns null when no currentCombat', async () => {
      const store = useCombatStore();
      const result = await store.updateNpcInstance(100, { notes: 'test' });
      expect(result).toBeNull();
    });
  });

  describe('removeNpcInstance', () => {
    it('removes NPC instance from current combat', async () => {
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      mockInstanceDelete.mockResolvedValue({});

      const store = useCombatStore();
      await store.selectCombat(10, 1);

      const result = await store.removeNpcInstance(100);

      expect(result).toBe(true);
      expect(store.currentCombat!.npcs).toHaveLength(0);
    });

    it('returns false when no currentCombat', async () => {
      const store = useCombatStore();
      const result = await store.removeNpcInstance(100);
      expect(result).toBe(false);
    });
  });

  // ========================================
  // Resource Patches
  // ========================================
  describe('resource patches', () => {
    it('patches HP on NPC instance', async () => {
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      mockInstancePatchResource.mockResolvedValue({ data: { current_hp: 7 } });

      const store = useCombatStore();
      await store.selectCombat(10, 1);

      await store.patchHp({ id: 100, value: 7 });

      expect(store.currentCombat!.npcs[0]!.currentHp).toBe(7);
    });

    it('patches focus on NPC instance', async () => {
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      mockInstancePatchResource.mockResolvedValue({ data: { current_focus: 3 } });

      const store = useCombatStore();
      await store.selectCombat(10, 1);

      await store.patchFocus({ id: 100, value: 3 });

      expect(store.currentCombat!.npcs[0]!.currentFocus).toBe(3);
    });

    it('patches investiture on NPC instance', async () => {
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      mockInstancePatchResource.mockResolvedValue({ data: { current_investiture: 2 } });

      const store = useCombatStore();
      await store.selectCombat(10, 1);

      await store.patchInvestiture({ id: 100, value: 2 });

      expect(store.currentCombat!.npcs[0]!.currentInvestiture).toBe(2);
    });

    it('clamps negative values to 0', async () => {
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      mockInstancePatchResource.mockResolvedValue({ data: { current_hp: 0 } });

      const store = useCombatStore();
      await store.selectCombat(10, 1);

      await store.patchHp({ id: 100, value: -5 });

      expect(mockInstancePatchResource).toHaveBeenCalledWith(100, 'current_hp', 0);
    });
  });

  // ========================================
  // End Round
  // ========================================
  describe('endRound', () => {
    it('updates combat detail and clears turnDoneIds', async () => {
      const nextRound: CombatDetail = {
        ...mockCombatDetail,
        round: 2,
        npcs: [{ ...mockNpcInstance, turnSpeed: null }],
      };
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      mockEndRound.mockResolvedValue({ data: nextRound });

      const store = useCombatStore();
      await store.selectCombat(10, 1);
      store.toggleTurnDone(100);
      expect(store.turnDoneIds.size).toBe(1);

      const result = await store.endRound(10, 1, 1);

      expect(result).toBe(true);
      expect(store.currentCombat!.round).toBe(2);
      expect(store.turnDoneIds.size).toBe(0);
    });

    it('updates combats list entry', async () => {
      mockGetCombats.mockResolvedValue({ data: [...mockCombats] });
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      const nextRound: CombatDetail = { ...mockCombatDetail, round: 2, npcs: [] };
      mockEndRound.mockResolvedValue({ data: nextRound });

      const store = useCombatStore();
      await store.fetchCombats(10);
      await store.selectCombat(10, 1);

      await store.endRound(10, 1, 1);

      expect(store.combats[0]!.round).toBe(2);
    });

    it('returns false on error', async () => {
      mockEndRound.mockRejectedValue(axiosError(500));
      const store = useCombatStore();

      const result = await store.endRound(10, 1, 1);

      expect(result).toBe(false);
      expect(store.error).toBe('Failed to end round');
    });
  });

  // ========================================
  // Computed: Allies and Enemies
  // ========================================
  describe('computed: allies and enemies', () => {
    it('separates NPCs by side', async () => {
      const ally: NpcInstance = { ...mockNpcInstance, id: 200, side: 'ally' };
      const enemy: NpcInstance = { ...mockNpcInstance, id: 201, side: 'enemy' };
      mockGetCombat.mockResolvedValue({
        data: { ...mockCombatDetail, npcs: [ally, enemy] },
      });

      const store = useCombatStore();
      await store.selectCombat(10, 1);

      expect(store.allies).toHaveLength(1);
      expect(store.allies[0]!.id).toBe(200);
      expect(store.enemies).toHaveLength(1);
      expect(store.enemies[0]!.id).toBe(201);
    });
  });

  // ========================================
  // Turn Done IDs
  // ========================================
  describe('turnDoneIds', () => {
    it('toggles turn done on and off', () => {
      const store = useCombatStore();
      store.toggleTurnDone(100);
      expect(store.turnDoneIds.has(100)).toBe(true);

      store.toggleTurnDone(100);
      expect(store.turnDoneIds.has(100)).toBe(false);
    });

    it('clearBossTurnDone removes only boss IDs', async () => {
      const boss: NpcInstance = { ...mockNpcInstance, id: 300, type: 'boss' };
      const minion: NpcInstance = { ...mockNpcInstance, id: 301, type: 'minion' };
      mockGetCombat.mockResolvedValue({
        data: { ...mockCombatDetail, npcs: [boss, minion] },
      });

      const store = useCombatStore();
      await store.selectCombat(10, 1);
      store.toggleTurnDone(300);
      store.toggleTurnDone(301);
      expect(store.turnDoneIds.size).toBe(2);

      store.clearBossTurnDone();

      expect(store.turnDoneIds.has(300)).toBe(false);
      expect(store.turnDoneIds.has(301)).toBe(true);
    });
  });

  // ========================================
  // Reset
  // ========================================
  describe('reset', () => {
    it('clears all state', async () => {
      mockGetCombats.mockResolvedValue({ data: [...mockCombats] });
      mockGetCombat.mockResolvedValue({ data: { ...mockCombatDetail } });
      mockGetNpcOptions.mockResolvedValue({ data: [...mockNpcOptions] });
      mockGetNpc.mockResolvedValue({ data: { ...mockNpc } });

      const store = useCombatStore();
      await store.fetchCombats(10);
      await store.selectCombat(10, 1);
      await store.fetchNpcOptions(10);
      await store.fetchNpc(10, 1);
      store.toggleTurnDone(100);

      store.reset();

      expect(store.combats).toEqual([]);
      expect(store.currentCombat).toBeNull();
      expect(store.currentNpc).toBeNull();
      expect(store.npcOptions).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.saving).toBe(false);
      expect(store.turnDoneIds.size).toBe(0);
    });
  });
});
