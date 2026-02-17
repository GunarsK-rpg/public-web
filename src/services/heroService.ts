import type { AxiosResponse } from 'axios';
import type { Hero, HeroBase, HeroSheet, PaginatedResponse } from 'src/types';
import { api } from './api';

export default {
  getAll(campaignId?: number): Promise<AxiosResponse<PaginatedResponse<Hero>>> {
    const params = campaignId ? { campaign_id: campaignId } : {};
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
    return api.post(`/heroes/${heroId}/${resource}`, data);
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
};
