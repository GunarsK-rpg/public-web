import type { CharacterSummary } from './character';

/**
 * Campaign data
 */
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  gmUserId: string;
  createdAt: string;
  updatedAt: string;
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
  userId: string;
  username: string;
  role: 'gm' | 'player';
  characterId?: string;
}
