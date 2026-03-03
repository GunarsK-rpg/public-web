import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'stores/auth';

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, _from, next) => {
    if (process.env.SERVER) {
      next();
      return;
    }

    const authStore = useAuthStore();

    const requiresAuth =
      to.matched.some((record) => record.meta.requiresAuth) &&
      !to.matched.some((record) => record.meta.public);

    if (requiresAuth) {
      // Trust local state; only verify with server on cold start
      if (!authStore.isAuthenticated) {
        const isValid = await authStore.checkAuthStatus();
        if (!isValid) {
          next({ name: 'login', query: { redirect: to.fullPath } });
          return;
        }
      }
    } else if (to.name === 'login' || to.name === 'register') {
      if (authStore.isAuthenticated || (await authStore.checkAuthStatus())) {
        next({ name: 'my-characters' });
        return;
      }
    }

    next();
  });

  return Router;
});
