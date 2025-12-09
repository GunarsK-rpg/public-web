/**
 * Heroic path code identifiers
 */
export type HeroicPathCode = 'agent' | 'envoy' | 'hunter' | 'leader' | 'scholar' | 'warrior';

/**
 * Heroic path classifier
 */
export interface HeroicPath {
  id: number;
  code: HeroicPathCode;
  name: string;
  description?: string;
}

/**
 * Specialty code identifiers
 */
export type SpecialtyCode =
  | 'investigator'
  | 'spy'
  | 'thief'
  | 'diplomat'
  | 'faithful'
  | 'mentor'
  | 'archer'
  | 'assassin'
  | 'tracker'
  | 'champion'
  | 'officer'
  | 'politico'
  | 'artifabrian'
  | 'strategist'
  | 'surgeon'
  | 'duelist'
  | 'shardbearer'
  | 'soldier';

/**
 * Specialty classifier
 */
export interface Specialty {
  id: number;
  code: SpecialtyCode;
  name: string;
  pathId: number;
  description?: string;
}
