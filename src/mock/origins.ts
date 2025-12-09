import type { Origin } from 'src/types';

export const origins: Origin[] = [
  {
    id: 1,
    code: 'soldier',
    name: 'Soldier',
    category: 'martial',
    description: 'Trained in military combat',
    skillBonuses: [
      { skillCode: 'heavy-weaponry', rank: 1 },
      { skillCode: 'athletics', rank: 1 },
    ],
    expertiseCodes: ['military-life'],
    equipmentCodes: ['longsword', 'chain', 'backpack'],
    spheres: 50,
  },
  {
    id: 2,
    code: 'noble',
    name: 'Noble',
    category: 'social',
    description: 'Born to privilege and responsibility',
    skillBonuses: [
      { skillCode: 'persuasion', rank: 1 },
      { skillCode: 'lore', rank: 1 },
    ],
    expertiseCodes: ['high-society'],
    equipmentCodes: ['clothing-fine', 'knife'],
    spheres: 200,
  },
  {
    id: 3,
    code: 'criminal',
    name: 'Criminal',
    category: 'underworld',
    description: 'Life on the wrong side of the law',
    skillBonuses: [
      { skillCode: 'stealth', rank: 1 },
      { skillCode: 'thievery', rank: 1 },
    ],
    expertiseCodes: [],
    equipmentCodes: ['knife', 'clothing-common'],
    spheres: 20,
  },
];
