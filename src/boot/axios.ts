import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { logger } from 'src/utils/logger';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  timeout: 30000, // 30 second timeout
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

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
