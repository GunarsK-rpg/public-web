import { describe, it, expect } from 'vitest';
import { trimText, trimName } from './stringUtils';
import { MAX_NAME_LENGTH, MAX_TEXT_LENGTH } from 'src/constants';

describe('trimName', () => {
  it('trims whitespace', () => {
    expect(trimName('  Hero Name  ')).toBe('Hero Name');
  });

  it(`truncates to MAX_NAME_LENGTH (${MAX_NAME_LENGTH}) characters`, () => {
    const long = 'A'.repeat(MAX_NAME_LENGTH + 50);
    expect(trimName(long)).toHaveLength(MAX_NAME_LENGTH);
  });

  it('returns empty string for whitespace-only input', () => {
    expect(trimName('   ')).toBe('');
  });
});

describe('trimText', () => {
  it('trims whitespace', () => {
    expect(trimText('  Some text  ')).toBe('Some text');
  });

  it(`truncates to MAX_TEXT_LENGTH (${MAX_TEXT_LENGTH}) characters`, () => {
    const long = 'B'.repeat(MAX_TEXT_LENGTH + 5000);
    expect(trimText(long)).toHaveLength(MAX_TEXT_LENGTH);
  });
});
