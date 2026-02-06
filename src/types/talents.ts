import type { Classifier } from './classifier';
import type { ClassifierRef, ClassifierInput } from './shared';

/** Talent prerequisite (JSONB) */
export interface TalentPrerequisite {
  type: string;
  talentIds?: number[];
  skillId?: number;
  skillRank?: number;
  description?: string;
}

/** Talent classifier (cl_talents) */
export interface Talent extends Classifier {
  path: ClassifierRef | null;
  specialties: ClassifierRef[];
  ancestry: ClassifierRef | null;
  radiantOrder: ClassifierRef | null;
  surge: ClassifierRef | null;
  descriptionShort?: string | null;
  isKey: boolean;
  prerequisites?: TalentPrerequisite[] | null;
}

/** Hero talent - upsert payload */
export interface HeroTalentBase {
  id?: number;
  heroId: number;
  talent: ClassifierInput;
  notes?: string | null;
}

/** Hero talent - API response */
export interface HeroTalent extends HeroTalentBase {
  id: number;
  talent: ClassifierRef;
}
