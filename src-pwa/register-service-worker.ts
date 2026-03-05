import { Notify } from 'quasar';
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
    Notify.create({
      message: 'New version available.',
      color: 'primary',
      timeout: 0,
      actions: [
        {
          label: 'Refresh',
          color: 'white',
          handler: () => window.location.reload(),
        },
        { label: 'Dismiss', color: 'white' },
      ],
    });
  },

  offline() {
    // No internet connection found. App is running in offline mode.
  },

  error(err) {
    console.error('Service worker registration failed:', err);
  },
});
