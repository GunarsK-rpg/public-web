import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './auth';

// Mock vue-router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock auth service with hoisted fns to avoid unbound-method lint errors
const { mockLogin, mockLogout, mockTokenStatus } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockLogout: vi.fn(),
  mockTokenStatus: vi.fn(),
}));

vi.mock('src/services/auth', () => ({
  default: {
    login: mockLogin,
    logout: mockLogout,
    refresh: vi.fn(),
    tokenStatus: mockTokenStatus,
  },
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

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  // ========================================
  // Initial State
  // ========================================
  describe('initial state', () => {
    it('starts not authenticated', () => {
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);
    });

    it('starts with empty username', () => {
      const store = useAuthStore();
      expect(store.username).toBe('');
    });

    it('starts with empty scopes', () => {
      const store = useAuthStore();
      expect(store.scopes).toEqual({});
    });

    it('starts not loading', () => {
      const store = useAuthStore();
      expect(store.loading).toBe(false);
    });
  });

  // ========================================
  // login
  // ========================================
  describe('login', () => {
    it('sets state on successful login', async () => {
      mockLogin.mockResolvedValue({
        data: { username: 'testuser', scopes: { heroes: 'edit' }, user_id: 1 },
      });

      const store = useAuthStore();
      const result = await store.login('testuser', 'password');

      expect(result).toBe(true);
      expect(store.isAuthenticated).toBe(true);
      expect(store.username).toBe('testuser');
      expect(store.scopes).toEqual({ heroes: 'edit' });
    });

    it('falls back to login username when response has no username', async () => {
      mockLogin.mockResolvedValue({
        data: { scopes: {} },
      });

      const store = useAuthStore();
      await store.login('fallbackuser', 'password');

      expect(store.username).toBe('fallbackuser');
    });

    it('returns false on login failure', async () => {
      mockLogin.mockRejectedValue(new Error('Network error'));

      const store = useAuthStore();
      const result = await store.login('testuser', 'password');

      expect(result).toBe(false);
      expect(store.isAuthenticated).toBe(false);
    });

    it('sets loading during login', async () => {
      mockLogin.mockResolvedValue({
        data: { username: 'testuser', scopes: {} },
      });

      const store = useAuthStore();
      const promise = store.login('testuser', 'password');
      expect(store.loading).toBe(true);

      await promise;
      expect(store.loading).toBe(false);
    });

    it('resets loading on failure', async () => {
      mockLogin.mockRejectedValue(new Error('fail'));

      const store = useAuthStore();
      await store.login('testuser', 'password');

      expect(store.loading).toBe(false);
    });
  });

  // ========================================
  // logout
  // ========================================
  describe('logout', () => {
    it('clears state and navigates to login', async () => {
      mockLogin.mockResolvedValue({
        data: { username: 'testuser', scopes: { heroes: 'edit' } },
      });
      mockLogout.mockResolvedValue({});

      const store = useAuthStore();
      await store.login('testuser', 'password');
      expect(store.isAuthenticated).toBe(true);

      await store.logout();

      expect(store.isAuthenticated).toBe(false);
      expect(store.username).toBe('');
      expect(store.scopes).toEqual({});
      expect(mockPush).toHaveBeenCalledWith({ name: 'login' });
    });

    it('clears state even when logout request fails', async () => {
      mockLogin.mockResolvedValue({
        data: { username: 'testuser', scopes: {} },
      });
      mockLogout.mockRejectedValue(new Error('Network error'));

      const store = useAuthStore();
      await store.login('testuser', 'password');

      await store.logout();

      expect(store.isAuthenticated).toBe(false);
      expect(store.username).toBe('');
    });
  });

  // ========================================
  // checkAuthStatus
  // ========================================
  describe('checkAuthStatus', () => {
    it('sets state when token is valid', async () => {
      mockTokenStatus.mockResolvedValue({
        data: { valid: true, username: 'testuser', scopes: { heroes: 'read' } },
      });

      const store = useAuthStore();
      const result = await store.checkAuthStatus();

      expect(result).toBe(true);
      expect(store.isAuthenticated).toBe(true);
      expect(store.username).toBe('testuser');
      expect(store.scopes).toEqual({ heroes: 'read' });
    });

    it('returns false when token is invalid', async () => {
      mockTokenStatus.mockResolvedValue({
        data: { valid: false },
      });

      const store = useAuthStore();
      const result = await store.checkAuthStatus();

      expect(result).toBe(false);
      expect(store.isAuthenticated).toBe(false);
    });

    it('returns false and clears state on error', async () => {
      mockTokenStatus.mockRejectedValue(new Error('Network error'));

      const store = useAuthStore();
      const result = await store.checkAuthStatus();

      expect(result).toBe(false);
      expect(store.isAuthenticated).toBe(false);
      expect(store.username).toBe('');
      expect(store.scopes).toEqual({});
    });
  });

  // ========================================
  // Permissions
  // ========================================
  describe('permissions', () => {
    it('hasPermission returns true when user level meets required', () => {
      const store = useAuthStore();
      store.scopes = { heroes: 'edit' };

      expect(store.hasPermission('heroes', 'read')).toBe(true);
      expect(store.hasPermission('heroes', 'edit')).toBe(true);
      expect(store.hasPermission('heroes', 'delete')).toBe(false);
    });

    it('hasPermission returns false for unknown resource', () => {
      const store = useAuthStore();
      store.scopes = { heroes: 'edit' };

      expect(store.hasPermission('unknown', 'read')).toBe(false);
    });

    it('canRead checks read permission', () => {
      const store = useAuthStore();
      store.scopes = { heroes: 'read' };

      expect(store.canRead('heroes')).toBe(true);
      expect(store.canRead('campaigns')).toBe(false);
    });

    it('canEdit checks edit permission', () => {
      const store = useAuthStore();
      store.scopes = { heroes: 'edit' };

      expect(store.canEdit('heroes')).toBe(true);
      expect(store.canEdit('campaigns')).toBe(false);
    });

    it('canDelete checks delete permission', () => {
      const store = useAuthStore();
      store.scopes = { heroes: 'delete' };

      expect(store.canDelete('heroes')).toBe(true);
      expect(store.canDelete('campaigns')).toBe(false);
    });
  });
});
