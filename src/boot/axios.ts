import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import { api } from 'src/services/api';
import { setAuthFailureCallback } from 'src/services/tokenRefresh';
import { useAuthStore } from 'stores/auth';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  // Wire auth failure callback (refresh failed → logout)
  const authStore = useAuthStore();
  setAuthFailureCallback(() => void authStore.logout());
});

export { api };
