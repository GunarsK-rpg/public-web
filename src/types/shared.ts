/** Unified special entry for equipment, talents, and singer forms */
export interface SpecialEntry {
  type: string;
  value?: number;
  display_value?: string;
}

/** Minimal classifier reference for upsert payloads */
export interface ClassifierInput {
  code: string;
}

/** Enriched classifier reference returned by the API */
export interface ClassifierRef extends ClassifierInput {
  id: number;
  name: string;
}

/** User reference returned by the API */
export interface UserRef {
  id: number;
  username: string;
}

/** Campaign reference (same shape as ClassifierRef) */
export type CampaignRef = ClassifierRef;
