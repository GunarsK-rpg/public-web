import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import { api } from 'src/services/api';
import { initAuthChannel } from 'src/services/authChannel';
import { setAuthFailureCallback } from 'src/services/tokenRefresh';
import { useAuthStore, setRouterInstance } from 'stores/auth';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

export default defineBoot(({ app, router }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  setRouterInstance(router);

  // Wire auth failure callback (refresh failed → logout)
  const authStore = useAuthStore();
  setAuthFailureCallback(() => void authStore.logout());
  initAuthChannel((msg) => authStore.handleAuthBroadcast(msg));
  authStore.initVisibilityHandler();
});

export { api };
