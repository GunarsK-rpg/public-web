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

/**
 * Validates that a redirect URL is safe (relative path only).
 */
/**
 * SessionStorage key for persisting the active hero tab.
 */
export function heroTabKey(characterId: string | number): string {
  return `hero-tab-${characterId}`;
}

/**
 * Clear the stored hero tab so fresh navigation opens the default tab.
 */
export function clearHeroTab(characterId: string | number): void {
  sessionStorage.removeItem(heroTabKey(characterId));
}

export function isValidRedirect(url: string): boolean {
  const normalized = url.replace(/\\/g, '/');
  if (!normalized.startsWith('/')) return false;
  if (normalized.startsWith('//')) return false;
  const colonIndex = normalized.indexOf(':');
  const slashIndex = normalized.indexOf('/', 1);
  if (colonIndex !== -1 && (slashIndex === -1 || colonIndex < slashIndex)) return false;
  if (normalized.includes('@')) return false;
  if (/%[0-9a-fA-F]{2}/.test(normalized)) return false;
  return true;
}
