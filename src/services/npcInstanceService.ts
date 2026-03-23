import type { AxiosResponse } from 'axios';
import type { NpcInstance, NpcInstancePatch } from 'src/types';
import { api } from './api';

export default {
  get(id: number): Promise<AxiosResponse<NpcInstance>> {
    return api.get(`/npc-instances/${id}`);
  },

  create(data: {
    npcId: number;
    combatId?: number;
    heroId?: number;
    displayName?: string | null;
    side?: 'ally' | 'enemy';
    sortOrder?: number;
    notes?: string | null;
  }): Promise<AxiosResponse<NpcInstance>> {
    return api.post('/npc-instances', data);
  },

  patch(id: number, data: NpcInstancePatch): Promise<AxiosResponse<NpcInstance>> {
    return api.patch(`/npc-instances/${id}`, { ...data, id });
  },

  patchResource(
    id: number,
    field: 'current_hp' | 'current_focus' | 'current_investiture',
    value: number
  ): Promise<AxiosResponse<Record<string, number>>> {
    return api.patch(`/npc-instances/${id}`, { id, field, value });
  },

  delete(id: number): Promise<AxiosResponse<void>> {
    return api.delete(`/npc-instances/${id}`);
  },
};
