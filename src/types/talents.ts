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
  /**
   * Talent prerequisite IDs with OR logic. Any one talent in the array satisfies the requirement.
   * Single prerequisite: [101], Multiple (OR): [2002, 2003, 2004]
   */
  talentIds?: number[];
  skillId?: number;
  skillRank?: number;
  description?: string;
}

/**
 * Talent classifier (cl_talents)
 * Actions granted by talents are linked via cl_action_links
 */
export interface Talent extends Classifier {
  pathId?: number | null;
  specialtyId?: number | null;
  ancestryId?: number | null;
  radiantOrderId?: number | null;
  surgeId?: number | null;
  descriptionShort?: string | null;
  isKey: boolean;
  prerequisites?: TalentPrerequisite[] | null; // JSONB
}

/**
 * Hero's talent (hero_talents table)
 */
export interface HeroTalent {
  id: number;
  heroId: number;
  talentId: number;
  notes?: string | null;
}
