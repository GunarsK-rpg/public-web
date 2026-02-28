import type { UserRef } from './shared';
import type { Hero } from './heroes';

/** Campaign - upsert payload */
export interface CampaignBase {
  id?: number;
  name: string;
  description?: string | null;
  talentsModifier?: number;
  skillsModifier?: number;
  expertisesModifier?: number;
}

/** Campaign - API response */
export interface Campaign extends CampaignBase {
  id: number;
  userId: number;
  code: string;
  talentsModifier: number;
  skillsModifier: number;
  expertisesModifier: number;
  user: UserRef;
}

/** Campaign with heroes (client-composed, not a DB response) */
export interface CampaignWithHeroes extends Campaign {
  heroes: Hero[];
}
