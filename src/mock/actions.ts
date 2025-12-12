import type { ActivationType, ActionType, Action } from 'src/types';

/**
 * Activation type classifiers - how an action is activated
 */
export const activationTypes: ActivationType[] = [
  { id: 1, code: 'action', name: 'Action', description: 'Standard action (⬡)' },
  { id: 2, code: 'double_action', name: 'Double Action', description: 'Double action (⬡⬡)' },
  { id: 3, code: 'triple_action', name: 'Triple Action', description: 'Triple action (⬡⬡⬡)' },
  { id: 4, code: 'free_action', name: 'Free Action', description: 'Free action (◇)' },
  { id: 5, code: 'reaction', name: 'Reaction', description: 'Reaction (↺)' },
  { id: 6, code: 'special', name: 'Special', description: 'Special activation (★)' },
  { id: 7, code: 'always_active', name: 'Always Active', description: 'Passive/always on (●)' },
];

/**
 * Action type classifiers - categories of actions
 */
export const actionTypes: ActionType[] = [
  { id: 1, code: 'basic', name: 'Basic', description: 'Basic actions available to all characters' },
  { id: 2, code: 'weapon', name: 'Weapon', description: 'Weapon-specific actions' },
  { id: 3, code: 'talent', name: 'Talent', description: 'Actions granted by talents' },
  { id: 4, code: 'surge', name: 'Surge', description: 'Radiant surge actions' },
];

/**
 * Actions - all available actions in the game
 * actionTypeId references actionTypes.id (1=basic, 2=weapon, 3=talent, 4=surge)
 * activationTypeId references activationTypes.id (1=action, 2=double, 3=triple, 4=free, 5=reaction, 6=special, 7=always)
 */
export const actions: Action[] = [
  // Basic Actions (actionTypeId 1)
  {
    id: 1,
    actionTypeId: 1,
    activationTypeId: 1,
    code: 'strike',
    name: 'Strike',
    description: 'Make a weapon attack against a target.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 2,
    actionTypeId: 1,
    activationTypeId: 1,
    code: 'move',
    name: 'Move',
    description: 'Move up to your movement rate.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 3,
    actionTypeId: 1,
    activationTypeId: 1,
    code: 'disengage',
    name: 'Disengage',
    description: 'Move without provoking reactions from nearby enemies.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 4,
    actionTypeId: 1,
    activationTypeId: 1,
    code: 'gain-advantage',
    name: 'Gain Advantage',
    description: 'Set up for a better attack on your next turn.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 5,
    actionTypeId: 1,
    activationTypeId: 1,
    code: 'brace',
    name: 'Brace',
    description: 'Gain a defensive bonus until your next turn.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 6,
    actionTypeId: 1,
    activationTypeId: 5,
    code: 'aid',
    name: 'Aid',
    description: "Help an ally's test, granting them advantage.",
    focusCost: 1,
    investitureCost: 0,
  },
  {
    id: 7,
    actionTypeId: 1,
    activationTypeId: 5,
    code: 'dodge',
    name: 'Dodge',
    description: 'Attempt to avoid an incoming attack.',
    focusCost: 1,
    investitureCost: 0,
  },
  {
    id: 8,
    actionTypeId: 1,
    activationTypeId: 5,
    code: 'reactive-strike',
    name: 'Reactive Strike',
    description: 'Attack an enemy that leaves your reach.',
    focusCost: 1,
    investitureCost: 0,
  },
  {
    id: 9,
    actionTypeId: 1,
    activationTypeId: 1,
    code: 'intimidate',
    name: 'Intimidate',
    description: 'Demoralize an enemy using the Intimidation skill.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 10,
    actionTypeId: 1,
    activationTypeId: 1,
    code: 'deceive',
    name: 'Deceive',
    description: 'Mislead or feint using the Deception skill.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 11,
    actionTypeId: 1,
    activationTypeId: 1,
    code: 'persuade',
    name: 'Persuade',
    description: 'Influence behavior using the Persuasion skill.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 12,
    actionTypeId: 1,
    activationTypeId: 4,
    code: 'recall',
    name: 'Recall',
    description: 'Remember relevant information using the Lore skill.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 13,
    actionTypeId: 1,
    activationTypeId: 1,
    code: 'grapple',
    name: 'Grapple',
    description: 'Attempt to grab and restrain an enemy.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 14,
    actionTypeId: 1,
    activationTypeId: 1,
    code: 'shove',
    name: 'Shove',
    description: 'Push an enemy away or knock them prone.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 15,
    actionTypeId: 1,
    activationTypeId: 1,
    code: 'interact',
    name: 'Interact',
    description: 'Interact with an object, fabrial, or environment.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Talent Actions (actionTypeId 3) - referenced by talents
  {
    id: 101,
    actionTypeId: 3,
    activationTypeId: 5,
    code: 'opportunity-attack',
    name: 'Opportunity Attack',
    description: 'Make an attack when an enemy moves away from you.',
    special: 'Triggered when enemy leaves your reach',
    focusCost: 1,
    investitureCost: 0,
  },
  {
    id: 102,
    actionTypeId: 3,
    activationTypeId: 7,
    code: 'hold-the-line',
    name: 'Hold the Line',
    description: 'Allies adjacent to you gain +2 to Physical Defense.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 103,
    actionTypeId: 3,
    activationTypeId: 1,
    code: 'attune-fabrial',
    name: 'Attune Fabrial',
    description: 'Fabrials you attune have +1 maximum charge.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 104,
    actionTypeId: 3,
    activationTypeId: 4,
    code: 'enter-stance',
    name: 'Enter Stance',
    description: 'Enter a combat stance that enhances your fighting style.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 105,
    actionTypeId: 3,
    activationTypeId: 7,
    code: 'flamestance-assault',
    name: 'Flamestance Assault',
    description: 'While in Flamestance, your attacks deal +2 damage.',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 106,
    actionTypeId: 3,
    activationTypeId: 6,
    code: 'change-form',
    name: 'Change Form',
    description: 'During a highstorm, bond a spren and transform into a new form.',
    special: 'Must be outdoors during a highstorm',
    focusCost: 0,
    investitureCost: 0,
  },
  {
    id: 107,
    actionTypeId: 3,
    activationTypeId: 1,
    code: 'unleash-lightning',
    name: 'Unleash Lightning',
    description: 'Make a ranged Discipline attack dealing 2d8 energy damage.',
    dice: '2d8',
    focusCost: 1,
    investitureCost: 0,
  },
  {
    id: 108,
    actionTypeId: 3,
    activationTypeId: 5,
    code: 'decaying-touch',
    name: 'Decaying Touch',
    description: 'Prevent a character within reach from recovering health or focus.',
    focusCost: 1,
    investitureCost: 0,
  },
  {
    id: 109,
    actionTypeId: 3,
    activationTypeId: 5,
    code: 'intervening-premonitions',
    name: 'Intervening Premonitions',
    description: 'Replace a test roll with one of your recorded d20 results.',
    focusCost: 0,
    investitureCost: 0,
  },
];

/**
 * Helper to get activation type name from ID
 */
export function getActivationTypeName(activationTypeId: number): string {
  return activationTypes.find((t) => t.id === activationTypeId)?.name ?? 'Unknown';
}

/**
 * Helper to get action type name from ID
 */
export function getActionTypeName(actionTypeId: number): string {
  return actionTypes.find((t) => t.id === actionTypeId)?.name ?? 'Unknown';
}

/**
 * Helper to get action by code
 */
export function getActionByCode(code: string): Action | undefined {
  return actions.find((a) => a.code === code);
}

/**
 * Helper to get actions by type
 */
export function getActionsByType(actionTypeId: number): Action[] {
  return actions.filter((a) => a.actionTypeId === actionTypeId);
}

/**
 * Helper to get basic actions
 */
export function getBasicActions(): Action[] {
  return getActionsByType(1);
}
