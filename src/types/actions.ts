import type { Classifier } from './classifier';

/**
 * Activation type classifier (cl_activation_types)
 */
export interface ActivationType extends Classifier {
  icon: string;
}

/**
 * Action type classifier (cl_action_types)
 */
export type ActionType = Classifier;

/**
 * Action classifier (cl_actions)
 */
export interface Action extends Classifier {
  actionTypeId: number;
  activationTypeId: number;
  damageTypeId?: number;
  special?: string;
  dice?: string;
  focusCost: number;
  investitureCost: number;
}

/**
 * Action link (cl_action_links)
 * Links actions to their sources (talents, equipment, surges)
 * The action's actionTypeId determines which table object_id references
 */
export interface ActionLink {
  id: number;
  actionId: number;
  objectId: number;
}
