import { describe, it, expect } from 'vitest';
import { clamp } from './numberUtils';

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 1, 10)).toBe(5);
  });

  it('clamps to min when value is below', () => {
    expect(clamp(-3, 1, 10)).toBe(1);
    expect(clamp(0, 1, 10)).toBe(1);
  });

  it('clamps to max when value is above', () => {
    expect(clamp(15, 1, 10)).toBe(10);
    expect(clamp(1000, 1, 999)).toBe(999);
  });

  it('returns min when min equals max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it('handles boundary values', () => {
    expect(clamp(1, 1, 10)).toBe(1);
    expect(clamp(10, 1, 10)).toBe(10);
  });

  it('handles negative ranges', () => {
    expect(clamp(0, -10, -1)).toBe(-1);
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
  });

  it('handles decimal values', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(1.5, 0, 1)).toBe(1);
  });
});
