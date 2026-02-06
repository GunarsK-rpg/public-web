import type { Classifier } from './classifier';
import type { ClassifierRef, ClassifierInput } from './shared';

/** Goal status classifier (cl_goal_status) */
export type GoalStatus = Classifier;

/** Connection type classifier (cl_connection_types) */
export type ConnectionType = Classifier;

/** Hero goal - upsert payload */
export interface HeroGoalBase {
  id?: number;
  heroId: number;
  status: ClassifierInput;
  name: string;
  description?: string | null;
  notes?: string | null;
  value: number;
}

/** Hero goal - API response */
export interface HeroGoal extends HeroGoalBase {
  id: number;
  status: ClassifierRef;
}

/** Hero connection - upsert payload */
export interface HeroConnectionBase {
  id?: number;
  heroId: number;
  connectionType: ClassifierInput;
  description?: string | null;
  notes?: string | null;
}

/** Hero connection - API response */
export interface HeroConnection extends HeroConnectionBase {
  id: number;
  connectionType: ClassifierRef;
}
