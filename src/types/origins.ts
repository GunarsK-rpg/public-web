import type { SkillId } from './skills';

/**
 * Origin category types
 */
export type OriginCategory = 'martial' | 'scholarly' | 'social' | 'underworld' | 'common';

/**
 * Origin definition from classifiers
 */
export interface Origin {
  id: string;
  name: string;
  category: OriginCategory;
  description: string;
  skillBonuses: OriginSkillBonus[];
  expertises: string[];
  equipment: string[];
  spheres: number;
  storyHooks?: string[];
}

/**
 * Origin skill bonus
 */
export interface OriginSkillBonus {
  skillId: SkillId;
  rank: number;
}
