import type { Classifier } from './classifier';
import type { ClassifierRef, SpecialEntry } from './shared';

/** Activation type classifier (cl_activation_types) */
export interface ActivationType extends Classifier {
  icon: string;
}

/** Action type classifier (cl_action_types) */
export type ActionType = Classifier;

/** Action classifier (cl_actions) */
export interface Action extends Classifier {
  actionType: ClassifierRef;
  activationType: ClassifierRef;
  damageType: ClassifierRef | null;
  descriptionShort?: string | null;
  special: SpecialEntry[];
  dice?: string | null;
  focusCost: number;
  investitureCost: number;
}

/** Action link (cl_action_links) */
export interface ActionLink {
  id: number;
  action: ClassifierRef;
  objectId: number;
}
