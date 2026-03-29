import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Router } from 'vue-router';
import authService, { type LoginResponse } from 'src/services/auth';
import { broadcastLogin, broadcastLogout, type AuthMessage } from 'src/services/authChannel';
import {
  scheduleProactiveRefresh,
  clearProactiveRefresh,
  refreshToken,
} from 'src/services/tokenRefresh';
import { Level, LevelValues, type LevelKey } from 'src/constants/permissions';
import { logger, setUserContext, clearUserContext } from 'src/utils/logger';
import { toError } from 'src/utils/errorHandling';
import axios from 'axios';

let routerInstance: Router | undefined;

export function setRouterInstance(router: Router): void {
  routerInstance = router;
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const userId = ref<number | null>(null);
  const username = ref('');
  const email = ref('');
  const emailVerified = ref(false);
  const displayName = ref('');
  const scopes = ref<Record<string, string>>({});
  const loading = ref(false);

  function isLevelKey(value: string): value is LevelKey {
    return (Object.values(Level) as string[]).includes(value);
  }

  function hasPermission(resource: string, required: string): boolean {
    const userLevel = scopes.value[resource] || Level.NONE;
    const userValue = isLevelKey(userLevel) ? LevelValues[userLevel] : 0;
    const requiredValue = isLevelKey(required) ? LevelValues[required] : Infinity;
    return userValue >= requiredValue;
  }

  const canRead = (resource: string) => hasPermission(resource, Level.READ);
  const canEdit = (resource: string) => hasPermission(resource, Level.EDIT);
  const canDelete = (resource: string) => hasPermission(resource, Level.DELETE);

  function hydrateProfile(data: {
    email?: string;
    email_verified?: boolean;
    display_name?: string;
  }): void {
    email.value = data.email ?? '';
    emailVerified.value = data.email_verified ?? false;
    displayName.value = data.display_name ?? '';
  }

  function resetAuthState(): void {
    clearProactiveRefresh();
    isAuthenticated.value = false;
    userId.value = null;
    username.value = '';
    email.value = '';
    emailVerified.value = false;
    displayName.value = '';
    scopes.value = {};
    clearUserContext();
  }

  async function checkAuthStatus(isRetry = false): Promise<boolean> {
    try {
      let response = await authService.tokenStatus();

      // Access token expired — attempt refresh before giving up
      if (!response.data.valid) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          resetAuthState();
          return false;
        }
        response = await authService.tokenStatus();
      }

      if (!response.data.valid) {
        resetAuthState();
        return false;
      }

      isAuthenticated.value = true;
      userId.value = response.data.user_id ?? null;
      username.value = response.data.username ?? '';
      hydrateProfile(response.data);
      scopes.value = response.data.scopes ?? {};
      scheduleProactiveRefresh(response.data.ttl_seconds);
      return true;
    } catch (error) {
      // 401 from token-status means access token expired — attempt refresh once
      if (!isRetry && axios.isAxiosError(error) && error.response?.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) return checkAuthStatus(true);
        // refreshToken failure already triggers logout via onAuthFailureCallback
        return false;
      }
      resetAuthState();
      logger.warn('Auth status check failed', { error: toError(error).message });
      return false;
    }
  }

  function hydrateLoginResponse(data: LoginResponse, fallbackUsername = ''): void {
    isAuthenticated.value = true;
    userId.value = data.user_id ?? null;
    username.value = data.username || fallbackUsername;
    hydrateProfile(data);
    scopes.value = data.scopes || {};

    if (userId.value) {
      setUserContext({ id: userId.value });
    }

    scheduleProactiveRefresh(data.expires_in);
    broadcastLogin();
  }

  async function login(identifier: string, password: string, rememberMe = false): Promise<boolean> {
    loading.value = true;
    try {
      const response = await authService.login(identifier, password, rememberMe);
      hydrateLoginResponse(response.data, identifier);
      logger.info('User logged in', { identifier });
      return true;
    } catch (error) {
      logger.error('Login failed', toError(error));
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function googleCallback(
    code: string,
    state: string,
    rememberMe: boolean
  ): Promise<boolean> {
    loading.value = true;
    try {
      const response = await authService.googleCallback(code, state, rememberMe);
      hydrateLoginResponse(response.data);
      return true;
    } catch (error) {
      logger.error('Google OAuth callback failed', toError(error));
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await authService.logout();
      logger.info('User logged out');
    } catch (error) {
      logger.warn('Logout request failed, clearing local state anyway', {
        error: toError(error).message,
      });
    } finally {
      const wasAuthenticated = isAuthenticated.value;
      resetAuthState();
      if (wasAuthenticated) {
        broadcastLogout();
        void routerInstance?.push({ name: 'login' });
      }
    }
  }

  function handleAuthBroadcast(message: AuthMessage): void {
    if (message.type === 'logout') {
      resetAuthState();
      void routerInstance?.push({ name: 'login' });
      return;
    }
    if (message.type === 'login') {
      void checkAuthStatus();
      return;
    }
    if (message.type === 'refresh') {
      const ttl = message.expires_in;
      if (typeof ttl === 'number' && Number.isFinite(ttl) && ttl > 0) {
        scheduleProactiveRefresh(ttl);
      }
    }
  }

  let hiddenAt: number | null = null;
  let visibilityHandlerAttached = false;
  const VISIBILITY_DEBOUNCE_MS = 5000;

  function initVisibilityHandler(): void {
    if (typeof document === 'undefined' || visibilityHandlerAttached) return;
    visibilityHandlerAttached = true;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        return;
      }
      if (hiddenAt && Date.now() - hiddenAt > VISIBILITY_DEBOUNCE_MS && isAuthenticated.value) {
        hiddenAt = null;
        void checkAuthStatus();
      }
    });
  }

  return {
    isAuthenticated,
    userId,
    username,
    email,
    emailVerified,
    displayName,
    scopes,
    loading,
    hasPermission,
    canRead,
    canEdit,
    canDelete,
    checkAuthStatus,
    login,
    googleCallback,
    logout,
    handleAuthBroadcast,
    initVisibilityHandler,
  };
});
