import type { Campaign, CampaignWithCharacters } from 'src/types';

export const campaigns: Campaign[] = [
  {
    id: 'campaign-001',
    name: 'The Shattered Plains',
    description: 'A campaign set during the War of Reckoning on the Shattered Plains',
    gmUserId: 'user-gm-001',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-28T15:30:00Z',
  },
  {
    id: 'campaign-002',
    name: 'Shadows of Kholinar',
    description: 'Urban intrigue in the capital city of Alethkar',
    gmUserId: 'user-gm-002',
    createdAt: '2024-03-20T14:00:00Z',
    updatedAt: '2024-11-25T18:00:00Z',
  },
];

export const campaignsWithCharacters: CampaignWithCharacters[] = [
  {
    id: 'campaign-001',
    name: 'The Shattered Plains',
    description: 'A campaign set during the War of Reckoning on the Shattered Plains',
    gmUserId: 'user-gm-001',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-28T15:30:00Z',
    characters: [
      {
        id: 'char-001',
        name: 'Kaladin Stormblessed',
        level: 5,
        heroicPath: 'warrior',
        radiantOrder: 'windrunner',
        currentHealth: 13,
        maxHealth: 15,
      },
      {
        id: 'char-002',
        name: 'Shallan Davar',
        level: 4,
        heroicPath: 'scholar',
        radiantOrder: 'lightweaver',
        currentHealth: 8,
        maxHealth: 11,
      },
      {
        id: 'char-003',
        name: 'Adolin Kholin',
        level: 6,
        heroicPath: 'warrior',
        radiantOrder: null,
        currentHealth: 14,
        maxHealth: 17,
      },
    ],
  },
  {
    id: 'campaign-002',
    name: 'Shadows of Kholinar',
    description: 'Urban intrigue in the capital city of Alethkar',
    gmUserId: 'user-gm-002',
    createdAt: '2024-03-20T14:00:00Z',
    updatedAt: '2024-11-25T18:00:00Z',
    characters: [],
  },
];

export default campaigns;
