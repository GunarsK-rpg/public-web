import type { ClassifierInput, ClassifierRef, ClassifierValue, TypedValue } from './shared';
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
  deletedAt?: string | null;
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
  isCompanion: boolean;
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

/** Unified NPC instance — combat or companion (from v_npc_instance_detail) */
export interface NpcInstance extends NpcTileData {
  combatId: number | null;
  heroId: number | null;
  sortOrder: number | null;
  side: 'ally' | 'enemy' | null;
  turnSpeed: 'fast' | 'slow' | null;
}

/** Combat with NPC instances — from get_combat */
export interface CombatDetail extends Combat {
  npcs: NpcInstance[];
}

/** End round payload */
export interface EndRoundPayload {
  combatId: number;
  campaignId: number;
  round: number;
}

/** NPC upsert payload — create/update custom NPC */
export interface NpcUpsert {
  id?: number;
  campaignId: number;
  name: string;
  tier: ClassifierInput;
  type: string;
  size: string;
  languages?: string | null;
  description?: string | null;
  tactics?: string | null;
  immunities?: string | null;
  isCompanion?: boolean;
  features: NpcFeature[];
  actions: NpcAction[];
  opportunities: NpcFeature[];
  attributes: ClassifierValue[];
  defenses: ClassifierValue[];
  skills: ClassifierValue[];
  derivedStats: (ClassifierValue & { displayValue?: string | null })[];
}
