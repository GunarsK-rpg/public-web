import type { AxiosResponse } from 'axios';
import type { Hero, HeroBase, HeroSheet, PaginatedResponse, NpcOption } from 'src/types';
import type { CompanionResourcePatch } from 'src/types/companions';
import { api } from './api';

export default {
  getAll(campaignId?: number): Promise<AxiosResponse<PaginatedResponse<Hero>>> {
    const params: Record<string, unknown> = {};
    if (campaignId) params.campaign_id = campaignId;
    return api.get('/heroes', { params });
  },
  getById(id: number): Promise<AxiosResponse<Hero>> {
    return api.get(`/heroes/${id}`);
  },
  getSheet(id: number): Promise<AxiosResponse<HeroSheet>> {
    return api.get(`/heroes/${id}/sheet`);
  },
  create(hero: HeroBase): Promise<AxiosResponse<Hero>> {
    return api.post('/heroes', hero);
  },
  update(id: number, hero: HeroBase): Promise<AxiosResponse<Hero>> {
    return api.put(`/heroes/${id}`, hero);
  },
  delete(id: number): Promise<AxiosResponse<void>> {
    return api.delete(`/heroes/${id}`);
  },
  getSubResource(heroId: number, resource: string): Promise<AxiosResponse<unknown>> {
    return api.get(`/heroes/${heroId}/${resource}`);
  },
  upsertSubResource<T = { id: number }>(
    heroId: number,
    resource: string,
    data: unknown
  ): Promise<AxiosResponse<T>> {
    return api.post<T>(`/heroes/${heroId}/${resource}`, data);
  },
  deleteSubResource(heroId: number, resource: string, subId: number): Promise<AxiosResponse<void>> {
    return api.delete(`/heroes/${heroId}/${resource}/${subId}`);
  },

  // Resource patches
  patchHealth(heroId: number, value: number): Promise<AxiosResponse<{ currentHealth: number }>> {
    return api.patch(`/heroes/${heroId}/health`, { heroId, value });
  },
  patchFocus(heroId: number, value: number): Promise<AxiosResponse<{ currentFocus: number }>> {
    return api.patch(`/heroes/${heroId}/focus`, { heroId, value });
  },
  patchInvestiture(
    heroId: number,
    value: number
  ): Promise<AxiosResponse<{ currentInvestiture: number }>> {
    return api.patch(`/heroes/${heroId}/investiture`, { heroId, value });
  },
  patchCurrency(heroId: number, value: number): Promise<AxiosResponse<{ currency: number }>> {
    return api.patch(`/heroes/${heroId}/currency`, { heroId, value });
  },

  // Companion NPC options
  getCompanionNpcOptions(
    heroId: number,
    campaignId?: number | null
  ): Promise<AxiosResponse<NpcOption[]>> {
    const params = campaignId ? { campaignId } : {};
    return api.get(`/heroes/${heroId}/companion-npcs`, { params });
  },

  // Companion resource patches
  patchCompanionHp(data: CompanionResourcePatch): Promise<AxiosResponse<{ currentHp: number }>> {
    return api.patch(`/heroes/${data.heroId}/companions/${data.id}/hp`, data);
  },
  patchCompanionFocus(
    data: CompanionResourcePatch
  ): Promise<AxiosResponse<{ currentFocus: number }>> {
    return api.patch(`/heroes/${data.heroId}/companions/${data.id}/focus`, data);
  },
  patchCompanionInvestiture(
    data: CompanionResourcePatch
  ): Promise<AxiosResponse<{ currentInvestiture: number }>> {
    return api.patch(`/heroes/${data.heroId}/companions/${data.id}/investiture`, data);
  },

  // Avatar
  setAvatar(heroId: number, avatarKey: string): Promise<AxiosResponse<{ avatarKey: string }>> {
    return api.post(`/heroes/${heroId}/avatar`, { avatarKey });
  },
  deleteAvatar(heroId: number): Promise<AxiosResponse<void>> {
    return api.delete(`/heroes/${heroId}/avatar`);
  },
};
