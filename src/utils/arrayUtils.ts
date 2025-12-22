/**
 * Generic array lookup and filter utilities.
 */

/**
 * Finds an item by any property value.
 */
export function findByProp<T, K extends keyof T>(
  array: T[] | undefined | null,
  prop: K,
  value: T[K] | undefined | null
): T | undefined {
  if (!array || value == null) return undefined;
  return array.find((item) => item[prop] === value);
}

/**
 * Finds an item by id.
 */
export function findById<T extends { id: number }>(
  array: T[] | undefined | null,
  id: number | undefined | null
): T | undefined {
  return findByProp(array, 'id', id);
}

/**
 * Finds an item by code.
 */
export function findByCode<T extends { code: string }>(
  array: T[] | undefined | null,
  code: string | undefined | null
): T | undefined {
  return findByProp(array, 'code', code);
}

/**
 * Removes an item from an array by its ID.
 * Mutates the array in place.
 */
export function removeById<T extends { id: number }>(
  array: T[] | undefined | null,
  id: number
): boolean {
  if (!array) return false;
  const index = array.findIndex((item) => item.id === id);
  if (index !== -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Returns a new array without the item with the given ID.
 * Non-mutating alternative to removeById.
 */
export function filterById<T extends { id: number }>(
  array: T[] | undefined | null,
  id: number
): T[] {
  if (!array) return [];
  return array.filter((item) => item.id !== id);
}
