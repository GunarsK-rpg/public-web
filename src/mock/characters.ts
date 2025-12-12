import type { Character } from 'src/types';

export const characters: Character[] = [
  // Kaladin - Level 5 Windrunner Warrior
  {
    id: 1,
    campaignId: 1,
    userId: 1,

    name: 'Kaladin Stormblessed',
    ancestry: 'human',
    cultures: ['alethi'],
    level: 5,
    experience: 1200,

    heroicPaths: ['warrior'],
    specialty: 'soldier',
    radiantOrder: 'windrunner',
    radiantIdeal: 3,

    startingKitId: 3, // military

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
      { skillId: 2, rank: 3 }, // athletics
      { skillId: 3, rank: 4 }, // heavy-weaponry
      { skillId: 4, rank: 2 }, // light-weaponry
      { skillId: 15, rank: 3 }, // leadership
      { skillId: 12, rank: 2 }, // medicine
      { skillId: 9, rank: 3 }, // discipline
      { skillId: 16, rank: 2 }, // perception
      { skillId: 18, rank: 2 }, // survival
    ],

    talents: [
      {
        id: 1,
        talentId: 1, // vigilant-stance
        notes: 'Key talent from Warrior path',
      },
      { id: 2, talentId: 2, notes: '' }, // combat-reflexes
      {
        id: 3,
        talentId: 3, // hold-the-line
        notes: 'Soldier specialty',
      },
    ],

    expertises: [
      { expertiseId: 1, source: 'starting_kit' }, // alethi
      { expertiseId: 15, source: 'starting_kit' }, // military-life
      { expertiseId: 31, source: 'talent' }, // shardblades
    ],

    weapons: [
      {
        weaponId: 3, // longspear
        isEquipped: true,
        isPrimary: true,
        notes: 'Standard infantry weapon',
      },
      { weaponId: 1, isEquipped: true, isPrimary: false, notes: '' }, // knife
    ],
    armor: {
      armorId: 2, // chain
      isEquipped: true,
      notes: 'Bridge Four uniform armor',
    },
    equipment: [
      { itemId: 1, quantity: 1 }, // backpack
      { itemId: 2, quantity: 1 }, // rope
      { itemId: 3, quantity: 5 }, // ration
      { itemId: 4, quantity: 1 }, // waterskin
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
    id: 2,
    campaignId: 1,
    userId: 2,

    name: 'Shallan Davar',
    ancestry: 'human',
    cultures: ['veden'],
    level: 4,
    experience: 900,

    heroicPaths: ['scholar'],
    specialty: 'artifabrian',
    radiantOrder: 'lightweaver',
    radiantIdeal: 2,

    startingKitId: 4, // courtier

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
      { skillId: 7, rank: 3 }, // crafting
      { skillId: 13, rank: 4 }, // deception
      { skillId: 11, rank: 4 }, // lore
      { skillId: 17, rank: 3 }, // persuasion
      { skillId: 14, rank: 2 }, // insight
      { skillId: 16, rank: 2 }, // perception
      { skillId: 4, rank: 1 }, // light-weaponry
    ],

    talents: [
      {
        id: 101,
        talentId: 4, // erudition
        notes: 'Key talent from Scholar path',
      },
      {
        id: 102,
        talentId: 5, // fabrial-attunement
        notes: 'Artifabrian specialty',
      },
    ],

    expertises: [
      { expertiseId: 2, source: 'starting_kit' }, // veden
      { expertiseId: 14, source: 'starting_kit' }, // high-society
      { expertiseId: 30, source: 'talent' }, // fabrial-crafting
    ],

    weapons: [
      {
        weaponId: 1, // knife
        isEquipped: true,
        isPrimary: true,
        notes: 'Hidden in sleeve',
      },
    ],
    armor: null,
    equipment: [
      { itemId: 6, quantity: 1 }, // clothing-fine
      { itemId: 1, quantity: 1 }, // backpack
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
    id: 3,
    campaignId: 1,
    userId: 3,

    name: 'Adolin Kholin',
    ancestry: 'human',
    cultures: ['alethi', 'high-society'],
    level: 6,
    experience: 1600,

    heroicPaths: ['warrior', 'leader'],
    specialty: 'duelist',
    radiantOrder: null,
    radiantIdeal: 0,

    startingKitId: 4, // courtier

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
      { skillId: 3, rank: 5 }, // heavy-weaponry
      { skillId: 2, rank: 3 }, // athletics
      { skillId: 17, rank: 3 }, // persuasion
      { skillId: 15, rank: 2 }, // leadership
      { skillId: 14, rank: 2 }, // insight
      { skillId: 13, rank: 1 }, // deception
    ],

    talents: [
      { id: 201, talentId: 1, notes: 'Warrior key talent' }, // vigilant-stance
      { id: 202, talentId: 17, notes: 'Leader key talent' }, // inspiring-presence
      {
        id: 203,
        talentId: 6, // practiced-kata
        notes: 'Duelist specialty',
      },
      { id: 204, talentId: 7, notes: 'Duelist specialty' }, // flamestance
      {
        id: 205,
        talentId: 8, // signature-weapon
        notes: 'Shardblade mastery',
      },
    ],

    expertises: [
      { expertiseId: 1, source: 'starting_kit' }, // alethi
      { expertiseId: 14, source: 'starting_kit' }, // high-society
      { expertiseId: 31, source: 'reward' }, // shardblades
      { expertiseId: 32, source: 'reward' }, // shardplate
    ],

    weapons: [
      {
        weaponId: 4, // shardblade
        customName: 'Sunblade',
        isEquipped: true,
        isPrimary: true,
        notes: 'Family Shardblade',
      },
      {
        weaponId: 2, // longsword
        isEquipped: false,
        isPrimary: false,
        notes: 'Backup weapon',
      },
    ],
    armor: {
      armorId: 4, // shardplate
      isEquipped: true,
      charges: 4,
      notes: 'Family Shardplate',
    },
    equipment: [{ itemId: 6, quantity: 3 }], // clothing-fine

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

  // Rlain - Level 4 Singer Warrior
  {
    id: 4,
    campaignId: 1,
    userId: 4,

    name: 'Rlain',
    ancestry: 'singer',
    cultures: ['listener'],
    activeSingerForm: 'warform',
    level: 4,
    experience: 900,

    heroicPaths: ['warrior'],
    specialty: 'soldier',
    radiantOrder: null,
    radiantIdeal: 0,

    startingKitId: 3, // military

    strength: 3,
    speed: 3,
    intellect: 2,
    willpower: 3,
    awareness: 3,
    presence: 2,

    currentHealth: 12,
    currentFocus: 4,
    currentInvestiture: 0,

    spheres: 50,

    biography:
      'A listener who served as a spy among the Alethi, Rlain is one of the few listeners who survived the betrayal of the Everstorm. He has chosen to reject Odium and stand with Bridge Four.',
    appearance:
      'In warform, Rlain has a large body covered with fierce carapace. His skin is marbled with black and red. Orange hairstrands frame his face.',
    notes: 'Former spy. Currently in warform. Loyal member of Bridge Four.',

    skills: [
      { skillId: 2, rank: 2 }, // athletics
      { skillId: 3, rank: 3 }, // heavy-weaponry
      { skillId: 5, rank: 3 }, // stealth
      { skillId: 13, rank: 2 }, // deception
      { skillId: 9, rank: 2 }, // discipline
      { skillId: 16, rank: 2 }, // perception
      { skillId: 18, rank: 2 }, // survival
    ],

    talents: [
      {
        id: 301,
        talentId: 9, // change-form
        notes: 'Singer key talent - grants dullform and mateform',
      },
      {
        id: 302,
        talentId: 11, // forms-of-resolve
        notes: 'Grants warform and workform',
      },
      {
        id: 303,
        talentId: 1, // vigilant-stance
        notes: 'Key talent from Warrior path',
      },
    ],

    expertises: [
      { expertiseId: 10, source: 'culture' }, // listener
      { expertiseId: 1, source: 'training' }, // alethi
      { expertiseId: 15, source: 'starting_kit' }, // military-life
    ],

    weapons: [
      {
        weaponId: 3, // longspear
        isEquipped: true,
        isPrimary: true,
        notes: 'Bridge Four standard issue',
      },
    ],
    armor: null,
    equipment: [
      { itemId: 1, quantity: 1 }, // backpack
      { itemId: 3, quantity: 3 }, // ration
    ],

    conditions: [],
    injuries: [],

    goals: [
      {
        name: 'Find my place among humans',
        type: 'long-term',
        category: 'ambition',
        status: 'active',
        description: 'Prove that listeners can be trusted allies',
      },
      {
        name: 'Protect Bridge Four',
        type: 'personal',
        category: 'connection',
        status: 'active',
        description: 'Stand with my brothers in Bridge Four',
      },
    ],

    connections: [
      {
        name: 'Bridge Four',
        type: 'ally',
        organization: 'Bridge Four',
        description: 'Fellow soldiers who accepted me despite being a singer',
      },
      {
        name: 'Kaladin Stormblessed',
        type: 'ally',
        description: 'Captain of Bridge Four, trusted leader',
      },
    ],

    companions: [],
  },
];

export default characters;
