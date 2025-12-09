/**
 * Activation type code identifiers
 */
export type ActivationTypeCode =
  | 'action'
  | 'double_action'
  | 'triple_action'
  | 'free_action'
  | 'reaction'
  | 'special'
  | 'always_active';

/**
 * Activation type classifier
 */
export interface ActivationType {
  id: number;
  code: ActivationTypeCode;
  name: string;
  description?: string;
}
