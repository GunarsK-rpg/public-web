/**
 * Debounced function interface with cancel method for cleanup
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DebouncedFunction<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

/**
 * Creates a debounced version of a function that delays execution
 * until after the specified delay has elapsed since the last call.
 *
 * @param fn - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function with cancel method for cleanup
 *
 * @example
 * const debouncedSave = debounce((val: string) => save(val), 300);
 * debouncedSave('test');
 * // On unmount: debouncedSave.cancel();
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = undefined;
    }, delay);
  };

  debouncedFn.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  return debouncedFn;
}
