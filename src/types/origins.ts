/**
 * Origin category types
 */
export type OriginCategory = 'martial' | 'scholarly' | 'social' | 'underworld' | 'common';

/**
 * Origin skill bonus
 */
export interface OriginSkillBonus {
  skillCode: string;
  rank: number;
}

/**
 * Origin classifier
 */
export interface Origin {
  id: number;
  code: string;
  name: string;
  category: OriginCategory;
  description?: string;
  startingSpheres?: number;
  spheres?: number;
  skillBonuses?: OriginSkillBonus[] | Record<string, number>;
  expertises?: string[];
  expertiseCodes?: string[];
  equipment?: string[];
  equipmentCodes?: string[];
}
