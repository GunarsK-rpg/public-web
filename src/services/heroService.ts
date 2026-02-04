import { api } from './api';

export default {
  getAll(campaignId?: number) {
    const params = campaignId ? { campaign_id: campaignId } : {};
    return api.get('/heroes', { params });
  },
  getById(id: number) {
    return api.get(`/heroes/${id}`);
  },
  getSheet(id: number) {
    return api.get(`/heroes/${id}/sheet`);
  },
  create(hero: unknown) {
    return api.post('/heroes', hero);
  },
  update(id: number, hero: unknown) {
    return api.put(`/heroes/${id}`, hero);
  },
  delete(id: number) {
    return api.delete(`/heroes/${id}`);
  },
  getSubResource(heroId: number, resource: string) {
    return api.get(`/heroes/${heroId}/${resource}`);
  },
  upsertSubResource(heroId: number, resource: string, data: unknown) {
    return api.post(`/heroes/${heroId}/${resource}`, data);
  },
  deleteSubResource(heroId: number, resource: string, subId: number) {
    return api.delete(`/heroes/${heroId}/${resource}/${subId}`);
  },
};
