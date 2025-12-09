/**
 * Singer form code identifiers
 */
export type SingerFormCode =
  | 'dullform'
  | 'mateform'
  | 'artform'
  | 'nimbleform'
  | 'warform'
  | 'workform'
  | 'mediationform'
  | 'scholarform'
  | 'direform'
  | 'stormform'
  | 'envoyform'
  | 'relayform'
  | 'decayform'
  | 'nightform';

/**
 * Singer form bonuses structure
 */
export interface SingerFormBonuses {
  str?: number;
  spd?: number;
  int?: number;
  wil?: number;
  awa?: number;
  pre?: number;
  strength?: number;
  speed?: number;
  intellect?: number;
  willpower?: number;
  awareness?: number;
  presence?: number;
  deflect?: number;
  focus?: number;
}

/**
 * Singer form action reference
 */
export interface SingerFormAction {
  id?: number;
  code: string;
  name: string;
  activation?: string;
  focusCost?: number;
  effect?: string;
  scaling?: string;
  description?: string;
}

/**
 * Singer form classifier
 */
export interface SingerForm {
  id: number;
  code: SingerFormCode;
  name: string;
  sprenType?: string;
  sprenCategory?: string;
  talentCode?: string;
  unlockedByTalentCode?: string;
  bonuses?: SingerFormBonuses;
  expertiseCodes?: string[];
  passiveAbilities?: string[];
  actions?: SingerFormAction[];
  description?: string;
}
