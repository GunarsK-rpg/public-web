/**
 * Action activation type identifiers
 */
export type ActionActivation = 'action' | 'bonus' | 'reaction' | 'free' | 'free-action' | 'passive' | 'double-action' | 'triple-action' | 'special';

/**
 * Action classifier
 */
export interface Action {
  id: number;
  actionTypeId: number;
  activationTypeId: number;
  code: string;
  name: string;
  description?: string;
  special?: string;
  dice?: string;
  focusCost: number;
  investitureCost: number;
}

/**
 * Granted action from equipment/talent (denormalized for display)
 */
export interface GrantedAction {
  id: number;
  name: string;
  description?: string;
  effect?: string;
  activation: ActionActivation;
  source: string;
  sourceName: string;
  focusCost?: number;
  investitureCost?: number;
  charges?: number;
}
