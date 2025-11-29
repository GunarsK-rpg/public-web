import type { AttributeId } from './attributes';
import type { CharacterSkill, CustomSkill } from './skills';
import type { HeroicPathId, SpecialtyId } from './paths';
import type { RadiantOrderId, RadiantIdealLevel } from './radiant';
import type { CharacterWeapon, CharacterArmor, CharacterEquipment } from './equipment';
import type { CharacterTalent } from './talents';
import type { CharacterCondition, CharacterInjury } from './conditions';
import type { Companion } from './companions';
import type { CharacterGoal, CharacterConnection } from './goals';
import type { CharacterExpertise } from './expertises';

/**
 * Ancestry types
 */
export type Ancestry = 'human' | 'singer' | 'horneater' | 'herdazian' | 'iriali';

/**
 * Character attribute values
 */
export type CharacterAttributes = Record<AttributeId, number>;

/**
 * Complete character data structure
 */
export interface Character {
  id: string;
  campaignId: string;
  userId: string;

  // Basic info
  name: string;
  ancestry: Ancestry;
  level: number;
  experience: number;

  // Paths
  heroicPath: HeroicPathId;
  specialty: SpecialtyId;
  radiantOrder: RadiantOrderId | null;
  radiantIdeal: RadiantIdealLevel;

  // Origin
  originId: string;

  // Attributes (0-10 scale)
  strength: number;
  speed: number;
  intellect: number;
  willpower: number;
  awareness: number;
  presence: number;

  // Current resources
  currentHealth: number;
  currentFocus: number;
  currentInvestiture: number;

  // Currency
  spheres: number;

  // Narrative
  biography?: string;
  appearance?: string;
  notes?: string;

  // Skills
  skills: CharacterSkill[];
  customSkills?: CustomSkill[];

  // Talents
  talents: CharacterTalent[];

  // Expertises
  expertises: CharacterExpertise[];

  // Equipment
  weapons: CharacterWeapon[];
  armor: CharacterArmor | null;
  equipment: CharacterEquipment[];

  // Status
  conditions: CharacterCondition[];
  injuries: CharacterInjury[];

  // Goals and connections
  goals: CharacterGoal[];
  connections: CharacterConnection[];

  // Companions
  companions: Companion[];
}

/**
 * Character summary for lists
 */
export interface CharacterSummary {
  id: string;
  name: string;
  level: number;
  heroicPath: HeroicPathId;
  radiantOrder: RadiantOrderId | null;
  currentHealth: number;
  maxHealth: number;
}
