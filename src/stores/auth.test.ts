import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore, setRouterInstance } from './auth';
import type { Router } from 'vue-router';

// Mock router instance
const mockPush = vi.fn();
setRouterInstance({ push: mockPush } as unknown as Router);

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

// Mock authChannel
const { mockBroadcastLogin, mockBroadcastLogout } = vi.hoisted(() => ({
  mockBroadcastLogin: vi.fn(),
  mockBroadcastLogout: vi.fn(),
}));

vi.mock('src/services/authChannel', () => ({
  broadcastLogin: mockBroadcastLogin,
  broadcastLogout: mockBroadcastLogout,
  initAuthChannel: vi.fn(),
  closeAuthChannel: vi.fn(),
}));

// Mock token refresh
const { mockScheduleProactiveRefresh, mockClearProactiveRefresh, mockRefreshToken } = vi.hoisted(
  () => ({
    mockScheduleProactiveRefresh: vi.fn(),
    mockClearProactiveRefresh: vi.fn(),
    mockRefreshToken: vi.fn(),
  })
);

vi.mock('src/services/tokenRefresh', () => ({
  scheduleProactiveRefresh: mockScheduleProactiveRefresh,
  clearProactiveRefresh: mockClearProactiveRefresh,
  refreshToken: mockRefreshToken,
}));

// Mock logger
const { mockClearUserContext } = vi.hoisted(() => ({
  mockClearUserContext: vi.fn(),
}));

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  setUserContext: vi.fn(),
  clearUserContext: mockClearUserContext,
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
        data: { username: 'testuser', scopes: { heroes: 'edit' }, user_id: 1, expires_in: 900 },
      });

      const store = useAuthStore();
      const result = await store.login('testuser', 'password');

      expect(result).toBe(true);
      expect(store.isAuthenticated).toBe(true);
      expect(store.username).toBe('testuser');
      expect(store.scopes).toEqual({ heroes: 'edit' });
    });

    it('schedules proactive refresh on successful login', async () => {
      mockLogin.mockResolvedValue({
        data: { username: 'testuser', scopes: {}, expires_in: 900 },
      });

      const store = useAuthStore();
      await store.login('testuser', 'password');

      expect(mockScheduleProactiveRefresh).toHaveBeenCalledWith(900);
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

    it('broadcasts login event on success', async () => {
      mockLogin.mockResolvedValue({
        data: { username: 'testuser', scopes: {}, expires_in: 900 },
      });

      const store = useAuthStore();
      await store.login('testuser', 'password');

      expect(mockBroadcastLogin).toHaveBeenCalled();
    });

    it('does not broadcast login on failure', async () => {
      mockLogin.mockRejectedValue(new Error('fail'));

      const store = useAuthStore();
      await store.login('testuser', 'password');

      expect(mockBroadcastLogin).not.toHaveBeenCalled();
    });

    it('passes rememberMe to auth service', async () => {
      mockLogin.mockResolvedValue({
        data: { username: 'testuser', scopes: {}, expires_in: 900 },
      });

      const store = useAuthStore();
      await store.login('testuser', 'password', true);

      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password', true);
    });

    it('defaults rememberMe to false', async () => {
      mockLogin.mockResolvedValue({
        data: { username: 'testuser', scopes: {}, expires_in: 900 },
      });

      const store = useAuthStore();
      await store.login('testuser', 'password');

      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password', false);
    });
  });

  // ========================================
  // logout
  // ========================================
  describe('logout', () => {
    it('clears state and navigates to login', async () => {
      mockLogin.mockResolvedValue({
        data: { username: 'testuser', scopes: { heroes: 'edit' }, expires_in: 900 },
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

    it('clears proactive refresh on logout', async () => {
      mockLogin.mockResolvedValue({
        data: { username: 'testuser', scopes: {}, expires_in: 900 },
      });
      mockLogout.mockResolvedValue({});

      const store = useAuthStore();
      await store.login('testuser', 'password');
      mockClearProactiveRefresh.mockClear();

      await store.logout();

      expect(mockClearProactiveRefresh).toHaveBeenCalled();
    });

    it('broadcasts logout event', async () => {
      mockLogout.mockResolvedValue({});

      const store = useAuthStore();
      await store.logout();

      expect(mockBroadcastLogout).toHaveBeenCalled();
    });

    it('clears state even when logout request fails', async () => {
      mockLogin.mockResolvedValue({
        data: { username: 'testuser', scopes: {}, expires_in: 900 },
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
        data: { valid: true, username: 'testuser', scopes: { heroes: 'read' }, ttl_seconds: 600 },
      });

      const store = useAuthStore();
      const result = await store.checkAuthStatus();

      expect(result).toBe(true);
      expect(store.isAuthenticated).toBe(true);
      expect(store.username).toBe('testuser');
      expect(store.scopes).toEqual({ heroes: 'read' });
    });

    it('schedules proactive refresh when token is valid', async () => {
      mockTokenStatus.mockResolvedValue({
        data: { valid: true, username: 'testuser', scopes: {}, ttl_seconds: 600 },
      });

      const store = useAuthStore();
      await store.checkAuthStatus();

      expect(mockScheduleProactiveRefresh).toHaveBeenCalledWith(600);
    });

    it('attempts refresh when access token is expired', async () => {
      mockTokenStatus.mockResolvedValue({ data: { valid: false } });
      mockRefreshToken.mockResolvedValue(false);

      const store = useAuthStore();
      await store.checkAuthStatus();

      expect(mockRefreshToken).toHaveBeenCalled();
    });

    it('recovers via refresh when access token is expired', async () => {
      mockTokenStatus.mockResolvedValueOnce({ data: { valid: false } }).mockResolvedValueOnce({
        data: { valid: true, username: 'testuser', scopes: { heroes: 'read' }, ttl_seconds: 800 },
      });
      mockRefreshToken.mockResolvedValue(true);

      const store = useAuthStore();
      const result = await store.checkAuthStatus();

      expect(result).toBe(true);
      expect(store.isAuthenticated).toBe(true);
      expect(store.username).toBe('testuser');
      expect(store.scopes).toEqual({ heroes: 'read' });
      expect(mockScheduleProactiveRefresh).toHaveBeenCalledWith(800);
    });

    it('returns false when refresh fails', async () => {
      mockTokenStatus.mockResolvedValue({ data: { valid: false } });
      mockRefreshToken.mockResolvedValue(false);

      const store = useAuthStore();
      const result = await store.checkAuthStatus();

      expect(result).toBe(false);
      expect(store.isAuthenticated).toBe(false);
      expect(mockClearProactiveRefresh).toHaveBeenCalled();
    });

    it('returns false and clears refresh on error', async () => {
      mockTokenStatus.mockRejectedValue(new Error('Network error'));

      const store = useAuthStore();
      const result = await store.checkAuthStatus();

      expect(result).toBe(false);
      expect(store.isAuthenticated).toBe(false);
      expect(store.username).toBe('');
      expect(store.scopes).toEqual({});
      expect(mockClearProactiveRefresh).toHaveBeenCalled();
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

  // ========================================
  // handleAuthBroadcast
  // ========================================
  describe('handleAuthBroadcast', () => {
    it('clears state and navigates on logout broadcast', async () => {
      mockLogin.mockResolvedValue({
        data: { username: 'testuser', scopes: { heroes: 'edit' }, expires_in: 900 },
      });

      const store = useAuthStore();
      await store.login('testuser', 'password');
      vi.clearAllMocks();

      store.handleAuthBroadcast({ type: 'logout' });

      expect(store.isAuthenticated).toBe(false);
      expect(store.username).toBe('');
      expect(store.scopes).toEqual({});
      expect(mockClearProactiveRefresh).toHaveBeenCalled();
      expect(mockClearUserContext).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith({ name: 'login' });
    });

    it('does not call authService.logout on logout broadcast', () => {
      const store = useAuthStore();
      store.handleAuthBroadcast({ type: 'logout' });

      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('calls checkAuthStatus on login broadcast', async () => {
      mockTokenStatus.mockResolvedValue({
        data: { valid: true, username: 'otheruser', scopes: { heroes: 'read' }, ttl_seconds: 800 },
      });

      const store = useAuthStore();
      store.handleAuthBroadcast({ type: 'login' });

      // Wait for async checkAuthStatus
      await vi.waitFor(() => {
        expect(store.isAuthenticated).toBe(true);
      });
      expect(store.username).toBe('otheruser');
    });
  });
});
