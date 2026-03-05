import { register } from 'register-service-worker';

register(process.env.SERVICE_WORKER_FILE, {
  ready() {
    // Service worker is active
  },

  registered() {
    // Service worker has been registered
  },

  cached() {
    // Content has been cached for offline use
  },

  updatefound() {
    // New content is downloading
  },

  updated(registration) {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
        once: true,
      });
    } else {
      window.location.reload();
    }
  },

  offline() {
    // No internet connection found. App is running in offline mode.
  },

  error(err) {
    console.error('Service worker registration failed:', err);
  },
});
