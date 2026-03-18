/**
 * Unified special entry for equipment, talents, and singer forms.
 * Fields use snake_case (display_value) to match the backend JSONB schema directly.
 * No API transformation layer exists - these are stored/returned as-is.
 */
export interface SpecialEntry {
  type: string;
  value?: number;
  display_value?: string;
  skill?: string;
  die_progression?: number[];
  codes?: string[];
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
  displayName: string;
}

/** Campaign reference (same shape as ClassifierRef) */
export type CampaignRef = ClassifierRef;

/** Unified stat entry — classifier type + numeric value + optional display */
export interface TypedValue {
  type: ClassifierRef;
  value: number;
  displayValue?: string | null;
}

/** Extended stat for UI — adds optional breakdown text for tooltips/display */
export interface StatValue extends TypedValue {
  breakdown?: string | null;
}

/** Current resource values for ResourcesBar */
export interface ResourceValues {
  currentHp?: number;
  currentFocus?: number;
  currentInvestiture?: number;
  currency?: number;
}
