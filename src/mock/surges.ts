import type { Surge } from 'src/types';

// Surge attributeIds reference cl_attributes classifier:
// 1=strength, 2=speed, 3=intellect, 4=willpower, 5=awareness, 6=presence
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
