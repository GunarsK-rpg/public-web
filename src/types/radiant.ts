import type { AttributeId } from './attributes';

/**
 * Radiant order identifiers
 */
export type RadiantOrderId =
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
 * Surge identifiers
 */
export type SurgeId =
  | 'abrasion'
  | 'adhesion'
  | 'cohesion'
  | 'division'
  | 'gravitation'
  | 'illumination'
  | 'progression'
  | 'tension'
  | 'transformation'
  | 'transportation';

/**
 * Spren type identifiers
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
 * Radiant order definition
 */
export interface RadiantOrder {
  id: RadiantOrderId;
  name: string;
  surges: [SurgeId, SurgeId];
  sprenType: SprenType;
  divineAttributes: [string, string];
  description: string;
}

/**
 * Surge definition
 */
export interface Surge {
  id: SurgeId;
  name: string;
  attributeId: AttributeId;
  description: string;
}

/**
 * Radiant ideal level (1-5)
 */
export type RadiantIdealLevel = 0 | 1 | 2 | 3 | 4 | 5;
