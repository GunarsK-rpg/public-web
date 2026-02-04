import { type Ref } from 'vue';
import axios from 'axios';
import { logger } from './logger';

/**
 * Normalize unknown catch block value to an Error instance.
 * Use directly for Error, or .message for the string.
 */
export function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string') return new Error(msg);
  }
  return new Error(String(err));
}

interface ErrorOptions {
  /** The store's error ref — will be set with the user-facing message */
  errorRef: Ref<string | null>;
  /** User-facing message (also used as log message) */
  message: string;
  /** If set, 404 responses use this message instead and log as warn */
  notFoundMessage?: string;
  /** Extra structured data for the log entry (e.g. { id }) */
  context?: Record<string, unknown>;
  /** Called when 404 is detected (e.g. clear related state) */
  onNotFound?: () => void;
}

/**
 * Unified store error handler — one call per catch block.
 * Handles 404 detection, sets the error ref, and logs consistently.
 */
export function handleError(err: unknown, options: ErrorOptions): void {
  const { errorRef, message, notFoundMessage, context, onNotFound } = options;

  if (notFoundMessage && axios.isAxiosError(err) && err.response?.status === 404) {
    errorRef.value = notFoundMessage;
    onNotFound?.();
    logger.warn(notFoundMessage, context);
    return;
  }

  errorRef.value = message;
  const error = toError(err);
  logger.error(message, {
    ...context,
    error: { message: error.message, stack: error.stack, name: error.name },
  });
}
