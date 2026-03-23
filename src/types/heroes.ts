import type { ClassifierInput, ClassifierRef, CampaignRef, UserRef } from './shared';
import type { HeroAttribute, HeroDefenseSheet } from './attributes';
import type { HeroDerivedStatSheet } from './derivedStats';
import type { HeroSkill } from './skills';
import type { HeroExpertise } from './expertises';
import type { HeroTalent } from './talents';
import type { HeroEquipment } from './equipments';
import type { HeroCondition, HeroInjury } from './conditions';
import type { HeroGoal, HeroConnection } from './goals';
import type { NpcInstance } from './combat';
import type { HeroNote } from './notes';
import type { HeroCulture } from './culture';
import type { HeroFavoriteAction } from './actions';

/** Hero - upsert payload (client-controlled fields) */
export interface HeroBase {
  id?: number;
  name: string;
  level: number;
  radiantIdeal: number;
  appearance?: string | null;
  biography?: string | null;
  notes?: string | null;
  currentHealth: number;
  currentFocus: number;
  currentInvestiture: number;
  currency: number;
  campaign: ClassifierInput | null;
  ancestry: ClassifierInput;
  startingKit?: ClassifierInput | null;
  activeSingerForm?: ClassifierInput | null;
  radiantOrder?: ClassifierInput | null;
}

/** Hero - API response from get_hero / get_heroes / upsert_hero */
export interface Hero extends HeroBase {
  id: number;
  userId: number;
  user: UserRef;
  campaignId: number | null;
  campaign: CampaignRef | null;
  ancestry: ClassifierRef;
  startingKit: ClassifierRef | null;
  activeSingerForm: ClassifierRef | null;
  radiantOrder: ClassifierRef | null;
  avatarKey: string | null;
}

/** Hero sheet - API response from get_hero_sheet (includes sub-resource arrays) */
export interface HeroSheet extends Hero {
  attributes: HeroAttribute[];
  defenses: HeroDefenseSheet[];
  derivedStats: HeroDerivedStatSheet[];
  skills: HeroSkill[];
  expertises: HeroExpertise[];
  talents: HeroTalent[];
  equipment: HeroEquipment[];
  conditions: HeroCondition[];
  injuries: HeroInjury[];
  goals: HeroGoal[];
  connections: HeroConnection[];
  companions: NpcInstance[];
  heroNotes: HeroNote[];
  cultures: HeroCulture[];
  favoriteActions: HeroFavoriteAction[];
}
