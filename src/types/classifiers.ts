import type { AttributeType, Attribute } from './attributes';
import type { DerivedStat, DerivedStatValue } from './derivedStats';
import type { Skill } from './skills';
import type { ExpertiseType, Expertise } from './expertises';
import type { ActivationType, ActionType, Action, ActionLink } from './actions';
import type { Path, Specialty } from './paths';
import type { Surge } from './surges';
import type { RadiantOrder } from './radiantOrders';
import type { SingerForm } from './singerForms';
import type { Talent } from './talents';
import type { Unit } from './units';
import type { EquipmentType, DamageType, Equipment } from './equipments';
import type { ModificationClassifier } from './modifications';
import type { EquipmentAttribute } from './equipmentAttributes';
import type { Condition, Injury } from './conditions';
import type { GoalStatus, ConnectionType } from './goals';
import type { StartingKit } from './startingKits';
import type { Ancestry } from './ancestries';
import type { Culture } from './culture';
import type { Tier } from './tiers';
import type { Level } from './levels';

/** Full classifiers response from /classifiers endpoint */
export interface Classifiers {
  // Attributes & Stats
  attributeTypes: AttributeType[];
  attributes: Attribute[];
  derivedStats: DerivedStat[];
  derivedStatValues: DerivedStatValue[];

  // Skills & Expertises
  skills: Skill[];
  expertiseTypes: ExpertiseType[];
  expertises: Expertise[];

  // Actions
  activationTypes: ActivationType[];
  actionTypes: ActionType[];
  actions: Action[];
  actionLinks: ActionLink[];

  // Paths & Talents
  paths: Path[];
  specialties: Specialty[];
  surges: Surge[];
  radiantOrders: RadiantOrder[];
  singerForms: SingerForm[];
  talents: Talent[];

  // Equipment
  units: Unit[];
  equipmentTypes: EquipmentType[];
  damageTypes: DamageType[];
  equipmentAttributes: EquipmentAttribute[];
  equipment: Equipment[];
  modifications: ModificationClassifier[];

  // Conditions & Status
  conditions: Condition[];
  injuries: Injury[];

  // Character Details
  goalStatuses: GoalStatus[];
  connectionTypes: ConnectionType[];
  // Starting & Ancestry
  startingKits: StartingKit[];
  ancestries: Ancestry[];
  cultures: Culture[];

  // Progression
  tiers: Tier[];
  levels: Level[];
}
