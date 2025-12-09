import type { RadiantOrder, Surge } from 'src/types';

export const surges: Surge[] = [
  {
    id: 1,
    code: 'adhesion',
    name: 'Adhesion',
    attributeId: 6, // presence
    description: 'Bind objects together',
  },
  {
    id: 2,
    code: 'gravitation',
    name: 'Gravitation',
    attributeId: 5, // awareness
    description: 'Manipulate gravity',
  },
  {
    id: 3,
    code: 'division',
    name: 'Division',
    attributeId: 3, // intellect
    description: 'Destroy and decay',
  },
  {
    id: 4,
    code: 'abrasion',
    name: 'Abrasion',
    attributeId: 2, // speed
    description: 'Control friction',
  },
  {
    id: 5,
    code: 'progression',
    name: 'Progression',
    attributeId: 5, // awareness
    description: 'Growth and healing',
  },
  {
    id: 6,
    code: 'illumination',
    name: 'Illumination',
    attributeId: 6, // presence
    description: 'Create light and sound',
  },
  {
    id: 7,
    code: 'transformation',
    name: 'Transformation',
    attributeId: 4, // willpower
    description: 'Change matter (Soulcasting)',
  },
  {
    id: 8,
    code: 'transportation',
    name: 'Transportation',
    attributeId: 3, // intellect
    description: 'Move between realms',
  },
  {
    id: 9,
    code: 'cohesion',
    name: 'Cohesion',
    attributeId: 4, // willpower
    description: 'Reshape solids',
  },
  {
    id: 10,
    code: 'tension',
    name: 'Tension',
    attributeId: 1, // strength
    description: 'Stiffen materials',
  },
];

export const radiantOrders: RadiantOrder[] = [
  {
    id: 1,
    code: 'windrunner',
    name: 'Windrunner',
    surge1Id: 1, // adhesion
    surge2Id: 2, // gravitation
    description: 'Protectors who can manipulate gravity and binding',
  },
  {
    id: 2,
    code: 'skybreaker',
    name: 'Skybreaker',
    surge1Id: 2, // gravitation
    surge2Id: 3, // division
    description: 'Enforcers of law who can manipulate gravity and destruction',
  },
  {
    id: 3,
    code: 'dustbringer',
    name: 'Dustbringer',
    surge1Id: 3, // division
    surge2Id: 4, // abrasion
    description: 'Warriors who can destroy and control friction',
  },
  {
    id: 4,
    code: 'edgedancer',
    name: 'Edgedancer',
    surge1Id: 4, // abrasion
    surge2Id: 5, // progression
    description: 'Healers who can move with supernatural grace',
  },
  {
    id: 5,
    code: 'truthwatcher',
    name: 'Truthwatcher',
    surge1Id: 5, // progression
    surge2Id: 6, // illumination
    description: 'Scholars who see the future and heal',
  },
  {
    id: 6,
    code: 'lightweaver',
    name: 'Lightweaver',
    surge1Id: 6, // illumination
    surge2Id: 7, // transformation
    description: 'Illusionists who create light and transform matter',
  },
  {
    id: 7,
    code: 'elsecaller',
    name: 'Elsecaller',
    surge1Id: 7, // transformation
    surge2Id: 8, // transportation
    description: 'Scholars who can Soulcast and travel between realms',
  },
  {
    id: 8,
    code: 'willshaper',
    name: 'Willshaper',
    surge1Id: 8, // transportation
    surge2Id: 9, // cohesion
    description: 'Explorers who can reshape stone and travel',
  },
  {
    id: 9,
    code: 'stoneward',
    name: 'Stoneward',
    surge1Id: 9, // cohesion
    surge2Id: 10, // tension
    description: 'Defenders who can reshape and strengthen',
  },
  {
    id: 10,
    code: 'bondsmith',
    name: 'Bondsmith',
    surge1Id: 10, // tension
    surge2Id: 1, // adhesion
    description: 'Unifiers who can bind and strengthen',
  },
];
