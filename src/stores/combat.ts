import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type {
  Combat,
  CombatBase,
  CombatDetail,
  NpcInstance,
  NpcInstancePatch,
  Npc,
  NpcOption,
  NpcUpsert,
} from 'src/types';
import { logger } from 'src/utils/logger';
import combatService from 'src/services/combatService';
import npcInstanceService from 'src/services/npcInstanceService';
import { handleError } from 'src/utils/errorHandling';

export const useCombatStore = defineStore('combat', () => {
  const combats = ref<Combat[]>([]);
  const currentCombat = ref<CombatDetail | null>(null);
  const npcOptions = ref<NpcOption[]>([]);
  const currentNpc = ref<Npc | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const savingCount = ref(0);
  const turnDoneIds = ref(new Set<number>());

  let fetchRequestId = 0;
  let selectRequestId = 0;
  let fetchNpcRequestId = 0;

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
      const changed = currentCombat.value?.id !== response.data.id;
      currentCombat.value = response.data;
      if (changed) turnDoneIds.value = new Set();
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
  // NPC CRUD
  // ===================

  async function fetchNpc(campaignId: number, npcId: number): Promise<Npc | null> {
    const requestId = ++fetchNpcRequestId;
    loading.value = true;
    error.value = null;
    try {
      const response = await combatService.getNpc(campaignId, npcId);
      if (requestId !== fetchNpcRequestId) return null;
      currentNpc.value = response.data;
      return response.data;
    } catch (err: unknown) {
      if (requestId === fetchNpcRequestId) {
        handleError(err, { errorRef: error, message: 'Failed to load NPC' });
      }
      return null;
    } finally {
      if (requestId === fetchNpcRequestId) {
        loading.value = false;
      }
    }
  }

  async function createNpc(data: NpcUpsert): Promise<Npc | null> {
    savingCount.value++;
    error.value = null;
    try {
      const response = await combatService.createNpc(data);
      currentNpc.value = response.data;
      npcOptions.value = [
        ...npcOptions.value,
        {
          id: response.data.id,
          campaignId: response.data.campaignId,
          name: response.data.name,
          tier: response.data.tier,
          type: response.data.type,
          isCompanion: response.data.isCompanion,
        },
      ];
      logger.info('NPC created', { id: response.data.id, name: response.data.name });
      return response.data;
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: 'Failed to create NPC' });
      return null;
    } finally {
      savingCount.value--;
    }
  }

  async function updateNpc(data: NpcUpsert & { id: number }): Promise<Npc | null> {
    savingCount.value++;
    error.value = null;
    try {
      const response = await combatService.updateNpc(data);
      currentNpc.value = response.data;
      const idx = npcOptions.value.findIndex((o) => o.id === data.id);
      if (idx !== -1) {
        npcOptions.value[idx] = {
          id: response.data.id,
          campaignId: response.data.campaignId,
          name: response.data.name,
          tier: response.data.tier,
          type: response.data.type,
          isCompanion: response.data.isCompanion,
        };
      }
      logger.info('NPC updated', { id: data.id });
      return response.data;
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: 'Failed to update NPC' });
      return null;
    } finally {
      savingCount.value--;
    }
  }

  async function deleteNpc(campaignId: number, npcId: number): Promise<boolean> {
    savingCount.value++;
    error.value = null;
    try {
      await combatService.deleteNpc(campaignId, npcId);
      npcOptions.value = npcOptions.value.filter((n) => n.id !== npcId);
      if (currentNpc.value?.id === npcId) currentNpc.value = null;
      logger.info('NPC deleted', { id: npcId });
      return true;
    } catch (err: unknown) {
      const apiMessage =
        axios.isAxiosError(err) && typeof err.response?.data?.error === 'string'
          ? err.response.data.error
          : 'Failed to delete NPC';
      handleError(err, { errorRef: error, message: apiMessage });
      return false;
    } finally {
      savingCount.value--;
    }
  }

  // ===================
  // COMBAT NPC INSTANCES
  // ===================

  async function addNpcInstance(data: {
    npcId: number;
    combatId: number;
    displayName?: string | null;
    side: 'ally' | 'enemy';
  }): Promise<NpcInstance | null> {
    if (!currentCombat.value) return null;
    savingCount.value++;

    // Auto-number duplicates if no custom display name
    let displayName = data.displayName;
    if (!displayName) {
      const existing = currentCombat.value.npcs.filter((n) => n.npcId === data.npcId);
      const first = existing[0];
      if (first) {
        displayName = `${first.name} ${existing.length + 1}`;
      }
    }

    try {
      const response = await npcInstanceService.create({
        ...data,
        displayName: displayName ?? null,
      });
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

  async function updateNpcInstance(
    id: number,
    data: NpcInstancePatch
  ): Promise<NpcInstance | null> {
    if (!currentCombat.value) return null;
    savingCount.value++;

    try {
      const response = await npcInstanceService.patch(id, data);
      const idx = currentCombat.value.npcs.findIndex((n) => n.id === id);
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

  async function removeNpcInstance(instanceId: number): Promise<boolean> {
    if (!currentCombat.value) return false;
    savingCount.value++;

    try {
      await npcInstanceService.delete(instanceId);
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

  async function patchInstanceResource(
    instanceId: number,
    field: 'current_hp' | 'current_focus' | 'current_investiture',
    value: number,
    npcField: keyof NpcInstance,
    errorMessage: string
  ): Promise<void> {
    if (!currentCombat.value) return;
    savingCount.value++;

    try {
      const response = await npcInstanceService.patchResource(
        instanceId,
        field,
        Math.max(0, Math.floor(value))
      );
      const npc = currentCombat.value.npcs.find((n) => n.id === instanceId);
      if (npc) {
        const val = response.data[field];
        if (val !== undefined) {
          (npc[npcField] as number) = val;
        }
      }
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: errorMessage });
    } finally {
      savingCount.value--;
    }
  }

  const patchHp = (data: { id: number; value: number }) =>
    patchInstanceResource(data.id, 'current_hp', data.value, 'currentHp', 'Failed to update HP');

  const patchFocus = (data: { id: number; value: number }) =>
    patchInstanceResource(
      data.id,
      'current_focus',
      data.value,
      'currentFocus',
      'Failed to update focus'
    );

  const patchInvestiture = (data: { id: number; value: number }) =>
    patchInstanceResource(
      data.id,
      'current_investiture',
      data.value,
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
      turnDoneIds.value = new Set();

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
          turnPhase: response.data.turnPhase,
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

  function clearBossTurnDone(): void {
    if (!currentCombat.value) return;
    const bossIds = new Set(
      currentCombat.value.npcs.filter((n) => n.type === 'boss').map((n) => n.id)
    );
    const current = [...turnDoneIds.value];
    if (current.some((id) => bossIds.has(id))) {
      turnDoneIds.value = new Set(current.filter((id) => !bossIds.has(id)));
    }
  }

  function toggleTurnDone(instanceId: number): void {
    const next = new Set(turnDoneIds.value);
    if (next.has(instanceId)) {
      next.delete(instanceId);
    } else {
      next.add(instanceId);
    }
    turnDoneIds.value = next;
  }

  function clearCurrentCombat(): void {
    currentCombat.value = null;
  }

  function setError(message: string): void {
    error.value = message;
  }

  function reset(): void {
    combats.value = [];
    currentCombat.value = null;
    currentNpc.value = null;
    npcOptions.value = [];
    loading.value = false;
    error.value = null;
    savingCount.value = 0;
    turnDoneIds.value = new Set();
    fetchRequestId = 0;
    selectRequestId = 0;
    fetchNpcRequestId = 0;
  }

  return {
    combats,
    currentCombat,
    currentNpc,
    npcOptions,
    loading,
    error,
    saving,
    hasCombats,
    allies,
    enemies,
    turnDoneIds,
    fetchCombats,
    selectCombat,
    createCombat,
    updateCombat,
    deleteCombat,
    fetchNpcOptions,
    fetchNpc,
    createNpc,
    updateNpc,
    deleteNpc,
    addNpcInstance,
    updateNpcInstance,
    removeNpcInstance,
    patchHp,
    patchFocus,
    patchInvestiture,
    endRound,
    toggleTurnDone,
    clearBossTurnDone,
    clearCurrentCombat,
    setError,
    reset,
  };
});
