import axios, { type InternalAxiosRequestConfig } from 'axios';
import { env } from 'src/config/env';
import { API_TIMEOUTS } from 'src/config/api';
import { add401Interceptor } from 'src/services/tokenRefresh';
import { logger } from 'src/utils/logger';
import { toError } from 'src/utils/errorHandling';

export const api = axios.create({
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
    const err = toError(error);
    logger.logError(err);
    return Promise.reject(error instanceof Error ? error : err);
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
    const err = toError(error);
    logger.logError(err);
    return Promise.reject(error instanceof Error ? error : err);
  }
);

// Add 401 → refresh → retry interceptor
add401Interceptor(api);
