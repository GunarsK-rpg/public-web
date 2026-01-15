import { describe, it, expect, vi } from 'vitest';
import { normalizeModifierInput, useIncrementDecrement } from './useModifierInput';

describe('normalizeModifierInput', () => {
  // ========================================
  // Null and Empty Handling
  // ========================================
  describe('null and empty handling', () => {
    it('returns 0 for null', () => {
      expect(normalizeModifierInput(null)).toBe(0);
    });

    it('returns 0 for empty string', () => {
      expect(normalizeModifierInput('')).toBe(0);
    });
  });

  // ========================================
  // Valid Number Inputs
  // ========================================
  describe('valid number inputs', () => {
    it('passes through positive numbers', () => {
      expect(normalizeModifierInput(5)).toBe(5);
    });

    it('passes through zero', () => {
      expect(normalizeModifierInput(0)).toBe(0);
    });

    it('passes through negative numbers', () => {
      expect(normalizeModifierInput(-3)).toBe(-3);
    });

    it('handles decimal numbers', () => {
      expect(normalizeModifierInput(3.7)).toBe(3.7);
    });
  });

  // ========================================
  // String Conversion
  // ========================================
  describe('string conversion', () => {
    it('converts string numbers', () => {
      expect(normalizeModifierInput('5')).toBe(5);
    });

    it('converts negative string numbers', () => {
      expect(normalizeModifierInput('-3')).toBe(-3);
    });

    it('converts decimal string numbers', () => {
      expect(normalizeModifierInput('3.5')).toBe(3.5);
    });

    it('converts string zero', () => {
      expect(normalizeModifierInput('0')).toBe(0);
    });
  });

  // ========================================
  // Invalid Input Handling
  // ========================================
  describe('invalid input handling', () => {
    it('returns null for NaN string', () => {
      expect(normalizeModifierInput('abc')).toBeNull();
    });

    it('returns null for mixed invalid string', () => {
      expect(normalizeModifierInput('12abc')).toBeNull();
    });

    it('returns null for undefined-like string', () => {
      expect(normalizeModifierInput('undefined')).toBeNull();
    });
  });

  // ========================================
  // Min Clamping
  // ========================================
  describe('min clamping', () => {
    it('clamps value below min to min', () => {
      expect(normalizeModifierInput(-5, 0)).toBe(0);
    });

    it('allows value at min', () => {
      expect(normalizeModifierInput(0, 0)).toBe(0);
    });

    it('allows value above min', () => {
      expect(normalizeModifierInput(5, 0)).toBe(5);
    });

    it('clamps with negative min', () => {
      expect(normalizeModifierInput(-10, -5)).toBe(-5);
    });
  });

  // ========================================
  // Max Clamping
  // ========================================
  describe('max clamping', () => {
    it('clamps value above max to max', () => {
      expect(normalizeModifierInput(15, undefined, 10)).toBe(10);
    });

    it('allows value at max', () => {
      expect(normalizeModifierInput(10, undefined, 10)).toBe(10);
    });

    it('allows value below max', () => {
      expect(normalizeModifierInput(5, undefined, 10)).toBe(5);
    });
  });

  // ========================================
  // Combined Min/Max Clamping
  // ========================================
  describe('combined min/max clamping', () => {
    it('clamps to min when below range', () => {
      expect(normalizeModifierInput(-5, 0, 10)).toBe(0);
    });

    it('clamps to max when above range', () => {
      expect(normalizeModifierInput(15, 0, 10)).toBe(10);
    });

    it('allows value within range', () => {
      expect(normalizeModifierInput(5, 0, 10)).toBe(5);
    });

    it('allows value at boundaries', () => {
      expect(normalizeModifierInput(0, 0, 10)).toBe(0);
      expect(normalizeModifierInput(10, 0, 10)).toBe(10);
    });

    it('handles narrow range', () => {
      expect(normalizeModifierInput(5, 3, 3)).toBe(3);
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles very large numbers', () => {
      expect(normalizeModifierInput(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('handles very small numbers', () => {
      expect(normalizeModifierInput(Number.MIN_SAFE_INTEGER)).toBe(Number.MIN_SAFE_INTEGER);
    });

    it('handles whitespace string', () => {
      // Number('   ') converts to 0
      expect(normalizeModifierInput('   ')).toBe(0);
    });

    it('handles Infinity with max clamp', () => {
      expect(normalizeModifierInput(Infinity, undefined, 100)).toBe(100);
    });

    it('handles -Infinity with min clamp', () => {
      expect(normalizeModifierInput(-Infinity, 0)).toBe(0);
    });
  });
});

describe('useIncrementDecrement', () => {
  // ========================================
  // Basic Increment
  // ========================================
  describe('increment', () => {
    it('increments value by 1', () => {
      let value = 5;
      const { increment } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        }
      );

      const result = increment();

      expect(result).toBe(true);
      expect(value).toBe(6);
    });

    it('returns true when increment succeeds', () => {
      let value = 0;
      const { increment } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        }
      );

      expect(increment()).toBe(true);
    });

    it('increments from zero', () => {
      let value = 0;
      const { increment } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        }
      );

      increment();

      expect(value).toBe(1);
    });

    it('increments negative values', () => {
      let value = -3;
      const { increment } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        }
      );

      increment();

      expect(value).toBe(-2);
    });
  });

  // ========================================
  // Basic Decrement
  // ========================================
  describe('decrement', () => {
    it('decrements value by 1', () => {
      let value = 5;
      const { decrement } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        }
      );

      const result = decrement();

      expect(result).toBe(true);
      expect(value).toBe(4);
    });

    it('returns true when decrement succeeds', () => {
      let value = 10;
      const { decrement } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        }
      );

      expect(decrement()).toBe(true);
    });

    it('decrements to zero', () => {
      let value = 1;
      const { decrement } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        }
      );

      decrement();

      expect(value).toBe(0);
    });
  });

  // ========================================
  // Min Boundary
  // ========================================
  describe('min boundary', () => {
    it('stops at min value', () => {
      let value = 0;
      const { decrement } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        },
        { min: 0 }
      );

      const result = decrement();

      expect(result).toBe(false);
      expect(value).toBe(0);
    });

    it('allows decrement above min', () => {
      let value = 5;
      const { decrement } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        },
        { min: 0 }
      );

      const result = decrement();

      expect(result).toBe(true);
      expect(value).toBe(4);
    });

    it('uses default min of 0', () => {
      let value = 0;
      const { decrement } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        }
      );

      const result = decrement();

      expect(result).toBe(false);
      expect(value).toBe(0);
    });

    it('respects custom min', () => {
      let value = 5;
      const { decrement } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        },
        { min: 5 }
      );

      const result = decrement();

      expect(result).toBe(false);
      expect(value).toBe(5);
    });
  });

  // ========================================
  // Max Boundary
  // ========================================
  describe('max boundary', () => {
    it('stops at max value', () => {
      let value = 10;
      const { increment } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        },
        { max: 10 }
      );

      const result = increment();

      expect(result).toBe(false);
      expect(value).toBe(10);
    });

    it('allows increment below max', () => {
      let value = 5;
      const { increment } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        },
        { max: 10 }
      );

      const result = increment();

      expect(result).toBe(true);
      expect(value).toBe(6);
    });

    it('uses Infinity as default max', () => {
      let value = 1000000;
      const { increment } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        }
      );

      const result = increment();

      expect(result).toBe(true);
      expect(value).toBe(1000001);
    });
  });

  // ========================================
  // Budget Constraint
  // ========================================
  describe('budget constraint', () => {
    it('stops increment when budget is 0', () => {
      let value = 5;
      const { increment } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        },
        { getBudgetRemaining: () => 0 }
      );

      const result = increment();

      expect(result).toBe(false);
      expect(value).toBe(5);
    });

    it('allows increment when budget available', () => {
      let value = 5;
      const { increment } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        },
        { getBudgetRemaining: () => 10 }
      );

      const result = increment();

      expect(result).toBe(true);
      expect(value).toBe(6);
    });

    it('decrement ignores budget', () => {
      let value = 5;
      const { decrement } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        },
        { getBudgetRemaining: () => 0 }
      );

      const result = decrement();

      expect(result).toBe(true);
      expect(value).toBe(4);
    });

    it('uses dynamic budget check', () => {
      let value = 5;
      let budget = 2;
      const { increment } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
          budget--;
        },
        { getBudgetRemaining: () => budget }
      );

      expect(increment()).toBe(true);
      expect(value).toBe(6);
      expect(budget).toBe(1);

      expect(increment()).toBe(true);
      expect(value).toBe(7);
      expect(budget).toBe(0);

      expect(increment()).toBe(false);
      expect(value).toBe(7);
    });
  });

  // ========================================
  // Combined Constraints
  // ========================================
  describe('combined constraints', () => {
    it('respects both max and budget', () => {
      let value = 9;
      const { increment } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        },
        { max: 10, getBudgetRemaining: () => 5 }
      );

      // Can increment (below max, has budget)
      expect(increment()).toBe(true);
      expect(value).toBe(10);

      // Cannot increment (at max)
      expect(increment()).toBe(false);
      expect(value).toBe(10);
    });

    it('stops at max even with budget remaining', () => {
      let value = 10;
      const { increment } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        },
        { max: 10, getBudgetRemaining: () => 100 }
      );

      expect(increment()).toBe(false);
    });

    it('stops at zero budget even below max', () => {
      let value = 5;
      const { increment } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        },
        { max: 100, getBudgetRemaining: () => 0 }
      );

      expect(increment()).toBe(false);
    });

    it('respects min and max range', () => {
      let value = 5;
      const { increment, decrement } = useIncrementDecrement(
        () => value,
        (v) => {
          value = v;
        },
        { min: 3, max: 7 }
      );

      // Increment to max
      increment(); // 6
      increment(); // 7
      expect(increment()).toBe(false);
      expect(value).toBe(7);

      // Decrement to min
      decrement(); // 6
      decrement(); // 5
      decrement(); // 4
      decrement(); // 3
      expect(decrement()).toBe(false);
      expect(value).toBe(3);
    });
  });

  // ========================================
  // Callback Verification
  // ========================================
  describe('callback verification', () => {
    it('calls getValue on each operation', () => {
      const getValue = vi.fn().mockReturnValue(5);
      const setValue = vi.fn();
      const { increment, decrement } = useIncrementDecrement(getValue, setValue);

      increment();
      decrement();

      expect(getValue).toHaveBeenCalledTimes(2);
    });

    it('calls setValue with correct value on increment', () => {
      const getValue = vi.fn().mockReturnValue(5);
      const setValue = vi.fn();
      const { increment } = useIncrementDecrement(getValue, setValue);

      increment();

      expect(setValue).toHaveBeenCalledWith(6);
    });

    it('calls setValue with correct value on decrement', () => {
      const getValue = vi.fn().mockReturnValue(5);
      const setValue = vi.fn();
      const { decrement } = useIncrementDecrement(getValue, setValue);

      decrement();

      expect(setValue).toHaveBeenCalledWith(4);
    });

    it('does not call setValue when blocked by max', () => {
      const getValue = vi.fn().mockReturnValue(10);
      const setValue = vi.fn();
      const { increment } = useIncrementDecrement(getValue, setValue, { max: 10 });

      increment();

      expect(setValue).not.toHaveBeenCalled();
    });

    it('does not call setValue when blocked by min', () => {
      const getValue = vi.fn().mockReturnValue(0);
      const setValue = vi.fn();
      const { decrement } = useIncrementDecrement(getValue, setValue, { min: 0 });

      decrement();

      expect(setValue).not.toHaveBeenCalled();
    });

    it('does not call setValue when blocked by budget', () => {
      const getValue = vi.fn().mockReturnValue(5);
      const setValue = vi.fn();
      const { increment } = useIncrementDecrement(getValue, setValue, {
        getBudgetRemaining: () => 0,
      });

      increment();

      expect(setValue).not.toHaveBeenCalled();
    });
  });
});
