import type { Campaign, CampaignWithHeroes } from 'src/types';

export const campaigns: Campaign[] = [
  {
    id: 1,
    code: 'shattered-plains',
    name: 'The Shattered Plains',
    description: 'A campaign set during the War of Reckoning on the Shattered Plains',
    userId: 100,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-28T15:30:00Z',
  },
  {
    id: 2,
    code: 'shadows-kholinar',
    name: 'Shadows of Kholinar',
    description: 'Urban intrigue in the capital city of Alethkar',
    userId: 101,
    createdAt: '2024-03-20T14:00:00Z',
    updatedAt: '2024-11-25T18:00:00Z',
  },
];

export const campaignsWithHeroes: CampaignWithHeroes[] = [
  {
    id: 1,
    code: 'shattered-plains',
    name: 'The Shattered Plains',
    description: 'A campaign set during the War of Reckoning on the Shattered Plains',
    userId: 100,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-28T15:30:00Z',
    heroes: [
      {
        id: 1,
        name: 'Kaladin Stormblessed',
        level: 5,
        radiantOrderId: 1, // Windrunner
        currentHealth: 13,
        maxHealth: 15,
      },
      {
        id: 2,
        name: 'Shallan Davar',
        level: 4,
        radiantOrderId: 2, // Lightweaver
        currentHealth: 8,
        maxHealth: 11,
      },
      {
        id: 3,
        name: 'Adolin Kholin',
        level: 6,
        radiantOrderId: null, // Not a Radiant (explicit null vs undefined which means "not loaded")
        currentHealth: 14,
        maxHealth: 17,
      },
      {
        id: 4,
        name: 'Rlain',
        level: 4,
        radiantOrderId: null, // Not a Radiant
        currentHealth: 12,
        maxHealth: 13,
      },
    ],
  },
  {
    id: 2,
    code: 'shadows-kholinar',
    name: 'Shadows of Kholinar',
    description: 'Urban intrigue in the capital city of Alethkar',
    userId: 101,
    createdAt: '2024-03-20T14:00:00Z',
    updatedAt: '2024-11-25T18:00:00Z',
    heroes: [],
  },
];
