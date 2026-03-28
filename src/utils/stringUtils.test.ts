import { describe, it, expect } from 'vitest';
import { trimText, trimName } from './stringUtils';

describe('trimName', () => {
  it('trims whitespace', () => {
    expect(trimName('  Hero Name  ')).toBe('Hero Name');
  });

  it('truncates to 255 characters', () => {
    const long = 'A'.repeat(300);
    expect(trimName(long)).toHaveLength(255);
  });

  it('returns empty string for whitespace-only input', () => {
    expect(trimName('   ')).toBe('');
  });
});

describe('trimText', () => {
  it('trims whitespace', () => {
    expect(trimText('  Some text  ')).toBe('Some text');
  });

  it('truncates to 10000 characters', () => {
    const long = 'B'.repeat(15000);
    expect(trimText(long)).toHaveLength(10000);
  });
});
