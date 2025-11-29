/**
 * Condition identifiers
 */
export type ConditionId =
  | 'afflicted'
  | 'determined'
  | 'disoriented'
  | 'empowered'
  | 'enhanced'
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
 * Condition definition from classifiers
 */
export interface Condition {
  id: ConditionId;
  name: string;
  effect: string;
  hasValue: boolean;
  isPositive: boolean;
}

/**
 * Character's active condition
 */
export interface CharacterCondition {
  id: string;
  conditionId: ConditionId;
  value?: number;
  source?: string;
  duration?: string;
  notes?: string;
}

/**
 * Injury duration types
 */
export type InjuryDuration = 'flesh-wound' | 'shallow' | 'vicious' | 'permanent' | 'death';

/**
 * Injury effect types
 */
export type InjuryEffect = 'exhausted' | 'slowed' | 'disoriented' | 'surprised' | 'one-hand';

/**
 * Injury definition
 */
export interface Injury {
  id: string;
  name: string;
  duration: InjuryDuration;
  effect: InjuryEffect;
  value?: number;
  description: string;
}

/**
 * Character's injury
 */
export interface CharacterInjury {
  id: string;
  injuryId: string;
  location?: string;
  daysRemaining?: number;
  notes?: string;
}
