import { api } from './api';

export default {
  getAll() {
    return api.get('/campaigns');
  },
  getById(id: number) {
    return api.get(`/campaigns/${id}`);
  },
  create(campaign: unknown) {
    return api.post('/campaigns', campaign);
  },
  update(id: number, campaign: unknown) {
    return api.put(`/campaigns/${id}`, campaign);
  },
  delete(id: number) {
    return api.delete(`/campaigns/${id}`);
  },
};
