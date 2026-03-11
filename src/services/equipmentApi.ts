import type { AxiosResponse } from 'axios';
import type { HeroEquipment } from 'src/types';
import { api } from './api';

export interface AddClassifierModPayload {
  equipmentId: number;
  modification: { code: string };
}

export interface AddCustomModPayload {
  equipmentId: number;
  customText: string;
  modType: 'upgrade' | 'drawback';
}

export default {
  addModification(
    heroId: number,
    equipmentId: number,
    payload: AddClassifierModPayload | AddCustomModPayload
  ): Promise<AxiosResponse<HeroEquipment>> {
    return api.post(`/heroes/${heroId}/equipment/${equipmentId}/modifications`, payload);
  },

  removeModification(
    heroId: number,
    equipmentId: number,
    modId: number
  ): Promise<AxiosResponse<void>> {
    return api.delete(`/heroes/${heroId}/equipment/${equipmentId}/modifications/${modId}`);
  },
};
