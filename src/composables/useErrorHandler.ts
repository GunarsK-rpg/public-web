import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { logger } from 'src/utils/logger';
import { useAuthStore } from 'src/stores/auth';

/**
 * Sanitize a message string to prevent XSS when displaying server-provided content.
 * Escapes HTML special characters to prevent injection.
 */
function sanitizeMessage(message: string | undefined): string | undefined {
  if (!message) return message;
  return message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

interface ErrorContext {
  retryFn?: () => Promise<void> | void;
  retryKey?: string;
  skipLogout?: boolean;
  entityName?: string;
  title?: string;
  message?: string;
  navigateToErrorPage?: boolean;
}

/**
 * API error shape compatible with Axios error structure.
 * Extends Error to ensure stack traces and message are preserved.
 */
interface ApiError extends Error {
  /** HTTP response details from Axios */
  response?: {
    status: number;
    statusText: string;
    data?: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
  };
  /** Request configuration from Axios */
  config?: {
    url?: string;
    method?: string;
    baseURL?: string;
  };
  /** Direct status for non-Axios errors */
  status?: number;
  /** Axios error code (e.g., 'ECONNABORTED', 'ERR_NETWORK') */
  code?: string;
  /** Whether request was made but no response received */
  request?: unknown;
}

/**
 * Centralized error handling composable for RPG application
 * Handles different types of errors with appropriate UI responses
 *
 * Usage:
 * const { handleError, showSuccess } = useErrorHandler()
 * catch (error) { handleError(error) }
 */
export function useErrorHandler() {
  const router = useRouter();
  const $q = useQuasar();
  const authStore = useAuthStore();

  // Track retry attempts per request to prevent infinite loops
  // Note: Map entries are cleaned up on success or final failure to prevent memory leaks
  const retryAttempts = ref(new Map<string, number>());
  const MAX_RETRIES = 3;
  const MAX_TRACKED_KEYS = 100; // Safety limit to prevent unbounded growth

  /**
   * Automatic retry with exponential backoff
   * Delays: 0ms (immediate), 2000ms (2s), 5000ms (5s)
   * Shows notification only on final failure to avoid notification spam
   */
  function createAutoRetry(
    retryFn: (() => Promise<void> | void) | undefined,
    retryKey: string,
    errorContext: ErrorContext = {}
  ): void {
    if (!retryFn) return;

    const attempts = retryAttempts.value.get(retryKey) ?? 0;

    if (attempts >= MAX_RETRIES) {
      // Show error notification only on final failure with context-specific message
      const { title, message } = errorContext;
      $q.notify({
        type: 'negative',
        message: title ?? 'Request Failed',
        caption:
          message ??
          `Unable to complete request after ${MAX_RETRIES} attempts. Please refresh the page and try again.`,
        timeout: 10000,
        actions: [{ icon: 'close', color: 'white' }],
      });
      // Reset attempts after showing final error
      retryAttempts.value.delete(retryKey);
      return;
    }

    // Calculate delay: 0ms (immediate), 2000ms, 5000ms
    const delays = [0, 2000, 5000];
    const delay = delays[attempts] ?? 5000;

    // Increment retry count
    retryAttempts.value.set(retryKey, attempts + 1);

    // Safety: prevent unbounded Map growth if cleanup fails
    if (retryAttempts.value.size > MAX_TRACKED_KEYS) {
      // Remove oldest entries (first inserted)
      const keysToRemove = Array.from(retryAttempts.value.keys()).slice(
        0,
        retryAttempts.value.size - MAX_TRACKED_KEYS
      );
      for (const key of keysToRemove) {
        retryAttempts.value.delete(key);
      }
    }

    // Automatically retry after delay
    setTimeout(() => {
      Promise.resolve(retryFn())
        .then(() => {
          // Only clear on actual success
          retryAttempts.value.delete(retryKey);
        })
        .catch((retryError: unknown) => {
          // Log retry failure for debugging - the retry function's error handler
          // will process the error, but we log here for visibility
          logger.debug('Retry attempt failed', {
            retryKey,
            attempt: attempts + 1,
            error: retryError instanceof Error ? retryError.message : String(retryError),
          });
        });
    }, delay);
  }

  /**
   * Main error handler - routes to appropriate handler based on error type
   */
  function handleError(error: ApiError, context: ErrorContext = {}): void {
    // Extract error info and sanitize server-provided message to prevent XSS
    const status = error.response?.status ?? error.status;
    const rawMessage = error.response?.data?.message ?? error.message;
    const message = sanitizeMessage(rawMessage);

    // Log error with structured data
    logger.error('Error occurred', {
      status,
      message,
      context,
      url: error.config?.url,
      method: error.config?.method,
      errorType: error.response ? 'http' : 'network',
    });

    // Create a unique key for retry tracking
    const retryKey = context.retryKey ?? `${Date.now()}-${Math.random()}`;

    // Route to appropriate handler
    switch (status) {
      case 401:
        handle401(context.skipLogout);
        break;
      case 403:
        handle403(context.navigateToErrorPage);
        break;
      case 404:
        handle404(message);
        break;
      case 500:
      case 502:
      case 503:
        handle500(message, context.navigateToErrorPage);
        break;
      case 408: // Timeout
        handleTimeout(context.retryFn, retryKey);
        break;
      default:
        // Network error or unknown error
        if (!error.response) {
          handleNetworkError(context.retryFn, retryKey);
        } else {
          handleGenericError(message);
        }
    }
  }

  /**
   * 401 - Unauthorized
   * Clear auth state and redirect to login (token expired or invalid)
   */
  function handle401(skipLogout = false): void {
    if (!skipLogout) {
      // Clear auth state before redirecting to prevent redirect loops
      authStore.logout();

      $q.notify({
        type: 'warning',
        message: 'Session Expired',
        caption: 'Your session has expired. Please log in again.',
        timeout: 5000,
      });
      void router.push('/login');
    }
  }

  /**
   * 403 - Forbidden
   * Show notification or navigate to error page
   */
  function handle403(navigateToPage = false): void {
    if (navigateToPage) {
      void router.push({ name: 'forbidden' });
    } else {
      $q.notify({
        type: 'negative',
        message: 'Access Denied',
        caption: 'You do not have permission to perform this action.',
        timeout: 5000,
        actions: [{ icon: 'close', color: 'white' }],
      });
    }
  }

  /**
   * 404 - Not Found
   * Show error notification
   */
  function handle404(message?: string): void {
    $q.notify({
      type: 'negative',
      message: 'Not Found',
      caption: message ?? 'The requested resource was not found.',
      timeout: 5000,
      actions: [{ icon: 'close', color: 'white' }],
    });
  }

  /**
   * 500 - Server Error
   * Show notification or navigate to error page
   */
  function handle500(message?: string, navigateToPage = false): void {
    if (navigateToPage) {
      void router.push({ name: 'server-error' });
    } else {
      $q.notify({
        type: 'negative',
        message: 'Server Error',
        caption: message ?? 'Something went wrong on our end. Please try again later.',
        timeout: 8000,
        actions: [{ icon: 'close', color: 'white' }],
      });
    }
  }

  /**
   * Network Error
   * Automatically retries with exponential backoff (max 3 attempts)
   * Shows notification only on final failure
   */
  function handleNetworkError(
    retryFn: (() => Promise<void> | void) | undefined,
    retryKey: string
  ): void {
    if (retryFn) {
      // Trigger automatic retry with network-specific error message
      createAutoRetry(retryFn, retryKey, {
        title: 'Network Error',
        message:
          'Unable to connect to the server after 3 attempts. Please check your internet connection and refresh the page.',
      });
    } else {
      // No retry function provided, just show error
      $q.notify({
        type: 'negative',
        message: 'Network Error',
        caption: 'Unable to connect to the server. Please check your internet connection.',
        timeout: 8000,
        actions: [{ icon: 'close', color: 'white' }],
      });
    }
  }

  /**
   * Timeout Error
   * Automatically retries with exponential backoff (max 3 attempts)
   * Shows notification only on final failure
   */
  function handleTimeout(
    retryFn: (() => Promise<void> | void) | undefined,
    retryKey: string
  ): void {
    if (retryFn) {
      // Trigger automatic retry with timeout-specific error message
      createAutoRetry(retryFn, retryKey, {
        title: 'Request Timeout',
        message:
          'The request took too long to complete after 3 attempts. Please check your connection and try again.',
      });
    } else {
      // No retry function provided, just show warning
      $q.notify({
        type: 'warning',
        message: 'Request Timeout',
        caption: 'The request took too long to complete. Please try again.',
        timeout: 6000,
        actions: [{ icon: 'close', color: 'white' }],
      });
    }
  }

  /**
   * Generic Error
   * Show error notification with custom message
   */
  function handleGenericError(message?: string): void {
    $q.notify({
      type: 'negative',
      message: 'Error',
      caption: message ?? 'An unexpected error occurred. Please try again.',
      timeout: 6000,
      actions: [{ icon: 'close', color: 'white' }],
    });
  }

  /**
   * Success notification helper
   */
  function showSuccess(message: string, caption?: string, timeout = 3000): void {
    $q.notify({
      type: 'positive',
      message,
      ...(caption && { caption }),
      timeout,
    });
  }

  /**
   * Info notification helper
   */
  function showInfo(message: string, caption?: string, timeout = 4000): void {
    $q.notify({
      type: 'info',
      message,
      ...(caption && { caption }),
      timeout,
    });
  }

  /**
   * Warning notification helper
   */
  function showWarning(message: string, caption?: string, timeout = 5000): void {
    $q.notify({
      type: 'warning',
      message,
      ...(caption && { caption }),
      timeout,
    });
  }

  return {
    handleError,
    handle401,
    handle403,
    handle404,
    handle500,
    handleNetworkError,
    handleTimeout,
    handleGenericError,
    showSuccess,
    showInfo,
    showWarning,
  };
}
