import { describe, it, expect } from 'vitest';
import { formatDate } from './dateUtils';

// =============================================================================
// formatDate - Date String Formatting
// =============================================================================

describe('formatDate', () => {
  // ---------------------------------------------------------------------------
  // Valid Inputs
  // ---------------------------------------------------------------------------
  it('formats valid ISO date string', () => {
    const result = formatDate('2024-03-15T10:30:00Z');
    // Result depends on locale, but should contain year and not be 'Unknown'
    expect(result).not.toBe('Unknown');
    expect(result).toContain('2024');
  });

  it('formats date-only string', () => {
    const result = formatDate('2024-01-01');
    expect(result).not.toBe('Unknown');
    expect(result).toContain('2024');
  });

  // ---------------------------------------------------------------------------
  // Invalid Inputs
  // ---------------------------------------------------------------------------
  it('returns Unknown for undefined', () => {
    expect(formatDate(undefined)).toBe('Unknown');
  });

  it('returns Unknown for empty string', () => {
    expect(formatDate('')).toBe('Unknown');
  });

  it('returns Unknown for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('Unknown');
    expect(formatDate('invalid')).toBe('Unknown');
  });
});
