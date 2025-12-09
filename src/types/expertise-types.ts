/**
 * Expertise type code identifiers
 */
export type ExpertiseTypeCode = 'armor' | 'cultural' | 'utility' | 'weapon' | 'specialist';

/**
 * Expertise category code identifiers (alias for ExpertiseTypeCode)
 */
export type ExpertiseCategoryCode = ExpertiseTypeCode;

/**
 * Expertise type classifier
 */
export interface ExpertiseType {
  id: number;
  code: ExpertiseTypeCode;
  name: string;
  description?: string;
}
