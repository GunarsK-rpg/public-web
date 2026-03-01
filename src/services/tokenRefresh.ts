import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authApi } from './authApi';
import type { LoginResponse } from './auth';

interface QueueItem {
  resolve: (value: boolean) => void;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const REFRESH_BUFFER_SECONDS = 60;
const MIN_REFRESH_DELAY_SECONDS = 10;

let isRefreshing = false;
let failedQueue: QueueItem[] = [];
let onAuthFailureCallback: (() => void) | null = null;
let refreshTimerId: ReturnType<typeof setTimeout> | null = null;
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

export function scheduleProactiveRefresh(ttlSeconds: number): void {
  clearProactiveRefresh();
  const delay = Math.max(ttlSeconds - REFRESH_BUFFER_SECONDS, MIN_REFRESH_DELAY_SECONDS);
  refreshTimerId = setTimeout(() => {
    void refreshToken();
  }, delay * 1000);
}

export function clearProactiveRefresh(): void {
  if (refreshTimerId !== null) {
    clearTimeout(refreshTimerId);
    refreshTimerId = null;
  }
}

export async function refreshToken(): Promise<boolean> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      failedQueue.push({ resolve });
    });
  }

  isRefreshing = true;

  try {
    const response = await authApi.post<LoginResponse>('/refresh');
    processQueue(true);
    if (response.data.expires_in > 0) {
      scheduleProactiveRefresh(response.data.expires_in);
    }
    return true;
  } catch {
    processQueue(false);
    clearProactiveRefresh();
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
