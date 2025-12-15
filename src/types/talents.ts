import type { Classifier } from './classifier';

/**
 * Talent prerequisite types (JSONB)
 */
export interface TalentPrerequisite {
  type: string;
  talentId?: number;
  skillId?: number;
  skillRank?: number;
  description?: string;
}

/**
 * Talent classifier (cl_talents)
 * Actions granted by talents are linked via cl_action_links
 */
export interface Talent extends Classifier {
  pathId?: number;
  specialtyId?: number;
  ancestryId?: number;
  radiantOrderId?: number;
  surgeId?: number;
  descriptionShort?: string;
  isKey: boolean;
  prerequisites?: TalentPrerequisite[];
}

/**
 * Hero's talent (hero_talents table)
 */
export interface HeroTalent {
  id: number;
  heroId: number;
  talentId: number;
  notes?: string;
}
