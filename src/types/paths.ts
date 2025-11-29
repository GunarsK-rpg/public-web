import type { SkillId } from './skills';

/**
 * Heroic path identifiers
 */
export type HeroicPathId = 'agent' | 'envoy' | 'hunter' | 'leader' | 'scholar' | 'warrior';

/**
 * Specialty identifiers by heroic path
 */
export type AgentSpecialty = 'investigator' | 'spy' | 'thief';
export type EnvoySpecialty = 'diplomat' | 'faithful' | 'mentor';
export type HunterSpecialty = 'archer' | 'assassin' | 'tracker';
export type LeaderSpecialty = 'champion' | 'officer' | 'politico';
export type ScholarSpecialty = 'artifabrian' | 'strategist' | 'surgeon';
export type WarriorSpecialty = 'duelist' | 'shardbearer' | 'soldier';

export type SpecialtyId =
  | AgentSpecialty
  | EnvoySpecialty
  | HunterSpecialty
  | LeaderSpecialty
  | ScholarSpecialty
  | WarriorSpecialty;

/**
 * Heroic path definition
 */
export interface HeroicPath {
  id: HeroicPathId;
  name: string;
  description: string;
  startingSkill: SkillId;
  keyTalentId: string;
  specialties: SpecialtyId[];
}

/**
 * Specialty definition
 */
export interface Specialty {
  id: SpecialtyId;
  name: string;
  pathId: HeroicPathId;
  description: string;
  talentTreeId: string;
}
