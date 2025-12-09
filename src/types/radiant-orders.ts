import type { SurgeCode } from './surges';

/**
 * Radiant order code identifiers
 */
export type RadiantOrderCode =
  | 'windrunner'
  | 'skybreaker'
  | 'dustbringer'
  | 'edgedancer'
  | 'truthwatcher'
  | 'lightweaver'
  | 'elsecaller'
  | 'willshaper'
  | 'stoneward'
  | 'bondsmith';

/**
 * Spren type identifiers for Radiant bonds
 */
export type SprenType =
  | 'honorspren'
  | 'highspren'
  | 'ashspren'
  | 'cultivationspren'
  | 'mistspren'
  | 'cryptic'
  | 'inkspren'
  | 'lightspren'
  | 'peakspren'
  | 'stormfather'
  | 'nightwatcher'
  | 'sibling';

/**
 * Radiant order classifier
 */
export interface RadiantOrder {
  id: number;
  code: RadiantOrderCode;
  name: string;
  description?: string;
  surge1Id: number;
  surge2Id: number;
  sprenType?: SprenType;
  surgeCodes?: SurgeCode[];
}

/**
 * Radiant ideal level (0-5)
 */
export type RadiantIdealLevel = 0 | 1 | 2 | 3 | 4 | 5;
