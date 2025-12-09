import type { HeroicPath, Specialty } from 'src/types';

/**
 * Heroic Paths - simplified structure with IDs
 */
export const heroicPaths: HeroicPath[] = [
  {
    id: 1,
    code: 'agent',
    name: 'Agent',
    description: 'Master of espionage and infiltration',
  },
  {
    id: 2,
    code: 'envoy',
    name: 'Envoy',
    description: 'Diplomat and social expert',
  },
  {
    id: 3,
    code: 'hunter',
    name: 'Hunter',
    description: 'Tracker and wilderness expert',
  },
  {
    id: 4,
    code: 'leader',
    name: 'Leader',
    description: 'Commander and inspiration',
  },
  {
    id: 5,
    code: 'scholar',
    name: 'Scholar',
    description: 'Seeker of knowledge',
  },
  {
    id: 6,
    code: 'warrior',
    name: 'Warrior',
    description: 'Master of combat',
  },
];

/**
 * Specialties - pathId references heroicPaths.id
 */
export const specialties: Specialty[] = [
  // Agent specialties (pathId 1)
  {
    id: 1,
    code: 'investigator',
    name: 'Investigator',
    pathId: 1,
    description: 'Expert at finding clues and solving mysteries',
  },
  {
    id: 2,
    code: 'spy',
    name: 'Spy',
    pathId: 1,
    description: 'Master of infiltration and intelligence gathering',
  },
  {
    id: 3,
    code: 'thief',
    name: 'Thief',
    pathId: 1,
    description: 'Expert at acquiring things that belong to others',
  },
  // Envoy specialties (pathId 2)
  {
    id: 4,
    code: 'diplomat',
    name: 'Diplomat',
    pathId: 2,
    description: 'Skilled negotiator and peacemaker',
  },
  {
    id: 5,
    code: 'faithful',
    name: 'Faithful',
    pathId: 2,
    description: 'Devoted religious leader and spiritual guide',
  },
  {
    id: 6,
    code: 'mentor',
    name: 'Mentor',
    pathId: 2,
    description: 'Teacher and guide to others',
  },
  // Hunter specialties (pathId 3)
  {
    id: 7,
    code: 'archer',
    name: 'Archer',
    pathId: 3,
    description: 'Master of ranged combat',
  },
  {
    id: 8,
    code: 'assassin',
    name: 'Assassin',
    pathId: 3,
    description: 'Deadly striker from the shadows',
  },
  {
    id: 9,
    code: 'tracker',
    name: 'Tracker',
    pathId: 3,
    description: 'Expert at following trails and finding prey',
  },
  // Leader specialties (pathId 4)
  {
    id: 10,
    code: 'champion',
    name: 'Champion',
    pathId: 4,
    description: 'Heroic figure who leads by example',
  },
  {
    id: 11,
    code: 'officer',
    name: 'Officer',
    pathId: 4,
    description: 'Military commander and tactician',
  },
  {
    id: 12,
    code: 'politico',
    name: 'Politico',
    pathId: 4,
    description: 'Master of political maneuvering',
  },
  // Scholar specialties (pathId 5)
  {
    id: 13,
    code: 'artifabrian',
    name: 'Artifabrian',
    pathId: 5,
    description: 'Creator and expert of fabrials',
  },
  {
    id: 14,
    code: 'strategist',
    name: 'Strategist',
    pathId: 5,
    description: 'Military planner and analyst',
  },
  {
    id: 15,
    code: 'surgeon',
    name: 'Surgeon',
    pathId: 5,
    description: 'Medical expert and healer',
  },
  // Warrior specialties (pathId 6)
  {
    id: 16,
    code: 'duelist',
    name: 'Duelist',
    pathId: 6,
    description: 'One-on-one combat master',
  },
  {
    id: 17,
    code: 'shardbearer',
    name: 'Shardbearer',
    pathId: 6,
    description: 'Wielder of Shardblades and Shardplate',
  },
  {
    id: 18,
    code: 'soldier',
    name: 'Soldier',
    pathId: 6,
    description: 'Infantry combat specialist',
  },
];

/**
 * Helper to get path by code
 */
export function getPathByCode(code: string): HeroicPath | undefined {
  return heroicPaths.find((p) => p.code === code);
}

/**
 * Helper to get path by ID
 */
export function getPathById(id: number): HeroicPath | undefined {
  return heroicPaths.find((p) => p.id === id);
}

/**
 * Helper to get specialties for a path
 */
export function getSpecialtiesByPathId(pathId: number): Specialty[] {
  return specialties.filter((s) => s.pathId === pathId);
}

/**
 * Helper to get specialty by code
 */
export function getSpecialtyByCode(code: string): Specialty | undefined {
  return specialties.find((s) => s.code === code);
}
