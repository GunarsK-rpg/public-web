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

  // Navigation guard for authentication
  Router.beforeEach((to, _from, next) => {
    // Skip auth check during SSR (localStorage not available)
    if (process.env.SERVER) {
      next();
      return;
    }

    const authStore = useAuthStore();

    // Initialize auth state if not done
    if (!authStore.initialized) {
      authStore.initialize();
    }

    // Check if route requires authentication
    const requiresAuth =
      to.matched.some((record) => record.meta.requiresAuth) &&
      !to.matched.some((record) => record.meta.public);

    if (requiresAuth && !authStore.isAuthenticated) {
      next({
        name: 'login',
        query: { redirect: to.fullPath },
      });
      return;
    }

    // Redirect authenticated users away from login
    if (to.name === 'login' && authStore.isAuthenticated) {
      next({ name: 'campaigns' });
      return;
    }

    next();
  });

  return Router;
});
