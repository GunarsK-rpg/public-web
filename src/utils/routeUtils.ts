import type { LocationQuery } from 'vue-router';

/**
 * Extract a single string token from route query parameters.
 * Handles arrays (takes first element), nulls, and empty strings.
 */
export function extractQueryParam(query: LocationQuery, key: string): string | null {
  const raw = query[key];
  if (Array.isArray(raw)) return typeof raw[0] === 'string' && raw[0] ? raw[0] : null;
  if (typeof raw !== 'string' || !raw) return null;
  return raw;
}
