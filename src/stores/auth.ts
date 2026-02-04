import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from 'src/services/auth';
import { Level, LevelValues, type LevelKey } from 'src/constants/permissions';
import { logger, setUserContext, clearUserContext } from 'src/utils/logger';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  const isAuthenticated = ref(false);
  const username = ref('');
  const scopes = ref<Record<string, string>>({});
  const loading = ref(false);

  function isLevelKey(value: string): value is LevelKey {
    return value in LevelValues;
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

  async function checkAuthStatus(): Promise<boolean> {
    try {
      const response = await authService.tokenStatus();
      const isValid = response.data.valid;
      isAuthenticated.value = isValid;
      if (isValid) {
        username.value = response.data.username ?? '';
        scopes.value = response.data.scopes ?? {};
      } else {
        username.value = '';
        scopes.value = {};
        clearUserContext();
      }
      return isValid;
    } catch (error) {
      isAuthenticated.value = false;
      username.value = '';
      scopes.value = {};
      logger.warn('Auth status check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  async function login(loginUsername: string, password: string): Promise<boolean> {
    loading.value = true;
    try {
      const response = await authService.login(loginUsername, password);
      isAuthenticated.value = true;
      username.value = response.data.username || loginUsername;
      scopes.value = response.data.scopes || {};

      logger.info('User logged in', { username: loginUsername });

      if (response.data.user_id) {
        setUserContext({ id: response.data.user_id });
      }

      return true;
    } catch (error) {
      logger.error('Login failed', error instanceof Error ? error : { error: String(error) });
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
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      isAuthenticated.value = false;
      username.value = '';
      scopes.value = {};
      clearUserContext();
      void router.push({ name: 'login' });
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
  };
});
