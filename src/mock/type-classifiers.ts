import type { GoalStatus, ConnectionType, CompanionType } from 'src/types';

/**
 * Goal status classifiers
 */
export const goalStatuses: GoalStatus[] = [
  { id: 1, code: 'active', name: 'Active' },
  { id: 2, code: 'completed', name: 'Completed' },
  { id: 3, code: 'failed', name: 'Failed' },
  { id: 4, code: 'abandoned', name: 'Abandoned' },
];

/**
 * Connection type classifiers
 */
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

/**
 * Companion type classifiers
 */
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

/**
 * Helper to get goal status by code
 */
export function getGoalStatusByCode(code: string): GoalStatus | undefined {
  return goalStatuses.find((s) => s.code === code);
}

/**
 * Helper to get connection type by code
 */
export function getConnectionTypeByCode(code: string): ConnectionType | undefined {
  return connectionTypes.find((t) => t.code === code);
}

/**
 * Helper to get companion type by code
 */
export function getCompanionTypeByCode(code: string): CompanionType | undefined {
  return companionTypes.find((t) => t.code === code);
}
