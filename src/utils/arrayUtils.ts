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

// =============================================================================
// Lookup Map Utilities
// =============================================================================

/**
 * Build a lookup map from item ID to a specified property value.
 * Useful for O(1) lookups by ID.
 * @param list - array of items with id property
 * @param valueProp - property name for the value to map to
 * @returns Record mapping item IDs to the specified property value
 */
export function buildLookupMap<T extends { id: number }, K extends keyof T>(
  list: T[],
  valueProp: K
): Record<number, T[K]> {
  const map: Record<number, T[K]> = {};
  for (const item of list) {
    map[item.id] = item[valueProp];
  }
  return map;
}

/**
 * Group items by a key derived from each item.
 * @param list - array to group
 * @param keyFn - function to extract the grouping key from each item
 * @returns Record mapping keys to arrays of items
 */
export function groupByKey<T, K extends PropertyKey>(
  list: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of list) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

/**
 * Group items by a foreign key ID property.
 * @param list - array to group
 * @param propName - property name containing the foreign key ID
 * @returns Record mapping IDs to arrays of items
 */
export function groupByForeignKey<T extends { id: number }, K extends keyof T>(
  list: T[],
  propName: K
): Record<number, T[]> {
  return groupByKey(list, (item) => item[propName] as number);
}

/**
 * Group items by a chained foreign key lookup.
 * Example: group skills by attrTypeId via skill.attrId -> attribute.attrTypeId
 * @param items - items to group
 * @param foreignKeyProp - property on item containing the foreign key
 * @param lookupList - list to look up the foreign key in
 * @param targetProp - property on lookup item to group by
 * @returns Record mapping target property values to arrays of items
 */
export function groupByChainedKey<
  T,
  FK extends keyof T,
  L extends { id: number },
  TP extends keyof L,
>(items: T[], foreignKeyProp: FK, lookupList: L[], targetProp: TP): Record<number, T[]> {
  // Build lookup map: lookupItem.id -> lookupItem[targetProp]
  const lookupMap: Record<number, number> = {};
  for (const item of lookupList) {
    lookupMap[item.id] = item[targetProp] as number;
  }

  // Group items by the chained lookup, filtering out items with missing lookups
  const result: Record<number, T[]> = {};
  for (const item of items) {
    const fkValue = item[foreignKeyProp] as number;
    const targetValue = lookupMap[fkValue];
    // Skip items with missing lookups to avoid grouping unrelated items under key 0
    if (targetValue === undefined) continue;
    if (!result[targetValue]) result[targetValue] = [];
    result[targetValue].push(item);
  }
  return result;
}
