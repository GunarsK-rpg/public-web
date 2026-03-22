import type { AxiosResponse } from 'axios';
import type {
  NpcOption,
  Npc,
  NpcUpsert,
  Combat,
  CombatBase,
  CombatDetail,
  CombatNpc,
  CombatNpcBase,
  CombatNpcResourcePatch,
  EndRoundPayload,
} from 'src/types';
import { api } from './api';

export default {
  // NPC library
  getNpcOptions(campaignId: number): Promise<AxiosResponse<NpcOption[]>> {
    return api.get(`/campaigns/${campaignId}/npcs`);
  },
  getNpc(campaignId: number, npcId: number): Promise<AxiosResponse<Npc>> {
    return api.get(`/campaigns/${campaignId}/npcs/${npcId}`);
  },
  createNpc(data: NpcUpsert): Promise<AxiosResponse<Npc>> {
    return api.post(`/campaigns/${data.campaignId}/npcs`, data);
  },
  updateNpc(data: NpcUpsert & { id: number }): Promise<AxiosResponse<Npc>> {
    return api.put(`/campaigns/${data.campaignId}/npcs/${data.id}`, data);
  },
  deleteNpc(campaignId: number, npcId: number): Promise<AxiosResponse<void>> {
    return api.delete(`/campaigns/${campaignId}/npcs/${npcId}`);
  },

  // Combats
  getCombats(campaignId: number): Promise<AxiosResponse<Combat[]>> {
    return api.get(`/campaigns/${campaignId}/combats`);
  },
  getCombat(campaignId: number, combatId: number): Promise<AxiosResponse<CombatDetail>> {
    return api.get(`/campaigns/${campaignId}/combats/${combatId}`);
  },
  createCombat(data: CombatBase): Promise<AxiosResponse<Combat>> {
    return api.post(`/campaigns/${data.campaignId}/combats`, data);
  },
  updateCombat(data: CombatBase & { id: number }): Promise<AxiosResponse<Combat>> {
    return api.put(`/campaigns/${data.campaignId}/combats/${data.id}`, data);
  },
  deleteCombat(campaignId: number, combatId: number): Promise<AxiosResponse<void>> {
    return api.delete(`/campaigns/${campaignId}/combats/${combatId}`);
  },

  // Combat NPC instances
  addCombatNpc(data: CombatNpcBase): Promise<AxiosResponse<CombatNpc>> {
    return api.post(`/campaigns/${data.campaignId}/combats/${data.combatId}/npcs`, data);
  },
  updateCombatNpc(data: CombatNpcBase & { id: number }): Promise<AxiosResponse<CombatNpc>> {
    return api.patch(
      `/campaigns/${data.campaignId}/combats/${data.combatId}/npcs/${data.id}`,
      data
    );
  },
  deleteCombatNpc(
    campaignId: number,
    combatId: number,
    instanceId: number
  ): Promise<AxiosResponse<void>> {
    return api.delete(`/campaigns/${campaignId}/combats/${combatId}/npcs/${instanceId}`);
  },

  // Resource patches
  patchHp(data: CombatNpcResourcePatch): Promise<AxiosResponse<{ currentHp: number }>> {
    return api.patch(
      `/campaigns/${data.campaignId}/combats/${data.combatId}/npcs/${data.id}/hp`,
      data
    );
  },
  patchFocus(data: CombatNpcResourcePatch): Promise<AxiosResponse<{ currentFocus: number }>> {
    return api.patch(
      `/campaigns/${data.campaignId}/combats/${data.combatId}/npcs/${data.id}/focus`,
      data
    );
  },
  patchInvestiture(
    data: CombatNpcResourcePatch
  ): Promise<AxiosResponse<{ currentInvestiture: number }>> {
    return api.patch(
      `/campaigns/${data.campaignId}/combats/${data.combatId}/npcs/${data.id}/investiture`,
      data
    );
  },

  // End round
  endRound(data: EndRoundPayload): Promise<AxiosResponse<CombatDetail>> {
    return api.post(`/campaigns/${data.campaignId}/combats/${data.combatId}/end-round`, data);
  },
};
