import type { GoalStatus, ConnectionType } from 'src/types';

export const goalStatuses: GoalStatus[] = [
  { id: 1, code: 'active', name: 'Active' },
  { id: 2, code: 'completed', name: 'Completed' },
  { id: 3, code: 'failed', name: 'Failed' },
  { id: 4, code: 'abandoned', name: 'Abandoned' },
];

export const connectionTypes: ConnectionType[] = [
  {
    id: 1,
    code: 'ally',
    name: 'Ally',
    description: 'A trusted friend who actively supports you',
  },
  {
    id: 2,
    code: 'contact',
    name: 'Contact',
    description: 'Someone who can provide information or services',
  },
  {
    id: 3,
    code: 'rival',
    name: 'Rival',
    description: 'A competitor who opposes you but may not be an enemy',
  },
  {
    id: 4,
    code: 'enemy',
    name: 'Enemy',
    description: 'Someone actively working against you',
  },
  {
    id: 5,
    code: 'patron',
    name: 'Patron',
    description: 'A powerful figure who provides support or resources',
  },
  {
    id: 6,
    code: 'follower',
    name: 'Follower',
    description: 'Someone who serves or follows you',
  },
];
