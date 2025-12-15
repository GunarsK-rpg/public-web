import type { Condition, Injury } from 'src/types';

export const conditions: Condition[] = [
  {
    id: 1,
    code: 'afflicted',
    name: 'Afflicted',
    description: 'Take X damage per turn',
  },
  {
    id: 2,
    code: 'determined',
    name: 'Determined',
    description: 'Add Opportunity to failed test, then remove',
  },
  {
    id: 3,
    code: 'disoriented',
    name: 'Disoriented',
    description: 'No reactions, disadvantage on Perception',
  },
  {
    id: 4,
    code: 'empowered',
    name: 'Empowered',
    description: 'Advantage on all tests, Investiture refills',
  },
  {
    id: 5,
    code: 'exhausted',
    name: 'Exhausted',
    description: 'Penalty to all tests, -10 = death',
  },
  {
    id: 6,
    code: 'focused',
    name: 'Focused',
    description: 'Abilities cost 1 less focus',
  },
  {
    id: 7,
    code: 'immobilized',
    name: 'Immobilized',
    description: 'Movement = 0',
  },
  {
    id: 8,
    code: 'prone',
    name: 'Prone',
    description: 'Slowed, melee attacks gain advantage',
  },
  {
    id: 9,
    code: 'restrained',
    name: 'Restrained',
    description: 'Movement = 0, disadvantage except escape',
  },
  {
    id: 10,
    code: 'slowed',
    name: 'Slowed',
    description: 'Movement halved',
  },
  {
    id: 11,
    code: 'stunned',
    name: 'Stunned',
    description: 'Lose reactions, -2 actions',
  },
  {
    id: 12,
    code: 'surprised',
    name: 'Surprised',
    description: 'No reactions, -1 action, removed next turn',
  },
  {
    id: 13,
    code: 'unconscious',
    name: 'Unconscious',
    description: 'Unaware, drop items, prone',
  },
];

export const injuries: Injury[] = [
  {
    id: 1,
    code: 'minor-wound',
    name: 'Minor Wound',
    description: 'A small cut or bruise that heals quickly',
  },
  {
    id: 2,
    code: 'major-wound',
    name: 'Major Wound',
    description: 'A significant injury requiring medical attention',
  },
  {
    id: 3,
    code: 'broken-bone',
    name: 'Broken Bone',
    description: 'A fractured limb that impairs movement',
  },
  {
    id: 4,
    code: 'concussion',
    name: 'Concussion',
    description: 'Head trauma affecting cognitive ability',
  },
];
