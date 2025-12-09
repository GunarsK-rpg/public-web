/**
 * Condition code identifiers
 */
export type ConditionCode =
  | 'afflicted'
  | 'determined'
  | 'disoriented'
  | 'empowered'
  | 'exhausted'
  | 'focused'
  | 'immobilized'
  | 'prone'
  | 'restrained'
  | 'slowed'
  | 'stunned'
  | 'surprised'
  | 'unconscious';

/**
 * Condition classifier
 */
export interface Condition {
  id: number;
  code: ConditionCode;
  name: string;
  effect?: string;
  hasValue?: boolean;
  isPositive?: boolean;
  description?: string;
}

/**
 * Hero's condition
 */
export interface HeroCondition {
  id: number;
  heroId: number;
  conditionId: number;
  notes?: string;
}

/**
 * Injury classifier
 */
export interface Injury {
  id: number;
  code: string;
  name: string;
  description?: string;
}

/**
 * Hero's injury
 */
export interface HeroInjury {
  id: number;
  heroId: number;
  injuryId: number;
  notes?: string;
}
