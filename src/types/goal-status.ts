/**
 * Goal status code identifiers
 */
export type GoalStatusCode = 'active' | 'completed' | 'failed' | 'abandoned';

/**
 * Goal type identifiers
 */
export type GoalType = 'drive' | 'burden' | 'personal' | 'short-term' | 'long-term';

/**
 * Goal status classifier
 */
export interface GoalStatus {
  id: number;
  code: GoalStatusCode;
  name: string;
}
