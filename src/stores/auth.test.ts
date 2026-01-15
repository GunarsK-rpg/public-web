import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './auth';

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

// Stub import.meta.env.DEV for mock login tests
vi.stubEnv('DEV', true);

describe('useAuthStore', () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    setActivePinia(createPinia());

    // Reset localStorage mock for each test
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    vi.clearAllMocks();
  });

  // ========================================
  // Initial State
  // ========================================
  describe('initial state', () => {
    it('starts with null user', () => {
      const store = useAuthStore();
      expect(store.user).toBeNull();
    });

    it('starts with null token', () => {
      const store = useAuthStore();
      expect(store.token).toBeNull();
    });

    it('starts not initialized', () => {
      const store = useAuthStore();
      expect(store.initialized).toBe(false);
    });

    it('starts not loading', () => {
      const store = useAuthStore();
      expect(store.loading).toBe(false);
    });

    it('isAuthenticated is false when no token/user', () => {
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  // ========================================
  // Initialize
  // ========================================
  describe('initialize', () => {
    it('sets initialized to true', () => {
      const store = useAuthStore();
      store.initialize();
      expect(store.initialized).toBe(true);
    });

    it('restores user from localStorage if valid', () => {
      const storedAuth = {
        token: 'valid-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
        expiresAt: Date.now() + 100000, // Not expired
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedAuth));

      const store = useAuthStore();
      store.initialize();

      expect(store.user).toEqual(storedAuth.user);
      expect(store.token).toBe('valid-token');
      expect(store.isAuthenticated).toBe(true);
    });

    it('clears expired token from localStorage', () => {
      const storedAuth = {
        token: 'expired-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
        expiresAt: Date.now() - 100000, // Already expired
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedAuth));

      const store = useAuthStore();
      store.initialize();

      expect(store.user).toBeNull();
      expect(store.token).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('clears invalid stored data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json{');

      const store = useAuthStore();
      store.initialize();

      expect(store.user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('clears incomplete user data', () => {
      const storedAuth = {
        token: 'valid-token',
        user: { id: 1 }, // Missing username and email
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedAuth));

      const store = useAuthStore();
      store.initialize();

      expect(store.user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('returns early if already initialized', () => {
      const store = useAuthStore();
      store.initialize();
      localStorageMock.getItem.mockClear();

      store.initialize();

      // Should not call getItem again
      expect(localStorageMock.getItem).not.toHaveBeenCalled();
    });

    it('handles localStorage unavailable', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const store = useAuthStore();
      // Should not throw
      expect(() => store.initialize()).not.toThrow();
      expect(store.initialized).toBe(true);
    });
  });

  // ========================================
  // setAuth
  // ========================================
  describe('setAuth', () => {
    it('sets token and user', () => {
      const store = useAuthStore();
      const user = { id: 1, username: 'testuser', email: 'test@example.com' };

      store.setAuth('new-token', user);

      expect(store.token).toBe('new-token');
      expect(store.user).toEqual(user);
    });

    it('sets isAuthenticated to true', () => {
      const store = useAuthStore();
      const user = { id: 1, username: 'testuser', email: 'test@example.com' };

      store.setAuth('new-token', user);

      expect(store.isAuthenticated).toBe(true);
    });

    it('saves to localStorage', () => {
      const store = useAuthStore();
      const user = { id: 1, username: 'testuser', email: 'test@example.com' };

      store.setAuth('new-token', user);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cosmere_auth',
        expect.stringContaining('new-token')
      );
    });

    it('saves expiresAt when provided', () => {
      const store = useAuthStore();
      const user = { id: 1, username: 'testuser', email: 'test@example.com' };
      const expiresAt = Date.now() + 100000;

      store.setAuth('new-token', user, expiresAt);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cosmere_auth',
        expect.stringContaining(String(expiresAt))
      );
    });

    it('handles localStorage unavailable', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const store = useAuthStore();
      const user = { id: 1, username: 'testuser', email: 'test@example.com' };

      // Should not throw
      expect(() => store.setAuth('new-token', user)).not.toThrow();
      // State should still be set
      expect(store.token).toBe('new-token');
      expect(store.user).toEqual(user);
    });
  });

  // ========================================
  // login (mock dev login)
  // ========================================
  describe('login', () => {
    it('sets user and token on success', async () => {
      const store = useAuthStore();

      const result = await store.login('testuser', 'password');

      expect(result).toBe(true);
      expect(store.user?.username).toBe('testuser');
      expect(store.token).toContain('mock-token');
    });

    it('sets isAuthenticated to true on success', async () => {
      const store = useAuthStore();

      await store.login('testuser', 'password');

      expect(store.isAuthenticated).toBe(true);
    });

    it('generates email from username', async () => {
      const store = useAuthStore();

      await store.login('testuser', 'password');

      expect(store.user?.email).toBe('testuser@example.com');
    });

    it('sets loading during login', async () => {
      const store = useAuthStore();

      const promise = store.login('testuser', 'password');

      // Loading should be true during async operation
      expect(store.loading).toBe(true);

      // After login completes, loading should be false
      await promise;
      expect(store.loading).toBe(false);
    });

    it('saves auth to localStorage', async () => {
      const store = useAuthStore();

      await store.login('testuser', 'password');

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  // ========================================
  // logout
  // ========================================
  describe('logout', () => {
    it('clears user and token', async () => {
      const store = useAuthStore();
      await store.login('testuser', 'password');
      expect(store.isAuthenticated).toBe(true);

      store.logout();

      expect(store.user).toBeNull();
      expect(store.token).toBeNull();
    });

    it('sets isAuthenticated to false', async () => {
      const store = useAuthStore();
      await store.login('testuser', 'password');

      store.logout();

      expect(store.isAuthenticated).toBe(false);
    });

    it('removes from localStorage', async () => {
      const store = useAuthStore();
      await store.login('testuser', 'password');
      localStorageMock.removeItem.mockClear();

      store.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cosmere_auth');
    });

    it('handles localStorage unavailable', async () => {
      const store = useAuthStore();
      await store.login('testuser', 'password');

      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      // Should not throw
      expect(() => store.logout()).not.toThrow();
      expect(store.user).toBeNull();
    });
  });

  // ========================================
  // reset
  // ========================================
  describe('reset', () => {
    it('clears user and token', async () => {
      const store = useAuthStore();
      await store.login('testuser', 'password');

      store.reset();

      expect(store.user).toBeNull();
      expect(store.token).toBeNull();
    });

    it('sets initialized to false', () => {
      const store = useAuthStore();
      store.initialize();

      store.reset();

      expect(store.initialized).toBe(false);
    });

    it('sets loading to false', () => {
      const store = useAuthStore();

      store.reset();

      expect(store.loading).toBe(false);
    });

    it('removes from localStorage', () => {
      const store = useAuthStore();

      store.reset();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cosmere_auth');
    });
  });

  // ========================================
  // currentUser
  // ========================================
  describe('currentUser', () => {
    it('returns null when not logged in', () => {
      const store = useAuthStore();
      expect(store.currentUser).toBeNull();
    });

    it('returns user when logged in', async () => {
      const store = useAuthStore();
      await store.login('testuser', 'password');

      expect(store.currentUser?.username).toBe('testuser');
    });
  });
});
