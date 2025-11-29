import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from 'src/types';

const STORAGE_KEY = 'cosmere_auth';

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

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredAuth = JSON.parse(stored);
        token.value = data.token;
        user.value = data.user;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    initialized.value = true;
  }

  function setAuth(newToken: string, newUser: User): void {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: newToken, user: newUser }));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function login(username: string, password: string): Promise<boolean> {
    loading.value = true;
    try {
      // TODO: Replace with actual API call
      // const response = await authService.login(username, password);
      // setAuth(response.token, response.user);

      // Mock login for development
      await Promise.resolve();
      const mockUser: User = {
        id: 'user-001',
        username,
        email: `${username}@example.com`,
      };
      setAuth('mock-token-' + Date.now(), mockUser);
      return true;
    } catch {
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout(): void {
    token.value = null;
    user.value = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  function reset(): void {
    user.value = null;
    token.value = null;
    initialized.value = false;
    loading.value = false;
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
