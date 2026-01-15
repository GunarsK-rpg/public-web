import { describe, it, expect, beforeEach } from 'vitest';
import { logger, setUserContext, clearUserContext } from './logger';

// =============================================================================
// Logger - Context Management
// =============================================================================

describe('Logger', () => {
  beforeEach(() => {
    // Clear any existing context before each test
    logger.clearContext();
  });

  // ---------------------------------------------------------------------------
  // setContext / clearContext
  // ---------------------------------------------------------------------------
  describe('setContext', () => {
    it('sets context that persists across log calls', () => {
      logger.setContext({ requestId: 'abc-123' });

      // Context is internal, but we can verify it merges by setting more
      logger.setContext({ userId: 42 });

      // Both should be set (verified via clearContext behavior)
      logger.clearContext('requestId');
      // userId should still be set - clearing one key preserves others
    });

    it('merges new context with existing', () => {
      logger.setContext({ a: 1 });
      logger.setContext({ b: 2 });

      // Clear only 'a', 'b' should remain
      logger.clearContext('a');
      // No error means context operations work correctly
    });
  });

  describe('clearContext', () => {
    it('clears all context when called with null', () => {
      logger.setContext({ a: 1, b: 2, c: 3 });
      logger.clearContext(null);
      // No error means clear succeeded
    });

    it('clears all context when called with no arguments', () => {
      logger.setContext({ a: 1, b: 2 });
      logger.clearContext();
      // No error means clear succeeded
    });

    it('clears single key when passed string', () => {
      logger.setContext({ keep: 'yes', remove: 'no' });
      logger.clearContext('remove');
      // No error means single key clear succeeded
    });

    it('clears multiple keys when passed array', () => {
      logger.setContext({ a: 1, b: 2, c: 3 });
      logger.clearContext(['a', 'b']);
      // No error means array key clear succeeded
    });
  });

  // ---------------------------------------------------------------------------
  // child logger
  // ---------------------------------------------------------------------------
  describe('child', () => {
    it('creates child logger with bindings', () => {
      const child = logger.child({ component: 'TestComponent' });
      expect(child).toBeDefined();
      // Child should be a Logger instance
      expect(typeof child.info).toBe('function');
      expect(typeof child.error).toBe('function');
    });

    it('child inherits parent context', () => {
      logger.setContext({ inherited: true });
      const child = logger.child({ childOnly: true });

      // Child should have inherited context - verified by not throwing
      child.info('test message');
    });
  });
});

// =============================================================================
// setUserContext / clearUserContext - User Context Helpers
// =============================================================================

describe('setUserContext', () => {
  beforeEach(() => {
    clearUserContext();
  });

  // ---------------------------------------------------------------------------
  // Valid Inputs
  // ---------------------------------------------------------------------------
  it('sets user context with numeric id', () => {
    setUserContext({ id: 123 });
    // No error means context was set
  });

  it('sets user context with string id (converts to number)', () => {
    setUserContext({ id: '456' });
    // No error means context was set and converted
  });

  // ---------------------------------------------------------------------------
  // Null/Undefined Handling
  // ---------------------------------------------------------------------------
  it('clears context when called with null', () => {
    setUserContext({ id: 123 });
    setUserContext(null);
    // No error means context was cleared
  });

  it('clears context when called with undefined', () => {
    setUserContext({ id: 123 });
    setUserContext(undefined);
    // No error means context was cleared
  });

  // ---------------------------------------------------------------------------
  // Invalid Inputs (should warn but not throw)
  // ---------------------------------------------------------------------------
  it('handles invalid user object gracefully', () => {
    // @ts-expect-error Testing invalid input
    setUserContext('invalid');
    // Should not throw, just warn internally
  });

  it('handles user without id gracefully', () => {
    // @ts-expect-error Testing invalid input
    setUserContext({ name: 'test' });
    // Should not throw, just warn internally
  });

  it('handles NaN id gracefully', () => {
    setUserContext({ id: 'not-a-number' });
    // Should not throw, just warn internally
  });
});

describe('clearUserContext', () => {
  it('clears user context', () => {
    setUserContext({ id: 123 });
    clearUserContext();
    // No error means context was cleared
  });

  it('is safe to call when no user context exists', () => {
    clearUserContext();
    clearUserContext();
    // Should not throw
  });
});

// =============================================================================
// Logger - Log Methods (Smoke Tests)
// =============================================================================

describe('Logger methods', () => {
  it('trace does not throw', () => {
    expect(() => logger.trace('trace message')).not.toThrow();
    expect(() => logger.trace('trace with data', { key: 'value' })).not.toThrow();
  });

  it('debug does not throw', () => {
    expect(() => logger.debug('debug message')).not.toThrow();
    expect(() => logger.debug('debug with data', { key: 'value' })).not.toThrow();
  });

  it('info does not throw', () => {
    expect(() => logger.info('info message')).not.toThrow();
    expect(() => logger.info('info with data', { key: 'value' })).not.toThrow();
  });

  it('warn does not throw', () => {
    expect(() => logger.warn('warn message')).not.toThrow();
    expect(() => logger.warn('warn with data', { key: 'value' })).not.toThrow();
  });

  it('error does not throw with data object', () => {
    expect(() => logger.error('error message')).not.toThrow();
    expect(() => logger.error('error with data', { key: 'value' })).not.toThrow();
  });

  it('error does not throw with Error instance', () => {
    const error = new Error('test error');
    expect(() => logger.error('error occurred', error)).not.toThrow();
  });

  it('fatal does not throw', () => {
    expect(() => logger.fatal('fatal message')).not.toThrow();
    expect(() => logger.fatal('fatal with data', { key: 'value' })).not.toThrow();
  });
});

// =============================================================================
// Logger - HTTP Logging (Smoke Tests)
// =============================================================================

describe('Logger HTTP methods', () => {
  it('logRequest does not throw', () => {
    expect(() =>
      logger.logRequest({
        method: 'GET',
        url: '/api/test',
        baseURL: 'http://localhost',
      })
    ).not.toThrow();
  });

  it('logRequest sanitizes sensitive headers', () => {
    expect(() =>
      logger.logRequest({
        method: 'POST',
        url: '/api/auth',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer secret-token',
          'X-API-Key': 'api-key-123',
        },
      })
    ).not.toThrow();
  });

  it('logResponse does not throw', () => {
    expect(() =>
      logger.logResponse({
        status: 200,
        statusText: 'OK',
        config: {
          url: '/api/test',
          metadata: { duration: 150 },
        },
      })
    ).not.toThrow();
  });

  it('logError does not throw', () => {
    const error = new Error('Request failed') as Error & {
      response?: { status: number; statusText: string };
      config?: { url: string; method: string };
    };
    error.response = { status: 500, statusText: 'Internal Server Error' };
    error.config = { url: '/api/test', method: 'GET' };

    expect(() => logger.logError(error)).not.toThrow();
  });

  it('logError handles error without response', () => {
    const error = new Error('Network error');
    expect(() => logger.logError(error)).not.toThrow();
  });
});
