import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

export function axiosError(status: number): AxiosError {
  return new AxiosError('Request failed', String(status), undefined, undefined, {
    status,
    data: null,
    statusText: '',
    headers: {},
    config: { headers: {} } as InternalAxiosRequestConfig,
  } as AxiosResponse);
}
