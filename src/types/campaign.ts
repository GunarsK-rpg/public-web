import type { CharacterSummary } from './character';

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
 * Campaign with characters for display
 */
export interface CampaignWithCharacters extends Campaign {
  characters: CharacterSummary[];
}

/**
 * Campaign member
 */
export interface CampaignMember {
  userId: number;
  username: string;
  role: 'gm' | 'player';
  characterId?: number;
}
