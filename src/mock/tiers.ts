import type { Tier } from 'src/types';

export const tiers: Tier[] = [
  {
    id: 1,
    code: 'tier1',
    name: 'Tier 1',
    levelMin: 1,
    levelMax: 5,
    description:
      'Characters are just coming into their powers and learning about their place on Roshar.',
  },
  {
    id: 2,
    code: 'tier2',
    name: 'Tier 2',
    levelMin: 6,
    levelMax: 10,
    description: 'Characters begin dealing with higher-stakes issues on Roshar.',
  },
  {
    id: 3,
    code: 'tier3',
    name: 'Tier 3',
    levelMin: 11,
    levelMax: 15,
    description: 'Characters begin facing challenges on a scale that impacts all of Roshar.',
  },
  {
    id: 4,
    code: 'tier4',
    name: 'Tier 4',
    levelMin: 16,
    levelMax: 20,
    description:
      'Characters face challenges not just on Roshar, but potentially stretching into the greater cosmere.',
  },
  {
    id: 5,
    code: 'tier5',
    name: 'Tier 5',
    levelMin: 21,
    levelMax: null,
    description: "After level 20, you've embraced your identity, your powers, and your destiny.",
  },
];

export function getTierByLevel(level: number): Tier | undefined {
  return tiers.find((t) => level >= t.levelMin && (t.levelMax === null || level <= t.levelMax));
}
