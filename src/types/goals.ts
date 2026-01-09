import type { Classifier } from './classifier';

/**
 * Goal status classifier (cl_goal_status)
 */
export type GoalStatus = Classifier;

/**
 * Connection type classifier (cl_connection_types)
 */
export type ConnectionType = Classifier;

/**
 * Hero's goal (goals table)
 */
export interface HeroGoal {
  id: number;
  heroId: number;
  name: string;
  description?: string;
  notes?: string;
  /**
   * Importance value (1-5) indicating goal priority.
   * Higher values indicate more important goals.
   * @minimum 1
   * @maximum 5
   */
  value: number;
  statusId: number;
}

/**
 * Hero's connection (connections table)
 */
export interface HeroConnection {
  id: number;
  heroId: number;
  connTypeId: number;
  description?: string;
  notes?: string;
}
