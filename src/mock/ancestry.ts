import type { Ancestry, SingerForm, Culture } from 'src/types';

// Ancestries - the two sapient species on Roshar
export const ancestries: Ancestry[] = [
  {
    id: 1,
    code: 'human',
    name: 'Human',
    description: 'The dominant species on Roshar, humans are diverse in culture and appearance.',
    size: 'medium',
    traits: [
      {
        id: 1,
        code: 'human-adaptability',
        name: 'Adaptability',
        level: 1,
        description: 'Gain one additional expertise at character creation.',
      },
    ],
  },
  {
    id: 2,
    code: 'singer',
    name: 'Singer',
    description:
      'The original inhabitants of Roshar, singers can change forms by bonding with spren during highstorms.',
    size: 'medium',
    traits: [
      {
        id: 2,
        code: 'singer-forms',
        name: 'Change Form',
        level: 1,
        description:
          'During a highstorm, you can change into dullform, mateform, or another form you have unlocked.',
      },
      {
        id: 3,
        code: 'singer-rhythms',
        name: 'Rhythms',
        level: 1,
        description: 'You can attune to rhythms that add emotional context to your words.',
      },
    ],
  },
];

// Singer Forms
export const singerForms: SingerForm[] = [
  // Basic forms (from Change Form key talent)
  {
    id: 1,
    code: 'dullform',
    name: 'Dullform',
    sprenType: 'none',
    sprenCategory: 'none',
    unlockedByTalentCode: 'change-form',
    bonuses: {},
    passiveAbilities: ['Can pass unnoticed as a "parshman" in most human societies'],
    description:
      "Your form isn't specialized, as your bonded spren grants no form. You can pass unnoticed as a parshman in most human societies, but you don't gain other benefits from your form.",
  },
  {
    id: 2,
    code: 'mateform',
    name: 'Mateform',
    sprenType: 'lifespren',
    sprenCategory: 'natural',
    unlockedByTalentCode: 'change-form',
    bonuses: {},
    passiveAbilities: ['Specialized for reproduction'],
    description: 'You have bonded with a lifespren, and your form is specialized for reproduction.',
  },
  // Forms of Finesse
  {
    id: 3,
    code: 'artform',
    name: 'Artform',
    sprenType: 'creationspren',
    sprenCategory: 'natural',
    unlockedByTalentCode: 'forms-of-finesse',
    bonuses: { awareness: 1 },
    expertiseCodes: ['painting', 'music'],
    passiveAbilities: [
      'Advantage on Crafting tests',
      'Advantage on tests related to entertaining (singing, dancing)',
    ],
    description:
      'Artform specializes in creative expression. You gain a heightened awareness of the rhythms, colors, and other aspects of the world around you. If you have carapace, it is purely cosmetic, representing radical self-expression.',
  },
  {
    id: 4,
    code: 'nimbleform',
    name: 'Nimbleform',
    sprenType: 'windspren',
    sprenCategory: 'natural',
    unlockedByTalentCode: 'forms-of-finesse',
    bonuses: { speed: 1, focus: 2 },
    passiveAbilities: ['Increased range of motion and mental focus'],
    description:
      'Nimbleform specializes in physical and mental flexibility. Your protective carapace is minimal; instead, you have an increased range of motion and mental focus.',
  },
  // Forms of Resolve
  {
    id: 5,
    code: 'warform',
    name: 'Warform',
    sprenType: 'painspren',
    sprenCategory: 'natural',
    unlockedByTalentCode: 'forms-of-resolve',
    bonuses: { strength: 1, deflect: 1 },
    passiveAbilities: [
      'Jump horizontally up to your movement rate without Athletics test',
      'Jump vertically up to half your movement rate without Athletics test',
      'Deflect does not stack with armor (choose which value to use)',
    ],
    description:
      'Warform specializes in combat, increasing your strength and stamina. Your body is large and covered with fierce carapace, which protects you like armor. Any aversions you might usually have to violence, pain, and death become slightly less pronounced in warform.',
  },
  {
    id: 6,
    code: 'workform',
    name: 'Workform',
    sprenType: 'gravitationspren',
    sprenCategory: 'natural',
    unlockedByTalentCode: 'forms-of-resolve',
    bonuses: { willpower: 1 },
    passiveAbilities: [
      'Ignore the effects of the Exhausted condition',
      'Can easily disguise yourself to pass as a "parshman" in human societies',
    ],
    description:
      'Workform specializes in labor. This form helps you see tasks through to completion, granting you determination and stamina. You have a rugged body with modest carapace ridges.',
  },
  // Forms of Wisdom
  {
    id: 7,
    code: 'mediationform',
    name: 'Mediationform',
    sprenType: 'bindspren',
    sprenCategory: 'natural',
    unlockedByTalentCode: 'forms-of-wisdom',
    bonuses: { presence: 1 },
    passiveAbilities: ["You don't have to spend focus to use the Aid reaction"],
    description:
      "Mediationform specializes in communication, whether you're connecting with new people or teaching those you know well. Your carapace is smooth, and your facial features are well-defined and expressive.",
  },
  {
    id: 8,
    code: 'scholarform',
    name: 'Scholarform',
    sprenType: 'logicspren',
    sprenCategory: 'natural',
    unlockedByTalentCode: 'forms-of-wisdom',
    bonuses: { intellect: 1 },
    passiveAbilities: [
      "When you adopt this form, choose one cultural or utility expertise you don't already have",
      "Choose one cognitive skill that isn't a surge skill and temporarily gain an additional rank",
    ],
    description:
      'Scholarform specializes in scholarship, enhancing your mental processes and memory. You become more patient and analytical, but you may also find yourself more inclined toward ambition. You have long hairstrands, and a cushioned lower body suited to sedentary work.',
  },
  // Forms of Destruction (Voidspren - require Ambitious Mind)
  {
    id: 9,
    code: 'direform',
    name: 'Direform',
    sprenType: 'callousspren',
    sprenCategory: 'voidspren',
    unlockedByTalentCode: 'forms-of-destruction',
    bonuses: { strength: 2, deflect: 2 },
    passiveAbilities: [
      'Deflect does not stack with armor (choose which value to use)',
      'When a character triggers a Reactive Strike from you, you can Grapple instead of attacking',
    ],
    description:
      'Direform specializes in unyielding strength and persistence, and this form is commonly used to guard objects or prisoners. You have substantial carapace with a jagged crest of spikes running along your head and shoulders. You are inclined toward obedience to your superiors but obstinacy with others.',
  },
  {
    id: 10,
    code: 'stormform',
    name: 'Stormform',
    sprenType: 'stormspren',
    sprenCategory: 'voidspren',
    unlockedByTalentCode: 'forms-of-destruction',
    bonuses: { strength: 1, speed: 1, deflect: 1 },
    passiveAbilities: ['Deflect does not stack with armor (choose which value to use)'],
    actions: [
      {
        id: 1,
        code: 'unleash-lightning',
        name: 'Unleash Lightning',
        activation: 'action',
        focusCost: 1,
        description:
          "Your body crackles with the Everstorm's unnatural red lightning, which you can unleash in a violent arc.",
        effect:
          'Spend 1 focus or 1 Investiture to make a ranged Discipline attack against the Physical defense of a target within 60 feet. Roll 2d8 energy damage. On a hit, the target is also Disoriented until the end of their next turn.',
        scaling: 'At Discipline 4+, roll 2d10 damage. At Discipline 5+, roll 2d12 damage.',
      },
    ],
    description:
      'Stormform is an elite battle form optimized for physical prowess and honed attacks. You are covered in finesse-enhancing armored carapace that grows under your skin, poking through in ridges and spikes. You can manipulate and unleash powerful red lightning on your foes.',
  },
  // Forms of Expansion (Voidspren - require Ambitious Mind)
  {
    id: 11,
    code: 'envoyform',
    name: 'Envoyform',
    sprenType: 'zealspren',
    sprenCategory: 'voidspren',
    unlockedByTalentCode: 'forms-of-expansion',
    bonuses: { intellect: 1, presence: 1 },
    passiveAbilities: [
      'You can speak, read, write, and understand all languages',
      'Advantage on Insight tests made to interpret the desires or intentions of others',
    ],
    description:
      'Envoyform is an embellished form often used to serve the administrative needs of the Fused. Your tall form towers over others, and your ornate carapace is uniquely alluring. You comprehend any language after brief exposure and can grasp hidden context with the subtlest of cues.',
  },
  {
    id: 12,
    code: 'relayform',
    name: 'Relayform',
    sprenType: 'hastespren',
    sprenCategory: 'voidspren',
    unlockedByTalentCode: 'forms-of-expansion',
    bonuses: { speed: 2 },
    passiveAbilities: [
      'Ignore the effects of the Slowed condition',
      'When you make an Agility, Stealth, or Thievery test, you can spend 1 focus to gain advantage',
    ],
    description:
      'Relayform boasts speed and stamina ideal for scouts. Your agile and muscular body is protected in the front by light carapace with smooth edges, and aerodynamic spikes run along the backs of your forearms and calves. You can run great distances and avoid detection.',
  },
  // Forms of Mystery (Voidspren - require Ambitious Mind)
  {
    id: 13,
    code: 'decayform',
    name: 'Decayform',
    sprenType: 'blightspren',
    sprenCategory: 'voidspren',
    unlockedByTalentCode: 'forms-of-mystery',
    bonuses: { willpower: 2 },
    actions: [
      {
        id: 2,
        code: 'decaying-touch',
        name: 'Decaying Touch',
        activation: 'reaction',
        focusCost: 1,
        description:
          'Your touch saps the vitality of other beings, preventing them from recovering.',
        effect:
          'Before a character within your reach recovers health or focus, spend 1 focus or 1 Investiture to prevent them from doing so. The character does not regain that health or focus, but any actions, Investiture, or other resources they spent still remain spent.',
      },
    ],
    passiveAbilities: [],
    description:
      'The enigmatic decayform grants an insidious ability to sap the vitality of other beings. Your thin carapace is jagged, brittle, and asymmetrical. People you touch find themselves less resilient while you remain in contact with them. This spiritual decay affects not just their bodies, but their minds, leaving them with nightmares long after the fact.',
  },
  {
    id: 14,
    code: 'nightform',
    name: 'Nightform',
    sprenType: 'nightspren',
    sprenCategory: 'voidspren',
    unlockedByTalentCode: 'forms-of-mystery',
    bonuses: { awareness: 1, intellect: 1, focus: 2 },
    actions: [
      {
        id: 3,
        code: 'intervening-premonitions',
        name: 'Intervening Premonitions',
        activation: 'reaction',
        description:
          'Your bond with a nightspren has granted you precognitive abilities—whether you wish them or not.',
        effect:
          "At the start of each session, roll two d20s and record both results. When an enemy or willing ally you can sense makes a test, you can use this reaction to replace the test's d20 roll with one of your recorded numbers. You can replace after seeing their roll and after advantages are applied, but before effects are resolved. Numbers are lost when used or when the session ends.",
      },
    ],
    passiveAbilities: [
      'At GM discretion, you might occasionally receive glimpses of the future at unpredictable times (Sporadic Premonitions)',
    ],
    description:
      'Nightform grants unpredictable visions of the future, and your senses become more acute, especially at night. Petal-like carapace grows from your skull, framing your ears and enhancing your ability to perceive rhythms. In various lights, your carapace reflects different iridescent patterns.',
  },
];

// Cultures of Roshar
export const cultures: Culture[] = [
  {
    id: 1,
    code: 'alethi',
    name: 'Alethi',
    region: 'Alethkar',
    religion: 'Vorinism',
    description:
      'A warrior nation ruled by a monarch and ten highprinces, driven by war and conquest.',
    physicalTraits: 'Tall, tan skin, dark hair',
    sampleNames: ['Kaladin', 'Dalinar', 'Adolin', 'Shallan', 'Jasnah', 'Navani'],
    expertiseDescription: 'Knowledge of princedoms, highprinces, Vorinism, and Alethi customs.',
    languages: ['Alethi', 'Glyphs', "Women's Script"],
  },
  {
    id: 2,
    code: 'veden',
    name: 'Veden',
    region: 'Jah Keved',
    religion: 'Vorinism',
    description: 'A nation with four major ethnic groups, closely tied to Alethkar culturally.',
    physicalTraits: 'Similar to Alethi, commonly black or red hair',
    sampleNames: ['Nan Balat', 'Tet Lin', 'Shallan', 'Helaran'],
    expertiseDescription: 'Knowledge of princedoms, ethnic groups, and Veden customs.',
    languages: ['Veden', 'Alethi', 'Glyphs', "Women's Script"],
  },
  {
    id: 3,
    code: 'azish',
    name: 'Azish',
    region: 'Azir / Azish Empire',
    religion: 'Kadasixes and Scions',
    description: 'A bureaucratic nation led by the Prime Aqasix and elite viziers.',
    physicalTraits: 'Very dark brown skin, black hair, slightly shorter',
    sampleNames: ['Yanagawn', 'Gawx', 'Lift', 'Szeth'],
    expertiseDescription: 'Knowledge of bureaucracy, Bronze Palace, viziers, and Azish law.',
    languages: ['Azish', 'Azish Sign Language'],
  },
  {
    id: 4,
    code: 'herdazian',
    name: 'Herdazian',
    region: 'Herdaz',
    religion: 'Vorinism (personal practice)',
    description: 'A verdant nation famous for hog ranches, with large diasporas abroad.',
    physicalTraits: 'Medium brown skin, brown hair, crystalline fingernails',
    sampleNames: ['Lopen', 'Rod', 'Huio', 'Punio'],
    expertiseDescription: 'Knowledge of ranching, sparkflickers, and Herdazian Vorinism.',
    languages: ['Herdazian', 'Glyphs'],
  },
  {
    id: 5,
    code: 'thaylen',
    name: 'Thaylen',
    region: 'Thaylenah',
    religion: 'Vorinism (flexible)',
    description: 'An island trading nation ruled by elected monarchs and merchant councils.',
    physicalTraits: 'Tan skin, long white eyebrows, brown or black hair',
    sampleNames: ['Vstim', 'Rysn', 'Mrall', 'Kdralk'],
    expertiseDescription:
      'Knowledge of trade, merchant councils, artifabrian guilds, and sea travel.',
    languages: ['Thaylen'],
  },
  {
    id: 6,
    code: 'unkalaki',
    name: 'Unkalaki (Horneater)',
    region: 'Horneater Peaks',
    religion: 'Traditional beliefs',
    description: 'Mountain people living around warm crater lakes, with ancient singer ancestry.',
    physicalTraits: 'Tall, red hair, pale to tan skin, strong teeth',
    sampleNames: ['Rock', 'Cord', 'Gift', 'Song'],
    expertiseDescription: 'Knowledge of Peaks culture, family structures, and Unkalaki traditions.',
    languages: ['Unkalaki'],
  },
  {
    id: 7,
    code: 'shin',
    name: 'Shin',
    region: 'Shinovar',
    religion: 'Stone Shamanism',
    description: 'An isolated nation where farmers are esteemed and warriors are lowly.',
    physicalTraits: 'Varied skin tones, no epicanthic folds',
    sampleNames: ['Szeth-son-son-Vallano', 'Neturo-son-Vallano'],
    expertiseDescription: 'Knowledge of Stone Shamanism, mild highstorms, and Shin customs.',
    languages: ['Shin'],
  },
  {
    id: 8,
    code: 'iriali',
    name: 'Iriali',
    region: 'Iri',
    religion: 'The One (Long Trail)',
    description: 'Descendants of offworlders following the Long Trail through seven worlds.',
    physicalTraits: 'Golden skin, golden hair',
    sampleNames: ['Evi', 'Axies', 'Riino'],
    expertiseDescription: 'Knowledge of the Triumvirate, the One religion, and travel preparation.',
    languages: ['Iri'],
  },
  {
    id: 9,
    code: 'kharbranthian',
    name: 'Kharbranthian',
    region: 'Kharbranth',
    religion: 'Vorinism',
    description: 'The City of Bells - a center of academic and medical achievement.',
    physicalTraits: 'Tan skin, dark hair (similar to Veden/Alethi)',
    sampleNames: ['Taravangian', 'Dukar', 'Joshor'],
    expertiseDescription: 'Knowledge of education systems, medicine, the Palanaeum library.',
    languages: ['Kharbranthian', 'Glyphs', "Women's Script"],
  },
  {
    id: 10,
    code: 'listener',
    name: 'Listener',
    region: 'Shattered Plains (Narak)',
    religion: 'Traditional (anti-Odium)',
    description: 'Singers who defied Odium and retained their identity through oral tradition.',
    physicalTraits: 'Red/white or red/black marbled skin, red carapace, dark gray eyes',
    sampleNames: ['Eshonai', 'Venli', 'Thude', 'Rlain'],
    expertiseDescription: 'Knowledge of forms, the Five council, Shattered Plains ecology.',
    languages: ['Listener language', 'Rhythms'],
    restrictedTo: 'singer',
  },
  {
    id: 11,
    code: 'reshi',
    name: 'Reshi',
    region: 'Reshi Isles',
    religion: 'Tai-na worship',
    description: 'Island people who worship greatshell Tai-na as gods.',
    physicalTraits: 'Brown skin, black hair, round faces',
    sampleNames: ['Talik', 'Nym', 'Relu-na'],
    expertiseDescription: 'Knowledge of Tai-na, island life, and quick conflict resolution.',
    languages: ['Reshi'],
  },
  {
    id: 12,
    code: 'natan',
    name: 'Natan',
    region: 'New Natanan',
    religion: 'Vorinism (moon reverence)',
    description: 'Remnants of a destroyed empire, some living as nomads.',
    physicalTraits: 'Pale blue skin, white hair',
    sampleNames: ['Au-nak', 'Fen'],
    expertiseDescription: 'Knowledge of lost empire history, intense highstorms, moon reverence.',
    languages: ['Natan', 'Vorin languages'],
  },
  {
    id: 13,
    code: 'wayfarer',
    name: 'Wayfarer',
    region: 'Various (traveler)',
    description: 'Perpetual travelers familiar with routes, shelters, and international customs.',
    sampleNames: [],
    expertiseDescription:
      'Knowledge of travel routes, currency exchange, storm shelters, map reading.',
    languages: ['Basic greetings in multiple languages'],
  },
  {
    id: 14,
    code: 'high-society',
    name: 'High Society',
    region: 'Various (noble circles)',
    description: 'The upper echelons of society across various nations.',
    sampleNames: [],
    expertiseDescription: 'Knowledge of noble customs, etiquette, political maneuvering.',
    languages: ['Varies by nation'],
  },
];
