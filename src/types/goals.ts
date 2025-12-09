/**
 * Hero's goal
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
 * Hero's connection
 */
export interface HeroConnection {
  id: number;
  heroId: number;
  connTypeId: number;
  description?: string;
  notes?: string;
}
