import type { Expertise, ExpertiseType } from 'src/types';

/**
 * Expertise type classifiers
 * Maps to cl_expertise_types table
 */
export const expertiseTypes: ExpertiseType[] = [
  {
    id: 1,
    code: 'armor',
    name: 'Armor',
    description: 'Expertise in wearing/maintaining specific armor types',
  },
  {
    id: 2,
    code: 'cultural',
    name: 'Cultural',
    description: 'Knowledge of nations, cultures, and languages',
  },
  {
    id: 3,
    code: 'utility',
    name: 'Utility',
    description: 'Tools, trades, and technical knowledge',
  },
  {
    id: 4,
    code: 'weapon',
    name: 'Weapon',
    description: 'Expertise in wielding/maintaining specific weapon types',
  },
  {
    id: 5,
    code: 'specialist',
    name: 'Specialist',
    description: 'Restricted knowledge (Shardblades, fabrials, etc.)',
  },
];

/**
 * Expertises - expertiseTypeId references expertiseTypes.id
 * 1=armor, 2=cultural, 3=utility, 4=weapon, 5=specialist
 */
export const expertises: Expertise[] = [
  // Cultural expertises (expertiseTypeId 2)
  {
    id: 1,
    code: 'alethi',
    name: 'Alethi',
    expertiseTypeId: 2,
    description: 'Knowledge of Alethi princedoms, highprinces, Vorinism, and customs.',
  },
  {
    id: 2,
    code: 'veden',
    name: 'Veden',
    expertiseTypeId: 2,
    description: 'Knowledge of Jah Keved, its ethnic groups, and Veden customs.',
  },
  {
    id: 3,
    code: 'azish',
    name: 'Azish',
    expertiseTypeId: 2,
    description: 'Knowledge of Azish bureaucracy, law, and the Kadasixes.',
  },
  {
    id: 4,
    code: 'herdazian',
    name: 'Herdazian',
    expertiseTypeId: 2,
    description: 'Knowledge of Herdaz, ranching culture, and Herdazian customs.',
  },
  {
    id: 5,
    code: 'thaylen',
    name: 'Thaylen',
    expertiseTypeId: 2,
    description: 'Knowledge of Thaylenah trade, merchant councils, and seafaring.',
  },
  {
    id: 6,
    code: 'unkalaki',
    name: 'Unkalaki',
    expertiseTypeId: 2,
    description: 'Knowledge of Horneater Peaks, family structures, and traditions.',
  },
  {
    id: 7,
    code: 'shin',
    name: 'Shin',
    expertiseTypeId: 2,
    description: 'Knowledge of Shinovar, Stone Shamanism, and Shin customs.',
  },
  {
    id: 8,
    code: 'iriali',
    name: 'Iriali',
    expertiseTypeId: 2,
    description: 'Knowledge of Iri, the One religion, and the Long Trail.',
  },
  {
    id: 9,
    code: 'kharbranthian',
    name: 'Kharbranthian',
    expertiseTypeId: 2,
    description: 'Knowledge of Kharbranth, education systems, and medicine.',
  },
  {
    id: 10,
    code: 'listener',
    name: 'Listener',
    expertiseTypeId: 2,
    description: 'Knowledge of listener forms, songs, and Shattered Plains.',
  },
  {
    id: 11,
    code: 'reshi',
    name: 'Reshi',
    expertiseTypeId: 2,
    description: 'Knowledge of Reshi Isles, Tai-na greatshells, and island life.',
  },
  {
    id: 12,
    code: 'natan',
    name: 'Natan',
    expertiseTypeId: 2,
    description: 'Knowledge of Natan history, intense highstorms, and traditions.',
  },
  {
    id: 13,
    code: 'wayfarer',
    name: 'Wayfarer',
    expertiseTypeId: 2,
    description: 'Knowledge of travel routes, storm shelters, and international customs.',
  },
  {
    id: 14,
    code: 'high-society',
    name: 'High Society',
    expertiseTypeId: 2,
    description: 'Knowledge of noble etiquette, politics, and social maneuvering.',
  },
  // Utility expertises (expertiseTypeId 3)
  {
    id: 15,
    code: 'military-life',
    name: 'Military Life',
    expertiseTypeId: 3,
    description: 'Knowledge of military organization, tactics, and soldier life.',
  },
  {
    id: 16,
    code: 'animal-care',
    name: 'Animal Care',
    expertiseTypeId: 3,
    description: 'Knowledge of caring for animals, including horses and chulls.',
  },
  {
    id: 17,
    code: 'engineering',
    name: 'Engineering',
    expertiseTypeId: 3,
    description: 'Knowledge of construction, mechanisms, and structural design.',
  },
  {
    id: 18,
    code: 'medicine-expertise',
    name: 'Medicine',
    expertiseTypeId: 3,
    description: 'Knowledge of healing, surgery, and medical treatment.',
  },
  {
    id: 19,
    code: 'history',
    name: 'History',
    expertiseTypeId: 3,
    description: 'Knowledge of historical events, figures, and eras.',
  },
  {
    id: 20,
    code: 'religion',
    name: 'Religion',
    expertiseTypeId: 3,
    description: 'General knowledge of Rosharan religions and spiritual practices.',
  },
  {
    id: 21,
    code: 'underworld',
    name: 'Underworld',
    expertiseTypeId: 3,
    description: "Knowledge of criminal organizations, black markets, and thieves' guilds.",
  },
  {
    id: 35,
    code: 'literature',
    name: 'Literature',
    expertiseTypeId: 3,
    description: 'Knowledge of written works, poetry, and literary traditions.',
  },
  // Weapon expertises (expertiseTypeId 4)
  {
    id: 22,
    code: 'swords',
    name: 'Swords',
    expertiseTypeId: 4,
    description: 'Expertise in swords - maintenance, techniques, and expert traits.',
  },
  {
    id: 23,
    code: 'spears',
    name: 'Spears',
    expertiseTypeId: 4,
    description: 'Expertise in spears and polearms - techniques and expert traits.',
  },
  {
    id: 24,
    code: 'bows',
    name: 'Bows',
    expertiseTypeId: 4,
    description: 'Expertise in bows and ranged weapons.',
  },
  {
    id: 25,
    code: 'knives',
    name: 'Knives',
    expertiseTypeId: 4,
    description: 'Expertise in knives and daggers.',
  },
  {
    id: 26,
    code: 'unarmed',
    name: 'Unarmed Attacks',
    expertiseTypeId: 4,
    description: 'Expertise in hand-to-hand combat.',
  },
  // Armor expertises (expertiseTypeId 1)
  {
    id: 27,
    code: 'leather-armor',
    name: 'Leather Armor',
    expertiseTypeId: 1,
    description: 'Expertise in wearing and maintaining leather armor.',
  },
  {
    id: 28,
    code: 'chain-armor',
    name: 'Chain Armor',
    expertiseTypeId: 1,
    description: 'Expertise in wearing and maintaining chain mail.',
  },
  {
    id: 29,
    code: 'plate-armor',
    name: 'Plate Armor',
    expertiseTypeId: 1,
    description: 'Expertise in wearing and maintaining plate armor.',
  },
  // Specialist expertises (expertiseTypeId 5, restricted)
  {
    id: 30,
    code: 'fabrial-crafting',
    name: 'Fabrial Crafting',
    expertiseTypeId: 5,
    description: 'Restricted knowledge of creating and modifying fabrials.',
  },
  {
    id: 31,
    code: 'shardblades',
    name: 'Shardblades',
    expertiseTypeId: 5,
    description: 'Restricted knowledge of wielding and bonding Shardblades.',
  },
  {
    id: 32,
    code: 'shardplate',
    name: 'Shardplate',
    expertiseTypeId: 5,
    description: 'Restricted knowledge of wearing and maintaining Shardplate.',
  },
  {
    id: 33,
    code: 'knights-radiant',
    name: 'Knights Radiant',
    expertiseTypeId: 5,
    description: 'Restricted knowledge of Radiant history, orders, and ideals.',
  },
  {
    id: 34,
    code: 'singer-history',
    name: 'Singer History',
    expertiseTypeId: 5,
    description: 'Restricted knowledge of ancient singer civilization and forms.',
  },
];

/**
 * Helper to get expertise type name from ID
 */
export function getExpertiseTypeName(expertiseTypeId: number): string {
  return expertiseTypes.find((t) => t.id === expertiseTypeId)?.name ?? 'Unknown';
}

/**
 * Helper to get expertise by code
 */
export function getExpertiseByCode(code: string): Expertise | undefined {
  return expertises.find((e) => e.code === code);
}

/**
 * Helper to get expertises by type ID
 */
export function getExpertisesByTypeId(expertiseTypeId: number): Expertise[] {
  return expertises.filter((e) => e.expertiseTypeId === expertiseTypeId);
}
