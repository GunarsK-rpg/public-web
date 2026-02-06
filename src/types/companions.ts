import type { ClassifierRef, ClassifierInput } from './shared';

/** Hero companion - upsert payload */
export interface HeroCompanionBase {
  id?: number;
  heroId: number;
  companionType: ClassifierInput;
  description?: string | null;
  notes?: string | null;
}

/** Hero companion - API response */
export interface HeroCompanion extends HeroCompanionBase {
  id: number;
  companionType: ClassifierRef;
}
