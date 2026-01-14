import type { Classifier } from './classifier';

/**
 * Expertise type classifier (cl_expertise_types)
 */
export type ExpertiseType = Classifier;

/**
 * Expertise source JSONB structure
 *
 * @property sourceType - Database classifier code indicating expertise origin.
 *   Values are dynamically defined in cl_source_types (culture, intellect, starting_kit, talent, reward, training, etc.)
 *   Use string type to support future source types without code changes.
 * @property sourceId - Optional foreign key to the source record (e.g., talent ID, culture ID)
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
