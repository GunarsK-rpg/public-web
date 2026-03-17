import type { Classifier } from './classifier';
import type { ClassifierRef, SpecialEntry } from './shared';
import type { HeroEquipment } from './equipments';

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
  objectType: string | null;
}

/** Equipment action resolved to a specific hero equipment instance */
export interface EquipmentActionInstance {
  action: Action;
  heroEquipment: HeroEquipment;
  effectiveSpecial: SpecialEntry[];
}

/** Hero favorite action - upsert payload */
export interface HeroFavoriteActionBase {
  heroId: number;
  actionId: number | null;
  heroEquipmentId: number | null;
}

/** Hero favorite action - API response */
export interface HeroFavoriteAction extends HeroFavoriteActionBase {
  id: number;
}

/** Type guard: check if an action entry is an equipment action instance */
export function isEquipmentActionInstance(
  entry: Action | EquipmentActionInstance
): entry is EquipmentActionInstance {
  return 'heroEquipment' in entry;
}
