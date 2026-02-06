import type { UserRef } from './shared';
import type { Hero } from './heroes';

/** Campaign - upsert payload */
export interface CampaignBase {
  id?: number;
  name: string;
  description?: string | null;
}

/** Campaign - API response */
export interface Campaign extends CampaignBase {
  id: number;
  userId: number;
  code: string;
  user: UserRef;
}

/** Campaign with heroes (client-composed, not a DB response) */
export interface CampaignWithHeroes extends Campaign {
  heroes: Hero[];
}
