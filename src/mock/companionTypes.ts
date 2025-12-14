import type { CompanionType } from 'src/types';

export const companionTypes: CompanionType[] = [
  {
    id: 1,
    code: 'spren',
    name: 'Spren',
    description: 'A bonded spren companion (for Radiants)',
  },
  {
    id: 2,
    code: 'animal',
    name: 'Animal',
    description: 'A bonded animal companion',
  },
  {
    id: 3,
    code: 'follower',
    name: 'Follower',
    description: 'An NPC who accompanies and assists you',
  },
  {
    id: 4,
    code: 'other',
    name: 'Other',
    description: 'Other types of companions',
  },
];
