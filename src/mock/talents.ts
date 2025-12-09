import type { Talent } from 'src/types';

/**
 * Talents - using IDs for references
 * pathId references heroicPaths.id (1=agent, 2=envoy, 3=hunter, 4=leader, 5=scholar, 6=warrior)
 * specialtyId references specialties.id (16=duelist, 17=shardbearer, 18=soldier, 13=artifabrian)
 * ancestryId references ancestries.id (singer ancestryId is placeholder)
 */
export const talents: Talent[] = [
  // Warrior Key Talent
  {
    id: 1,
    code: 'vigilant-stance',
    name: 'Vigilant Stance',
    description: 'Gain +1 to Physical Defense while aware of enemies',
    pathId: 6, // warrior
    isKey: true,
    prerequisites: [],
  },
  // Warrior Path Talents
  {
    id: 2,
    code: 'combat-reflexes',
    name: 'Combat Reflexes',
    description: 'Make an opportunity attack when enemy moves away',
    pathId: 6, // warrior
    actionId: 101, // opportunity-attack action
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 1 }], // vigilant-stance
  },
  // Soldier Specialty Talents (specialtyId 18)
  {
    id: 3,
    code: 'hold-the-line',
    name: 'Hold the Line',
    description: 'Allies adjacent to you gain +2 to Physical Defense',
    pathId: 6, // warrior
    specialtyId: 18, // soldier
    actionId: 102, // hold-the-line action
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 1 }], // vigilant-stance
  },
  // Scholar Key Talent
  {
    id: 4,
    code: 'erudition',
    name: 'Erudition',
    description: 'Gain advantage on Lore checks related to your expertises',
    pathId: 5, // scholar
    isKey: true,
    prerequisites: [],
  },
  // Artifabrian Specialty Talents (specialtyId 13)
  {
    id: 5,
    code: 'fabrial-attunement',
    name: 'Fabrial Attunement',
    description: 'Fabrials you use have +1 maximum charge',
    pathId: 5, // scholar
    specialtyId: 13, // artifabrian
    actionId: 103, // attune-fabrial action
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 4 }], // erudition
  },
  // Duelist Specialty Talents (specialtyId 16)
  {
    id: 6,
    code: 'practiced-kata',
    name: 'Practiced Kata',
    description: 'Enter a combat stance that enhances your fighting style',
    pathId: 6, // warrior
    specialtyId: 16, // duelist
    actionId: 104, // enter-stance action
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 1 }], // vigilant-stance
  },
  {
    id: 7,
    code: 'flamestance',
    name: 'Flamestance',
    description: 'An aggressive stance focused on overwhelming offense',
    pathId: 6, // warrior
    specialtyId: 16, // duelist
    actionId: 105, // flamestance-assault action
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 6 }], // practiced-kata
  },
  {
    id: 8,
    code: 'signature-weapon',
    name: 'Signature Weapon',
    description: 'Your mastery with your chosen weapon grants additional benefits',
    pathId: 6, // warrior
    specialtyId: 16, // duelist
    isKey: false,
    prerequisites: [{ type: 'skill', skillId: 3, skillRank: 3 }], // heavy-weaponry rank 3
  },
  // Leader Key Talent
  {
    id: 17,
    code: 'inspiring-presence',
    name: 'Inspiring Presence',
    description: 'Your presence bolsters the morale of allies. Allies within 30 feet gain +1 to Willpower tests.',
    pathId: 4, // leader
    isKey: true,
    prerequisites: [],
  },
  // Singer Ancestry Talents (ancestryId placeholder = 2 for singer)
  {
    id: 9,
    code: 'change-form',
    name: 'Change Form',
    description:
      'You learn to bond a spren during highstorms and change your form. This transformation alters not only your appearance, but your physical, cognitive, and spiritual strengths, and even your personality.',
    descriptionShort:
      'While outdoors during a highstorm, bond a spren and change into any form you have unlocked.',
    ancestryId: 2, // singer
    actionId: 106, // change-form action
    isKey: true,
    prerequisites: [],
  },
  {
    id: 10,
    code: 'forms-of-finesse',
    name: 'Forms of Finesse',
    description:
      'You have learned to bond with spren that grant creative and agile forms, expanding your connection to the rhythms and enhancing your physical flexibility. You gain artform and nimbleform.',
    ancestryId: 2, // singer
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 9 }], // change-form
  },
  {
    id: 11,
    code: 'forms-of-resolve',
    name: 'Forms of Resolve',
    description:
      'You have learned to bond with spren that grant forms of strength and endurance. You gain warform and workform.',
    ancestryId: 2, // singer
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 9 }], // change-form
  },
  {
    id: 12,
    code: 'forms-of-wisdom',
    name: 'Forms of Wisdom',
    description:
      'You have learned to bond with spren that enhance communication and scholarship. You gain mediationform and scholarform.',
    ancestryId: 2, // singer
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 9 }], // change-form
  },
  {
    id: 13,
    code: 'ambitious-mind',
    name: 'Ambitious Mind',
    description:
      "Your growing thirst for power opens you to the influence of Odium. Your Cognitive defense increases by 2. If you later acquire a talent that grants forms of power, you can bond a Voidspren.",
    ancestryId: 2, // singer
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 9, skillRank: 3 }, // discipline rank 3
      {
        type: 'talent',
        description: 'Forms of Finesse, Forms of Resolve, or Forms of Wisdom',
      },
    ],
  },
  {
    id: 14,
    code: 'forms-of-destruction',
    name: 'Forms of Destruction',
    description:
      "You have opened yourself to Odium's power and can now bond Voidspren that grant devastating forms of war. You gain direform and stormform.",
    ancestryId: 2, // singer
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 13 }], // ambitious-mind
  },
  {
    id: 15,
    code: 'forms-of-expansion',
    name: 'Forms of Expansion',
    description:
      "You have opened yourself to Odium's power and can now bond Voidspren that grant forms of communication and speed. You gain envoyform and relayform.",
    ancestryId: 2, // singer
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 13 }], // ambitious-mind
  },
  {
    id: 16,
    code: 'forms-of-mystery',
    name: 'Forms of Mystery',
    description:
      "You have opened yourself to Odium's power and can now bond Voidspren that grant forms of spiritual manipulation and foresight. You gain decayform and nightform.",
    ancestryId: 2, // singer
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 13 }], // ambitious-mind
  },
];

/**
 * Helper to get talents by path ID
 */
export function getTalentsByPathId(pathId: number): Talent[] {
  return talents.filter((t) => t.pathId === pathId);
}

/**
 * Helper to get talents by specialty ID
 */
export function getTalentsBySpecialtyId(specialtyId: number): Talent[] {
  return talents.filter((t) => t.specialtyId === specialtyId);
}

/**
 * Helper to get talents by ancestry ID
 */
export function getTalentsByAncestryId(ancestryId: number): Talent[] {
  return talents.filter((t) => t.ancestryId === ancestryId);
}

/**
 * Helper to get key talents for a path
 */
export function getKeyTalentForPath(pathId: number): Talent | undefined {
  return talents.find((t) => t.pathId === pathId && t.isKey);
}

/**
 * Helper to get talent by code
 */
export function getTalentByCode(code: string): Talent | undefined {
  return talents.find((t) => t.code === code);
}
