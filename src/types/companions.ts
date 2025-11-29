import type { SprenType } from './radiant';

/**
 * Companion type identifiers
 */
export type CompanionType = 'spren' | 'animal' | 'follower';

/**
 * Animal companion size
 */
export type AnimalSize = 'tiny' | 'small' | 'medium' | 'large';

/**
 * Animal companion trait
 */
export type AnimalTrait = 'loyal' | 'alert' | 'swift' | 'tough' | 'fierce' | 'stealthy';

/**
 * Base companion interface
 */
export interface BaseCompanion {
  id?: string;
  name: string;
  type: CompanionType;
  personality?: string;
  notes?: string;
}

/**
 * Spren companion for Radiants
 */
export interface SprenCompanion extends BaseCompanion {
  type: 'spren';
  subtype: SprenType;
  bondStrength: number;
  canManifestBlade: boolean;
}

/**
 * Animal companion
 */
export interface AnimalCompanion extends BaseCompanion {
  type: 'animal';
  species: string;
  size: AnimalSize;
  health: number;
  traits: AnimalTrait[];
  attacks?: CompanionAttack[];
}

/**
 * Follower companion
 */
export interface FollowerCompanion extends BaseCompanion {
  type: 'follower';
  role: string;
  skills?: string[];
}

/**
 * Companion attack
 */
export interface CompanionAttack {
  name: string;
  damage: string;
  description?: string;
}

/**
 * Union type for all companions
 */
export type Companion = SprenCompanion | AnimalCompanion | FollowerCompanion;
