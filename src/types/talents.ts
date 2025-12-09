/**
 * Talent prerequisite types
 */
export interface TalentPrerequisite {
  type: string;
  talentId?: number;
  skillId?: number;
  skillRank?: number;
  description?: string;
}

/**
 * Talent classifier
 */
export interface Talent {
  id: number;
  pathId?: number;
  specialtyId?: number;
  ancestryId?: number;
  surgeId?: number;
  code: string;
  name: string;
  description?: string;
  descriptionShort?: string;
  actionId?: number;
  isKey: boolean;
  prerequisites?: TalentPrerequisite[] | string;
}

/**
 * Hero's talent
 */
export interface HeroTalent {
  id: number;
  heroId: number;
  talentId: number;
  notes?: string;
}
