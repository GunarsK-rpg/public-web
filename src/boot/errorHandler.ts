import { defineBoot } from '#q-app/wrappers';
import { Notify } from 'quasar';
import { logger } from 'src/utils/logger';

/**
 * Global Vue error handler boot file.
 * Catches unhandled errors in Vue components and provides user feedback.
 */
export default defineBoot(({ app }) => {
  // Vue component error handler
  app.config.errorHandler = (err, instance, info) => {
    const error = err instanceof Error ? err : new Error(String(err));
    const componentName = instance?.$options?.name || 'Anonymous';

    logger.error('Unhandled Vue error', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      component: componentName,
      info,
    });

    // Show user-friendly notification
    Notify.create({
      type: 'negative',
      message: 'An unexpected error occurred',
      caption: import.meta.env.DEV ? error.message : 'Please try again or refresh the page',
      timeout: 5000,
      actions: [
        {
          label: 'Dismiss',
          color: 'white',
        },
      ],
    });
  };

  // Vue warning handler (development only)
  if (import.meta.env.DEV) {
    app.config.warnHandler = (msg, instance, trace) => {
      const componentName = instance?.$options?.name || 'Anonymous';

      logger.warn('Vue warning', {
        message: msg,
        component: componentName,
        trace,
      });
    };
  }

  // Global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

    logger.error('Unhandled promise rejection', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    });

    // Show user-friendly notification for unhandled promises
    Notify.create({
      type: 'negative',
      message: 'An unexpected error occurred',
      caption: import.meta.env.DEV ? error.message : 'Please try again or refresh the page',
      timeout: 5000,
      actions: [
        {
          label: 'Dismiss',
          color: 'white',
        },
      ],
    });
  });

  // Global error handler for uncaught exceptions
  window.addEventListener('error', (event) => {
    // Ignore errors from extensions or cross-origin scripts
    if (!event.filename || event.filename.includes('extension://')) {
      return;
    }

    logger.error('Uncaught exception', {
      error: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });
});
