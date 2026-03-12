import type { Classifier } from './classifier';
import type { ClassifierRef, ClassifierInput, SpecialEntry } from './shared';

/** Talent prerequisite (JSONB -- enriched by get_talents) */
export interface TalentPrerequisite {
  type: string;
  codes?: ClassifierRef[];
  value?: number;
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
  special: SpecialEntry[];
}

/** Hero talent - upsert payload */
export interface HeroTalentBase {
  id?: number;
  heroId: number;
  talent: ClassifierInput;
  notes?: string | null;
  special?: SpecialEntry[];
}

/** Hero talent - API response */
export interface HeroTalent extends HeroTalentBase {
  id: number;
  talent: ClassifierRef;
  special: SpecialEntry[];
  grantSelections: SpecialEntry[];
}
