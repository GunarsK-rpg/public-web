import type { Level, Tier, DerivedStat, DerivedStatValue, Attribute } from 'src/types';

export type AttributeValues = Record<string, number>;

export interface DerivedStatDisplay {
  id: number;
  code: string;
  name: string;
  baseValue: number;
  baseDisplay: string;
  modifier: number;
  totalValue: number;
  totalDisplay: string;
  hasModifier: boolean;
}

/**
 * Format value for display based on stat code
 */
function formatValue(statCode: string, value: number): string {
  // Handle edge cases
  if (!Number.isFinite(value)) return '—';

  switch (statCode) {
    case 'recovery_die':
      return value > 0 ? `d${value}` : '—';
    case 'lift_capacity':
    case 'carry_capacity':
      return `${value.toLocaleString()} lb`;
    case 'movement':
      return `${value} ft`;
    case 'senses_range':
      return value === -1 ? 'Unaffected' : `${value} ft`;
    default:
      return String(value);
  }
}

/**
 * Calculate formula-based stat value
 */
export function calculateFormulaStat(
  statCode: string,
  attrs: AttributeValues,
  levelData: Level | undefined,
  tierData: Tier | undefined
): number {
  const str = attrs['str'] ?? 0;
  const spd = attrs['spd'] ?? 0;
  const int = attrs['int'] ?? 0;
  const wil = attrs['wil'] ?? 0;
  const awa = attrs['awa'] ?? 0;
  const pre = attrs['pre'] ?? 0;
  const tier = tierData?.id ?? 1;
  const healthBase = levelData?.healthBase ?? 10;

  switch (statCode) {
    case 'max_health':
      return healthBase + str * tier;
    case 'max_focus':
      return 2 + wil;
    case 'max_investiture':
      return 2 + Math.max(awa, pre);
    case 'physical_defense':
      return 10 + str + spd;
    case 'cognitive_defense':
      return 10 + int + wil;
    case 'spiritual_defense':
      return 10 + awa + pre;
    case 'deflect':
      return 0;
    default:
      return 0;
  }
}

/**
 * Build display list for all derived stats
 * @param derivedStats - list of derived stat classifiers
 * @param derivedStatValues - lookup table for config-based stats
 * @param attributes - list of attribute classifiers
 * @param attrs - hero's attribute values
 * @param levelData - hero's level data
 * @param tierData - hero's tier data
 * @param getModifier - function to get hero's modifier for a stat
 * @returns display list for rendering
 */
export function buildDerivedStatsList(
  derivedStats: DerivedStat[],
  derivedStatValues: DerivedStatValue[],
  attributes: Attribute[],
  attrs: AttributeValues,
  levelData: Level | undefined,
  tierData: Tier | undefined,
  getModifier: (statId: number) => number
): DerivedStatDisplay[] {
  return derivedStats.map((stat) => {
    // Check if this stat has lookup table entries
    const statEntries = derivedStatValues.filter((v) => v.derivedStat.id === stat.id);
    let baseValue: number;
    const hasModifier = stat.code !== 'recovery_die';

    const firstEntry = statEntries[0];
    if (firstEntry) {
      // Lookup-based stat - all entries for a stat should reference the same attribute
      const attrId = firstEntry.attr.id;
      const attr = attributes.find((a) => a.id === attrId);
      const attrValue = attr ? (attrs[attr.code] ?? 0) : 0;

      // Find matching range for the hero's attribute value
      const entry = statEntries.find(
        (v) => attrValue >= v.attrMin && (v.attrMax === null || attrValue <= v.attrMax)
      );

      baseValue = entry?.value ?? 0;
    } else {
      // Formula-based stat
      baseValue = calculateFormulaStat(stat.code, attrs, levelData, tierData);
    }

    const modifier = getModifier(stat.id);
    const totalValue = hasModifier ? baseValue + modifier : baseValue;

    return {
      id: stat.id,
      code: stat.code,
      name: stat.name,
      baseValue,
      baseDisplay: formatValue(stat.code, baseValue),
      modifier,
      totalValue,
      totalDisplay: formatValue(stat.code, totalValue),
      hasModifier,
    };
  });
}
