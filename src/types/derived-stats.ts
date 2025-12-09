/**
 * Derived stat code identifiers
 */
export type DerivedStatCode =
  | 'max_health'
  | 'max_focus'
  | 'max_investiture'
  | 'movement'
  | 'recovery_die'
  | 'lift_capacity'
  | 'carry_capacity'
  | 'senses_range'
  | 'unarmed_damage';

/**
 * Derived stat classifier
 */
export interface DerivedStat {
  id: number;
  code: DerivedStatCode;
  name: string;
}

/**
 * Hero's derived stat value
 */
export interface HeroDerivedStat {
  id: number;
  heroId: number;
  statId: number;
  value: string;
  modifier: number;
}
