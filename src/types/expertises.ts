import type { Classifier } from './classifier';
import type { ClassifierRef, ClassifierInput } from './shared';

/** Expertise type classifier (cl_expertise_types) */
export type ExpertiseType = Classifier;

/** Expertise source JSONB structure */
export interface ExpertiseSourceData {
  sourceType: string;
  sourceId?: number;
}

/** Expertise classifier (cl_expertises) */
export interface Expertise extends Classifier {
  expertiseType: ClassifierRef;
}

/** Hero expertise - upsert payload */
export interface HeroExpertiseBase {
  id?: number;
  heroId: number;
  expertise?: ClassifierInput | null;
  expertiseType?: ClassifierInput | null;
  customName?: string | null;
  notes?: string | null;
  source?: ExpertiseSourceData | null;
}

/** Hero expertise - API response */
export interface HeroExpertise extends Omit<
  HeroExpertiseBase,
  'id' | 'expertise' | 'expertiseType'
> {
  id: number;
  expertise: ClassifierRef | null;
  expertiseType: ClassifierRef;
}
