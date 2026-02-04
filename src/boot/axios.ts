import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { env } from 'src/config/env';
import { API_TIMEOUTS } from 'src/config/api';
import { add401Interceptor, setAuthFailureCallback } from 'src/services/tokenRefresh';
import { useAuthStore } from 'stores/auth';
import { logger } from 'src/utils/logger';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({
  baseURL: env.apiUrl,
  timeout: API_TIMEOUTS.DEFAULT,
  withCredentials: true,
});

// Extended config type for request timing
interface RequestConfigWithMetadata extends InternalAxiosRequestConfig {
  metadata?: { startTime: number };
}

// Request interceptor - log outgoing requests and track timing
api.interceptors.request.use(
  (config: RequestConfigWithMetadata) => {
    config.metadata = { startTime: Date.now() };
    logger.logRequest(config);
    return config;
  },
  (error: unknown) => {
    logger.error('Request setup failed', error instanceof Error ? error : { error: String(error) });
    const err = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(err);
  }
);

// Response interceptor - log responses and errors
api.interceptors.response.use(
  (response) => {
    const config = response.config as RequestConfigWithMetadata;
    const duration = config.metadata?.startTime
      ? Date.now() - config.metadata.startTime
      : undefined;

    logger.logResponse({
      status: response.status,
      statusText: response.statusText,
      config: { ...config, ...(duration !== undefined && { metadata: { duration } }) },
    });
    return response;
  },
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      logger.logError(error);
    } else {
      logger.error('Request failed', error instanceof Error ? error : { error: String(error) });
    }
    const err = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(err);
  }
);

// Add 401 → refresh → retry interceptor
add401Interceptor(api);

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  // Wire auth failure callback (refresh failed → logout)
  const authStore = useAuthStore();
  setAuthFailureCallback(() => void authStore.logout());
});

export { api };
