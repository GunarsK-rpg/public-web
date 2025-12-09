import type { ExpertiseCategoryCode } from './expertise-types';

/**
 * Expertise classifier
 */
export interface Expertise {
  id: number;
  code: string;
  name: string;
  expertiseTypeId?: number;
  categoryId: number;
  cultureId?: number;
  isRestricted?: boolean;
  description?: string;
}

/**
 * Hero's expertise
 */
export interface HeroExpertise {
  id: number;
  heroId: number;
  expertiseId: number;
  notes?: string;
  source?: string;
}

/**
 * Expertise category (alias for ExpertiseType)
 */
export interface ExpertiseCategory {
  id: number;
  code: ExpertiseCategoryCode;
  name: string;
  description?: string;
}

/**
 * Expertise source classifier
 */
export interface ExpertiseSource {
  id: number;
  code: string;
  name: string;
  description?: string;
}
