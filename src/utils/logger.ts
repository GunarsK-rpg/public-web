import pino from 'pino';

// Determine log level based on environment
function getLogLevel(): string {
  if (import.meta.env.DEV) return 'debug';
  if (import.meta.env.PROD) return 'info';
  return 'info';
}

// Create base logger
const baseLogger = pino({
  level: getLogLevel(),
  browser: {
    asObject: true,
  },
  base: {
    app: 'cosmere-rpg',
    env: import.meta.env.MODE,
  },
});

interface LogContext {
  user?: { id: number };
  [key: string]: unknown;
}

interface HttpRequestConfig {
  method?: string;
  url?: string;
  baseURL?: string;
  headers?: Record<string, string>;
  metadata?: { duration?: number; startTime?: number };
}

interface HttpResponse {
  status: number;
  statusText: string;
  config?: HttpRequestConfig;
}

interface HttpError extends Error {
  response?: HttpResponse;
  config?: HttpRequestConfig;
}

class Logger {
  private pino: pino.Logger;
  private context: LogContext;

  constructor(pinoInstance: pino.Logger) {
    this.pino = pinoInstance;
    this.context = {};
  }

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  clearContext(keys: string | string[] | null = null): void {
    if (!keys) {
      this.context = {};
    } else if (Array.isArray(keys)) {
      keys.forEach((key) => delete this.context[key]);
    } else {
      delete this.context[keys];
    }
  }

  child(bindings: Record<string, unknown>): Logger {
    const childLogger = new Logger(this.pino.child(bindings));
    childLogger.context = { ...this.context };
    return childLogger;
  }

  private mergeContext(data: Record<string, unknown> = {}): Record<string, unknown> {
    return { ...this.context, ...data };
  }

  trace(msg: string, data?: Record<string, unknown>): void {
    this.pino.trace(this.mergeContext(data), msg);
  }

  debug(msg: string, data?: Record<string, unknown>): void {
    this.pino.debug(this.mergeContext(data), msg);
  }

  info(msg: string, data?: Record<string, unknown>): void {
    this.pino.info(this.mergeContext(data), msg);
  }

  warn(msg: string, data?: Record<string, unknown>): void {
    this.pino.warn(this.mergeContext(data), msg);
  }

  error(msg: string, data?: Record<string, unknown> | Error): void {
    if (data instanceof Error) {
      this.pino.error(
        this.mergeContext({
          error: {
            message: data.message,
            stack: data.stack,
            name: data.name,
          },
        }),
        msg
      );
    } else {
      this.pino.error(this.mergeContext(data), msg);
    }
  }

  fatal(msg: string, data?: Record<string, unknown>): void {
    this.pino.fatal(this.mergeContext(data), msg);
  }

  logRequest(config: HttpRequestConfig, data: Record<string, unknown> = {}): void {
    this.debug('HTTP Request', {
      ...data,
      http: {
        method: config.method?.toUpperCase(),
        url: this.sanitizeUrl(config.url),
        baseURL: config.baseURL,
        headers: this.sanitizeHeaders(config.headers),
      },
    });
  }

  logResponse(response: HttpResponse, data: Record<string, unknown> = {}): void {
    this.debug('HTTP Response', {
      ...data,
      http: {
        status: response.status,
        statusText: response.statusText,
        url: this.sanitizeUrl(response.config?.url),
        duration: response.config?.metadata?.duration,
      },
    });
  }

  logError(error: HttpError, context: Record<string, unknown> = {}): void {
    const errorData: Record<string, unknown> = {
      ...context,
      error: {
        message: error.message,
        stack: error.stack,
      },
    };

    if (error.response) {
      errorData.http = {
        status: error.response.status,
        statusText: error.response.statusText,
        url: this.sanitizeUrl(error.config?.url),
        method: error.config?.method?.toUpperCase(),
      };
    }

    this.error('Error occurred', errorData);
  }

  private sanitizeHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const sanitized = { ...headers };
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
      'x-csrf-token',
      'x-session-id',
    ];

    // Case-insensitive header matching
    Object.keys(sanitized).forEach((key) => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeUrl(url: string | undefined): string | undefined {
    if (!url) return url;

    const sensitiveParams = [
      'token',
      'apiKey',
      'api_key',
      'access_token',
      'refresh_token',
      'auth',
      'password',
      'key',
      'secret',
      'credential',
      'session',
      'jwt',
      'bearer',
      'client_secret',
      'private_key',
    ];

    try {
      // Handle relative URLs by using a dummy base
      const isRelative = !url.startsWith('http');
      const parsed = new URL(url, isRelative ? 'http://dummy' : undefined);

      sensitiveParams.forEach((param) => {
        if (parsed.searchParams.has(param)) {
          parsed.searchParams.set(param, '[REDACTED]');
        }
      });

      // Return relative URL if input was relative
      return isRelative ? parsed.pathname + parsed.search + parsed.hash : parsed.toString();
    } catch {
      // If URL parsing fails, return as-is
      return url;
    }
  }
}

export const logger = new Logger(baseLogger);

/**
 * Sets user context for logging
 */
export function setUserContext(user: { id: number } | null | undefined): void {
  if (!user || typeof user !== 'object') {
    logger.warn('setUserContext called with invalid user', { user });
    return;
  }

  logger.setContext({
    user: {
      id: user.id,
    },
  });
}

/**
 * Clears user context from logging
 */
export function clearUserContext(): void {
  logger.clearContext(['user']);
}
