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

  updated() {
    // New content is available; please refresh
  },

  offline() {
    // No internet connection found. App is running in offline mode.
  },

  error(/* err */) {
    // Error during service worker registration
  },
});
