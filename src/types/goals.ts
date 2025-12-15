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
