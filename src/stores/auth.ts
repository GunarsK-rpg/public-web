import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Router } from 'vue-router';
import authService from 'src/services/auth';
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
  const username = ref('');
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

  function resetAuthState(): void {
    clearProactiveRefresh();
    isAuthenticated.value = false;
    username.value = '';
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
      username.value = response.data.username ?? '';
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

  async function login(
    loginUsername: string,
    password: string,
    rememberMe = false
  ): Promise<boolean> {
    loading.value = true;
    try {
      const response = await authService.login(loginUsername, password, rememberMe);
      isAuthenticated.value = true;
      username.value = response.data.username || loginUsername;
      scopes.value = response.data.scopes || {};

      logger.info('User logged in', { username: loginUsername });

      if (response.data.user_id) {
        setUserContext({ id: response.data.user_id });
      }

      scheduleProactiveRefresh(response.data.expires_in);
      broadcastLogin();
      return true;
    } catch (error) {
      logger.error('Login failed', toError(error));
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
    }
  }

  return {
    isAuthenticated,
    username,
    scopes,
    loading,
    hasPermission,
    canRead,
    canEdit,
    canDelete,
    checkAuthStatus,
    login,
    logout,
    handleAuthBroadcast,
  };
});
