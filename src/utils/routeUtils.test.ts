import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractQueryParam,
  removeQueryParam,
  heroTabKey,
  clearHeroTab,
  isValidRedirect,
} from './routeUtils';

describe('extractQueryParam', () => {
  it('returns string value for simple param', () => {
    expect(extractQueryParam({ tab: 'skills' }, 'tab')).toBe('skills');
  });

  it('returns null for missing key', () => {
    expect(extractQueryParam({}, 'tab')).toBeNull();
  });

  it('returns null for null value', () => {
    expect(extractQueryParam({ tab: null }, 'tab')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(extractQueryParam({ tab: '' }, 'tab')).toBeNull();
  });

  it('returns first valid string from array', () => {
    expect(extractQueryParam({ tab: [null, '', 'skills', 'stats'] }, 'tab')).toBe('skills');
  });

  it('returns null for array of nulls', () => {
    expect(extractQueryParam({ tab: [null, null] }, 'tab')).toBeNull();
  });
});

describe('removeQueryParam', () => {
  it('removes the specified key', () => {
    expect(removeQueryParam({ tab: 'skills', id: '1' }, 'tab')).toEqual({ id: '1' });
  });

  it('returns empty object when removing only key', () => {
    expect(removeQueryParam({ tab: 'skills' }, 'tab')).toEqual({});
  });

  it('returns same entries when key not present', () => {
    expect(removeQueryParam({ id: '1' }, 'tab')).toEqual({ id: '1' });
  });
});

describe('heroTabKey', () => {
  it('returns key with string id', () => {
    expect(heroTabKey('42')).toBe('hero-tab-42');
  });

  it('returns key with numeric id', () => {
    expect(heroTabKey(7)).toBe('hero-tab-7');
  });
});

describe('clearHeroTab', () => {
  beforeEach(() => {
    vi.stubGlobal('sessionStorage', { removeItem: vi.fn() });
  });

  it('removes the hero tab key from sessionStorage', () => {
    clearHeroTab(5);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('hero-tab-5');
  });
});

describe('isValidRedirect', () => {
  it('accepts simple relative paths', () => {
    expect(isValidRedirect('/dashboard')).toBe(true);
    expect(isValidRedirect('/heroes/42')).toBe(true);
    expect(isValidRedirect('/campaigns/1/combats')).toBe(true);
  });

  it('accepts root path', () => {
    expect(isValidRedirect('/')).toBe(true);
  });

  it('rejects non-relative paths', () => {
    expect(isValidRedirect('dashboard')).toBe(false);
    expect(isValidRedirect('http://evil.com')).toBe(false);
    expect(isValidRedirect('https://evil.com')).toBe(false);
  });

  it('rejects protocol-relative URLs', () => {
    expect(isValidRedirect('//evil.com')).toBe(false);
  });

  it('rejects URLs with scheme-like colons', () => {
    expect(isValidRedirect('/javascript:alert(1)')).toBe(false);
  });

  it('rejects URLs with @ (credential injection)', () => {
    expect(isValidRedirect('/@evil.com')).toBe(false);
    expect(isValidRedirect('/path@host')).toBe(false);
  });

  it('rejects URLs with percent-encoded characters', () => {
    expect(isValidRedirect('/%2F%2Fevil.com')).toBe(false);
    expect(isValidRedirect('/path%00injection')).toBe(false);
  });

  it('normalizes backslashes', () => {
    expect(isValidRedirect('\\\\evil.com')).toBe(false);
  });

  it('allows colon after first path segment', () => {
    expect(isValidRedirect('/path/time:12:00')).toBe(true);
  });
});
