import type { ClassifierRef, TypedValue } from './shared';
import type { TurnPhase } from 'src/constants/combat';

/** NPC identity from template — name, tier, type, stats */
export interface NpcIdentity {
  name: string;
  tier: ClassifierRef;
  type: string;
  derivedStats: TypedValue[];
}

/** Live resource counters shared by combat NPCs and companions */
export interface NpcResources {
  currentHp: number;
  currentFocus: number;
  currentInvestiture: number;
}

/** NPC instance data — prop contract for CombatNpcTile (combat + companion) */
export interface NpcTileData extends NpcIdentity, NpcResources {
  id: number;
  npcId: number;
  displayName?: string | null;
  notes?: string | null;
}

/** NPC option — lightweight picker list from get_npc_options */
export interface NpcOption {
  id: number;
  campaignId: number | null;
  name: string;
  tier: ClassifierRef;
  type: string;
  isCompanion?: boolean;
}

/** NPC feature or opportunity (JSONB — snake_case matches DB storage) */
export interface NpcFeature {
  name: string;
  display_value: string;
}

/** NPC action — feature + activation type (JSONB — snake_case matches DB storage) */
export interface NpcAction extends NpcFeature {
  activation_type: string;
}

/** Full NPC stat block — from get_npc */
export interface Npc extends NpcOption {
  createdBy: number | null;
  size: string;
  languages: string | null;
  description: string | null;
  tactics: string | null;
  immunities: string | null;
  attributes: TypedValue[];
  defenses: TypedValue[];
  skills: TypedValue[];
  derivedStats: TypedValue[];
  features: NpcFeature[];
  actions: NpcAction[];
  opportunities: NpcFeature[];
}

/** Combat — upsert payload */
export interface CombatBase {
  id?: number;
  campaignId: number;
  name: string;
  description?: string | null;
  isActive?: boolean;
  round?: number;
  notes?: string | null;
  turnPhase?: TurnPhase;
}

/** Combat — API response */
export interface Combat extends CombatBase {
  id: number;
  description: string | null;
  isActive: boolean;
  round: number;
  notes: string | null;
  turnPhase: TurnPhase;
}

/** Combat NPC — upsert payload */
export interface CombatNpcBase {
  campaignId: number;
  combatId: number;
  npcId: number;
  displayName?: string | null;
  sortOrder?: number;
  side: 'ally' | 'enemy';
  turnSpeed?: 'fast' | 'slow' | null;
  notes?: string | null;
}

/** Combat NPC — API response (NPC tile data + combat-specific fields) */
export interface CombatNpc extends NpcTileData {
  campaignId: number;
  combatId: number;
  sortOrder: number;
  side: 'ally' | 'enemy';
  turnSpeed: 'fast' | 'slow' | null;
}

/** Combat with NPC instances — from get_combat */
export interface CombatDetail extends Combat {
  npcs: CombatNpc[];
}

/** Resource patch payload (HP/focus/investiture) */
export interface CombatNpcResourcePatch {
  id: number;
  combatId: number;
  campaignId: number;
  value: number;
}

/** End round payload */
export interface EndRoundPayload {
  combatId: number;
  campaignId: number;
  round: number;
}
