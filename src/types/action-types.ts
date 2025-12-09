/**
 * Action type code identifiers
 */
export type ActionTypeCode = 'basic' | 'weapon' | 'talent' | 'surge';

/**
 * Action type classifier
 */
export interface ActionType {
  id: number;
  code: ActionTypeCode;
  name: string;
  description?: string;
}
