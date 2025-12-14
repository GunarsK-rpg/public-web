import type { SingerForm } from 'src/types';

export const singerForms: SingerForm[] = [
  // Basic forms (from Change Form key talent - id: 2001)
  {
    id: 1,
    code: 'dullform',
    name: 'Dullform',
    sprenType: 'none',
    talentId: 2001,
    bonuses: {},
    description:
      "Your form isn't specialized, as your bonded spren grants no form. You can pass unnoticed as a parshman in most human societies, but you don't gain other benefits from your form.",
  },
  {
    id: 2,
    code: 'mateform',
    name: 'Mateform',
    sprenType: 'lifespren',
    talentId: 2001,
    bonuses: {},
    description: 'You have bonded with a lifespren, and your form is specialized for reproduction.',
  },
  // Forms of Finesse (id: 2002)
  {
    id: 3,
    code: 'artform',
    name: 'Artform',
    sprenType: 'creationspren',
    talentId: 2002,
    bonuses: { awa: 1 },
    description:
      'Artform specializes in creative expression. You gain a heightened awareness of the rhythms, colors, and other aspects of the world around you. If you have carapace, it is purely cosmetic, representing radical self-expression.',
  },
  {
    id: 4,
    code: 'nimbleform',
    name: 'Nimbleform',
    sprenType: 'windspren',
    talentId: 2002,
    bonuses: { spd: 1, focus: 2 },
    description:
      'Nimbleform specializes in physical and mental flexibility. Your protective carapace is minimal; instead, you have an increased range of motion and mental focus.',
  },
  // Forms of Resolve (id: 2003)
  {
    id: 5,
    code: 'warform',
    name: 'Warform',
    sprenType: 'painspren',
    talentId: 2003,
    bonuses: { str: 1, deflect: 1 },
    description:
      'Warform specializes in combat, increasing your strength and stamina. Your body is large and covered with fierce carapace, which protects you like armor. Any aversions you might usually have to violence, pain, and death become slightly less pronounced in warform.',
  },
  {
    id: 6,
    code: 'workform',
    name: 'Workform',
    sprenType: 'gravitationspren',
    talentId: 2003,
    bonuses: { wil: 1 },
    description:
      'Workform specializes in labor. This form helps you see tasks through to completion, granting you determination and stamina. You have a rugged body with modest carapace ridges.',
  },
  // Forms of Wisdom (id: 2004)
  {
    id: 7,
    code: 'mediationform',
    name: 'Mediationform',
    sprenType: 'bindspren',
    talentId: 2004,
    bonuses: { pre: 1 },
    description:
      "Mediationform specializes in communication, whether you're connecting with new people or teaching those you know well. Your carapace is smooth, and your facial features are well-defined and expressive.",
  },
  {
    id: 8,
    code: 'scholarform',
    name: 'Scholarform',
    sprenType: 'logicspren',
    talentId: 2004,
    bonuses: { int: 1 },
    description:
      'Scholarform specializes in scholarship, enhancing your mental processes and memory. You become more patient and analytical, but you may also find yourself more inclined toward ambition. You have long hairstrands, and a cushioned lower body suited to sedentary work.',
  },
  // Forms of Destruction (id: 2006 - Voidspren, require Ambitious Mind)
  {
    id: 9,
    code: 'direform',
    name: 'Direform',
    sprenType: 'callousspren',
    talentId: 2006,
    bonuses: { str: 2, deflect: 2 },
    description:
      'Direform specializes in unyielding strength and persistence, and this form is commonly used to guard objects or prisoners. You have substantial carapace with a jagged crest of spikes running along your head and shoulders. You are inclined toward obedience to your superiors but obstinacy with others.',
  },
  {
    id: 10,
    code: 'stormform',
    name: 'Stormform',
    sprenType: 'stormspren',
    talentId: 2006,
    bonuses: { str: 1, spd: 1, deflect: 1 },
    description:
      'Stormform is an elite battle form optimized for physical prowess and honed attacks. You are covered in finesse-enhancing armored carapace that grows under your skin, poking through in ridges and spikes. You can manipulate and unleash powerful red lightning on your foes.',
  },
  // Forms of Expansion (id: 2007 - Voidspren, require Ambitious Mind)
  {
    id: 11,
    code: 'envoyform',
    name: 'Envoyform',
    sprenType: 'zealspren',
    talentId: 2007,
    bonuses: { int: 1, pre: 1 },
    description:
      'Envoyform is an embellished form often used to serve the administrative needs of the Fused. Your tall form towers over others, and your ornate carapace is uniquely alluring. You comprehend any language after brief exposure and can grasp hidden context with the subtlest of cues.',
  },
  {
    id: 12,
    code: 'relayform',
    name: 'Relayform',
    sprenType: 'hastespren',
    talentId: 2007,
    bonuses: { spd: 2 },
    description:
      'Relayform boasts speed and stamina ideal for scouts. Your agile and muscular body is protected in the front by light carapace with smooth edges, and aerodynamic spikes run along the backs of your forearms and calves. You can run great distances and avoid detection.',
  },
  // Forms of Mystery (id: 2008 - Voidspren, require Ambitious Mind)
  {
    id: 13,
    code: 'decayform',
    name: 'Decayform',
    sprenType: 'blightspren',
    talentId: 2008,
    bonuses: { wil: 2 },
    description:
      'The enigmatic decayform grants an insidious ability to sap the vitality of other beings. Your thin carapace is jagged, brittle, and asymmetrical. People you touch find themselves less resilient while you remain in contact with them. This spiritual decay affects not just their bodies, but their minds, leaving them with nightmares long after the fact.',
  },
  {
    id: 14,
    code: 'nightform',
    name: 'Nightform',
    sprenType: 'nightspren',
    talentId: 2008,
    bonuses: { awa: 1, int: 1, focus: 2 },
    description:
      'Nightform grants unpredictable visions of the future, and your senses become more acute, especially at night. Petal-like carapace grows from your skull, framing your ears and enhancing your ability to perceive rhythms. In various lights, your carapace reflects different iridescent patterns.',
  },
];
