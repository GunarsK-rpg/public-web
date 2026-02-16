import { describe, it, expect } from 'vitest';
import { calculateFormulaStat, buildDerivedStatsList, type AttributeValues } from './derivedStats';
import type { Level, Tier, DerivedStat, DerivedStatValue, Attribute } from 'src/types';

// =============================================================================
// Test Fixtures
// =============================================================================

const createLevel = (overrides: Partial<Level> = {}): Level => ({
  id: 1,
  level: 1,
  tier: { id: 1, code: 'test', name: 'Test' },
  attributePoints: 12,
  healthBase: 10,
  maxSkillRank: 2,
  skillRanks: 8,
  talentSlots: 3,
  ...overrides,
});

const createTier = (overrides: Partial<Tier> = {}): Tier => ({
  id: 1,
  code: 'tier_1',
  name: 'Tier 1',
  levelMin: 1,
  levelMax: 5,
  ...overrides,
});

const createDerivedStat = (overrides: Partial<DerivedStat> = {}): DerivedStat => ({
  id: 1,
  code: 'max_health',
  name: 'Max Health',
  ...overrides,
});

const createAttribute = (overrides: Partial<Attribute> = {}): Attribute => ({
  id: 1,
  code: 'str',
  name: 'Strength',
  attrType: { id: 1, code: 'test', name: 'Test' },
  ...overrides,
});

const createDerivedStatValue = (overrides: Partial<DerivedStatValue> = {}): DerivedStatValue => ({
  id: 1,
  derivedStat: { id: 1, code: 'test', name: 'Test' },
  attr: { id: 1, code: 'test', name: 'Test' },
  attrMin: 0,
  attrMax: 2,
  value: 10,
  valueDisplay: null,
  ...overrides,
});

const createAttrs = (overrides: Partial<AttributeValues> = {}): AttributeValues => ({
  str: 2,
  spd: 2,
  int: 2,
  wil: 2,
  awa: 2,
  pre: 2,
  ...overrides,
});

// =============================================================================
// calculateFormulaStat - Formula-based Stat Calculations
// =============================================================================

describe('calculateFormulaStat', () => {
  // ---------------------------------------------------------------------------
  // Resource Stats (Health, Focus, Investiture)
  // ---------------------------------------------------------------------------
  describe('max_health', () => {
    it('calculates as healthBase + (str * tier)', () => {
      const attrs = createAttrs({ str: 3 });
      const level = createLevel({ healthBase: 10 });
      const tier = createTier({ id: 2 });

      const result = calculateFormulaStat('max_health', attrs, level, tier);

      expect(result).toBe(16); // 10 + (3 * 2)
    });

    it('uses defaults when level/tier undefined', () => {
      const attrs = createAttrs({ str: 3 });

      const result = calculateFormulaStat('max_health', attrs, undefined, undefined);

      expect(result).toBe(13); // 10 + (3 * 1)
    });
  });

  describe('max_focus', () => {
    it('calculates as 2 + willpower', () => {
      const attrs = createAttrs({ wil: 4 });

      const result = calculateFormulaStat('max_focus', attrs, undefined, undefined);

      expect(result).toBe(6); // 2 + 4
    });

    it('returns 2 for zero willpower', () => {
      const attrs = createAttrs({ wil: 0 });

      const result = calculateFormulaStat('max_focus', attrs, undefined, undefined);

      expect(result).toBe(2);
    });
  });

  describe('max_investiture', () => {
    it('calculates as 2 + max(awareness, presence)', () => {
      const attrs = createAttrs({ awa: 3, pre: 5 });

      const result = calculateFormulaStat('max_investiture', attrs, undefined, undefined);

      expect(result).toBe(7); // 2 + max(3, 5) = 2 + 5
    });

    it('uses awareness when higher', () => {
      const attrs = createAttrs({ awa: 5, pre: 2 });

      const result = calculateFormulaStat('max_investiture', attrs, undefined, undefined);

      expect(result).toBe(7); // 2 + max(5, 2) = 2 + 5
    });

    it('handles equal awareness and presence', () => {
      const attrs = createAttrs({ awa: 3, pre: 3 });

      const result = calculateFormulaStat('max_investiture', attrs, undefined, undefined);

      expect(result).toBe(5); // 2 + 3
    });
  });

  // ---------------------------------------------------------------------------
  // Defense Stats
  // ---------------------------------------------------------------------------
  describe('physical_defense', () => {
    it('calculates as 10 + str + spd', () => {
      const attrs = createAttrs({ str: 3, spd: 4 });

      const result = calculateFormulaStat('physical_defense', attrs, undefined, undefined);

      expect(result).toBe(17); // 10 + 3 + 4
    });
  });

  describe('cognitive_defense', () => {
    it('calculates as 10 + int + wil', () => {
      const attrs = createAttrs({ int: 3, wil: 4 });

      const result = calculateFormulaStat('cognitive_defense', attrs, undefined, undefined);

      expect(result).toBe(17); // 10 + 3 + 4
    });
  });

  describe('spiritual_defense', () => {
    it('calculates as 10 + awa + pre', () => {
      const attrs = createAttrs({ awa: 3, pre: 4 });

      const result = calculateFormulaStat('spiritual_defense', attrs, undefined, undefined);

      expect(result).toBe(17); // 10 + 3 + 4
    });
  });

  // ---------------------------------------------------------------------------
  // Other Stats & Edge Cases
  // ---------------------------------------------------------------------------
  describe('deflect', () => {
    it('returns 0 (base deflect without armor)', () => {
      const attrs = createAttrs();

      const result = calculateFormulaStat('deflect', attrs, undefined, undefined);

      expect(result).toBe(0);
    });
  });

  describe('unknown stat', () => {
    it('returns 0 for unknown stat code', () => {
      const attrs = createAttrs();

      const result = calculateFormulaStat('unknown_stat', attrs, undefined, undefined);

      expect(result).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles zero attributes', () => {
      const attrs = createAttrs({ str: 0, spd: 0, int: 0, wil: 0, awa: 0, pre: 0 });
      const level = createLevel({ healthBase: 10 });
      const tier = createTier({ id: 1 });

      expect(calculateFormulaStat('max_health', attrs, level, tier)).toBe(10);
      expect(calculateFormulaStat('max_focus', attrs, level, tier)).toBe(2);
      expect(calculateFormulaStat('physical_defense', attrs, level, tier)).toBe(10);
    });

    it('handles missing attribute values', () => {
      const attrs: AttributeValues = {}; // No attributes

      const result = calculateFormulaStat('physical_defense', attrs, undefined, undefined);

      expect(result).toBe(10); // 10 + 0 + 0
    });
  });
});

// =============================================================================
// buildDerivedStatsList - Stat List Building
// =============================================================================

describe('buildDerivedStatsList', () => {
  const mockGetModifier = (statId: number) => (statId === 1 ? 2 : 0);

  // ---------------------------------------------------------------------------
  // Formula-based Stats
  // ---------------------------------------------------------------------------
  describe('formula-based stats', () => {
    it('builds display list for formula stats', () => {
      const derivedStats = [createDerivedStat({ id: 1, code: 'max_health', name: 'Max Health' })];
      const attrs = createAttrs({ str: 3 });
      const level = createLevel({ healthBase: 10 });
      const tier = createTier({ id: 1 });

      const result = buildDerivedStatsList(
        derivedStats,
        [], // No lookup values
        [],
        attrs,
        level,
        tier,
        mockGetModifier
      );

      expect(result).toHaveLength(1);
      expect(result[0]!.code).toBe('max_health');
      expect(result[0]!.baseValue).toBe(13); // 10 + (3 * 1)
      expect(result[0]!.modifier).toBe(2);
      expect(result[0]!.totalValue).toBe(15); // 13 + 2
      expect(result[0]!.hasModifier).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Lookup-based Stats (from derivedStatValues table)
  // ---------------------------------------------------------------------------
  describe('lookup-based stats', () => {
    it('uses lookup table for stat values', () => {
      const derivedStats = [createDerivedStat({ id: 1, code: 'movement', name: 'Movement' })];
      const attributes = [createAttribute({ id: 1, code: 'spd', name: 'Speed' })];
      const derivedStatValues = [
        createDerivedStatValue({
          derivedStat: { id: 1, code: 'test', name: 'Test' },
          attr: { id: 1, code: 'spd', name: 'Speed' },
          attrMin: 0,
          attrMax: 1,
          value: 20,
        }),
        createDerivedStatValue({
          derivedStat: { id: 1, code: 'test', name: 'Test' },
          attr: { id: 1, code: 'spd', name: 'Speed' },
          attrMin: 2,
          attrMax: 3,
          value: 25,
        }),
        createDerivedStatValue({
          derivedStat: { id: 1, code: 'test', name: 'Test' },
          attr: { id: 1, code: 'spd', name: 'Speed' },
          attrMin: 4,
          attrMax: null,
          value: 30,
        }),
      ];
      const attrs = createAttrs({ spd: 3 });

      const result = buildDerivedStatsList(
        derivedStats,
        derivedStatValues,
        attributes,
        attrs,
        undefined,
        undefined,
        () => 0
      );

      expect(result[0]!.baseValue).toBe(25); // spd=3 falls in 2-3 range
      expect(result[0]!.baseDisplay).toBe('25 ft');
    });

    it('handles null attrMax for unbounded ranges', () => {
      const derivedStats = [createDerivedStat({ id: 1, code: 'movement', name: 'Movement' })];
      const attributes = [createAttribute({ id: 1, code: 'spd' })];
      const derivedStatValues = [
        createDerivedStatValue({
          derivedStat: { id: 1, code: 'test', name: 'Test' },
          attr: { id: 1, code: 'spd', name: 'Speed' },
          attrMin: 0,
          attrMax: 2,
          value: 20,
        }),
        createDerivedStatValue({
          derivedStat: { id: 1, code: 'test', name: 'Test' },
          attr: { id: 1, code: 'spd', name: 'Speed' },
          attrMin: 3,
          attrMax: null,
          value: 35,
        }),
      ];
      const attrs = createAttrs({ spd: 5 });

      const result = buildDerivedStatsList(
        derivedStats,
        derivedStatValues,
        attributes,
        attrs,
        undefined,
        undefined,
        () => 0
      );

      expect(result[0]!.baseValue).toBe(35); // spd=5 falls in 3+ range
    });

    it('returns 0 when no matching range found', () => {
      const derivedStats = [createDerivedStat({ id: 1, code: 'test_stat', name: 'Test' })];
      const attributes = [createAttribute({ id: 1, code: 'str' })];
      const derivedStatValues = [
        createDerivedStatValue({
          derivedStat: { id: 1, code: 'test', name: 'Test' },
          attr: { id: 1, code: 'str', name: 'Strength' },
          attrMin: 5,
          attrMax: 10,
          value: 100,
        }),
      ];
      const attrs = createAttrs({ str: 2 }); // Below min

      const result = buildDerivedStatsList(
        derivedStats,
        derivedStatValues,
        attributes,
        attrs,
        undefined,
        undefined,
        () => 0
      );

      expect(result[0]!.baseValue).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Display Formatting (units, special values)
  // ---------------------------------------------------------------------------
  describe('display formatting', () => {
    it('formats recovery_die with d prefix', () => {
      const derivedStats = [
        createDerivedStat({ id: 1, code: 'recovery_die', name: 'Recovery Die' }),
      ];
      const attributes = [createAttribute({ id: 1, code: 'str' })];
      const derivedStatValues = [
        createDerivedStatValue({
          derivedStat: { id: 1, code: 'test', name: 'Test' },
          attr: { id: 1, code: 'str', name: 'Strength' },
          attrMin: 0,
          attrMax: null,
          value: 8,
        }),
      ];
      const attrs = createAttrs({ str: 2 });

      const result = buildDerivedStatsList(
        derivedStats,
        derivedStatValues,
        attributes,
        attrs,
        undefined,
        undefined,
        () => 0
      );

      expect(result[0]!.baseDisplay).toBe('d8');
      expect(result[0]!.hasModifier).toBe(false); // recovery_die ignores modifiers
    });

    it('formats capacity stats with lb suffix', () => {
      const derivedStats = [
        createDerivedStat({ id: 1, code: 'carry_capacity', name: 'Carry Capacity' }),
      ];
      const attributes = [createAttribute({ id: 1, code: 'str' })];
      const derivedStatValues = [
        createDerivedStatValue({
          derivedStat: { id: 1, code: 'test', name: 'Test' },
          attr: { id: 1, code: 'str', name: 'Strength' },
          attrMin: 0,
          attrMax: null,
          value: 150,
        }),
      ];
      const attrs = createAttrs({ str: 3 });

      const result = buildDerivedStatsList(
        derivedStats,
        derivedStatValues,
        attributes,
        attrs,
        undefined,
        undefined,
        () => 0
      );

      expect(result[0]!.baseDisplay).toBe('150 lb');
    });

    it('formats senses_range with -1 as Unaffected', () => {
      const derivedStats = [
        createDerivedStat({ id: 1, code: 'senses_range', name: 'Senses Range' }),
      ];
      const attributes = [createAttribute({ id: 1, code: 'awa' })];
      const derivedStatValues = [
        createDerivedStatValue({
          derivedStat: { id: 1, code: 'test', name: 'Test' },
          attr: { id: 1, code: 'awa', name: 'Awareness' },
          attrMin: 0,
          attrMax: null,
          value: -1,
        }),
      ];
      const attrs = createAttrs({ awa: 0 });

      const result = buildDerivedStatsList(
        derivedStats,
        derivedStatValues,
        attributes,
        attrs,
        undefined,
        undefined,
        () => 0
      );

      expect(result[0]!.baseDisplay).toBe('Unaffected');
    });
  });

  // ---------------------------------------------------------------------------
  // Modifier Handling
  // ---------------------------------------------------------------------------
  describe('modifier handling', () => {
    it('includes modifier in totalValue', () => {
      const derivedStats = [createDerivedStat({ id: 1, code: 'max_health', name: 'Max Health' })];
      const attrs = createAttrs({ str: 2 });
      const level = createLevel({ healthBase: 10 });
      const tier = createTier({ id: 1 });

      const result = buildDerivedStatsList(
        derivedStats,
        [],
        [],
        attrs,
        level,
        tier,
        () => 5 // +5 modifier
      );

      expect(result[0]!.baseValue).toBe(12); // 10 + (2 * 1)
      expect(result[0]!.modifier).toBe(5);
      expect(result[0]!.totalValue).toBe(17); // 12 + 5
    });

    it('excludes modifier from recovery_die totalValue', () => {
      const derivedStats = [
        createDerivedStat({ id: 1, code: 'recovery_die', name: 'Recovery Die' }),
      ];
      const attributes = [createAttribute({ id: 1, code: 'str' })];
      const derivedStatValues = [
        createDerivedStatValue({
          derivedStat: { id: 1, code: 'test', name: 'Test' },
          attr: { id: 1, code: 'str', name: 'Strength' },
          attrMin: 0,
          attrMax: null,
          value: 6,
        }),
      ];
      const attrs = createAttrs({ str: 1 });

      const result = buildDerivedStatsList(
        derivedStats,
        derivedStatValues,
        attributes,
        attrs,
        undefined,
        undefined,
        () => 10 // Should be ignored
      );

      expect(result[0]!.totalValue).toBe(6); // Modifier not applied
      expect(result[0]!.hasModifier).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('handles empty derivedStats array', () => {
      const result = buildDerivedStatsList(
        [],
        [],
        [],
        createAttrs(),
        undefined,
        undefined,
        () => 0
      );

      expect(result).toEqual([]);
    });

    it('handles missing attribute in lookup', () => {
      const derivedStats = [createDerivedStat({ id: 1, code: 'test', name: 'Test' })];
      const derivedStatValues = [
        createDerivedStatValue({
          derivedStat: { id: 1, code: 'test', name: 'Test' },
          attr: { id: 999, code: 'unknown', name: 'Unknown' }, // Non-existent attribute
          attrMin: 0,
          attrMax: null,
          value: 100,
        }),
      ];

      const result = buildDerivedStatsList(
        derivedStats,
        derivedStatValues,
        [], // No attributes
        createAttrs(),
        undefined,
        undefined,
        () => 0
      );

      // Should use attrValue=0 when attribute not found
      expect(result[0]!.baseValue).toBe(100); // 0 falls in 0-null range
    });
  });
});
