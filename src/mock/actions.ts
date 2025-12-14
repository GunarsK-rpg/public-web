import type { ActivationType, ActionType, Action, ActionLink } from 'src/types';

/**
 * Activation type classifiers - how an action is activated
 * icon: path relative to src/assets/icons/
 */
export const activationTypes: ActivationType[] = [
  { id: 1, code: 'action', name: 'Action', icon: 'action.svg', description: 'Standard action' },
  {
    id: 2,
    code: 'double_action',
    name: 'Double Action',
    icon: 'double-action.svg',
    description: 'Double action',
  },
  {
    id: 3,
    code: 'triple_action',
    name: 'Triple Action',
    icon: 'triple-action.svg',
    description: 'Triple action',
  },
  {
    id: 4,
    code: 'free_action',
    name: 'Free Action',
    icon: 'free-action.svg',
    description: 'Free action',
  },
  { id: 5, code: 'reaction', name: 'Reaction', icon: 'reaction.svg', description: 'Reaction' },
  {
    id: 6,
    code: 'special',
    name: 'Special',
    icon: 'special.svg',
    description: 'Special activation',
  },
  {
    id: 7,
    code: 'always_active',
    name: 'Always Active',
    icon: 'passive.svg',
    description: 'Passive/always on',
  },
];

/**
 * Action type classifiers - categories of actions
 */
export const actionTypes: ActionType[] = [
  { id: 1, code: 'basic', name: 'Basic', description: 'Basic actions available to all characters' },
  { id: 2, code: 'equipment', name: 'Equipment', description: 'Equipment-specific actions' },
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

  // ============================================================================
  // TALENT ACTIONS (actionTypeId 3) - referenced by talents via actionId FK
  // ============================================================================

  // --- WARRIOR PATH TALENTS ---

  // Warrior Key Talent: Vigilant Stance (id: 600)
  {
    id: 600,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'vigilant-stance',
    name: 'Vigilant Stance',
    description:
      'Enter a combat stance as a free action. While in any stance, you gain advantage on Perception tests to notice threats and cannot be Surprised.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Duelist: Riposte (id: 605)
  {
    id: 605,
    actionTypeId: 3,
    activationTypeId: 5, // reaction
    code: 'riposte',
    name: 'Riposte',
    description:
      'When an enemy misses you with a melee attack, spend 1 focus to make a melee attack against them.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Duelist: Blade Dance (id: 607)
  {
    id: 607,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'blade-dance',
    name: 'Blade Dance',
    description:
      'Once per turn, when you hit with a melee attack, you can move up to 10 feet without provoking reactions.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Duelist: Masterful Flourish (id: 608)
  {
    id: 608,
    actionTypeId: 3,
    activationTypeId: 1, // action
    code: 'masterful-flourish',
    name: 'Masterful Flourish',
    description:
      'Spend 2 focus to make a melee attack. On a hit, deal an extra 2d6 damage and the target becomes Disoriented until the end of your next turn.',
    dice: '2d6',
    focusCost: 2,
    investitureCost: 0,
  },

  // Shardbearer: Plate Regeneration (id: 614)
  {
    id: 614,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'plate-regeneration',
    name: 'Plate Regeneration',
    description:
      'During your turn, spend 1 focus to restore 1 charge to your Shardplate. You can only use this ability once per round.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Shardbearer: Devastating Cleave (id: 615)
  {
    id: 615,
    actionTypeId: 3,
    activationTypeId: 2, // double action
    code: 'devastating-cleave',
    name: 'Devastating Cleave',
    description:
      'Make a single Shardblade attack against all enemies within reach in a 180-degree arc. Roll damage once and apply to all targets hit.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Shardbearer: Instant Summon (id: 617)
  {
    id: 617,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'instant-summon',
    name: 'Instant Summon',
    description:
      'You can summon or dismiss your bonded Shardblade as a free action. Additionally, if disarmed, you can immediately resummon it.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Shardbearer: Unstoppable Force (id: 618)
  {
    id: 618,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'unstoppable-force',
    name: 'Unstoppable Force',
    description:
      'Once per combat, spend 3 focus to move up to double your movement in a straight line. You can move through enemy spaces and make a melee attack against each enemy you pass through with +2 damage.',
    focusCost: 3,
    investitureCost: 0,
  },

  // Soldier: Spear Wall (id: 623)
  {
    id: 623,
    actionTypeId: 3,
    activationTypeId: 5, // reaction
    code: 'spear-wall',
    name: 'Spear Wall',
    description:
      'When wielding a reach weapon and an enemy enters your reach, spend 1 focus to make a melee attack against them. On a hit, the enemy must stop their movement.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Soldier: Never Surrender (id: 626)
  {
    id: 626,
    actionTypeId: 3,
    activationTypeId: 5, // reaction
    code: 'never-surrender',
    name: 'Never Surrender',
    description:
      'Once per combat, when you would be reduced to 0 health, you instead remain at 1 health. You become Exhausted until you complete a rest.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Soldier: Rallying Cry (id: 628)
  {
    id: 628,
    actionTypeId: 3,
    activationTypeId: 1, // action
    code: 'rallying-cry',
    name: 'Rallying Cry',
    description:
      'Spend 2 focus to rally allies within 30 feet. Each ally gains temporary health equal to your tier + Leadership ranks and recovers 1 focus. Enemies who can hear you must succeed on a Spiritual defense test or become Frightened.',
    focusCost: 2,
    investitureCost: 0,
  },

  // --- AGENT PATH TALENTS ---

  // Agent: Watchful Eye (id: 101)
  {
    id: 101,
    actionTypeId: 3,
    activationTypeId: 5, // reaction
    code: 'watchful-eye',
    name: 'Watchful Eye',
    description:
      'When a willing ally within 20 feet of you rolls a plot die, use Opportunist on that plot die as if it were your own.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Agent: Quick Analysis (id: 102)
  {
    id: 102,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'quick-analysis',
    name: 'Quick Analysis',
    description:
      'Spend 2 focus to gain an action, which you can only use to make cognitive skill tests.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Agent: Get 'Em Talking (id: 103)
  {
    id: 103,
    actionTypeId: 3,
    activationTypeId: 1, // action
    code: 'get-em-talking',
    name: "Get 'Em Talking",
    description:
      "Spend 1 focus to make a Deduction test against the Spiritual defense of a character you can influence. On success, learn the target's motivation.",
    focusCost: 1,
    investitureCost: 0,
  },

  // Agent: Close the Case (id: 108)
  {
    id: 108,
    actionTypeId: 3,
    activationTypeId: 1, // action
    code: 'close-the-case',
    name: 'Close the Case',
    description:
      'Once per scene, spend 3 focus to make a Deduction test against the Cognitive defense of a character. On success, influence them to back down.',
    focusCost: 3,
    investitureCost: 0,
  },

  // Agent: Plausible Excuse (id: 203)
  {
    id: 203,
    actionTypeId: 3,
    activationTypeId: 5, // reaction
    code: 'plausible-excuse',
    name: 'Plausible Excuse',
    description:
      'After you are discovered while hiding, spend 2 focus to pass yourself off as doing something innocent.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Agent: Subtle Takedown (id: 205)
  {
    id: 205,
    actionTypeId: 3,
    activationTypeId: 1, // action
    code: 'subtle-takedown',
    name: 'Subtle Takedown',
    description:
      "Make an unarmed attack using Insight against the Cognitive defense of a character who is Surprised or doesn't sense you. On hit, the target can't communicate until end of their next turn.",
    focusCost: 0,
    investitureCost: 0,
  },

  // Agent: Cheap Shot (id: 301)
  {
    id: 301,
    actionTypeId: 3,
    activationTypeId: 1, // action
    code: 'cheap-shot',
    name: 'Cheap Shot',
    description:
      'Spend 1 focus to make an unarmed attack using Thievery against the Cognitive defense of an enemy. On a hit, the target becomes Stunned.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Agent: Shadow Step (id: 303)
  {
    id: 303,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'shadow-step',
    name: 'Shadow Step',
    description:
      "After you Disengage, spend 2 focus to make a Thievery test against each enemy's Cognitive defense. On success, you're hidden from them.",
    focusCost: 2,
    investitureCost: 0,
  },

  // Agent: Trickster's Hand (id: 304)
  {
    id: 304,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'tricksters-hand',
    name: "Trickster's Hand",
    description: 'Spend 2 focus to gain an action for physical skill tests only.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Agent: Fast Talker (id: 307)
  {
    id: 307,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'fast-talker',
    name: 'Fast Talker',
    description: 'Spend 2 focus to gain an action for spiritual skill tests only.',
    focusCost: 2,
    investitureCost: 0,
  },

  // --- SCHOLAR PATH TALENTS ---

  // Scholar: Field Medicine (id: 521)
  {
    id: 521,
    actionTypeId: 3,
    activationTypeId: 1, // action
    code: 'field-medicine',
    name: 'Field Medicine',
    description:
      'Spend 1 focus to make a DC 15 Medicine test to heal a conscious willing character. On success, they recover health equal to their recovery die + your Medicine ranks.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Scholar: Anatomical Insight (id: 523)
  {
    id: 523,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'anatomical-insight',
    name: 'Anatomical Insight',
    description:
      'On an unarmed hit, spend 1 focus to apply Exhausted. The penalty equals half your Medicine ranks (rounded up).',
    focusCost: 1,
    investitureCost: 0,
  },

  // Scholar: Swift Healer (id: 525)
  {
    id: 525,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'swift-healer',
    name: 'Swift Healer',
    description:
      'Use Field Medicine as a free action. When healing others, they recover additional health equal to your Medicine ranks.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Scholar: Deep Contemplation (id: 515)
  {
    id: 515,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'deep-contemplation',
    name: 'Deep Contemplation',
    description: 'Reassign up to 2 of the skills and expertises gained from Erudition.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Scholar: Contingency (id: 516)
  {
    id: 516,
    actionTypeId: 3,
    activationTypeId: 5, // reaction
    code: 'contingency',
    name: 'Contingency',
    description: 'After an ally within 20 feet rolls a Complication, spend 2 focus to remove it.',
    focusCost: 2,
    investitureCost: 0,
  },

  // --- SINGER ANCESTRY TALENTS ---

  // Singer: Change Form (id: 2001)
  {
    id: 2001,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'change-form',
    name: 'Change Form',
    description: 'During a highstorm, bond a spren and transform into a new form.',
    special: 'Must be outdoors during a highstorm',
    focusCost: 0,
    investitureCost: 0,
  },

  // Singer: Unleash Lightning (id: 2006)
  {
    id: 2006,
    actionTypeId: 3,
    activationTypeId: 1, // action
    code: 'unleash-lightning',
    name: 'Unleash Lightning',
    description:
      'Make a ranged Discipline attack dealing 2d8 energy damage. Target becomes Disoriented on hit.',
    dice: '2d8',
    focusCost: 0,
    investitureCost: 0,
  },

  // Singer: Decaying Touch (id: 2008)
  {
    id: 2008,
    actionTypeId: 3,
    activationTypeId: 5, // reaction
    code: 'decaying-touch',
    name: 'Decaying Touch',
    description:
      'Spend 1 focus to prevent a character within reach from recovering health or focus.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Singer: Intervening Premonitions (id: 2008b - using 2009 to avoid collision)
  {
    id: 2009,
    actionTypeId: 3,
    activationTypeId: 5, // reaction
    code: 'intervening-premonitions',
    name: 'Intervening Premonitions',
    description: 'Replace a test roll with one of your recorded d20 results.',
    focusCost: 0,
    investitureCost: 0,
  },

  // --- WINDRUNNER RADIANT TALENTS ---

  // Windrunner: Reverse Lashing (id: 3003)
  {
    id: 3003,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'reverse-lashing',
    name: 'Reverse Lashing',
    description:
      'Instead of a Basic Lashing, infuse a target with a Reverse Lashing. Declare a type of object to attract. Objects within your gravitation rate fly toward and stick to the target.',
    focusCost: 0,
    investitureCost: 1,
  },

  // Adhesion Surge: Stormlight Reclamation (id: 4001)
  {
    id: 4001,
    actionTypeId: 4, // surge
    activationTypeId: 4, // free action
    code: 'stormlight-reclamation',
    name: 'Stormlight Reclamation',
    description:
      'After infusions expend Investiture, end any within reach and recover remaining Investiture.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Adhesion Surge: Binding Strike (id: 4002)
  {
    id: 4002,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'binding-strike',
    name: 'Binding Strike',
    description:
      'After hitting with a melee attack, spend an action or 2 focus to use Adhesion without spending an action. Automatically succeed on the test.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Adhesion Surge: Binding Shot (id: 4004)
  {
    id: 4004,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'binding-shot',
    name: 'Binding Shot',
    description: 'Use Binding Strike with ranged attacks at any distance.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Adhesion Surge: Adhesive Trap (id: 4006)
  {
    id: 4006,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'adhesive-trap',
    name: 'Adhesive Trap',
    description:
      'Infuse a surface instead of objects. Characters touching it become subject to a Full Lashing.',
    focusCost: 0,
    investitureCost: 1,
  },

  // Gravitation Surge: Flying Ace (id: 4101)
  {
    id: 4101,
    actionTypeId: 4, // surge
    activationTypeId: 4, // free action
    code: 'flying-ace',
    name: 'Flying Ace',
    description:
      'While Lashing yourself, fly up to your gravitation rate. Spend 1 focus for a melee attack during movement. Gravitation rate increases to 40 feet.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Gravitation Surge: Gravitational Slam (id: 4102)
  {
    id: 4102,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'gravitational-slam',
    name: 'Gravitational Slam',
    description:
      'When moving an unwilling target into a surface, deal 1d4 impact damage per 10 feet moved.',
    dice: '1d4',
    focusCost: 0,
    investitureCost: 0,
  },

  // Gravitation Surge: Multiple Lashings (id: 4104)
  {
    id: 4104,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'multiple-lashings',
    name: 'Multiple Lashings',
    description:
      'After succeeding on Gravitation vs unwilling character, infuse up to your Gravitation ranks in Investiture. Effect continues until infusion ends.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Gravitation Surge: Lashing Shot (id: 4105)
  {
    id: 4105,
    actionTypeId: 4, // surge
    activationTypeId: 1, // action
    code: 'lashing-shot',
    name: 'Lashing Shot',
    description:
      'Touch an object and propel it at a target. Make a ranged Gravitation attack dealing 2d4 impact damage.',
    dice: '2d4',
    focusCost: 0,
    investitureCost: 1,
  },

  // Gravitation Surge: Group Flight (id: 4106)
  {
    id: 4106,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'group-flight',
    name: 'Group Flight',
    description:
      'While not in combat, when Lashing yourself or an ally, also infuse up to your Gravitation ranks in additional allies within reach.',
    focusCost: 0,
    investitureCost: 0,
  },

  // ============================================================================
  // AGENT PATH TALENT ACTIONS (actionTypeId 3)
  // ============================================================================

  // Agent Key Talent: Opportunist (id: 1)
  {
    id: 101,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'opportunist',
    name: 'Opportunist',
    description: 'Once per round, when you roll a plot die, you can reroll that result.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Investigator: Watchful Eye (id: 101 talent -> action 1011)
  {
    id: 1011,
    actionTypeId: 3,
    activationTypeId: 5, // reaction
    code: 'watchful-eye',
    name: 'Watchful Eye',
    description:
      'When a willing ally within 20 feet rolls a plot die, use Opportunist on that plot die as if it were your own.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Investigator: Quick Analysis (id: 102 talent -> action 1021)
  {
    id: 1021,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'quick-analysis',
    name: 'Quick Analysis',
    description:
      'Spend 2 focus to gain an action for cognitive skill tests only (Use a Skill, Gain Advantage, or Agent talents).',
    focusCost: 2,
    investitureCost: 0,
  },

  // Investigator: Get 'Em Talking (id: 103 talent -> action 1031)
  {
    id: 1031,
    actionTypeId: 3,
    activationTypeId: 1, // action
    code: 'get-em-talking',
    name: "Get 'Em Talking",
    description:
      "Spend 1 focus to learn target's motivation and raise stakes against them until end of scene.",
    focusCost: 1,
    investitureCost: 0,
  },

  // Investigator: Close the Case (id: 108 talent -> action 1081)
  {
    id: 1081,
    actionTypeId: 3,
    activationTypeId: 1, // action
    code: 'close-the-case',
    name: 'Close the Case',
    description: 'Once per scene, spend 3 focus to influence target to back down.',
    focusCost: 3,
    investitureCost: 0,
  },

  // Spy: Sure Outcome (id: 201 talent -> action 2011)
  {
    id: 2011,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'sure-outcome',
    name: 'Sure Outcome',
    description: 'When using Opportunist, spend 2 focus to flip plot die to specific result.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Spy: Plausible Excuse (id: 203 talent -> action 2031)
  {
    id: 2031,
    actionTypeId: 3,
    activationTypeId: 5, // reaction
    code: 'plausible-excuse',
    name: 'Plausible Excuse',
    description: 'After being discovered while hiding, spend 2 focus to feign innocence.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Spy: Subtle Takedown (id: 205 talent -> action 2051)
  {
    id: 2051,
    actionTypeId: 3,
    activationTypeId: 1, // action
    code: 'subtle-takedown',
    name: 'Subtle Takedown',
    description: "Silent unarmed attack using Insight against unaware target's Cognitive defense.",
    focusCost: 0,
    investitureCost: 0,
  },

  // Spy: High Society Contacts (id: 207 talent -> action 2071)
  {
    id: 2071,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'high-society-contacts',
    name: 'High Society Contacts',
    description: 'Spend 2 focus to add Opportunity to high society social tests.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Thief: Cheap Shot (id: 301 talent -> action 3011)
  {
    id: 3011,
    actionTypeId: 3,
    activationTypeId: 1, // action
    code: 'cheap-shot',
    name: 'Cheap Shot',
    description: 'Spend 1 focus for unarmed attack using Thievery. Target becomes Stunned on hit.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Thief: Shadow Step (id: 303 talent -> action 3031)
  {
    id: 3031,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'shadow-step',
    name: 'Shadow Step',
    description: 'After Disengage, spend 2 focus to hide from enemies.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Thief: Trickster's Hand (id: 304 talent -> action 3041)
  {
    id: 3041,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'tricksters-hand',
    name: "Trickster's Hand",
    description: 'Spend 2 focus to gain an action for physical skill tests only.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Thief: Risky Behavior (id: 305 talent -> action 3051)
  {
    id: 3051,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'risky-behavior',
    name: 'Risky Behavior',
    description: 'Before making a test, spend 1 focus to raise the stakes.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Thief: Double Down (id: 306 talent -> action 3061)
  {
    id: 3061,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'double-down',
    name: 'Double Down',
    description: 'After Opportunist, reroll again. Lose 2 focus on Complication.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Thief: Fast Talker (id: 307 talent -> action 3071)
  {
    id: 3071,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'fast-talker',
    name: 'Fast Talker',
    description: 'Spend 2 focus to gain an action for spiritual skill tests only.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Thief: Underworld Contacts (id: 308 talent -> action 3081)
  {
    id: 3081,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'underworld-contacts',
    name: 'Underworld Contacts',
    description: 'Spend 2 focus to add Opportunity to social tests with criminals.',
    focusCost: 2,
    investitureCost: 0,
  },

  // ============================================================================
  // SCHOLAR PATH TALENT ACTIONS (actionTypeId 3)
  // ============================================================================

  // Scholar Key Talent: Erudition (id: 500)
  {
    id: 5001,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'erudition',
    name: 'Erudition',
    description:
      'Gain temporary expertise and skill ranks. Reassign after long rest with library access.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Artifabrian: Prized Acquisition (id: 502 talent -> action 5021)
  {
    id: 5021,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'prized-acquisition',
    name: 'Prized Acquisition',
    description: 'Gain Fabrial Crafting expertise and a special gem for crafting.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Artifabrian: Overcharge (id: 506 talent -> action 5061)
  {
    id: 5061,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'overcharge',
    name: 'Overcharge',
    description: 'Raise stakes on fabrial attacks. Spend Opportunity for free Strike.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Artifabrian: Experimental Tinkering (id: 507 talent -> action 5071)
  {
    id: 5071,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'experimental-tinkering',
    name: 'Experimental Tinkering',
    description: 'Expanded Opportunity range, halved craft time. Reconfigure Prized fabrial.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Artifabrian: Overwhelm with Details (id: 508 talent -> action 5081)
  {
    id: 5081,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'overwhelm-with-details',
    name: 'Overwhelm with Details',
    description: 'Spend 2 focus to use Lore for any cognitive/spiritual test.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Strategist: Strategize (id: 511 talent -> action 5111)
  {
    id: 5111,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'strategize',
    name: 'Strategize',
    description: 'Give Gain Advantage benefits to an ally instead of yourself.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Strategist: Deep Contemplation (id: 515 talent -> action 5151)
  {
    id: 5151,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'deep-contemplation',
    name: 'Deep Contemplation',
    description: 'Reassign up to 2 skills/expertises from Erudition.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Strategist: Contingency (id: 516 talent -> action 5161)
  {
    id: 5161,
    actionTypeId: 3,
    activationTypeId: 5, // reaction
    code: 'contingency',
    name: 'Contingency',
    description: "Spend 2 focus to remove Complication from ally's test within 20 feet.",
    focusCost: 2,
    investitureCost: 0,
  },

  // Strategist: Turning Point (id: 518 talent -> action 5181)
  {
    id: 5181,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'turning-point',
    name: 'Turning Point',
    description: 'Once per scene, on success vs enemy leader, allies gain extra action.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Surgeon: Field Medicine (id: 521 talent -> action 5211)
  {
    id: 5211,
    actionTypeId: 3,
    activationTypeId: 1, // action
    code: 'field-medicine',
    name: 'Field Medicine',
    description: 'DC 15 Medicine test to heal a conscious character.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Surgeon: Anatomical Insight (id: 523 talent -> action 5231)
  {
    id: 5231,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'anatomical-insight',
    name: 'Anatomical Insight',
    description: 'On unarmed hit, spend 1 focus to apply Exhausted condition.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Surgeon: Swift Healer (id: 525 talent -> action 5251)
  {
    id: 5251,
    actionTypeId: 3,
    activationTypeId: 4, // free action
    code: 'swift-healer',
    name: 'Swift Healer',
    description: 'Use Field Medicine as free action. Heal extra = Medicine ranks.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Surgeon: Ongoing Care (id: 527 talent -> action 5271)
  {
    id: 5271,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'ongoing-care',
    name: 'Ongoing Care',
    description: 'During rest, remove injury condition from ally.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Surgeon: Resuscitation (id: 528 talent -> action 5281)
  {
    id: 5281,
    actionTypeId: 3,
    activationTypeId: 6, // special
    code: 'resuscitation',
    name: 'Resuscitation',
    description: 'Spend 3 focus to revive Unconscious or recently dead character.',
    focusCost: 3,
    investitureCost: 0,
  },

  // ============================================================================
  // ADDITIONAL WINDRUNNER/SURGE TALENT ACTIONS (actionTypeId 4)
  // ============================================================================

  // Windrunner: Wound Regeneration (id: 3006 talent -> action 30061)
  {
    id: 30061,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'wound-regeneration',
    name: 'Wound Regeneration',
    description: 'When Regenerating, spend Investiture to recover from injuries.',
    focusCost: 0,
    investitureCost: 2,
  },

  // Windrunner: Fourth Ideal (id: 3007 talent -> action 30071)
  {
    id: 30071,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'fourth-ideal-windrunner',
    name: 'Fourth Ideal (Windrunner)',
    description: 'Goal to speak Fourth Ideal; call windspren as Radiant Shardplate.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Windrunner: Take Squire (id: 3009 talent -> action 30091)
  {
    id: 30091,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'take-squire-windrunner',
    name: 'Take Squire (Windrunner)',
    description: 'After long rest, choose a willing character as squire, granting surges.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Adhesion Surge: Stormlight Reclamation (id: 4001 talent -> action 40011)
  {
    id: 40011,
    actionTypeId: 4, // surge
    activationTypeId: 4, // free action
    code: 'stormlight-reclamation',
    name: 'Stormlight Reclamation',
    description: 'End Adhesion infusions within reach, recover remaining Investiture.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Adhesion Surge: Binding Strike (id: 4002 talent -> action 40021)
  {
    id: 40021,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'binding-strike',
    name: 'Binding Strike',
    description: 'After melee hit, use Adhesion without spending an action.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Adhesion Surge: Binding Shot (id: 4004 talent -> action 40041)
  {
    id: 40041,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'binding-shot',
    name: 'Binding Shot',
    description: 'Use Binding Strike with ranged attacks at any distance.',
    focusCost: 2,
    investitureCost: 0,
  },

  // Adhesion Surge: Adhesive Trap (id: 4006 talent -> action 40061)
  {
    id: 40061,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'adhesive-trap',
    name: 'Adhesive Trap',
    description: 'Infuse surfaces; characters touching become Fully Lashed.',
    focusCost: 0,
    investitureCost: 1,
  },

  // Gravitation Surge: Flying Ace (id: 4101 talent -> action 41011)
  {
    id: 41011,
    actionTypeId: 4, // surge
    activationTypeId: 4, // free action
    code: 'flying-ace',
    name: 'Flying Ace',
    description: 'Fly + melee attack; gravitation rate increases to 40 feet.',
    focusCost: 1,
    investitureCost: 0,
  },

  // Gravitation Surge: Gravitational Slam (id: 4102 talent -> action 41021)
  {
    id: 41021,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'gravitational-slam',
    name: 'Gravitational Slam',
    description: 'Deal 1d4 impact damage per 10 feet moved when Lashing into surfaces.',
    focusCost: 0,
    investitureCost: 0,
  },

  // Gravitation Surge: Multiple Lashings (id: 4104 talent -> action 41041)
  {
    id: 41041,
    actionTypeId: 4, // surge
    activationTypeId: 6, // special
    code: 'multiple-lashings',
    name: 'Multiple Lashings',
    description: 'Infuse unwilling targets with multiple Investiture; effect continues.',
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

/**
 * Action links (cl_action_links)
 * Links actions to their sources (talents, equipment, surges)
 * The action's actionTypeId determines which table objectId references:
 * - talent (actionTypeId=3) → objectId is cl_talents.id
 * - equipment (actionTypeId=2) → objectId is cl_equipments.id
 * - surge (actionTypeId=4) → objectId is cl_surges.id
 * - basic (actionTypeId=1) → no entry needed (available to all)
 */
export const actionLinks: ActionLink[] = [
  // TODO: Populate with actual links when talents/equipment/surges are defined
  // Example: { id: 1, actionId: 600, objectId: 1 } // Vigilant Stance action linked to talent id 1
];
