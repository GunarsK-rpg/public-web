import type { LocationQuery } from 'vue-router';

/**
 * Extract a single string value from route query parameters.
 * Handles arrays (returns first valid string element), nulls, and empty strings.
 */
export function extractQueryParam(query: LocationQuery, key: string): string | null {
  const raw = query[key];
  if (Array.isArray(raw)) return raw.find((v): v is string => typeof v === 'string' && !!v) ?? null;
  if (typeof raw !== 'string' || !raw) return null;
  return raw;
}

/**
 * Return a new query object with the named key removed.
 */
export function removeQueryParam(query: LocationQuery, key: string): LocationQuery {
  return Object.fromEntries(Object.entries(query).filter(([k]) => k !== key));
}
