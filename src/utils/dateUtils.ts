/**
 * Date formatting utilities.
 */

/**
 * Format a date string for display.
 * Uses the user's locale preference with SSR-safe fallback.
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';
  // Use navigator.language for user's locale preference with SSR-safe fallback
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
