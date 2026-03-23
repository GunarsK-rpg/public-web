import type { AxiosResponse } from 'axios';
import type {
  NpcOption,
  Npc,
  NpcUpsert,
  Combat,
  CombatBase,
  CombatDetail,
  EndRoundPayload,
} from 'src/types';
import { api } from './api';

export default {
  // NPC library (templates)
  getNpcOptions(campaignId: number): Promise<AxiosResponse<NpcOption[]>> {
    return api.get(`/campaigns/${campaignId}/npcs`);
  },
  getNpcLibrary(campaignId: number): Promise<AxiosResponse<NpcOption[]>> {
    return api.get(`/campaigns/${campaignId}/npcs/library`);
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
  setNpcAvatar(
    campaignId: number,
    npcId: number,
    avatarKey: string
  ): Promise<AxiosResponse<{ avatarKey: string }>> {
    return api.post(`/campaigns/${campaignId}/npcs/${npcId}/avatar`, { avatarKey });
  },
  deleteNpcAvatar(campaignId: number, npcId: number): Promise<AxiosResponse<void>> {
    return api.delete(`/campaigns/${campaignId}/npcs/${npcId}/avatar`);
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

  // End round
  endRound(data: EndRoundPayload): Promise<AxiosResponse<CombatDetail>> {
    return api.post(`/campaigns/${data.campaignId}/combats/${data.combatId}/end-round`, data);
  },
};
