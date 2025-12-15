import type { Classifier } from './classifier';

/**
 * Expertise type classifier (cl_expertise_types)
 */
export type ExpertiseType = Classifier;

/**
 * Expertise source JSONB structure
 * sourceType values come from database (culture, intellect, starting_kit, talent, reward, training, etc.)
 */
export interface ExpertiseSourceData {
  sourceType: string;
  sourceId?: number;
}

/**
 * Expertise classifier (cl_expertises)
 */
export interface Expertise extends Classifier {
  expertiseTypeId: number;
}

/**
 * Hero's expertise
 * Maps to expertises table
 */
export interface HeroExpertise {
  id: number;
  heroId: number;
  expertiseId: number;
  notes?: string;
  source?: ExpertiseSourceData; // JSONB: {source_type, source_id}
}
