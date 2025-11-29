/**
 * Goal timeframe types
 */
export type GoalType = 'short-term' | 'long-term' | 'personal';

/**
 * Goal category types
 */
export type GoalCategory =
  | 'ambition'
  | 'connection'
  | 'discovery'
  | 'justice'
  | 'survival'
  | 'redemption';

/**
 * Goal status
 */
export type GoalStatus = 'active' | 'completed' | 'failed' | 'abandoned';

/**
 * Character's goal
 */
export interface CharacterGoal {
  id?: string;
  name: string;
  type: GoalType;
  category: GoalCategory;
  status: GoalStatus;
  description?: string;
}

/**
 * Connection type identifiers
 */
export type ConnectionType = 'ally' | 'contact' | 'rival' | 'enemy' | 'patron' | 'follower';

/**
 * Character's connection/relationship
 */
export interface CharacterConnection {
  id?: string;
  name: string;
  type: ConnectionType;
  organization?: string;
  description?: string;
}
