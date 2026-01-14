/**
 * Composable for handling numeric modifier input normalization.
 * Eliminates duplication between AttributesStep and SkillsStep.
 */

/**
 * Normalizes a modifier input value from form input.
 * Handles null, empty string, and NaN cases.
 *
 * @param value - Raw value from input (string | number | null)
 * @param min - Optional minimum value for clamping
 * @param max - Optional maximum value for clamping
 * @returns Normalized number or null if input is invalid
 */
export function normalizeModifierInput(
  value: string | number | null,
  min?: number,
  max?: number
): number | null {
  // Handle null and empty string - return 0 (reset to default)
  if (value === null || value === '') {
    return 0;
  }

  const numValue = typeof value === 'string' ? Number(value) : value;

  // Invalid number - return null to signal caller should ignore
  if (Number.isNaN(numValue)) {
    return null;
  }

  // Apply clamping if bounds provided
  let result = numValue;
  if (min !== undefined) {
    result = Math.max(min, result);
  }
  if (max !== undefined) {
    result = Math.min(max, result);
  }

  return result;
}

/**
 * Creates increment/decrement handlers for a numeric value with budget constraints.
 *
 * @param getValue - Function to get current value
 * @param setValue - Function to set new value
 * @param options - Configuration options
 * @returns Object with increment and decrement functions
 */
export function useIncrementDecrement(
  getValue: () => number,
  setValue: (value: number) => void,
  options: {
    min?: number;
    max?: number;
    getBudgetRemaining?: () => number;
  } = {}
) {
  const { min = 0, max = Infinity, getBudgetRemaining } = options;

  function increment(): boolean {
    const current = getValue();
    const canIncrement =
      current < max && (getBudgetRemaining === undefined || getBudgetRemaining() > 0);

    if (canIncrement) {
      setValue(current + 1);
      return true;
    }
    return false;
  }

  function decrement(): boolean {
    const current = getValue();
    if (current > min) {
      setValue(current - 1);
      return true;
    }
    return false;
  }

  return { increment, decrement };
}
