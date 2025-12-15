import type { HeroEquipment } from './equipments';
import type { HeroAttribute, HeroDefense } from './attributes';
import type { HeroSkill } from './skills';
import type { HeroTalent } from './talents';
import type { HeroExpertise } from './expertises';
import type { HeroCondition, HeroInjury } from './conditions';
import type { HeroGoal, HeroConnection } from './goals';
import type { HeroCompanion } from './companions';
import type { HeroCulture } from './culture';
import type { HeroDerivedStat } from './derivedStats';

/**
 * Hero entity (heroes table)
 */
export interface Hero {
  id: number;
  userId: number;
  campaignId: number;
  ancestryId: number;
  startingKitId: number | null;
  activeSingerFormId: number | null;
  radiantOrderId: number | null;
  radiantIdeal: number;

  name: string;
  level: number;
  appearance?: string;
  biography?: string;
  notes?: string;

  currentHealth: number;
  currentFocus: number;
  currentInvestiture: number;
  currency: number;

  createdAt?: string;
  updatedAt?: string;

  // Hero data arrays
  attributes: HeroAttribute[];
  defenses: HeroDefense[];
  derivedStats: HeroDerivedStat[];
  skills: HeroSkill[];
  talents: HeroTalent[];
  expertises: HeroExpertise[];
  equipment: HeroEquipment[];
  conditions: HeroCondition[];
  injuries: HeroInjury[];
  goals: HeroGoal[];
  connections: HeroConnection[];
  companions: HeroCompanion[];
  cultures: HeroCulture[];
}

/**
 * Hero summary for lists
 */
export interface HeroSummary {
  id: number;
  name: string;
  level: number;
  radiantOrderId?: number | null; // null = not a Radiant, undefined = not yet loaded
  currentHealth: number;
  maxHealth: number;
}
