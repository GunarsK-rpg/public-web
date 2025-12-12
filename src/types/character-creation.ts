/**
 * Character Creation Types
 * Types for the multi-step character creation wizard
 */

/**
 * Point budgets for different character creation aspects
 */
export interface PointBudgets {
  attributes: number; // Points available for attributes (typically 12 at level 1)
  skills: number; // Points available for skills (varies by level)
  talents: number; // Number of talents available (varies by level + path)
  expertises: number; // Number of free expertises (2 cultural + INT score)
}

/**
 * Basic setup step data
 */
export interface BasicSetupData {
  name: string;
  level: number;
  campaignId?: number;
}

/**
 * Ancestry step data
 */
export interface AncestryData {
  ancestryId: number;
  singerFormId?: number; // Only for Singer ancestry - initial form (usually dullform)
}

/**
 * Culture step data
 */
export interface CultureData {
  primaryCultureId: number;
  secondaryCultureId?: number; // Optional secondary culture
}

/**
 * Starting kit step data
 */
export interface StartingKitData {
  startingKitId: number;
  rolledSpheres?: number; // Result of dice roll for starting currency
}

/**
 * Attribute allocation
 */
export interface AttributeAllocation {
  strength: number; // 0-5
  speed: number;
  intellect: number;
  willpower: number;
  awareness: number;
  presence: number;
}

/**
 * Attributes step data
 */
export interface AttributesData {
  allocation: AttributeAllocation;
}

/**
 * Skill rank allocation
 */
export interface SkillAllocation {
  skillId: number;
  rank: number; // 0-5
}

/**
 * Skills step data
 */
export interface SkillsData {
  allocations: SkillAllocation[];
  customSkills?: { name: string; attrId: number }[];
}

/**
 * Expertise source for tracking where each expertise came from
 */
export interface ExpertiseAllocation {
  expertiseId: number;
  source: 'culture' | 'intellect' | 'starting_kit' | 'talent' | 'training';
}

/**
 * Expertises step data
 */
export interface ExpertisesData {
  allocations: ExpertiseAllocation[];
}

/**
 * Heroic path selection with specialty
 */
export interface PathSelection {
  pathId: number;
  specialtyId?: number;
  talentIds: number[]; // Selected talents from this path
}

/**
 * Radiant path selection (optional)
 */
export interface RadiantSelection {
  orderId: number;
  idealLevel: number; // 0-5, determines Radiant abilities
  talentIds: number[]; // Selected Radiant talents
}

/**
 * Paths step data - supports multiclassing
 */
export interface PathsData {
  paths: PathSelection[];
  ancestryTalentIds?: number[]; // Ancestry-specific talents (e.g., Singer forms)
  radiantPath?: RadiantSelection;
}

/**
 * Equipment item in inventory
 */
export interface EquipmentItem {
  equipmentId: number;
  quantity: number;
  isEquipped: boolean;
  notes?: string;
}

/**
 * Starting kit selection for equipment step
 * Note: Full StartingKit interface is in starting-kits.ts
 */
export type StartingKitSelection =
  | 'academic'
  | 'artisan'
  | 'military'
  | 'courtier'
  | 'underworld'
  | 'prisoner'
  | 'custom';

/**
 * Equipment step data
 */
export interface EquipmentData {
  startingKit: StartingKitSelection;
  equipment: EquipmentItem[];
  spheres: number; // Currency
}

/**
 * Goal for personal details
 */
export interface GoalEntry {
  type: 'drive' | 'burden' | 'personal' | 'short-term' | 'long-term';
  description: string;
  statusCode: string;
}

/**
 * Connection for personal details
 */
export interface ConnectionEntry {
  name: string;
  connectionTypeId: number;
  description?: string;
}

/**
 * Personal details step data
 */
export interface PersonalDetailsData {
  biography?: string;
  appearance?: string;
  goals: GoalEntry[];
  connections: ConnectionEntry[];
  notes?: string;
}

/**
 * Complete character creation form state
 */
export interface CharacterCreationState {
  // Step data
  basicSetup: BasicSetupData;
  ancestry: AncestryData;
  culture: CultureData;
  startingKit: StartingKitData;
  attributes: AttributesData;
  skills: SkillsData;
  expertises: ExpertisesData;
  paths: PathsData;
  equipment: EquipmentData;
  personalDetails: PersonalDetailsData;

  // Wizard state
  currentStep: number;
  completedSteps: number[];
  isDraft: boolean;
}

/**
 * Validation result for a step
 */
export interface StepValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Derived stats preview for attributes step
 */
export interface DerivedStatsPreview {
  maxHealth: number;
  maxFocus: number;
  maxInvestiture?: number; // Only for Radiants
  physicalDefense: number;
  cognitiveDefense: number;
  spiritualDefense: number;
  movement: string;
  recoveryDie: string;
  liftCapacity: string;
  carryCapacity: string;
  sensesRange: string;
  unarmedDamage: string;
}

/**
 * Starting kit contents for wizard display
 * Note: This is a simplified view - full data comes from StartingKit classifier
 */
export interface StartingKitContents {
  code: StartingKitSelection;
  name: string;
  description: string;
  equipmentCodes: string[];
  startingSpheres: string; // Dice formula like "3d12", "4d8", "0"
}

/**
 * Wizard step configuration
 */
export interface WizardStep {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  isOptional: boolean;
}

/**
 * Character creation wizard steps
 */
export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    code: 'basic-setup',
    name: 'Basic Setup',
    description: 'Name, level, and campaign',
    icon: 'sym_o_badge',
    isOptional: false,
  },
  {
    id: 2,
    code: 'ancestry',
    name: 'Ancestry',
    description: 'Choose your ancestry',
    icon: 'sym_o_diversity_3',
    isOptional: false,
  },
  {
    id: 3,
    code: 'culture',
    name: 'Culture',
    description: 'Select cultural background',
    icon: 'sym_o_language',
    isOptional: false,
  },
  {
    id: 4,
    code: 'attributes',
    name: 'Attributes',
    description: 'Allocate attribute points',
    icon: 'sym_o_fitness_center',
    isOptional: false,
  },
  {
    id: 5,
    code: 'skills',
    name: 'Skills',
    description: 'Assign skill ranks',
    icon: 'sym_o_school',
    isOptional: false,
  },
  {
    id: 6,
    code: 'expertises',
    name: 'Expertises',
    description: 'Select your expertises',
    icon: 'sym_o_workspace_premium',
    isOptional: false,
  },
  {
    id: 7,
    code: 'paths',
    name: 'Paths',
    description: 'Choose paths and talents',
    icon: 'sym_o_route',
    isOptional: false,
  },
  {
    id: 8,
    code: 'starting-kit',
    name: 'Starting Kit',
    description: 'Choose equipment bundle',
    icon: 'sym_o_backpack',
    isOptional: false,
  },
  {
    id: 9,
    code: 'equipment',
    name: 'Equipment',
    description: 'Customize gear and currency',
    icon: 'sym_o_inventory_2',
    isOptional: false,
  },
  {
    id: 10,
    code: 'personal-details',
    name: 'Details',
    description: 'Biography, goals, connections',
    icon: 'sym_o_person',
    isOptional: true,
  },
  {
    id: 11,
    code: 'review',
    name: 'Review',
    description: 'Review and create',
    icon: 'sym_o_checklist',
    isOptional: false,
  },
];

/**
 * Default starting kits
 */
export const STARTING_KITS: StartingKitContents[] = [
  {
    code: 'academic',
    name: 'Academic Kit',
    description: 'For scholars and students',
    equipmentCodes: ['knife', 'sling', 'staff', 'uniform', 'backpack', 'writing-kit', 'books'],
    startingSpheres: '3d12',
  },
  {
    code: 'artisan',
    name: 'Artisan Kit',
    description: 'For craftspeople and healers',
    equipmentCodes: ['hammer', 'leather-armor', 'chest', 'toolkit', 'rope', 'lantern'],
    startingSpheres: '4d8',
  },
  {
    code: 'military',
    name: 'Military Kit',
    description: 'For soldiers and guards',
    equipmentCodes: ['uniform', 'chain-armor', 'backpack', 'bedroll', 'rations'],
    startingSpheres: '2d6',
  },
  {
    code: 'courtier',
    name: 'Courtier Kit',
    description: 'For nobles and diplomats',
    equipmentCodes: ['clothing-fine', 'jewelry'],
    startingSpheres: '4d20',
  },
  {
    code: 'underworld',
    name: 'Underworld Kit',
    description: 'For rogues and criminals',
    equipmentCodes: ['leather-armor', 'backpack', 'lockpicks', 'rope', 'lantern'],
    startingSpheres: '1d20',
  },
  {
    code: 'prisoner',
    name: 'Prisoner Kit',
    description: 'For those starting with nothing',
    equipmentCodes: ['manacles', 'clothing-ragged'],
    startingSpheres: '0',
  },
];

/**
 * Default empty state for character creation
 */
export const DEFAULT_CHARACTER_CREATION_STATE: CharacterCreationState = {
  basicSetup: {
    name: '',
    level: 1,
  },
  ancestry: {
    ancestryId: 0,
  },
  culture: {
    primaryCultureId: 0,
  },
  startingKit: {
    startingKitId: 0,
  },
  attributes: {
    allocation: {
      strength: 0,
      speed: 0,
      intellect: 0,
      willpower: 0,
      awareness: 0,
      presence: 0,
    },
  },
  skills: {
    allocations: [],
  },
  expertises: {
    allocations: [],
  },
  paths: {
    paths: [],
  },
  equipment: {
    startingKit: 'custom',
    equipment: [],
    spheres: 0,
  },
  personalDetails: {
    goals: [],
    connections: [],
  },
  currentStep: 1,
  completedSteps: [],
  isDraft: true,
};
