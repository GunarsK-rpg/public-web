/**
 * Expertise category types
 */
export type ExpertiseCategory = 'cultural' | 'utility' | 'weapon' | 'specialist';

/**
 * Expertise source
 */
export type ExpertiseSource = 'origin' | 'talent' | 'reward' | 'advancement';

/**
 * Expertise definition from classifiers
 */
export interface Expertise {
  id: string;
  name: string;
  category: ExpertiseCategory;
  isRestricted: boolean;
  description?: string;
}

/**
 * Character's expertise
 */
export interface CharacterExpertise {
  expertiseId: string;
  source: ExpertiseSource;
  notes?: string;
}
