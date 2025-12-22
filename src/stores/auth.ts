import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from 'src/types';
import { logger, setUserContext, clearUserContext } from 'src/utils/logger';

const STORAGE_KEY = 'cosmere_auth';

// Security Note: localStorage is vulnerable to XSS attacks.
// For production, authentication should use httpOnly cookies set by the backend.
// This implementation is for development/mock purposes only.
// TODO: Replace with secure cookie-based auth when backend is implemented

interface StoredAuth {
  token: string;
  user: User;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const initialized = ref(false);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const currentUser = computed(() => user.value);

  function initialize(): void {
    if (initialized.value) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data: StoredAuth = JSON.parse(stored);
          // Validate stored data structure
          if (
            data &&
            typeof data.token === 'string' &&
            data.token.length > 0 &&
            data.user &&
            typeof data.user.id === 'number' &&
            typeof data.user.username === 'string' &&
            typeof data.user.email === 'string'
          ) {
            token.value = data.token;
            user.value = data.user;
            // Restore logger context for restored sessions
            setUserContext(data.user);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // localStorage may be unavailable (SSR, private browsing, etc.)
    }
    initialized.value = true;
  }

  function setAuth(newToken: string, newUser: User): void {
    token.value = newToken;
    user.value = newUser;
    setUserContext(newUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: newToken, user: newUser }));
    } catch {
      // localStorage may be unavailable (SSR, private browsing, etc.)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function login(username: string, password: string): Promise<boolean> {
    // Environment guard: prevent mock auth in production
    if (!import.meta.env.DEV) {
      logger.error('Mock authentication attempted in production');
      throw new Error('Mock authentication is disabled in production');
    }

    loading.value = true;
    try {
      // TODO: Replace with actual API call
      // const response = await authService.login(username, password);
      // setAuth(response.token, response.user);

      // Mock login for development only
      await Promise.resolve();
      const mockUser: User = {
        id: 1,
        username,
        email: `${username}@example.com`,
      };
      setAuth('mock-token-' + Date.now(), mockUser);
      logger.info('User logged in', { userId: mockUser.id });
      return true;
    } catch (err) {
      logger.error('Login failed', err instanceof Error ? err : { error: String(err) });
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout(): void {
    const userId = user.value?.id;
    token.value = null;
    user.value = null;
    clearUserContext();
    logger.info('User logged out', { userId });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage may be unavailable (SSR, private browsing, etc.)
    }
  }

  function reset(): void {
    user.value = null;
    token.value = null;
    initialized.value = false;
    loading.value = false;
    clearUserContext();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage may be unavailable
    }
  }

  return {
    user,
    token,
    initialized,
    loading,
    isAuthenticated,
    currentUser,
    initialize,
    setAuth,
    login,
    logout,
    reset,
  };
});
