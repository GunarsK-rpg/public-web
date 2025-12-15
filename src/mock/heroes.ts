import type { Hero } from 'src/types';

export const heroes: Hero[] = [
  // Kaladin - Level 5 Windrunner Warrior
  {
    id: 1,
    campaignId: 1,
    userId: 1,
    ancestryId: 1, // human
    startingKitId: 3, // military
    activeSingerFormId: null,
    radiantOrderId: 1, // windrunner
    radiantIdeal: 3,

    name: 'Kaladin Stormblessed',
    level: 5,
    appearance: 'Tall with dark hair and brands on his forehead. Carries himself like a soldier.',
    biography: 'Former soldier turned bridgeman, now a Knight Radiant',
    notes: 'Sworn three Ideals. Bonded to Syl.',

    currentHealth: 13,
    currentFocus: 4,
    currentInvestiture: 5,

    attributes: [
      { id: 1, heroId: 1, attrId: 1, value: 3 }, // str
      { id: 2, heroId: 1, attrId: 2, value: 4 }, // spd
      { id: 3, heroId: 1, attrId: 3, value: 2 }, // int
      { id: 4, heroId: 1, attrId: 4, value: 4 }, // wil
      { id: 5, heroId: 1, attrId: 5, value: 3 }, // awa
      { id: 6, heroId: 1, attrId: 6, value: 2 }, // pre
    ],
    defenses: [
      { id: 1, heroId: 1, attrTypeId: 1, value: 17, modifier: 0 }, // physical
      { id: 2, heroId: 1, attrTypeId: 2, value: 16, modifier: 0 }, // cognitive
      { id: 3, heroId: 1, attrTypeId: 3, value: 15, modifier: 0 }, // spiritual
    ],
    derivedStats: [
      { id: 1, heroId: 1, statId: 1, value: 0, modifier: 5 }, // max_health +5 from talent
      { id: 2, heroId: 1, statId: 4, value: 0, modifier: 10 }, // movement +10 ft from Windrunner
    ],
    skills: [
      { id: 1, heroId: 1, skillId: 2, rank: 3, modifier: 0 }, // athletics
      { id: 2, heroId: 1, skillId: 3, rank: 4, modifier: 0 }, // heavy-weaponry
      { id: 3, heroId: 1, skillId: 4, rank: 2, modifier: 0 }, // light-weaponry
      { id: 4, heroId: 1, skillId: 15, rank: 3, modifier: 0 }, // leadership
      { id: 5, heroId: 1, skillId: 12, rank: 2, modifier: 0 }, // medicine
      { id: 6, heroId: 1, skillId: 9, rank: 3, modifier: 0 }, // discipline
      { id: 7, heroId: 1, skillId: 16, rank: 2, modifier: 0 }, // perception
      { id: 8, heroId: 1, skillId: 18, rank: 2, modifier: 0 }, // survival
    ],
    talents: [
      { id: 1, heroId: 1, talentId: 600, notes: 'Warrior key talent' },
      { id: 2, heroId: 1, talentId: 621, notes: 'Soldier specialty' },
    ],
    expertises: [
      { id: 1, heroId: 1, expertiseId: 1, source: { sourceType: 'starting_kit', sourceId: 3 } },
      { id: 2, heroId: 1, expertiseId: 15, source: { sourceType: 'starting_kit', sourceId: 3 } },
    ],
    equipment: [
      {
        id: 1,
        heroId: 1,
        equipmentId: 3,
        amount: 1,
        isEquipped: true,
        isPrimary: true,
        notes: 'Standard infantry weapon',
      },
      { id: 2, heroId: 1, equipmentId: 1, amount: 1, isEquipped: true, isPrimary: false },
      {
        id: 3,
        heroId: 1,
        equipmentId: 6,
        amount: 1,
        isEquipped: true,
        isPrimary: false,
        notes: 'Chain mail armor',
      },
    ],
    currency: 150, // 15 topaz marks equivalent in diamond marks
    conditions: [],
    injuries: [],
    goals: [
      {
        id: 1,
        heroId: 1,
        name: 'Protect Bridge Four',
        description: 'Keep my men safe',
        value: 2,
        statusId: 1,
      },
    ],
    connections: [
      {
        id: 1,
        heroId: 1,
        connTypeId: 1,
        description: 'Bridge Four - Former bridgemen, now guards',
      },
      {
        id: 2,
        heroId: 1,
        connTypeId: 5,
        description: 'Dalinar Kholin - Highprince who freed Bridge Four',
      },
    ],
    companions: [
      { id: 1, heroId: 1, compTypeId: 1, description: 'Syl - Honorspren, bonded partner' },
    ],
    cultures: [
      { id: 1, heroId: 1, cultureId: 1 }, // alethi
    ],
  },

  // Shallan - Level 4 Lightweaver Scholar
  {
    id: 2,
    campaignId: 1,
    userId: 2,
    ancestryId: 1, // human
    startingKitId: 4, // courtier
    activeSingerFormId: null,
    radiantOrderId: 6, // lightweaver
    radiantIdeal: 2,

    name: 'Shallan Davar',
    level: 4,
    appearance: 'Red hair, light skin with freckles. Often carries a sketchbook.',
    biography: 'Veden noblewoman and aspiring scholar, secretly a Knight Radiant',
    notes: 'Bonded to Pattern. Skilled artist.',

    currentHealth: 8,
    currentFocus: 5,
    currentInvestiture: 5,

    attributes: [
      { id: 7, heroId: 2, attrId: 1, value: 1 }, // str
      { id: 8, heroId: 2, attrId: 2, value: 2 }, // spd
      { id: 9, heroId: 2, attrId: 3, value: 4 }, // int
      { id: 10, heroId: 2, attrId: 4, value: 3 }, // wil
      { id: 11, heroId: 2, attrId: 5, value: 3 }, // awa
      { id: 12, heroId: 2, attrId: 6, value: 4 }, // pre
    ],
    defenses: [
      { id: 4, heroId: 2, attrTypeId: 1, value: 13, modifier: 0 },
      { id: 5, heroId: 2, attrTypeId: 2, value: 17, modifier: 0 },
      { id: 6, heroId: 2, attrTypeId: 3, value: 17, modifier: 0 },
    ],
    derivedStats: [],
    skills: [
      { id: 9, heroId: 2, skillId: 7, rank: 3, modifier: 0 }, // crafting
      { id: 10, heroId: 2, skillId: 13, rank: 4, modifier: 0 }, // deception
      { id: 11, heroId: 2, skillId: 11, rank: 4, modifier: 0 }, // lore
      { id: 12, heroId: 2, skillId: 17, rank: 3, modifier: 0 }, // persuasion
    ],
    talents: [{ id: 3, heroId: 2, talentId: 500, notes: 'Scholar key talent' }],
    expertises: [
      { id: 3, heroId: 2, expertiseId: 2, source: { sourceType: 'starting_kit', sourceId: 4 } },
      { id: 4, heroId: 2, expertiseId: 14, source: { sourceType: 'starting_kit', sourceId: 4 } },
    ],
    equipment: [
      { id: 4, heroId: 2, equipmentId: 1, amount: 1, isEquipped: true, isPrimary: true },
      { id: 5, heroId: 2, equipmentId: 16, amount: 1, isEquipped: true, isPrimary: false }, // fine clothing
    ],
    currency: 500, // 10 sapphire marks equivalent in diamond marks
    conditions: [],
    injuries: [],
    goals: [
      {
        id: 2,
        heroId: 2,
        name: 'Learn about fabrials',
        description: 'Study under Jasnah',
        value: 1,
        statusId: 1,
      },
    ],
    connections: [
      { id: 3, heroId: 2, connTypeId: 5, description: 'Jasnah Kholin - Mentor and teacher' },
    ],
    companions: [
      { id: 2, heroId: 2, compTypeId: 1, description: 'Pattern - Cryptic spren, bonded partner' },
    ],
    cultures: [
      { id: 2, heroId: 2, cultureId: 2 }, // veden
    ],
  },
];

export default heroes;
