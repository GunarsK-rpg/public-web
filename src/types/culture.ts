import type { Classifier } from './classifier';

/**
 * Culture classifier (cl_cultures)
 */
export type Culture = Classifier;

/**
 * Hero's culture (hero_cultures table)
 */
export interface HeroCulture {
  id: number;
  heroId: number;
  cultureId: number;
}
