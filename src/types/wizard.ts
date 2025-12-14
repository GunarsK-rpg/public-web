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
 * Wizard steps for hero creation/editing
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
