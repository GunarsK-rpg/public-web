import type { Expertise, ExpertiseCategory, ExpertiseSource } from 'src/types';

/**
 * Expertise category classifiers
 */
export const expertiseCategories: ExpertiseCategory[] = [
  { id: 1, code: 'armor', name: 'Armor', description: 'Expertise in wearing/maintaining specific armor types' },
  { id: 2, code: 'cultural', name: 'Cultural', description: 'Knowledge of nations, cultures, and languages' },
  { id: 3, code: 'utility', name: 'Utility', description: 'Tools, trades, and technical knowledge' },
  { id: 4, code: 'weapon', name: 'Weapon', description: 'Expertise in wielding/maintaining specific weapon types' },
  { id: 5, code: 'specialist', name: 'Specialist', description: 'Restricted knowledge (Shardblades, fabrials, etc.)' },
];

/**
 * Expertise source classifiers
 */
export const expertiseSources: ExpertiseSource[] = [
  { id: 1, code: 'culture', name: 'Culture', description: 'From cultural background (2 cultural expertises at creation)' },
  { id: 2, code: 'intellect', name: 'Intellect', description: 'From Intellect attribute' },
  { id: 3, code: 'origin', name: 'Origin', description: 'From origin/background' },
  { id: 4, code: 'talent', name: 'Talent', description: 'Granted by a talent' },
  { id: 5, code: 'reward', name: 'Reward', description: 'Earned through play' },
  { id: 6, code: 'training', name: 'Training', description: 'Learned during downtime' },
];

/**
 * Expertises - categoryId references expertiseCategories.id
 * 1=armor, 2=cultural, 3=utility, 4=weapon, 5=specialist
 */
export const expertises: Expertise[] = [
  // Cultural expertises (categoryId 2)
  {
    id: 1,
    code: 'alethi',
    name: 'Alethi',
    categoryId: 2,
    cultureId: 1,
    isRestricted: false,
    description: 'Knowledge of Alethi princedoms, highprinces, Vorinism, and customs.',
  },
  {
    id: 2,
    code: 'veden',
    name: 'Veden',
    categoryId: 2,
    cultureId: 2,
    isRestricted: false,
    description: 'Knowledge of Jah Keved, its ethnic groups, and Veden customs.',
  },
  {
    id: 3,
    code: 'azish',
    name: 'Azish',
    categoryId: 2,
    cultureId: 3,
    isRestricted: false,
    description: 'Knowledge of Azish bureaucracy, law, and the Kadasixes.',
  },
  {
    id: 4,
    code: 'herdazian',
    name: 'Herdazian',
    categoryId: 2,
    cultureId: 4,
    isRestricted: false,
    description: 'Knowledge of Herdaz, ranching culture, and Herdazian customs.',
  },
  {
    id: 5,
    code: 'thaylen',
    name: 'Thaylen',
    categoryId: 2,
    cultureId: 5,
    isRestricted: false,
    description: 'Knowledge of Thaylenah trade, merchant councils, and seafaring.',
  },
  {
    id: 6,
    code: 'unkalaki',
    name: 'Unkalaki',
    categoryId: 2,
    cultureId: 6,
    isRestricted: false,
    description: 'Knowledge of Horneater Peaks, family structures, and traditions.',
  },
  {
    id: 7,
    code: 'shin',
    name: 'Shin',
    categoryId: 2,
    cultureId: 7,
    isRestricted: false,
    description: 'Knowledge of Shinovar, Stone Shamanism, and Shin customs.',
  },
  {
    id: 8,
    code: 'iriali',
    name: 'Iriali',
    categoryId: 2,
    cultureId: 8,
    isRestricted: false,
    description: 'Knowledge of Iri, the One religion, and the Long Trail.',
  },
  {
    id: 9,
    code: 'kharbranthian',
    name: 'Kharbranthian',
    categoryId: 2,
    cultureId: 9,
    isRestricted: false,
    description: 'Knowledge of Kharbranth, education systems, and medicine.',
  },
  {
    id: 10,
    code: 'listener',
    name: 'Listener',
    categoryId: 2,
    cultureId: 10,
    isRestricted: false,
    description: 'Knowledge of listener forms, songs, and Shattered Plains.',
  },
  {
    id: 11,
    code: 'reshi',
    name: 'Reshi',
    categoryId: 2,
    cultureId: 11,
    isRestricted: false,
    description: 'Knowledge of Reshi Isles, Tai-na greatshells, and island life.',
  },
  {
    id: 12,
    code: 'natan',
    name: 'Natan',
    categoryId: 2,
    cultureId: 12,
    isRestricted: false,
    description: 'Knowledge of Natan history, intense highstorms, and traditions.',
  },
  {
    id: 13,
    code: 'wayfarer',
    name: 'Wayfarer',
    categoryId: 2,
    cultureId: 13,
    isRestricted: false,
    description: 'Knowledge of travel routes, storm shelters, and international customs.',
  },
  {
    id: 14,
    code: 'high-society',
    name: 'High Society',
    categoryId: 2,
    cultureId: 14,
    isRestricted: false,
    description: 'Knowledge of noble etiquette, politics, and social maneuvering.',
  },
  // Utility expertises (categoryId 3)
  {
    id: 15,
    code: 'military-life',
    name: 'Military Life',
    categoryId: 3,
    isRestricted: false,
    description: 'Knowledge of military organization, tactics, and soldier life.',
  },
  {
    id: 16,
    code: 'animal-care',
    name: 'Animal Care',
    categoryId: 3,
    isRestricted: false,
    description: 'Knowledge of caring for animals, including horses and chulls.',
  },
  {
    id: 17,
    code: 'engineering',
    name: 'Engineering',
    categoryId: 3,
    isRestricted: false,
    description: 'Knowledge of construction, mechanisms, and structural design.',
  },
  {
    id: 18,
    code: 'medicine-expertise',
    name: 'Medicine',
    categoryId: 3,
    isRestricted: false,
    description: 'Knowledge of healing, surgery, and medical treatment.',
  },
  {
    id: 19,
    code: 'history',
    name: 'History',
    categoryId: 3,
    isRestricted: false,
    description: 'Knowledge of historical events, figures, and eras.',
  },
  {
    id: 20,
    code: 'religion',
    name: 'Religion',
    categoryId: 3,
    isRestricted: false,
    description: 'General knowledge of Rosharan religions and spiritual practices.',
  },
  {
    id: 21,
    code: 'underworld',
    name: 'Underworld',
    categoryId: 3,
    isRestricted: false,
    description: "Knowledge of criminal organizations, black markets, and thieves' guilds.",
  },
  // Weapon expertises (categoryId 4)
  {
    id: 22,
    code: 'swords',
    name: 'Swords',
    categoryId: 4,
    isRestricted: false,
    description: 'Expertise in swords - maintenance, techniques, and expert traits.',
  },
  {
    id: 23,
    code: 'spears',
    name: 'Spears',
    categoryId: 4,
    isRestricted: false,
    description: 'Expertise in spears and polearms - techniques and expert traits.',
  },
  {
    id: 24,
    code: 'bows',
    name: 'Bows',
    categoryId: 4,
    isRestricted: false,
    description: 'Expertise in bows and ranged weapons.',
  },
  {
    id: 25,
    code: 'knives',
    name: 'Knives',
    categoryId: 4,
    isRestricted: false,
    description: 'Expertise in knives and daggers.',
  },
  {
    id: 26,
    code: 'unarmed',
    name: 'Unarmed Attacks',
    categoryId: 4,
    isRestricted: false,
    description: 'Expertise in hand-to-hand combat.',
  },
  // Armor expertises (categoryId 1)
  {
    id: 27,
    code: 'leather-armor',
    name: 'Leather Armor',
    categoryId: 1,
    isRestricted: false,
    description: 'Expertise in wearing and maintaining leather armor.',
  },
  {
    id: 28,
    code: 'chain-armor',
    name: 'Chain Armor',
    categoryId: 1,
    isRestricted: false,
    description: 'Expertise in wearing and maintaining chain mail.',
  },
  {
    id: 29,
    code: 'plate-armor',
    name: 'Plate Armor',
    categoryId: 1,
    isRestricted: false,
    description: 'Expertise in wearing and maintaining plate armor.',
  },
  // Specialist expertises (categoryId 5, restricted)
  {
    id: 30,
    code: 'fabrial-crafting',
    name: 'Fabrial Crafting',
    categoryId: 5,
    isRestricted: true,
    description: 'Restricted knowledge of creating and modifying fabrials.',
  },
  {
    id: 31,
    code: 'shardblades',
    name: 'Shardblades',
    categoryId: 5,
    isRestricted: true,
    description: 'Restricted knowledge of wielding and bonding Shardblades.',
  },
  {
    id: 32,
    code: 'shardplate',
    name: 'Shardplate',
    categoryId: 5,
    isRestricted: true,
    description: 'Restricted knowledge of wearing and maintaining Shardplate.',
  },
  {
    id: 33,
    code: 'knights-radiant',
    name: 'Knights Radiant',
    categoryId: 5,
    isRestricted: true,
    description: 'Restricted knowledge of Radiant history, orders, and ideals.',
  },
  {
    id: 34,
    code: 'singer-history',
    name: 'Singer History',
    categoryId: 5,
    isRestricted: true,
    description: 'Restricted knowledge of ancient singer civilization and forms.',
  },
];

/**
 * Helper to get expertise category name from ID
 */
export function getExpertiseCategoryName(categoryId: number): string {
  return expertiseCategories.find((c) => c.id === categoryId)?.name ?? 'Unknown';
}

/**
 * Helper to get expertise by code
 */
export function getExpertiseByCode(code: string): Expertise | undefined {
  return expertises.find((e) => e.code === code);
}

/**
 * Helper to get expertises by category ID
 */
export function getExpertisesByCategoryId(categoryId: number): Expertise[] {
  return expertises.filter((e) => e.categoryId === categoryId);
}
