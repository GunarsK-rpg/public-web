import { describe, it, expect } from 'vitest';
import type { ComputedRef } from 'vue';
import {
  findByProp,
  findById,
  findByCode,
  removeById,
  filterById,
  buildIdNameMap,
  makeNameGetter,
  buildIdCodeMap,
  buildLookupMap,
  groupByKey,
  groupByForeignKey,
  groupByChainedKey,
} from './arrayUtils';

// =============================================================================
// Test Data Types & Fixtures
// =============================================================================

interface TestItem {
  id: number;
  name: string;
  code: string;
  categoryId: number;
}

const createTestItems = (): TestItem[] => [
  { id: 1, name: 'Item One', code: 'ITEM_1', categoryId: 10 },
  { id: 2, name: 'Item Two', code: 'ITEM_2', categoryId: 10 },
  { id: 3, name: 'Item Three', code: 'ITEM_3', categoryId: 20 },
];

// =============================================================================
// Search Functions
// =============================================================================

describe('findByProp', () => {
  // --- Valid inputs ---
  it('finds item by property value', () => {
    const items = createTestItems();
    const result = findByProp(items, 'name', 'Item Two');
    expect(result).toEqual({ id: 2, name: 'Item Two', code: 'ITEM_2', categoryId: 10 });
  });

  it('returns undefined when not found', () => {
    const items = createTestItems();
    const result = findByProp(items, 'name', 'Nonexistent');
    expect(result).toBeUndefined();
  });

  // --- Empty/null arrays ---
  it('returns undefined for empty array', () => {
    const result = findByProp([] as TestItem[], 'id', 1);
    expect(result).toBeUndefined();
  });

  it('returns undefined for null array', () => {
    const result = findByProp(null as TestItem[] | null, 'id', 1);
    expect(result).toBeUndefined();
  });

  it('returns undefined for undefined array', () => {
    const result = findByProp(undefined as TestItem[] | undefined, 'id', 1);
    expect(result).toBeUndefined();
  });

  // --- Null/undefined values ---
  it('returns undefined for null value', () => {
    const items = createTestItems();
    const result = findByProp(items, 'id', null);
    expect(result).toBeUndefined();
  });

  it('returns undefined for undefined value', () => {
    const items = createTestItems();
    const result = findByProp(items, 'id', undefined);
    expect(result).toBeUndefined();
  });
});

describe('findById', () => {
  // --- Valid inputs ---
  it('finds item by id', () => {
    const items = createTestItems();
    const result = findById(items, 2);
    expect(result?.name).toBe('Item Two');
  });

  it('returns undefined when id not found', () => {
    const items = createTestItems();
    const result = findById(items, 999);
    expect(result).toBeUndefined();
  });

  // --- Null/undefined ids ---
  it('returns undefined for null id', () => {
    const items = createTestItems();
    const result = findById(items, null);
    expect(result).toBeUndefined();
  });

  it('returns undefined for undefined id', () => {
    const items = createTestItems();
    const result = findById(items, undefined);
    expect(result).toBeUndefined();
  });
});

describe('findByCode', () => {
  // --- Valid inputs ---
  it('finds item by code', () => {
    const items = createTestItems();
    const result = findByCode(items, 'ITEM_3');
    expect(result?.name).toBe('Item Three');
  });

  it('returns undefined when code not found', () => {
    const items = createTestItems();
    const result = findByCode(items, 'NONEXISTENT');
    expect(result).toBeUndefined();
  });

  // --- Null code ---
  it('returns undefined for null code', () => {
    const items = createTestItems();
    const result = findByCode(items, null);
    expect(result).toBeUndefined();
  });
});

// =============================================================================
// Mutation Functions
// =============================================================================

describe('removeById', () => {
  // --- Successful removal ---
  it('removes item and returns true', () => {
    const items = createTestItems();
    const result = removeById(items, 2);
    expect(result).toBe(true);
    expect(items).toHaveLength(2);
    expect(findById(items, 2)).toBeUndefined();
  });

  it('mutates the original array', () => {
    const items = createTestItems();
    const originalLength = items.length;
    removeById(items, 1);
    expect(items.length).toBe(originalLength - 1);
  });

  // --- Not found ---
  it('returns false when id not found', () => {
    const items = createTestItems();
    const result = removeById(items, 999);
    expect(result).toBe(false);
    expect(items).toHaveLength(3);
  });

  // --- Null/undefined arrays ---
  it('returns false for null array', () => {
    const result = removeById(null, 1);
    expect(result).toBe(false);
  });

  it('returns false for undefined array', () => {
    const result = removeById(undefined, 1);
    expect(result).toBe(false);
  });
});

describe('filterById', () => {
  // --- Filtering ---
  it('returns new array without the specified id', () => {
    const items = createTestItems();
    const result = filterById(items, 2);
    expect(result).toHaveLength(2);
    expect(findById(result, 2)).toBeUndefined();
  });

  it('does not mutate original array', () => {
    const items = createTestItems();
    filterById(items, 2);
    expect(items).toHaveLength(3);
  });

  it('returns same items when id not found', () => {
    const items = createTestItems();
    const result = filterById(items, 999);
    expect(result).toHaveLength(3);
  });

  // --- Null/undefined inputs ---
  it('returns empty array for null input', () => {
    const result = filterById(null, 1);
    expect(result).toEqual([]);
  });

  it('returns empty array for undefined input', () => {
    const result = filterById(undefined, 1);
    expect(result).toEqual([]);
  });
});

// =============================================================================
// Map Building Functions
// =============================================================================

describe('buildIdNameMap', () => {
  it('builds map from id to name', () => {
    const items = createTestItems();
    const map = buildIdNameMap(items);
    expect(map.get(1)).toBe('Item One');
    expect(map.get(2)).toBe('Item Two');
    expect(map.get(3)).toBe('Item Three');
  });

  it('returns empty map for empty array', () => {
    const map = buildIdNameMap([]);
    expect(map.size).toBe(0);
  });

  it('handles duplicate ids (last wins)', () => {
    const items = [
      { id: 1, name: 'First' },
      { id: 1, name: 'Second' },
    ];
    const map = buildIdNameMap(items);
    expect(map.get(1)).toBe('Second');
  });
});

describe('makeNameGetter', () => {
  // --- Found ---
  it('returns name from map', () => {
    const map = new Map<number, string>([
      [1, 'Name One'],
      [2, 'Name Two'],
    ]);
    const computedMap = { value: map } as ComputedRef<Map<number, string>>;
    const getName = makeNameGetter(computedMap);

    expect(getName(1)).toBe('Name One');
    expect(getName(2)).toBe('Name Two');
  });

  // --- Fallbacks ---
  it('returns default fallback for missing id', () => {
    const map = new Map<number, string>();
    const computedMap = { value: map } as ComputedRef<Map<number, string>>;
    const getName = makeNameGetter(computedMap);

    expect(getName(999)).toBe('Unknown');
  });

  it('returns custom fallback when provided', () => {
    const map = new Map<number, string>();
    const computedMap = { value: map } as ComputedRef<Map<number, string>>;
    const getName = makeNameGetter(computedMap, 'N/A');

    expect(getName(999)).toBe('N/A');
  });

  // --- Null/undefined ids ---
  it('returns fallback for null id', () => {
    const map = new Map<number, string>([[1, 'Name']]);
    const computedMap = { value: map } as ComputedRef<Map<number, string>>;
    const getName = makeNameGetter(computedMap);

    expect(getName(null)).toBe('Unknown');
  });

  it('returns fallback for undefined id', () => {
    const map = new Map<number, string>([[1, 'Name']]);
    const computedMap = { value: map } as ComputedRef<Map<number, string>>;
    const getName = makeNameGetter(computedMap);

    expect(getName(undefined)).toBe('Unknown');
  });
});

describe('buildIdCodeMap', () => {
  it('builds map from id to code', () => {
    const items = createTestItems();
    const map = buildIdCodeMap(items);
    expect(map.get(1)).toBe('ITEM_1');
    expect(map.get(2)).toBe('ITEM_2');
    expect(map.get(3)).toBe('ITEM_3');
  });

  it('returns empty map for empty array', () => {
    const map = buildIdCodeMap([]);
    expect(map.size).toBe(0);
  });
});

describe('buildLookupMap', () => {
  it('builds lookup map with specified property', () => {
    const items = createTestItems();
    const map = buildLookupMap(items, 'name');
    expect(map[1]).toBe('Item One');
    expect(map[2]).toBe('Item Two');
  });

  it('works with different property types', () => {
    const items = createTestItems();
    const map = buildLookupMap(items, 'categoryId');
    expect(map[1]).toBe(10);
    expect(map[3]).toBe(20);
  });

  it('returns empty object for empty array', () => {
    const map = buildLookupMap([], 'name');
    expect(Object.keys(map)).toHaveLength(0);
  });
});

// =============================================================================
// Grouping Functions
// =============================================================================

describe('groupByKey', () => {
  // --- Basic grouping ---
  it('groups items by key function', () => {
    const items = createTestItems();
    const grouped = groupByKey(items, (item) => item.categoryId);

    expect(grouped[10]).toHaveLength(2);
    expect(grouped[20]).toHaveLength(1);
    expect(grouped[10]!.map((i) => i.id)).toEqual([1, 2]);
  });

  it('returns empty object for empty array', () => {
    const grouped = groupByKey([], (item: TestItem) => item.categoryId);
    expect(Object.keys(grouped)).toHaveLength(0);
  });

  // --- Different key types ---
  it('handles string keys', () => {
    const items = createTestItems();
    const grouped = groupByKey(items, (item) => item.code);

    expect(grouped['ITEM_1']).toHaveLength(1);
    expect(grouped['ITEM_2']).toHaveLength(1);
  });

  it('handles computed keys', () => {
    const items = [{ value: 5 }, { value: 15 }, { value: 8 }, { value: 25 }];
    const grouped = groupByKey(items, (item) => (item.value < 10 ? 'small' : 'large'));

    expect(grouped['small']).toHaveLength(2);
    expect(grouped['large']).toHaveLength(2);
  });
});

describe('groupByForeignKey', () => {
  it('groups items by foreign key property', () => {
    const items = createTestItems();
    const grouped = groupByForeignKey(items, 'categoryId');

    expect(grouped[10]).toHaveLength(2);
    expect(grouped[20]).toHaveLength(1);
  });

  it('handles items with same foreign key', () => {
    const items = [
      { id: 1, parentId: 100 },
      { id: 2, parentId: 100 },
      { id: 3, parentId: 100 },
    ];
    const grouped = groupByForeignKey(items, 'parentId');

    expect(grouped[100]).toHaveLength(3);
  });

  it('returns empty object for empty array', () => {
    const grouped = groupByForeignKey([], 'categoryId');
    expect(Object.keys(grouped)).toHaveLength(0);
  });
});

describe('groupByChainedKey', () => {
  // --- Chained lookup ---
  it('groups items by chained lookup', () => {
    const skills = [
      { id: 1, name: 'Athletics', attrId: 10 },
      { id: 2, name: 'Intimidation', attrId: 20 },
      { id: 3, name: 'Acrobatics', attrId: 10 },
    ];
    const attributes = [
      { id: 10, name: 'Strength', attrTypeId: 1 },
      { id: 20, name: 'Charisma', attrTypeId: 2 },
    ];

    const grouped = groupByChainedKey(skills, 'attrId', attributes, 'attrTypeId');

    expect(grouped[1]).toHaveLength(2); // Athletics, Acrobatics
    expect(grouped[2]).toHaveLength(1); // Intimidation
    expect(grouped[1]!.map((s) => s.name)).toEqual(['Athletics', 'Acrobatics']);
  });

  // --- Missing lookups ---
  it('skips items with missing lookup', () => {
    const skills = [
      { id: 1, name: 'Valid', attrId: 10 },
      { id: 2, name: 'Invalid', attrId: 999 }, // No matching attribute
    ];
    const attributes = [{ id: 10, name: 'Strength', attrTypeId: 1 }];

    const grouped = groupByChainedKey(skills, 'attrId', attributes, 'attrTypeId');

    expect(grouped[1]).toHaveLength(1);
    expect(grouped[1]![0]!.name).toBe('Valid');
    expect(Object.keys(grouped)).toHaveLength(1);
  });

  // --- Edge cases ---
  it('returns empty object for empty items array', () => {
    const attributes = [{ id: 10, name: 'Strength', attrTypeId: 1 }];
    const grouped = groupByChainedKey([], 'attrId', attributes, 'attrTypeId');
    expect(Object.keys(grouped)).toHaveLength(0);
  });

  it('returns empty object when all lookups fail', () => {
    const skills = [
      { id: 1, name: 'Orphan1', attrId: 100 },
      { id: 2, name: 'Orphan2', attrId: 200 },
    ];
    const attributes = [{ id: 10, name: 'Strength', attrTypeId: 1 }];

    const grouped = groupByChainedKey(skills, 'attrId', attributes, 'attrTypeId');
    expect(Object.keys(grouped)).toHaveLength(0);
  });
});
