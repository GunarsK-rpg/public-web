import * as Sentry from '@sentry/vue';
import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ app, router }) => {
  const dsn = (import.meta.env.VITE_SENTRY_DSN || '').trim();
  if (!dsn) return;

  Sentry.init({
    app,
    dsn,
    environment: import.meta.env.DEV ? 'development' : 'production',
    enabled: !import.meta.env.DEV,
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
});
