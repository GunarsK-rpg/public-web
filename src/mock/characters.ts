import type { Character } from 'src/types';

export const characters: Character[] = [
  // Kaladin - Level 5 Windrunner Warrior
  {
    id: 'char-001',
    campaignId: 'campaign-001',
    userId: 'user-001',

    name: 'Kaladin Stormblessed',
    ancestry: 'human',
    level: 5,
    experience: 1200,

    heroicPath: 'warrior',
    specialty: 'soldier',
    radiantOrder: 'windrunner',
    radiantIdeal: 3,

    originId: 'soldier',

    strength: 3,
    speed: 4,
    intellect: 2,
    willpower: 4,
    awareness: 3,
    presence: 2,

    currentHealth: 13,
    currentFocus: 4,
    currentInvestiture: 5,

    spheres: 150,

    biography: 'Former soldier turned bridgeman, now a Knight Radiant',
    appearance: 'Tall with dark hair and brands on his forehead. Carries himself like a soldier.',
    notes: 'Sworn three Ideals. Bonded to Syl.',

    skills: [
      { skillId: 'athletics', rank: 3 },
      { skillId: 'heavy-weaponry', rank: 4 },
      { skillId: 'light-weaponry', rank: 2 },
      { skillId: 'leadership', rank: 3 },
      { skillId: 'medicine', rank: 2 },
      { skillId: 'discipline', rank: 3 },
      { skillId: 'perception', rank: 2 },
      { skillId: 'survival', rank: 2 },
    ],

    talents: [
      {
        id: 'talent-001',
        talentId: 'vigilant-stance',
        notes: 'Key talent from Warrior path',
      },
      { id: 'talent-002', talentId: 'combat-reflexes', notes: '' },
      {
        id: 'talent-003',
        talentId: 'hold-the-line',
        notes: 'Soldier specialty',
      },
    ],

    expertises: [
      { expertiseId: 'alethi-culture', source: 'origin' },
      { expertiseId: 'military-life', source: 'origin' },
      { expertiseId: 'shardblades', source: 'talent' },
    ],

    weapons: [
      {
        weaponId: 'longspear',
        isEquipped: true,
        isPrimary: true,
        notes: 'Standard infantry weapon',
      },
      { weaponId: 'knife', isEquipped: true, isPrimary: false, notes: '' },
    ],
    armor: {
      armorId: 'chain',
      isEquipped: true,
      notes: 'Bridge Four uniform armor',
    },
    equipment: [
      { itemId: 'backpack', quantity: 1 },
      { itemId: 'rope', quantity: 1 },
      { itemId: 'ration', quantity: 5 },
      { itemId: 'waterskin', quantity: 1 },
    ],

    conditions: [],
    injuries: [],

    goals: [
      {
        name: 'Protect Bridge Four',
        type: 'long-term',
        category: 'connection',
        status: 'active',
        description: 'Keep my men safe',
      },
      {
        name: 'Master the Third Ideal',
        type: 'personal',
        category: 'ambition',
        status: 'completed',
        description: 'Accept that some people cannot be saved',
      },
    ],

    connections: [
      { name: 'Syl', type: 'ally', description: 'Honorspren, bonded partner' },
      {
        name: 'Bridge Four',
        type: 'ally',
        organization: 'Bridge Four',
        description: 'Former bridgemen, now guards',
      },
      {
        name: 'Dalinar Kholin',
        type: 'patron',
        description: 'Highprince who freed Bridge Four',
      },
    ],

    companions: [
      {
        name: 'Syl',
        type: 'spren',
        subtype: 'honorspren',
        bondStrength: 3,
        canManifestBlade: true,
        personality: 'Playful, curious, fiercely protective',
      },
    ],
  },

  // Shallan - Level 4 Lightweaver Scholar
  {
    id: 'char-002',
    campaignId: 'campaign-001',
    userId: 'user-002',

    name: 'Shallan Davar',
    ancestry: 'human',
    level: 4,
    experience: 900,

    heroicPath: 'scholar',
    specialty: 'artifabrian',
    radiantOrder: 'lightweaver',
    radiantIdeal: 2,

    originId: 'noble',

    strength: 1,
    speed: 2,
    intellect: 4,
    willpower: 3,
    awareness: 3,
    presence: 4,

    currentHealth: 8,
    currentFocus: 5,
    currentInvestiture: 5,

    spheres: 500,

    biography: 'Veden noblewoman and aspiring scholar, secretly a Knight Radiant',
    appearance: 'Red hair, light skin with freckles. Often carries a sketchbook.',
    notes: 'Bonded to Pattern. Skilled artist.',

    skills: [
      { skillId: 'crafting', rank: 3 },
      { skillId: 'deception', rank: 4 },
      { skillId: 'lore', rank: 4 },
      { skillId: 'persuasion', rank: 3 },
      { skillId: 'insight', rank: 2 },
      { skillId: 'perception', rank: 2 },
      { skillId: 'light-weaponry', rank: 1 },
    ],

    talents: [
      {
        id: 'talent-101',
        talentId: 'erudition',
        notes: 'Key talent from Scholar path',
      },
      {
        id: 'talent-102',
        talentId: 'fabrial-attunement',
        notes: 'Artifabrian specialty',
      },
    ],

    expertises: [
      { expertiseId: 'veden-culture', source: 'origin' },
      { expertiseId: 'high-society', source: 'origin' },
      { expertiseId: 'fabrial-crafting', source: 'talent' },
    ],

    weapons: [
      {
        weaponId: 'knife',
        isEquipped: true,
        isPrimary: true,
        notes: 'Hidden in sleeve',
      },
    ],
    armor: null,
    equipment: [
      { itemId: 'clothing-fine', quantity: 1 },
      { itemId: 'backpack', quantity: 1 },
    ],

    conditions: [],
    injuries: [],

    goals: [
      {
        name: 'Protect family secrets',
        type: 'long-term',
        category: 'connection',
        status: 'active',
        description: 'Keep the truth about father hidden',
      },
      {
        name: 'Learn about fabrials',
        type: 'short-term',
        category: 'discovery',
        status: 'active',
        description: 'Study under Jasnah',
      },
    ],

    connections: [
      {
        name: 'Pattern',
        type: 'ally',
        description: 'Cryptic spren, bonded partner',
      },
      { name: 'Jasnah Kholin', type: 'patron', description: 'Mentor and teacher' },
    ],

    companions: [
      {
        name: 'Pattern',
        type: 'spren',
        subtype: 'cryptic',
        bondStrength: 2,
        canManifestBlade: false,
        personality: 'Curious about lies and truths, often confused by human behavior',
      },
    ],
  },

  // Adolin - Level 6 Warrior (Non-Radiant)
  {
    id: 'char-003',
    campaignId: 'campaign-001',
    userId: 'user-003',

    name: 'Adolin Kholin',
    ancestry: 'human',
    level: 6,
    experience: 1600,

    heroicPath: 'warrior',
    specialty: 'duelist',
    radiantOrder: null,
    radiantIdeal: 0,

    originId: 'noble',

    strength: 4,
    speed: 3,
    intellect: 2,
    willpower: 3,
    awareness: 2,
    presence: 4,

    currentHealth: 14,
    currentFocus: 5,
    currentInvestiture: 0,

    spheres: 2000,

    biography: 'Eldest son of Highprince Dalinar Kholin, accomplished duelist',
    appearance: 'Handsome with blonde hair streaked with black. Always impeccably dressed.',
    notes: 'One of the finest duelists in Alethkar. Owns Shardplate and Shardblade.',

    skills: [
      { skillId: 'heavy-weaponry', rank: 5 },
      { skillId: 'athletics', rank: 3 },
      { skillId: 'persuasion', rank: 3 },
      { skillId: 'leadership', rank: 2 },
      { skillId: 'insight', rank: 2 },
      { skillId: 'deception', rank: 1 },
    ],

    talents: [
      { id: 'talent-201', talentId: 'vigilant-stance', notes: 'Key talent' },
      {
        id: 'talent-202',
        talentId: 'practiced-kata',
        notes: 'Duelist specialty',
      },
      { id: 'talent-203', talentId: 'flamestance', notes: 'Duelist specialty' },
      {
        id: 'talent-204',
        talentId: 'signature-weapon',
        notes: 'Shardblade mastery',
      },
    ],

    expertises: [
      { expertiseId: 'alethi-culture', source: 'origin' },
      { expertiseId: 'high-society', source: 'origin' },
      { expertiseId: 'shardblades', source: 'reward' },
      { expertiseId: 'shardplate', source: 'reward' },
    ],

    weapons: [
      {
        weaponId: 'shardblade',
        customName: 'Sunblade',
        isEquipped: true,
        isPrimary: true,
        notes: 'Family Shardblade',
      },
      {
        weaponId: 'longsword',
        isEquipped: false,
        isPrimary: false,
        notes: 'Backup weapon',
      },
    ],
    armor: {
      armorId: 'shardplate',
      isEquipped: true,
      charges: 4,
      notes: 'Family Shardplate',
    },
    equipment: [{ itemId: 'clothing-fine', quantity: 3 }],

    conditions: [],
    injuries: [],

    goals: [
      {
        name: 'Win the dueling championship',
        type: 'short-term',
        category: 'ambition',
        status: 'active',
        description: 'Prove myself the best',
      },
      {
        name: "Support father's vision",
        type: 'long-term',
        category: 'connection',
        status: 'active',
        description: 'Help unite the highprinces',
      },
    ],

    connections: [
      {
        name: 'Dalinar Kholin',
        type: 'ally',
        description: 'Father and Highprince',
      },
      { name: 'Renarin Kholin', type: 'ally', description: 'Younger brother' },
    ],

    companions: [],
  },
];

export default characters;
