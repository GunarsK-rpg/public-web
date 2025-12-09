/**
 * Hero entity
 */
export interface Hero {
  id: number;
  userId: number;
  campaignId: number;
  ancestryId: number;
  originId: number;
  activeSingerFormId?: number;
  radiantOrderId?: number;
  radiantIdeal: number;
  name: string;
  level: number;
  appearance?: string;
  biography?: string;
  notes?: string;
  currentHealth: number;
  currentFocus: number;
  currentInvestiture: number;
  createdAt?: string;
  updatedAt?: string;
}
