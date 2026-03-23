import type { AxiosResponse } from 'axios';
import type { Npc } from 'src/types';
import { api } from './api';

export default {
  get(id: number): Promise<AxiosResponse<Npc>> {
    return api.get(`/npcs/${id}`);
  },
};
