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
  damageTypeId?: number | null;
  special?: string | null;
  dice?: string | null;
  focusCost: number;
  investitureCost: number;
}

/**
 * Action link (cl_action_links)
 * Links actions to their sources (talents, equipment, surges)
 *
 * @property sourceType - Database classifier code (e.g., 'talent', 'equipment', 'surge').
 *   Values are dynamically defined in cl_source_types table - use string type to support future extensions.
 * @property objectId - Foreign key to the source table (determined by sourceType)
 */
export interface ActionLink {
  id: number;
  actionId: number;
  sourceType: string;
  objectId: number;
}
