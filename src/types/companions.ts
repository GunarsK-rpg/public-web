import type { ClassifierRef, ClassifierInput } from './shared';
import type { NpcTileData, NpcResources } from './combat';

/** Hero companion - upsert payload */
export interface HeroCompanionBase extends Partial<NpcResources> {
  id?: number;
  heroId: number;
  companionType: ClassifierInput;
  description?: string | null;
  notes?: string | null;
  npcId?: number;
  displayName?: string | null;
}

/** Hero companion - API response */
export interface HeroCompanion extends NpcTileData {
  heroId: number;
  companionType: ClassifierRef;
  description: string | null;
}

/** Companion resource patch payload */
export interface CompanionResourcePatch {
  id: number;
  heroId: number;
  value: number;
}
