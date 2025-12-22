/**
 * Step code constants for type-safe comparisons
 */
export const STEP_CODES = {
  BASIC_SETUP: 'basic-setup',
  ANCESTRY: 'ancestry',
  CULTURE: 'culture',
  ATTRIBUTES: 'attributes',
  SKILLS: 'skills',
  EXPERTISES: 'expertises',
  PATHS: 'paths',
  STARTING_KIT: 'starting-kit',
  EQUIPMENT: 'equipment',
  PERSONAL_DETAILS: 'personal-details',
  REVIEW: 'review',
} as const;

export type StepCodeType = (typeof STEP_CODES)[keyof typeof STEP_CODES];

/**
 * Wizard step configuration
 */
export interface WizardStep {
  id: number;
  code: StepCodeType;
  name: string;
  description: string;
  icon: string;
  isOptional: boolean;
}

/**
 * Wizard steps for hero creation/editing
 */
export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    code: STEP_CODES.BASIC_SETUP,
    name: 'Basic Setup',
    description: 'Name, level, and campaign',
    icon: 'sym_o_badge',
    isOptional: false,
  },
  {
    id: 2,
    code: STEP_CODES.ANCESTRY,
    name: 'Ancestry',
    description: 'Choose your ancestry',
    icon: 'sym_o_diversity_3',
    isOptional: false,
  },
  {
    id: 3,
    code: STEP_CODES.CULTURE,
    name: 'Culture',
    description: 'Select cultural background',
    icon: 'sym_o_language',
    isOptional: false,
  },
  {
    id: 4,
    code: STEP_CODES.ATTRIBUTES,
    name: 'Attributes',
    description: 'Allocate attribute points',
    icon: 'sym_o_fitness_center',
    isOptional: false,
  },
  {
    id: 5,
    code: STEP_CODES.SKILLS,
    name: 'Skills',
    description: 'Assign skill ranks',
    icon: 'sym_o_school',
    isOptional: false,
  },
  {
    id: 6,
    code: STEP_CODES.EXPERTISES,
    name: 'Expertises',
    description: 'Select your expertises',
    icon: 'sym_o_workspace_premium',
    isOptional: false,
  },
  {
    id: 7,
    code: STEP_CODES.PATHS,
    name: 'Paths',
    description: 'Choose paths and talents',
    icon: 'sym_o_route',
    isOptional: false,
  },
  {
    id: 8,
    code: STEP_CODES.STARTING_KIT,
    name: 'Starting Kit',
    description: 'Choose equipment bundle',
    icon: 'sym_o_backpack',
    isOptional: false,
  },
  {
    id: 9,
    code: STEP_CODES.EQUIPMENT,
    name: 'Equipment',
    description: 'Customize gear and currency',
    icon: 'sym_o_inventory_2',
    isOptional: false,
  },
  {
    id: 10,
    code: STEP_CODES.PERSONAL_DETAILS,
    name: 'Details',
    description: 'Biography, goals, connections',
    icon: 'sym_o_person',
    isOptional: true,
  },
  {
    id: 11,
    code: STEP_CODES.REVIEW,
    name: 'Review',
    description: 'Review and create',
    icon: 'sym_o_checklist',
    isOptional: false,
  },
];
