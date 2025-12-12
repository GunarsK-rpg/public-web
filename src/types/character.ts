import type { HeroicPathCode, SpecialtyCode } from './paths';
import type { RadiantOrderCode, RadiantIdealLevel } from './radiant-orders';
import type { AncestryCode } from './ancestry';
import type { SingerFormCode } from './singer-forms';
import type { CultureCode } from './culture';
import type { GoalType, GoalStatusCode } from './goal-status';
import type { ConnectionTypeCode } from './connection-types';
import type { CompanionTypeCode } from './companion-types';

/**
 * Character skill (denormalized)
 */
export interface CharacterSkill {
  skillId: number;
  rank: number;
}

/**
 * Character talent (denormalized)
 */
export interface CharacterTalent {
  id: number;
  talentId: number;
  notes?: string;
}

/**
 * Character expertise (denormalized)
 */
export interface CharacterExpertise {
  expertiseId: number;
  source: string;
}

/**
 * Character weapon (denormalized)
 */
export interface CharacterWeapon {
  weaponId: number;
  customName?: string;
  isEquipped: boolean;
  isPrimary: boolean;
  notes?: string;
}

/**
 * Character armor (denormalized)
 */
export interface CharacterArmor {
  armorId: number;
  isEquipped: boolean;
  charges?: number;
  notes?: string;
}

/**
 * Character equipment (denormalized)
 */
export interface CharacterEquipment {
  itemId: number;
  quantity: number;
}

/**
 * Character condition (denormalized)
 */
export interface CharacterCondition {
  id: number;
  conditionId: number;
  value?: number;
  notes?: string;
}

/**
 * Character injury (denormalized)
 */
export interface CharacterInjury {
  id: number;
  injuryId: number;
  daysRemaining?: number;
  notes?: string;
}

/**
 * Character goal (denormalized)
 */
export interface CharacterGoal {
  name: string;
  type: GoalType;
  category: string;
  status: GoalStatusCode;
  description?: string;
}

/**
 * Character connection (denormalized)
 */
export interface CharacterConnection {
  name: string;
  type: ConnectionTypeCode;
  organization?: string;
  description?: string;
}

/**
 * Character companion (denormalized)
 */
export interface CharacterCompanion {
  name: string;
  type: CompanionTypeCode;
  subtype?: string;
  bondStrength?: number;
  canManifestBlade?: boolean;
  personality?: string;
}

/**
 * Denormalized character for display
 */
export interface Character {
  id: number;
  campaignId: number;
  userId: number;

  name: string;
  ancestry: AncestryCode;
  cultures: CultureCode[];
  level: number;
  experience: number;

  activeSingerForm?: SingerFormCode;

  heroicPaths: HeroicPathCode[];
  specialty: SpecialtyCode;
  radiantOrder: RadiantOrderCode | null;
  radiantIdeal: RadiantIdealLevel;

  startingKitId: number;

  strength: number;
  speed: number;
  intellect: number;
  willpower: number;
  awareness: number;
  presence: number;

  currentHealth: number;
  currentFocus: number;
  currentInvestiture: number;

  spheres: number;

  biography?: string;
  appearance?: string;
  notes?: string;

  skills: CharacterSkill[];
  talents: CharacterTalent[];
  expertises: CharacterExpertise[];
  weapons: CharacterWeapon[];
  armor: CharacterArmor | null;
  equipment: CharacterEquipment[];
  conditions: CharacterCondition[];
  injuries: CharacterInjury[];
  goals: CharacterGoal[];
  connections: CharacterConnection[];
  companions: CharacterCompanion[];
}

/**
 * Character summary for lists
 */
export interface CharacterSummary {
  id: number;
  name: string;
  level: number;
  heroicPaths: HeroicPathCode[];
  radiantOrder: RadiantOrderCode | null;
  currentHealth: number;
  maxHealth: number;
}
