import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authApi } from './authApi';

interface QueueItem {
  resolve: (value: boolean) => void;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];
let onAuthFailureCallback: (() => void) | null = null;
const registeredInstances = new WeakSet<AxiosInstance>();

function processQueue(success: boolean): void {
  failedQueue.forEach(({ resolve }) => {
    resolve(success);
  });
  failedQueue = [];
}

export function setAuthFailureCallback(callback: () => void): void {
  onAuthFailureCallback = callback;
}

export async function refreshToken(): Promise<boolean> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      failedQueue.push({ resolve });
    });
  }

  isRefreshing = true;

  try {
    await authApi.post('/refresh');
    processQueue(true);
    return true;
  } catch {
    processQueue(false);
    onAuthFailureCallback?.();
    return false;
  } finally {
    isRefreshing = false;
  }
}

export function add401Interceptor(axiosInstance: AxiosInstance): void {
  if (registeredInstances.has(axiosInstance)) {
    return;
  }
  registeredInstances.add(axiosInstance);

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableConfig | undefined;

      if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        originalRequest._retry = true;
        return new Promise<boolean>((resolve) => {
          failedQueue.push({ resolve });
        }).then((success) => {
          if (success) {
            return axiosInstance(originalRequest);
          }
          return Promise.reject(error);
        });
      }

      originalRequest._retry = true;
      const success = await refreshToken();

      if (success) {
        return axiosInstance(originalRequest);
      }

      return Promise.reject(error);
    }
  );
}
