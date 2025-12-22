import type { Classifier } from './classifier';

/**
 * Known prerequisite types - extensible via database
 * Using string union for common types with fallback to string for future additions
 */
export type PrerequisiteType = 'talent' | 'skill' | 'narrative' | (string & NonNullable<unknown>);

/**
 * Talent prerequisite types (JSONB)
 */
export interface TalentPrerequisite {
  type: PrerequisiteType;
  talentId?: number;
  talentIds?: number[]; // For OR logic (any of these talents)
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
