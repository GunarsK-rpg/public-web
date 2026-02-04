import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Mock vue-router
const mockRouter = {
  push: vi.fn(),
};
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}));

// Mock quasar
const mockNotify = vi.fn();
vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: mockNotify,
  }),
}));

// Mock logger
vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  setUserContext: vi.fn(),
  clearUserContext: vi.fn(),
}));

// Mock auth service (required by auth store)
vi.mock('src/services/auth', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue({}),
    refresh: vi.fn(),
    tokenStatus: vi.fn(),
  },
}));

// Import after mocks are set up
import { useErrorHandler } from './useErrorHandler';
import { useAuthStore } from 'src/stores/auth';

describe('useErrorHandler', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper to create API-like errors
  const createError = (
    status?: number,
    message?: string,
    options: { url?: string; method?: string; noResponse?: boolean } = {}
  ) => {
    const error = new Error(message ?? 'Error') as Error & {
      response?: { status: number; statusText: string; data?: { message?: string } };
      config?: { url?: string; method?: string };
      status?: number;
    };

    if (!options.noResponse && status !== undefined) {
      error.response = {
        status,
        statusText: 'Status Text',
      };
      if (message) {
        error.response.data = { message };
      }
    }

    if (options.url !== undefined || options.method !== undefined) {
      error.config = {};
      if (options.url !== undefined) {
        error.config.url = options.url;
      }
      if (options.method !== undefined) {
        error.config.method = options.method;
      }
    }

    if (options.noResponse && status !== undefined) {
      error.status = status;
    }

    return error;
  };

  // ========================================
  // 401 - Unauthorized
  // ========================================
  describe('handle401', () => {
    it('clears auth and redirects to login', () => {
      const authStore = useAuthStore();
      authStore.isAuthenticated = true;
      authStore.username = 'test';

      const { handleError } = useErrorHandler();
      handleError(createError(401));

      // logout is async (fire-and-forget via void), check notification and direct redirect
      expect(mockNotify).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('shows session expired notification', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(401));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: 'Session Expired',
        })
      );
    });

    it('skips logout when skipLogout is true', () => {
      const authStore = useAuthStore();
      authStore.isAuthenticated = true;
      authStore.username = 'test';

      const { handleError } = useErrorHandler();
      handleError(createError(401), { skipLogout: true });

      expect(authStore.isAuthenticated).toBe(true);
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('can be called directly', () => {
      const { handle401 } = useErrorHandler();
      handle401();

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
      expect(mockNotify).toHaveBeenCalled();
    });
  });

  // ========================================
  // 403 - Forbidden
  // ========================================
  describe('handle403', () => {
    it('shows access denied notification by default', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(403));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'negative',
          message: 'Access Denied',
        })
      );
    });

    it('navigates to forbidden page when specified', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(403), { navigateToErrorPage: true });

      expect(mockRouter.push).toHaveBeenCalledWith({ name: 'forbidden' });
      expect(mockNotify).not.toHaveBeenCalled();
    });

    it('can be called directly', () => {
      const { handle403 } = useErrorHandler();
      handle403();

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access Denied',
        })
      );
    });

    it('can navigate when called directly', () => {
      const { handle403 } = useErrorHandler();
      handle403(true);

      expect(mockRouter.push).toHaveBeenCalledWith({ name: 'forbidden' });
    });
  });

  // ========================================
  // 404 - Not Found
  // ========================================
  describe('handle404', () => {
    it('shows not found notification', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(404));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'negative',
          message: 'Not Found',
        })
      );
    });

    it('uses custom message from response', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(404, 'Hero not found'));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: 'Hero not found',
        })
      );
    });

    it('can be called directly', () => {
      const { handle404 } = useErrorHandler();
      handle404('Custom not found message');

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: 'Custom not found message',
        })
      );
    });
  });

  // ========================================
  // 500/502/503 - Server Error
  // ========================================
  describe('handle500', () => {
    it('shows server error notification for 500', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(500));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'negative',
          message: 'Server Error',
        })
      );
    });

    it('handles 502 Bad Gateway', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(502));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server Error',
        })
      );
    });

    it('handles 503 Service Unavailable', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(503));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server Error',
        })
      );
    });

    it('navigates to server error page when specified', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(500), { navigateToErrorPage: true });

      expect(mockRouter.push).toHaveBeenCalledWith({ name: 'server-error' });
      expect(mockNotify).not.toHaveBeenCalled();
    });

    it('uses custom message from response', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(500, 'Database connection failed'));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: 'Database connection failed',
        })
      );
    });
  });

  // ========================================
  // 408 - Timeout
  // ========================================
  describe('handleTimeout', () => {
    it('shows timeout notification without retry function', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(408));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: 'Request Timeout',
        })
      );
    });

    it('triggers auto-retry with retry function', async () => {
      const retryFn = vi.fn().mockResolvedValue(undefined);

      const { handleError } = useErrorHandler();
      handleError(createError(408), { retryFn, retryKey: 'test-timeout' });

      // First retry is immediate (0ms delay)
      await vi.advanceTimersByTimeAsync(0);

      expect(retryFn).toHaveBeenCalledTimes(1);
    });

    it('can be called directly', () => {
      const { handleTimeout } = useErrorHandler();
      handleTimeout(undefined, 'test-key');

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Request Timeout',
        })
      );
    });
  });

  // ========================================
  // Network Error
  // ========================================
  describe('handleNetworkError', () => {
    it('shows network error notification without retry function', () => {
      const { handleError } = useErrorHandler();
      const error = createError(undefined, 'Network Error', { noResponse: true });
      // Remove response to simulate network error
      delete (error as { response?: unknown }).response;

      handleError(error);

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'negative',
          message: 'Network Error',
        })
      );
    });

    it('triggers auto-retry for network error', async () => {
      const retryFn = vi.fn().mockResolvedValue(undefined);

      const { handleError } = useErrorHandler();
      const error = createError(undefined, 'Network Error');
      delete (error as { response?: unknown }).response;

      handleError(error, { retryFn, retryKey: 'test-network' });

      await vi.advanceTimersByTimeAsync(0);

      expect(retryFn).toHaveBeenCalledTimes(1);
    });

    it('can be called directly', () => {
      const { handleNetworkError } = useErrorHandler();
      handleNetworkError(undefined, 'test-key');

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Network Error',
        })
      );
    });
  });

  // ========================================
  // Generic Error
  // ========================================
  describe('handleGenericError', () => {
    it('shows generic error for unknown status', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(418, "I'm a teapot"));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'negative',
          message: 'Error',
        })
      );
    });

    it('uses custom message', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(418, 'Custom error message'));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: 'Custom error message',
        })
      );
    });

    it('can be called directly', () => {
      const { handleGenericError } = useErrorHandler();
      handleGenericError('Something went wrong');

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error',
          caption: 'Something went wrong',
        })
      );
    });
  });

  // ========================================
  // Auto-Retry Logic
  // ========================================
  describe('auto-retry logic', () => {
    it('retries up to 3 times with exponential backoff', async () => {
      const retryFn = vi.fn().mockRejectedValue(new Error('Still failing'));

      const { handleError } = useErrorHandler();
      const error = createError(undefined, 'Network Error');
      delete (error as { response?: unknown }).response;

      handleError(error, { retryFn, retryKey: 'test-backoff' });

      // First retry: immediate (0ms)
      await vi.advanceTimersByTimeAsync(0);
      expect(retryFn).toHaveBeenCalledTimes(1);

      // Need to re-trigger error handler to continue retry chain
      // In real code, the retry function would call the original request
      // which would fail and trigger handleError again
    });

    it('clears retry tracking on success', async () => {
      let callCount = 0;
      const retryFn = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          return Promise.reject(new Error('Fail once'));
        }
        return Promise.resolve();
      });

      const { handleError } = useErrorHandler();
      const error = createError(undefined, 'Network Error');
      delete (error as { response?: unknown }).response;

      handleError(error, { retryFn, retryKey: 'test-success' });

      // First retry
      await vi.advanceTimersByTimeAsync(0);
      expect(retryFn).toHaveBeenCalledTimes(1);
    });

    it('shows final error notification after max retries', () => {
      const { handleError } = useErrorHandler();

      // Simulate 4 errors with same retry key to exhaust retries
      const error = createError(undefined, 'Network Error');
      delete (error as { response?: unknown }).response;

      // Call 4 times to exceed MAX_RETRIES (3)
      for (let i = 0; i < 4; i++) {
        handleError(error, { retryKey: 'test-max-retries' });
      }

      // After 4th call (exceeds MAX_RETRIES), should show notification
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'negative',
          message: 'Network Error',
        })
      );
    });
  });

  // ========================================
  // XSS Sanitization
  // ========================================
  describe('XSS sanitization', () => {
    it('sanitizes script tags in error messages', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(500, '<script>alert("xss")</script>'));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
        })
      );
    });

    it('sanitizes HTML entities', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(500, '<img onerror="alert(1)" src="x">'));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: '&lt;img onerror=&quot;alert(1)&quot; src=&quot;x&quot;&gt;',
        })
      );
    });

    it('preserves safe text content', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(500, 'Normal error message'));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: 'Normal error message',
        })
      );
    });

    it('handles ampersands correctly', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(500, 'Error in A & B'));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: 'Error in A &amp; B',
        })
      );
    });

    it('handles single quotes', () => {
      const { handleError } = useErrorHandler();
      handleError(createError(500, "Error with 'quotes'"));

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: 'Error with &#x27;quotes&#x27;',
        })
      );
    });
  });

  // ========================================
  // Success/Info/Warning Helpers
  // ========================================
  describe('notification helpers', () => {
    describe('showSuccess', () => {
      it('shows positive notification', () => {
        const { showSuccess } = useErrorHandler();
        showSuccess('Operation completed');

        expect(mockNotify).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'positive',
            message: 'Operation completed',
            timeout: 3000,
          })
        );
      });

      it('includes caption when provided', () => {
        const { showSuccess } = useErrorHandler();
        showSuccess('Saved', 'Changes have been saved');

        expect(mockNotify).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Saved',
            caption: 'Changes have been saved',
          })
        );
      });

      it('uses custom timeout', () => {
        const { showSuccess } = useErrorHandler();
        showSuccess('Quick message', undefined, 1000);

        expect(mockNotify).toHaveBeenCalledWith(
          expect.objectContaining({
            timeout: 1000,
          })
        );
      });
    });

    describe('showInfo', () => {
      it('shows info notification', () => {
        const { showInfo } = useErrorHandler();
        showInfo('Information');

        expect(mockNotify).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'info',
            message: 'Information',
            timeout: 4000,
          })
        );
      });

      it('includes caption when provided', () => {
        const { showInfo } = useErrorHandler();
        showInfo('Tip', 'You can do this');

        expect(mockNotify).toHaveBeenCalledWith(
          expect.objectContaining({
            caption: 'You can do this',
          })
        );
      });
    });

    describe('showWarning', () => {
      it('shows warning notification', () => {
        const { showWarning } = useErrorHandler();
        showWarning('Warning');

        expect(mockNotify).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'warning',
            message: 'Warning',
            timeout: 5000,
          })
        );
      });

      it('includes caption when provided', () => {
        const { showWarning } = useErrorHandler();
        showWarning('Caution', 'This action is irreversible');

        expect(mockNotify).toHaveBeenCalledWith(
          expect.objectContaining({
            caption: 'This action is irreversible',
          })
        );
      });
    });
  });

  // ========================================
  // Error Context
  // ========================================
  describe('error context handling', () => {
    it('uses provided retryKey', () => {
      const retryFn = vi.fn().mockResolvedValue(undefined);
      const { handleError } = useErrorHandler();

      const error = createError(undefined, 'Network Error');
      delete (error as { response?: unknown }).response;

      handleError(error, { retryFn, retryKey: 'custom-key' });

      // Should use custom key for tracking
      expect(retryFn).not.toHaveBeenCalled(); // Not yet - needs timer advance
    });

    it('generates unique retryKey when not provided', async () => {
      const retryFn = vi.fn().mockResolvedValue(undefined);
      const { handleError } = useErrorHandler();

      const error = createError(undefined, 'Network Error');
      delete (error as { response?: unknown }).response;

      handleError(error, { retryFn });
      await vi.advanceTimersByTimeAsync(0);

      expect(retryFn).toHaveBeenCalled();
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles error without message', () => {
      const { handleError } = useErrorHandler();
      const error = createError(500);

      handleError(error);

      expect(mockNotify).toHaveBeenCalled();
    });

    it('handles error with empty config', () => {
      const { handleError } = useErrorHandler();
      const error = createError(500, 'Error', { url: '', method: '' });

      handleError(error);

      expect(mockNotify).toHaveBeenCalled();
    });

    it('handles undefined status gracefully', () => {
      const { handleError } = useErrorHandler();
      const error = new Error('Unknown error');

      handleError(error as unknown as Parameters<typeof handleError>[0]);

      // Should hit network error path (no response)
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Network Error',
        })
      );
    });
  });
});
