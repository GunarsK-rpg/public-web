import type { HeroSummary } from './heroes';

/**
 * Campaign data (campaigns table)
 */
export interface Campaign {
  id: number;
  userId: number;
  code: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Campaign with heroes for display
 */
export interface CampaignWithHeroes extends Campaign {
  heroes: HeroSummary[];
}
