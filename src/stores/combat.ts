import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Combat,
  CombatBase,
  CombatDetail,
  CombatNpc,
  CombatNpcBase,
  CombatNpcResourcePatch,
  NpcOption,
} from 'src/types';
import { logger } from 'src/utils/logger';
import combatService from 'src/services/combatService';
import { handleError } from 'src/utils/errorHandling';

export const useCombatStore = defineStore('combat', () => {
  const combats = ref<Combat[]>([]);
  const currentCombat = ref<CombatDetail | null>(null);
  const npcOptions = ref<NpcOption[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const savingCount = ref(0);

  let fetchRequestId = 0;
  let selectRequestId = 0;

  const saving = computed(() => savingCount.value > 0);
  const hasCombats = computed(() => combats.value.length > 0);

  const allies = computed(() => currentCombat.value?.npcs.filter((n) => n.side === 'ally') ?? []);

  const enemies = computed(() => currentCombat.value?.npcs.filter((n) => n.side === 'enemy') ?? []);

  // ===================
  // COMBAT LIST
  // ===================

  async function fetchCombats(campaignId: number): Promise<void> {
    const requestId = ++fetchRequestId;
    loading.value = true;
    error.value = null;

    try {
      const response = await combatService.getCombats(campaignId);
      if (requestId !== fetchRequestId) return;
      combats.value = response.data;
      logger.info('Combats loaded', { count: response.data.length });
    } catch (err: unknown) {
      if (requestId === fetchRequestId) {
        handleError(err, { errorRef: error, message: 'Failed to load combats' });
      }
    } finally {
      if (requestId === fetchRequestId) {
        loading.value = false;
      }
    }
  }

  // ===================
  // COMBAT DETAIL
  // ===================

  async function selectCombat(campaignId: number, combatId: number): Promise<void> {
    const requestId = ++selectRequestId;
    loading.value = true;
    error.value = null;

    try {
      const response = await combatService.getCombat(campaignId, combatId);
      if (requestId !== selectRequestId) return;
      currentCombat.value = response.data;
      logger.info('Combat selected', { id: combatId });
    } catch (err: unknown) {
      if (requestId === selectRequestId) {
        handleError(err, {
          errorRef: error,
          message: 'Failed to load combat',
          notFoundMessage: 'Combat not found',
          context: { combatId },
          onNotFound: () => {
            currentCombat.value = null;
          },
        });
      }
    } finally {
      if (requestId === selectRequestId) {
        loading.value = false;
      }
    }
  }

  // ===================
  // COMBAT CRUD
  // ===================

  async function createCombat(data: CombatBase): Promise<Combat | null> {
    savingCount.value++;
    error.value = null;

    try {
      const response = await combatService.createCombat(data);
      combats.value.unshift(response.data);
      logger.info('Combat created', { id: response.data.id, name: response.data.name });
      return response.data;
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: 'Failed to create combat' });
      return null;
    } finally {
      savingCount.value--;
    }
  }

  async function updateCombat(data: CombatBase & { id: number }): Promise<Combat | null> {
    savingCount.value++;
    error.value = null;

    try {
      const response = await combatService.updateCombat(data);
      const updated = response.data;

      const index = combats.value.findIndex((c) => c.id === data.id);
      if (index !== -1) {
        combats.value[index] = updated;
      }

      if (currentCombat.value?.id === data.id) {
        currentCombat.value = { ...currentCombat.value, ...updated };
      }

      logger.info('Combat updated', { id: data.id });
      return updated;
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: 'Failed to update combat' });
      return null;
    } finally {
      savingCount.value--;
    }
  }

  async function deleteCombat(campaignId: number, combatId: number): Promise<boolean> {
    savingCount.value++;
    error.value = null;

    try {
      await combatService.deleteCombat(campaignId, combatId);
      combats.value = combats.value.filter((c) => c.id !== combatId);
      if (currentCombat.value?.id === combatId) {
        currentCombat.value = null;
      }
      logger.info('Combat deleted', { id: combatId });
      return true;
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: 'Failed to delete combat' });
      return false;
    } finally {
      savingCount.value--;
    }
  }

  // ===================
  // NPC OPTIONS
  // ===================

  async function fetchNpcOptions(campaignId: number): Promise<void> {
    try {
      const response = await combatService.getNpcOptions(campaignId);
      npcOptions.value = response.data;
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: 'Failed to load NPC options' });
    }
  }

  // ===================
  // COMBAT NPC INSTANCES
  // ===================

  async function addCombatNpc(data: CombatNpcBase): Promise<CombatNpc | null> {
    if (!currentCombat.value) return null;
    savingCount.value++;

    // Auto-number duplicates if no custom display name
    if (!data.displayName) {
      const existing = currentCombat.value.npcs.filter((n) => n.npcId === data.npcId);
      const first = existing[0];
      if (first) {
        data = { ...data, displayName: `${first.name} ${existing.length + 1}` };
      }
    }

    try {
      const response = await combatService.addCombatNpc(data);
      currentCombat.value.npcs.push(response.data);
      logger.info('Combat NPC added', { id: response.data.id, npcId: data.npcId });
      return response.data;
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: 'Failed to add NPC' });
      return null;
    } finally {
      savingCount.value--;
    }
  }

  async function updateCombatNpc(data: CombatNpcBase & { id: number }): Promise<CombatNpc | null> {
    if (!currentCombat.value) return null;
    savingCount.value++;

    try {
      const response = await combatService.updateCombatNpc(data);
      const idx = currentCombat.value.npcs.findIndex((n) => n.id === data.id);
      if (idx !== -1) {
        currentCombat.value.npcs[idx] = response.data;
      }
      return response.data;
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: 'Failed to update NPC' });
      return null;
    } finally {
      savingCount.value--;
    }
  }

  async function removeCombatNpc(
    campaignId: number,
    combatId: number,
    instanceId: number
  ): Promise<boolean> {
    if (!currentCombat.value) return false;
    savingCount.value++;

    try {
      await combatService.deleteCombatNpc(campaignId, combatId, instanceId);
      currentCombat.value.npcs = currentCombat.value.npcs.filter((n) => n.id !== instanceId);
      logger.info('Combat NPC removed', { id: instanceId });
      return true;
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: 'Failed to remove NPC' });
      return false;
    } finally {
      savingCount.value--;
    }
  }

  // ===================
  // RESOURCE PATCHES
  // ===================

  async function patchNpcResource(
    data: CombatNpcResourcePatch,
    serviceFn: (d: CombatNpcResourcePatch) => Promise<{ data: Record<string, number> }>,
    field: keyof CombatNpc,
    responseKey: string,
    errorMessage: string
  ): Promise<void> {
    if (!currentCombat.value) return;
    savingCount.value++;

    try {
      const response = await serviceFn({ ...data, value: Math.max(0, Math.floor(data.value)) });
      const npc = currentCombat.value.npcs.find((n) => n.id === data.id);
      if (npc) {
        const val = response.data[responseKey];
        if (val !== undefined) {
          (npc[field] as number) = val;
        }
      }
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: errorMessage });
    } finally {
      savingCount.value--;
    }
  }

  const patchHp = (data: CombatNpcResourcePatch) =>
    patchNpcResource(
      data,
      (d) => combatService.patchHp(d),
      'currentHp',
      'currentHp',
      'Failed to update HP'
    );

  const patchFocus = (data: CombatNpcResourcePatch) =>
    patchNpcResource(
      data,
      (d) => combatService.patchFocus(d),
      'currentFocus',
      'currentFocus',
      'Failed to update focus'
    );

  const patchInvestiture = (data: CombatNpcResourcePatch) =>
    patchNpcResource(
      data,
      (d) => combatService.patchInvestiture(d),
      'currentInvestiture',
      'currentInvestiture',
      'Failed to update investiture'
    );

  // ===================
  // END ROUND
  // ===================

  async function endRound(campaignId: number, combatId: number, round: number): Promise<boolean> {
    savingCount.value++;

    try {
      const response = await combatService.endRound({ campaignId, combatId, round });
      currentCombat.value = response.data;

      const idx = combats.value.findIndex((c) => c.id === combatId);
      if (idx !== -1) {
        combats.value[idx] = {
          id: response.data.id,
          campaignId: response.data.campaignId,
          name: response.data.name,
          description: response.data.description,
          isActive: response.data.isActive,
          round: response.data.round,
          notes: response.data.notes,
        };
      }

      logger.info('Round ended', { combatId, round: response.data.round });
      return true;
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: 'Failed to end round' });
      return false;
    } finally {
      savingCount.value--;
    }
  }

  // ===================
  // CLEANUP
  // ===================

  function clearCurrentCombat(): void {
    currentCombat.value = null;
  }

  function setError(message: string): void {
    error.value = message;
  }

  function reset(): void {
    combats.value = [];
    currentCombat.value = null;
    npcOptions.value = [];
    loading.value = false;
    error.value = null;
    savingCount.value = 0;
    fetchRequestId = 0;
    selectRequestId = 0;
  }

  return {
    combats,
    currentCombat,
    npcOptions,
    loading,
    error,
    saving,
    hasCombats,
    allies,
    enemies,
    fetchCombats,
    selectCombat,
    createCombat,
    updateCombat,
    deleteCombat,
    fetchNpcOptions,
    addCombatNpc,
    updateCombatNpc,
    removeCombatNpc,
    patchHp,
    patchFocus,
    patchInvestiture,
    endRound,
    clearCurrentCombat,
    setError,
    reset,
  };
});
