import type { AxiosResponse } from 'axios';
import type { Classifiers } from 'src/types';
import { api } from './api';

export default {
  getAll(): Promise<AxiosResponse<Classifiers>> {
    return api.get('/classifiers');
  },
};
