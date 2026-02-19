import type { AxiosResponse } from 'axios';
import type { Campaign, CampaignBase } from 'src/types';
import { api } from './api';

export default {
  getAll(): Promise<AxiosResponse<Campaign[]>> {
    return api.get('/campaigns');
  },
  getById(id: number): Promise<AxiosResponse<Campaign>> {
    return api.get(`/campaigns/${id}`);
  },
  create(campaign: CampaignBase): Promise<AxiosResponse<Campaign>> {
    return api.post('/campaigns', campaign);
  },
  update(id: number, campaign: CampaignBase): Promise<AxiosResponse<Campaign>> {
    return api.put(`/campaigns/${id}`, { ...campaign, id });
  },
  delete(id: number): Promise<AxiosResponse<void>> {
    return api.delete(`/campaigns/${id}`);
  },
};
