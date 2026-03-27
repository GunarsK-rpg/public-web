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
