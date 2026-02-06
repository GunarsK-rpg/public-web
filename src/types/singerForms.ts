import type { Classifier } from './classifier';
import type { ClassifierRef } from './shared';

/** Singer form bonuses (JSONB) */
export interface SingerFormBonuses {
  str?: number;
  spd?: number;
  int?: number;
  wil?: number;
  awa?: number;
  pre?: number;
  deflect?: number;
  focus?: number;
}

/** Singer form classifier (cl_singer_forms) */
export interface SingerForm extends Classifier {
  sprenType?: string | null;
  talent: ClassifierRef | null;
  bonuses?: SingerFormBonuses | null;
}
