import type { Talent, TalentPrerequisite } from 'src/types';
import { getSkillById } from './skills';

// Re-export types for convenience
export type { Talent, TalentPrerequisite };

/**
 * Talents Mock Data
 *
 * Path IDs:
 * 1 = Agent, 2 = Envoy, 3 = Hunter, 4 = Leader, 5 = Scholar, 6 = Warrior
 *
 * Specialty IDs:
 * Agent: 1 = Investigator, 2 = Spy, 3 = Thief
 * Scholar: 13 = Artifabrian, 14 = Strategist, 15 = Surgeon
 *
 * Ancestry IDs: 1 = Human, 2 = Singer
 *
 * Radiant Order IDs: 1 = Windrunner
 *
 * Surge IDs: 1 = Adhesion, 2 = Gravitation
 *
 * Activation Type IDs (actionId):
 * 1 = action, 4 = free_action, 5 = reaction, 6 = special, 7 = always_active
 *
 * Skill IDs for prerequisites:
 * 1=Agility, 2=Athletics, 3=Heavy Weaponry, 4=Light Weaponry, 5=Stealth, 6=Thievery,
 * 7=Crafting, 8=Deduction, 9=Discipline, 10=Intimidation, 11=Lore, 12=Medicine,
 * 13=Deception, 14=Insight, 15=Leadership, 16=Perception, 17=Persuasion, 18=Survival
 */

// ============================================================================
// AGENT PATH TALENTS (pathId: 1)
// ============================================================================

const agentKeyTalent: Talent = {
  id: 1,
  pathId: 1,
  code: 'opportunist',
  name: 'Opportunist',
  isKey: true,
  descriptionShort: 'Once per round, reroll a plot die result.',
  description: `You instinctively sense moments of consequence. In these moments where the scale teeters between disaster and glory, you can push yourself—and your luck—to tip the outcome in your favor.

**Effect:** Once per round, when you roll a plot die, you can reroll that result. The original roll has no effect and you must use the new result.`,
};

// Agent: Investigator Specialty (specialtyId: 1)
const investigatorTalents: Talent[] = [
  {
    id: 101,
    pathId: 1,
    specialtyId: 1,
    code: 'watchful-eye',
    name: 'Watchful Eye',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 8, skillRank: 1 },
      { type: 'talent', talentId: 1 },
    ],
    descriptionShort: "Use Opportunist for an ally's plot die within 20 feet.",
    description: `Allies can be an asset or a liability, so you keep an eye on them for their protection and yours.

**Effect:** When a willing ally you can influence within 20 feet of you rolls a plot die, you can use this reaction to use Opportunist on that plot die as if it were your own.`,
  },
  {
    id: 102,
    pathId: 1,
    specialtyId: 1,
    code: 'quick-analysis',
    name: 'Quick Analysis',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 101 }],
    descriptionShort: 'Spend 2 focus for extra action on cognitive tests.',
    description: `Your mind quickly files and organizes data, and you swiftly act on that information while under pressure.

**Effect:** Spend 2 focus to gain an action, which you can only use to make cognitive skill tests via the following actions: Use a Skill, Gain Advantage, or an action from any Agent talent.`,
  },
  {
    id: 103,
    pathId: 1,
    specialtyId: 1,
    code: 'get-em-talking',
    name: "Get 'Em Talking",
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 14, skillRank: 2 },
      { type: 'talent', talentId: 1 },
    ],
    descriptionShort: "Learn target's motivation and raise stakes against them.",
    description: `With a leading question or cutting remark, you goad others into revealing their motives.

**Effect:** Spend 1 focus to make a Deduction test against the Spiritual defense of a character you can influence. On a success, you learn the target's motivation for being in the scene. Until the end of the scene, when you make a test to leverage this motivation against the target, you can raise the stakes.`,
  },
  {
    id: 104,
    pathId: 1,
    specialtyId: 1,
    code: 'gather-evidence',
    name: 'Gather Evidence',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 14, skillRank: 2 },
      { type: 'talent', talentId: 102 },
    ],
    descriptionShort: 'Become Focused after cognitive test success. Gain Legal Codes expertise.',
    description: `Observing clues in your environment, you slowly but surely build a mental model of the mysteries before you.

**Effect:** After you succeed on a cognitive test against another character, you become Focused until the end of your next turn. Additionally, gain a utility expertise in Legal Codes.`,
  },
  {
    id: 105,
    pathId: 1,
    specialtyId: 1,
    code: 'baleful',
    name: 'Baleful',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 103 }],
    descriptionShort: 'Targets spend extra focus equal to your tier to resist your influence.',
    description: `With a severe stare, you crack the resolve of all but the most composed adversaries.

**Effect:** To resist your influence, a character must spend additional focus equal to your tier.`,
  },
  {
    id: 106,
    pathId: 1,
    specialtyId: 1,
    code: 'hardy',
    name: 'Hardy',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 105 }],
    descriptionShort: '+1 max health per level (retroactive).',
    description: `You've trained your body to endure pain and fatigue, keeping you in the fight until the bitter end.

**Effect:** When you acquire this talent, your maximum and current health increase by 1 per level. This applies to all previous and future levels.`,
  },
  {
    id: 107,
    pathId: 1,
    specialtyId: 1,
    code: 'sleuths-instincts',
    name: "Sleuth's Instincts",
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 8, skillRank: 3 },
      { type: 'talent', talentId: 106 },
    ],
    descriptionShort:
      'Advantage on cognitive tests vs known motivations; detect lies automatically.',
    description: `When cracking mysteries, you know that "why" can be as important as "who" or "how."

**Effect:** You gain an advantage on cognitive tests against a character whose motivation you know. Additionally, after a character whose motivation you know lies to you, you automatically know they're being deceitful (but not the nature of their lie).`,
  },
  {
    id: 108,
    pathId: 1,
    specialtyId: 1,
    code: 'close-the-case',
    name: 'Close the Case',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 8, skillRank: 3 },
      { type: 'talent', talentId: 106 },
    ],
    descriptionShort: 'Spend 3 focus to make target back down.',
    description: `You've compiled information on your target's motive and circumstances. Now, by pressing on your target's desires, weaknesses, or guilt, you can convince them to back down.

**Effect:** Once per scene, spend 3 focus to make a Deduction test against the Cognitive defense of a character you can influence. You gain an advantage if you know the target's motivation. On a success, you influence the target to back down.`,
  },
];

// Agent: Spy Specialty (specialtyId: 2)
const spyTalents: Talent[] = [
  {
    id: 201,
    pathId: 1,
    specialtyId: 2,
    code: 'sure-outcome',
    name: 'Sure Outcome',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 14, skillRank: 2 },
      { type: 'talent', talentId: 1 },
    ],
    descriptionShort: 'Flip plot die to specific result for 2 focus.',
    description: `The best gamble is one that secretly isn't a gamble at all.

**Effect:** When you use your Opportunist talent, instead of rerolling the plot die, you can spend 2 focus to flip it to a specific result. If it was showing Complication, flip it to 4. If it was showing Opportunity, flip it to Complication.`,
  },
  {
    id: 202,
    pathId: 1,
    specialtyId: 2,
    code: 'collected-spy',
    name: 'Collected',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 201 }],
    descriptionShort: '+2 Cognitive and +2 Spiritual defense.',
    description: `You remain mindful of your immediate goals without losing sight of your deeper value, keeping you even-keeled amid chaos.

**Effect:** When you acquire this talent, increase your Cognitive and Spiritual defenses by 2.`,
  },
  {
    id: 203,
    pathId: 1,
    specialtyId: 2,
    code: 'plausible-excuse',
    name: 'Plausible Excuse',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 13, skillRank: 1 },
      { type: 'talent', talentId: 1 },
    ],
    descriptionShort: 'Feign innocence when discovered; gain Sleight of Hand expertise.',
    description: `Years of covert operations have taught you to dissemble on the spot.

**Effect:** After you are discovered while hiding, you can use this reaction and spend 2 focus to pass yourself off as doing something innocent. Gain a utility expertise in Sleight of Hand.`,
  },
  {
    id: 204,
    pathId: 1,
    specialtyId: 2,
    code: 'cover-story',
    name: 'Cover Story',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 203 }],
    descriptionShort: 'Create a false identity with cultural expertise.',
    description: `By spinning vague rumors into popular gossip, you've created a false identity to inhabit.

**Effect:** When you acquire this talent, you create a false identity for yourself. Gain a cultural expertise relevant to your false identity's culture.`,
  },
  {
    id: 205,
    pathId: 1,
    specialtyId: 2,
    code: 'subtle-takedown',
    name: 'Subtle Takedown',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 14, skillRank: 3 },
      { type: 'talent', talentId: 204 },
    ],
    descriptionShort: 'Silent unarmed attack against unaware targets.',
    description: `You swiftly strike at your target's throat, knees, or another vulnerable area.

**Effect:** Make an unarmed attack using Insight against the Cognitive defense of a character who is Surprised, doesn't sense you, or doesn't view you as a threat. On a hit, the target can't communicate until the end of their next turn.`,
  },
  {
    id: 206,
    pathId: 1,
    specialtyId: 2,
    code: 'mighty',
    name: 'Mighty',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 204 }],
    descriptionShort: '+1+tier damage per action spent on attack.',
    description: `You deliver your swings, punches, and kicks with practiced efficiency.

**Effect:** When you hit with an attack, for each action you used, increase the damage by 1 + your tier.`,
  },
  {
    id: 207,
    pathId: 1,
    specialtyId: 2,
    code: 'high-society-contacts',
    name: 'High Society Contacts',
    isKey: false,
    prerequisites: [
      { type: 'narrative', description: 'Have a patron who is part of high society' },
      { type: 'talent', talentId: 204 },
    ],
    descriptionShort: 'Add Opportunity to high society social tests for 2 focus.',
    description: `Your patron's name opens doors for you, even in unfamiliar places.

**Effect:** When you make a test to interact socially in high society, you can spend 2 focus to add Opportunity to the result. Gain a cultural expertise in High Society.`,
  },
  {
    id: 208,
    pathId: 1,
    specialtyId: 2,
    code: 'mercurial-facade',
    name: 'Mercurial Facade',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 13, skillRank: 3 },
      { type: 'talent', talentId: 205 },
    ],
    descriptionShort: 'Disguise without supplies; first one to see through is Surprised.',
    description: `You know poise is essential to any disguise.

**Effect:** You can use Deception instead of Thievery to disguise yourself, even without supplies. The first character who sees through your disguise becomes Surprised until the end of your next turn.`,
  },
];

// Agent: Thief Specialty (specialtyId: 3)
const thiefTalents: Talent[] = [
  {
    id: 301,
    pathId: 1,
    specialtyId: 3,
    code: 'cheap-shot',
    name: 'Cheap Shot',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 1 }],
    descriptionShort: 'Thievery attack vs Cognitive defense; target Stunned on hit.',
    description: `You know exactly where to strike to leave your foe reeling in pain.

**Effect:** Spend 1 focus to make an unarmed attack using Thievery against the Cognitive defense of an enemy. On a hit, the target becomes Stunned until the end of their next turn.`,
  },
  {
    id: 302,
    pathId: 1,
    specialtyId: 3,
    code: 'surefooted',
    name: 'Surefooted',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 301 }],
    descriptionShort: '+10 movement; reduce fall/terrain damage by 2 x tier.',
    description: `You move through treacherous terrain with confidence and speed.

**Effect:** Increase your movement rate by 10. Reduce damage from dangerous terrain or falling by 2 x your tier.`,
  },
  {
    id: 303,
    pathId: 1,
    specialtyId: 3,
    code: 'shadow-step',
    name: 'Shadow Step',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 6, skillRank: 3 },
      { type: 'talent', talentId: 302 },
    ],
    descriptionShort: 'Hide after Disengage by spending 2 focus.',
    description: `You can slip from sight with ease.

**Effect:** After you Disengage, spend 2 focus to make a Thievery test against each enemy's Cognitive defense. On success, you're hidden from them.`,
  },
  {
    id: 304,
    pathId: 1,
    specialtyId: 3,
    code: 'tricksters-hand',
    name: "Trickster's Hand",
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 6, skillRank: 3 },
      { type: 'talent', talentId: 302 },
    ],
    descriptionShort: 'Spend 2 focus for extra action on physical tests.',
    description: `Your acts of skulduggery are executed with subtlety and dexterity.

**Effect:** Spend 2 focus to gain an action for physical skill tests only.`,
  },
  {
    id: 305,
    pathId: 1,
    specialtyId: 3,
    code: 'risky-behavior',
    name: 'Risky Behavior',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 14, skillRank: 2 },
      { type: 'talent', talentId: 1 },
    ],
    descriptionShort: 'Spend 1 focus to raise the stakes on any test.',
    description: `You know that risk and reward are inseparable.

**Effect:** Before you make a test, you can spend 1 focus to raise the stakes.`,
  },
  {
    id: 306,
    pathId: 1,
    specialtyId: 3,
    code: 'double-down',
    name: 'Double Down',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 305 }],
    descriptionShort: 'Reroll Opportunist again; lose 2 focus on Complication.',
    description: `When you decide to take a risk, you commit fully.

**Effect:** After using Opportunist, you can reroll the die one additional time. If it shows Complication, you lose 2 focus.`,
  },
  {
    id: 307,
    pathId: 1,
    specialtyId: 3,
    code: 'fast-talker',
    name: 'Fast Talker',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 14, skillRank: 3 },
      { type: 'talent', talentId: 306 },
    ],
    descriptionShort: 'Spend 2 focus for extra action on spiritual tests.',
    description: `Speaking quickly gets you out of trouble as often as it gets you into it.

**Effect:** Spend 2 focus to gain an action for spiritual skill tests only.`,
  },
  {
    id: 308,
    pathId: 1,
    specialtyId: 3,
    code: 'underworld-contacts',
    name: 'Underworld Contacts',
    isKey: false,
    prerequisites: [
      { type: 'narrative', description: 'Have a patron or follower in the criminal underworld' },
      { type: 'talent', talentId: 306 },
    ],
    descriptionShort: 'Add Opportunity to criminal social tests for 2 focus.',
    description: `Your patron's name carries weight in circles of ill repute.

**Effect:** Spend 2 focus to add Opportunity to social tests with criminals. Gain a utility expertise in Criminal Groups.`,
  },
];

// ============================================================================
// SCHOLAR PATH TALENTS (pathId: 5)
// ============================================================================

const scholarKeyTalent: Talent = {
  id: 500,
  pathId: 5,
  code: 'erudition',
  name: 'Erudition',
  isKey: true,
  descriptionShort: 'Gain temporary expertise and skill ranks; reassign after long rest.',
  description: `You've conditioned your mind to quickly assimilate, archive, and recall information.

**Effect:** Choose one cultural or utility expertise you don't already have, and choose two different cognitive skills that aren't surge skills. You count as having the expertise and one additional rank of each skill. After a long rest with library access, you can reassign these.`,
};

// Scholar: Artifabrian Specialty (specialtyId: 13)
const artifabrianTalents: Talent[] = [
  {
    id: 501,
    pathId: 5,
    specialtyId: 13,
    code: 'efficient-engineer',
    name: 'Efficient Engineer',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 7, skillRank: 1 },
      { type: 'talent', talentId: 500 },
    ],
    descriptionShort:
      'Gain crafting expertise and fabrial; expanded Opportunity range, half material cost.',
    description: `Solid work begins with practice and fundamentals.

**Effect:** Gain a utility expertise in Armor, Equipment, or Weapon Crafting. Gain a starting fabrial. When crafting, your Opportunity range expands by 2 and material costs are halved.`,
  },
  {
    id: 502,
    pathId: 5,
    specialtyId: 13,
    code: 'prized-acquisition',
    name: 'Prized Acquisition',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 500 }],
    descriptionShort: 'Gain Fabrial Crafting expertise and a special gem.',
    description: `Through good fortune or hard work, you've acquired a gemstone of sufficient quality.

**Effect:** Gain a specialist expertise in Fabrial Crafting. Gain a specially cut gemstone that can be used to craft a fabrial of your tier.`,
  },
  {
    id: 503,
    pathId: 5,
    specialtyId: 13,
    code: 'deep-study',
    name: 'Deep Study',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 501 }],
    descriptionShort: 'Erudition grants extra expertise and two additional cognitive skills.',
    description: `You love getting lost in an archive of books, scrolls, and dusty secrets.

**Effect:** Your Erudition grants one additional expertise and two additional cognitive skills.`,
  },
  {
    id: 504,
    pathId: 5,
    specialtyId: 13,
    code: 'inventive-design',
    name: 'Inventive Design',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 7, skillRank: 2 },
      { type: 'talent', talentId: 502 },
    ],
    descriptionShort: 'Prized Acquisition fabrial can use effects 1 tier higher.',
    description: `Your custom fabrials integrate novel functionalities.

**Effect:** When crafting with your Prized Acquisition gem, select an effect 1 tier higher than the tier you're crafting.`,
  },
  {
    id: 505,
    pathId: 5,
    specialtyId: 13,
    code: 'fine-handiwork',
    name: 'Fine Handiwork',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 501 }],
    descriptionShort: 'Advanced features cost 1 upgrade instead of 2.',
    description: `Your dedication to quality ensures your designs stand out.

**Effect:** When crafting, you can spend one upgrade to apply an advanced feature instead of two upgrades.`,
  },
  {
    id: 506,
    pathId: 5,
    specialtyId: 13,
    code: 'overcharge',
    name: 'Overcharge',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 7, skillRank: 3 },
      { type: 'talent', talentId: 502 },
    ],
    descriptionShort: 'Raise stakes on fabrial attacks; spend Opportunity for free Strike.',
    description: `You push fabrials to their limits.

**Effect:** When attacking with a fabrial, you can raise the stakes. Spend Opportunity to use Strike as a free action.`,
  },
  {
    id: 507,
    pathId: 5,
    specialtyId: 13,
    code: 'experimental-tinkering',
    name: 'Experimental Tinkering',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 505 }],
    descriptionShort:
      'Expanded Opportunity range, halved craft time; reconfigure Prized fabrial during rest.',
    description: `You've honed your instinct for when to sacrifice one feature to enhance another.

**Effect:** When crafting, Opportunity range expands by 1 and time is halved. You can reconfigure your Prized fabrial during a long rest.`,
  },
  {
    id: 508,
    pathId: 5,
    specialtyId: 13,
    code: 'overwhelm-with-details',
    name: 'Overwhelm with Details',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 11, skillRank: 3 },
      { type: 'talent', talentId: 507 },
    ],
    descriptionShort: 'Spend 2 focus to use Lore for any cognitive/spiritual test.',
    description: `When speaking about a topic you're passionate about, you do so with unsurpassed authority.

**Effect:** Spend 2 focus to make a cognitive or spiritual test using Lore instead of the usual skill.`,
  },
];

// Scholar: Strategist Specialty (specialtyId: 14)
const strategistTalents: Talent[] = [
  {
    id: 511,
    pathId: 5,
    specialtyId: 14,
    code: 'strategize',
    name: 'Strategize',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 8, skillRank: 1 },
      { type: 'talent', talentId: 500 },
    ],
    descriptionShort: 'Give Gain Advantage benefits to an ally instead of yourself.',
    description: `You carefully observe and assess your problem from novel angles.

**Effect:** After succeeding on Gain Advantage using an Erudition skill, you can give the benefits to an ally you can influence instead.`,
  },
  {
    id: 512,
    pathId: 5,
    specialtyId: 14,
    code: 'mind-and-body',
    name: 'Mind and Body',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 500 }],
    descriptionShort: 'Erudition can grant physical skills; gain weapon expertise.',
    description: `You expand your studies to include martial arts and fitness.

**Effect:** Erudition grants an additional skill and can choose physical skills. Gain one weapon expertise.`,
  },
  {
    id: 513,
    pathId: 5,
    specialtyId: 14,
    code: 'composed',
    name: 'Composed',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 511 }],
    descriptionShort: '+tier to max and current focus.',
    description: `Through practiced composure, you push your limits.

**Effect:** Your maximum and current focus increase by your tier.`,
  },
  {
    id: 514,
    pathId: 5,
    specialtyId: 14,
    code: 'know-your-moment',
    name: 'Know Your Moment',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 8, skillRank: 2 },
      { type: 'talent', talentId: 512 },
    ],
    descriptionShort: '+2 to all defenses from start of round until your turn.',
    description: `Your knowledge of strategy guides you on when to act for greatest effect.

**Effect:** After the beginning of each round, each of your defenses increases by 2 until the start of your turn.`,
  },
  {
    id: 515,
    pathId: 5,
    specialtyId: 14,
    code: 'deep-contemplation',
    name: 'Deep Contemplation',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 11, skillRank: 2 },
      { type: 'talent', talentId: 513 },
    ],
    descriptionShort: 'Reassign up to 2 skills/expertises from Erudition.',
    description: `You methodically search your mental archives.

**Effect:** Reassign up to 2 of the skills and expertises gained from Erudition.`,
  },
  {
    id: 516,
    pathId: 5,
    specialtyId: 14,
    code: 'contingency',
    name: 'Contingency',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 11, skillRank: 3 },
      { type: 'talent', talentId: 513 },
    ],
    descriptionShort: "Spend 2 focus to remove Complication from ally's test within 20 feet.",
    description: `You prepare for anything that might derail your plans.

**Effect:** After an ally within 20 feet rolls a Complication, spend 2 focus to remove it.`,
  },
  {
    id: 517,
    pathId: 5,
    specialtyId: 14,
    code: 'keen-insight',
    name: 'Keen Insight',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 515 }],
    descriptionShort:
      'After Gain Advantage, target gets disadvantage on next test unless they resist.',
    description: `Everyone has weaknesses—and you have a knack for exploiting them.

**Effect:** After succeeding on Gain Advantage, the target gains a disadvantage on their next test unless they resist.`,
  },
  {
    id: 518,
    pathId: 5,
    specialtyId: 14,
    code: 'turning-point',
    name: 'Turning Point',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 8, skillRank: 3 },
      { type: 'talent', talentId: 516 },
    ],
    descriptionShort: 'Once per scene, on success vs enemy leader, allies gain extra action.',
    description: `Battles often pivot on a single crucial moment.

**Effect:** Once per scene, spend 2 focus to make a Deduction test against the enemy leader. On success, you and your allies gain an extra action on your next turns.`,
  },
];

// Scholar: Surgeon Specialty (specialtyId: 15)
const surgeonTalents: Talent[] = [
  {
    id: 521,
    pathId: 5,
    specialtyId: 15,
    code: 'field-medicine',
    name: 'Field Medicine',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 12, skillRank: 1 },
      { type: 'talent', talentId: 500 },
    ],
    descriptionShort: 'DC 15 Medicine test to heal a conscious character.',
    description: `You treat a minor wound by bandaging a gash, applying salves, or resetting a dislocated joint.

**Effect:** Spend 1 focus to make a DC 15 Medicine test to heal a conscious willing character. On success, they recover health equal to their recovery die + your Medicine ranks.`,
  },
  {
    id: 522,
    pathId: 5,
    specialtyId: 15,
    code: 'emotional-intelligence',
    name: 'Emotional Intelligence',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 500 }],
    descriptionShort: 'Erudition can grant spiritual skills; gain Diagnosis expertise.',
    description: `You hone your intuition and understanding of others.

**Effect:** Erudition grants an additional skill and can choose spiritual skills. Gain a utility expertise in Diagnosis.`,
  },
  {
    id: 523,
    pathId: 5,
    specialtyId: 15,
    code: 'anatomical-insight',
    name: 'Anatomical Insight',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 521 }],
    descriptionShort: 'On unarmed hit, spend 1 focus to apply Exhausted condition.',
    description: `Your knowledge of anatomy aids you in striking vital points.

**Effect:** On an unarmed hit, spend 1 focus to apply Exhausted. The penalty equals half your Medicine ranks (rounded up).`,
  },
  {
    id: 524,
    pathId: 5,
    specialtyId: 15,
    code: 'collected-surgeon',
    name: 'Collected',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 522 }],
    descriptionShort: '+2 Cognitive and +2 Spiritual defense.',
    description: `You've learned to be mindful of your immediate goals.

**Effect:** Increase your Cognitive and Spiritual defenses by 2.`,
  },
  {
    id: 525,
    pathId: 5,
    specialtyId: 15,
    code: 'swift-healer',
    name: 'Swift Healer',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 12, skillRank: 2 },
      { type: 'talent', talentId: 521 },
    ],
    descriptionShort: 'Use Field Medicine as free action; heal extra = Medicine ranks.',
    description: `Your practiced hands quickly dress wounds.

**Effect:** Use Field Medicine as a free action. When healing others, they recover additional health equal to your Medicine ranks.`,
  },
  {
    id: 526,
    pathId: 5,
    specialtyId: 15,
    code: 'applied-medicine',
    name: 'Applied Medicine',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 11, skillRank: 2 },
      { type: 'talent', talentId: 524 },
    ],
    descriptionShort: 'Heal extra = Lore ranks.',
    description: `Your broad foundation enhances your healing.

**Effect:** When you cause a character to recover health, they recover additional health equal to your Lore ranks.`,
  },
  {
    id: 527,
    pathId: 5,
    specialtyId: 15,
    code: 'ongoing-care',
    name: 'Ongoing Care',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 11, skillRank: 3 },
      { type: 'talent', talentId: 525 },
    ],
    descriptionShort:
      'During rest, remove injury condition from ally; gain Mental Health Care expertise.',
    description: `You've studied the connection between physical and mental health.

**Effect:** During a rest, make a Medicine test to remove a condition from an ally's injury. Gain a utility expertise in Mental Health Care.`,
  },
  {
    id: 528,
    pathId: 5,
    specialtyId: 15,
    code: 'resuscitation',
    name: 'Resuscitation',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 12, skillRank: 3 },
      { type: 'talent', talentId: 525 },
    ],
    descriptionShort: 'Spend 3 focus to revive Unconscious or recently dead character.',
    description: `You can pull mortally wounded creatures back from the brink.

**Effect:** Use Field Medicine with 3 focus to target an Unconscious or recently dead character. On success, they recover health and return to life.`,
  },
];

// ============================================================================
// WARRIOR PATH TALENTS (pathId: 6)
// ============================================================================

const warriorKeyTalent: Talent = {
  id: 600,
  pathId: 6,
  code: 'vigilant-stance',
  name: 'Vigilant Stance',
  isKey: true,
  descriptionShort: 'Enter a stance as a free action; maintain awareness in combat.',
  description: `You've trained to keep your guard up and react instantly to threats. Your combat stances are second nature.

**Effect:** You can enter a combat stance as a free action. While in any stance, you gain advantage on Perception tests to notice threats and can't be Surprised.`,
};

// Warrior: Duelist Specialty (specialtyId: 16)
const duelistTalents: Talent[] = [
  {
    id: 601,
    pathId: 6,
    specialtyId: 16,
    code: 'practiced-kata',
    name: 'Practiced Kata',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 3, skillRank: 1 },
      { type: 'talent', talentId: 600 },
    ],
    descriptionShort: 'Learn a combat stance; gain +1 to attack rolls while in it.',
    description: `Through endless practice, you've perfected the movements of a specific combat form.

**Effect:** Choose a combat stance. While in that stance, you gain +1 to attack rolls. You can take this talent multiple times, choosing a different stance each time.`,
  },
  {
    id: 602,
    pathId: 6,
    specialtyId: 16,
    code: 'flamestance',
    name: 'Flamestance',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 601 }],
    descriptionShort: 'Aggressive stance that increases damage dealt.',
    description: `The Flamestance is an aggressive combat form focused on overwhelming offense.

**Effect:** While in Flamestance, your attacks deal +2 damage. However, your Physical defense is reduced by 1.`,
  },
  {
    id: 603,
    pathId: 6,
    specialtyId: 16,
    code: 'windstance',
    name: 'Windstance',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 601 }],
    descriptionShort: 'Balanced stance that improves both offense and defense.',
    description: `The Windstance balances attack and defense, flowing like the wind.

**Effect:** While in Windstance, you gain +1 to both attack rolls and Physical defense. Additionally, you can move 5 feet as part of your reaction when you Dodge.`,
  },
  {
    id: 604,
    pathId: 6,
    specialtyId: 16,
    code: 'stonestance',
    name: 'Stonestance',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 601 }],
    descriptionShort: 'Defensive stance focused on protection.',
    description: `The Stonestance is a defensive form, rooted and immovable like stone.

**Effect:** While in Stonestance, your Physical defense increases by 2 and you can't be moved against your will. However, your movement rate is reduced by 10.`,
  },
  {
    id: 605,
    pathId: 6,
    specialtyId: 16,
    code: 'riposte',
    name: 'Riposte',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 3, skillRank: 2 },
      { type: 'talent', talentId: 602 },
    ],
    descriptionShort: 'Counterattack when an enemy misses you in melee.',
    description: `You exploit openings when enemies overextend.

**Effect:** When an enemy misses you with a melee attack, spend 1 focus to make a melee attack against them.`,
  },
  {
    id: 606,
    pathId: 6,
    specialtyId: 16,
    code: 'signature-weapon',
    name: 'Signature Weapon',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 605 }],
    descriptionShort: 'Gain mastery with a specific weapon type.',
    description: `You've devoted yourself to mastering a specific weapon.

**Effect:** Choose a weapon type. When using that weapon type, you gain +1 to attack rolls and +2 to damage. You can take this talent multiple times, choosing a different weapon each time.`,
  },
  {
    id: 607,
    pathId: 6,
    specialtyId: 16,
    code: 'blade-dance',
    name: 'Blade Dance',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 3, skillRank: 3 },
      { type: 'talent', talentId: 605 },
    ],
    descriptionShort: 'Move between attacks without provoking.',
    description: `You weave through combat with deadly grace.

**Effect:** Once per turn, when you hit with a melee attack, you can move up to 10 feet without provoking reactions.`,
  },
  {
    id: 608,
    pathId: 6,
    specialtyId: 16,
    code: 'masterful-flourish',
    name: 'Masterful Flourish',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 3, skillRank: 3 },
      { type: 'talent', talentId: 606 },
    ],
    descriptionShort: 'Devastating attack that deals extra damage and applies a condition.',
    description: `You execute a devastating technique that leaves opponents reeling.

**Effect:** Spend 2 focus to make a melee attack. On a hit, deal an extra 2d6 damage and the target becomes Disoriented until the end of your next turn.`,
  },
];

// Warrior: Shardbearer Specialty (specialtyId: 17)
const shardbearerTalents: Talent[] = [
  {
    id: 611,
    pathId: 6,
    specialtyId: 17,
    code: 'shard-bonding',
    name: 'Shard Bonding',
    isKey: false,
    prerequisites: [
      { type: 'narrative', description: 'Own a Shardblade or Shardplate' },
      { type: 'talent', talentId: 600 },
    ],
    descriptionShort: 'Reduce summon time and gain proficiency with Shards.',
    description: `You've bonded deeply with your Shardweapon or Shardplate.

**Effect:** You can summon a bonded Shardblade in 5 heartbeats instead of 10. You gain expertise with Shardblades and Shardplate.`,
  },
  {
    id: 612,
    pathId: 6,
    specialtyId: 17,
    code: 'shardplate-training',
    name: 'Shardplate Training',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 611 }],
    descriptionShort: 'Move at full speed in Shardplate and enhance its protection.',
    description: `You've trained extensively in Shardplate, making its weight feel like nothing.

**Effect:** While wearing Shardplate, your movement isn't reduced and you gain +1 to Physical defense beyond the Plate's normal bonus.`,
  },
  {
    id: 613,
    pathId: 6,
    specialtyId: 17,
    code: 'shardblade-mastery',
    name: 'Shardblade Mastery',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 611 }],
    descriptionShort: 'Shardblade attacks ignore armor and deal bonus damage.',
    description: `Your mastery of the Shardblade makes each strike devastating.

**Effect:** Your Shardblade attacks ignore deflect from non-Shard armor. On a hit against an unarmored target or a target whose Shardplate is broken, deal an additional 1d6 damage.`,
  },
  {
    id: 614,
    pathId: 6,
    specialtyId: 17,
    code: 'plate-regeneration',
    name: 'Plate Regeneration',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 9, skillRank: 2 },
      { type: 'talent', talentId: 612 },
    ],
    descriptionShort: 'Recover Shardplate charges during combat.',
    description: `You've learned to draw upon Stormlight to repair your Shardplate quickly.

**Effect:** During your turn, spend 1 focus to restore 1 charge to your Shardplate. You can only use this ability once per round.`,
  },
  {
    id: 615,
    pathId: 6,
    specialtyId: 17,
    code: 'devastating-cleave',
    name: 'Devastating Cleave',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 3, skillRank: 2 },
      { type: 'talent', talentId: 613 },
    ],
    descriptionShort: 'Attack all enemies in an arc with your Shardblade.',
    description: `You sweep your Shardblade in a devastating arc.

**Effect:** Make a single Shardblade attack against all enemies within reach in a 180-degree arc. Roll damage once and apply to all targets hit.`,
  },
  {
    id: 616,
    pathId: 6,
    specialtyId: 17,
    code: 'shard-sync',
    name: 'Shard Sync',
    isKey: false,
    prerequisites: [
      { type: 'talent', talentId: 614 },
      { type: 'talent', talentId: 615 },
    ],
    descriptionShort: 'Blade and Plate work in harmony, enhancing both.',
    description: `Your Shardblade and Shardplate work together as extensions of your will.

**Effect:** While wielding a Shardblade and wearing Shardplate, gain +1 to all defenses and +1 to damage with the Shardblade.`,
  },
  {
    id: 617,
    pathId: 6,
    specialtyId: 17,
    code: 'instant-summon',
    name: 'Instant Summon',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 9, skillRank: 3 },
      { type: 'talent', talentId: 616 },
    ],
    descriptionShort: 'Summon or dismiss Shardblade instantly.',
    description: `Your bond with your Shardblade is so strong it appears at mere thought.

**Effect:** You can summon or dismiss your bonded Shardblade as a free action. Additionally, if disarmed, you can immediately resummon it.`,
  },
  {
    id: 618,
    pathId: 6,
    specialtyId: 17,
    code: 'unstoppable-force',
    name: 'Unstoppable Force',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 3, skillRank: 3 },
      { type: 'talent', talentId: 616 },
    ],
    descriptionShort: 'Charge through enemies, attacking all in your path.',
    description: `You become an unstoppable juggernaut on the battlefield.

**Effect:** Once per combat, spend 3 focus to move up to double your movement in a straight line. You can move through enemy spaces and make a melee attack against each enemy you pass through. You gain +2 to damage on all attacks made during this movement.`,
  },
];

// Warrior: Soldier Specialty (specialtyId: 18)
const soldierTalents: Talent[] = [
  {
    id: 621,
    pathId: 6,
    specialtyId: 18,
    code: 'combat-reflexes',
    name: 'Combat Reflexes',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 2, skillRank: 1 },
      { type: 'talent', talentId: 600 },
    ],
    descriptionShort: 'React faster in combat; gain additional reaction.',
    description: `Your battlefield experience has honed your reflexes to a razor's edge.

**Effect:** You gain an additional reaction each round. You can use this reaction only for Reactive Strike or Dodge.`,
  },
  {
    id: 622,
    pathId: 6,
    specialtyId: 18,
    code: 'hold-the-line',
    name: 'Hold the Line',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 621 }],
    descriptionShort: 'Allies adjacent to you gain defensive bonus.',
    description: `You anchor your allies in combat, creating a defensive bulwark.

**Effect:** Allies within 5 feet of you gain +2 to Physical defense. This bonus ends if you move more than 5 feet on your turn.`,
  },
  {
    id: 623,
    pathId: 6,
    specialtyId: 18,
    code: 'spear-wall',
    name: 'Spear Wall',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 621 }],
    descriptionShort: 'Attack enemies that approach you with reach weapons.',
    description: `You've trained to strike enemies before they can close.

**Effect:** When wielding a reach weapon, when an enemy enters your reach, you can spend 1 focus to make a melee attack against them. On a hit, the enemy must stop their movement.`,
  },
  {
    id: 624,
    pathId: 6,
    specialtyId: 18,
    code: 'battlefield-awareness',
    name: 'Battlefield Awareness',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 16, skillRank: 2 },
      { type: 'talent', talentId: 622 },
    ],
    descriptionShort: "Can't be flanked; gain advantage on Perception in combat.",
    description: `You maintain constant awareness of threats from all directions.

**Effect:** You can't be flanked and enemies don't gain bonuses for attacking from blind spots. You gain advantage on Perception tests during combat.`,
  },
  {
    id: 625,
    pathId: 6,
    specialtyId: 18,
    code: 'shield-mastery',
    name: 'Shield Mastery',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 3, skillRank: 2 },
      { type: 'talent', talentId: 622 },
    ],
    descriptionShort: 'Increase shield bonus and can attack with shields.',
    description: `You wield your shield as both protection and weapon.

**Effect:** When using a shield, increase its defense bonus by 1. You can make Shield Bash attacks that deal 1d6 + Strength bludgeoning damage and can knock targets prone on Opportunity.`,
  },
  {
    id: 626,
    pathId: 6,
    specialtyId: 18,
    code: 'never-surrender',
    name: 'Never Surrender',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 9, skillRank: 2 },
      { type: 'talent', talentId: 624 },
    ],
    descriptionShort: 'Resist being incapacitated; stay standing at 0 health once per combat.',
    description: `Your determination keeps you fighting when others would fall.

**Effect:** Once per combat, when you would be reduced to 0 health, you instead remain at 1 health. You become Exhausted until you complete a rest.`,
  },
  {
    id: 627,
    pathId: 6,
    specialtyId: 18,
    code: 'veterans-grit',
    name: "Veteran's Grit",
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 625 }],
    descriptionShort: 'Reduce damage taken and resist conditions.',
    description: `Years of combat have toughened your body and mind.

**Effect:** Reduce all damage taken by 1 (after deflect). You have advantage on tests to resist or end conditions caused by enemies.`,
  },
  {
    id: 628,
    pathId: 6,
    specialtyId: 18,
    code: 'rallying-cry',
    name: 'Rallying Cry',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 15, skillRank: 3 },
      { type: 'talent', talentId: 626 },
    ],
    descriptionShort: 'Inspire allies, granting them temporary health and focus.',
    description: `Your battle cry inspires allies and strikes fear into enemies.

**Effect:** Spend 2 focus to rally allies within 30 feet. Each ally gains temporary health equal to your tier + Leadership ranks and recovers 1 focus. Enemies who can hear you must succeed on a Spiritual defense test or become Frightened until the end of your next turn.`,
  },
];

// ============================================================================
// SINGER ANCESTRY TALENTS (ancestryId: 2)
// ============================================================================

const singerTalents: Talent[] = [
  {
    id: 2001,
    ancestryId: 2,
    code: 'change-form',
    name: 'Change Form',
    isKey: true,
    descriptionShort: 'Bond spren during highstorms to change forms.',
    description: `You learn to bond a spren during highstorms and change your form. This transformation alters your physical, cognitive, and spiritual strengths, and even your personality.

**Effect:** You begin with dullform and mateform. While outdoors during a highstorm, you can bond a spren and change into any form you've unlocked. While in a form, you gain its bonuses until you assume a different form.`,
  },
  {
    id: 2002,
    ancestryId: 2,
    code: 'forms-of-finesse',
    name: 'Forms of Finesse',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 2001 }],
    descriptionShort:
      'Gain Artform (Awareness +1, creative bonuses) and Nimbleform (Speed +1, Focus +2).',
    description: `You gain two new singer forms—artform and nimbleform.

**Artform (creationspren):** Awareness +1, Painting and Music expertises, advantage on Crafting and entertaining tests.

**Nimbleform (windspren):** Speed +1, maximum and current focus +2.`,
  },
  {
    id: 2003,
    ancestryId: 2,
    code: 'forms-of-resolve',
    name: 'Forms of Resolve',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 2001 }],
    descriptionShort:
      'Gain Warform (Strength +1, Deflect +1) and Workform (Willpower +1, ignore Exhausted).',
    description: `You gain two new singer forms—warform and workform.

**Warform (painspren):** Strength +1, deflect +1 (doesn't stack with armor), enhanced jumping.

**Workform (gravitationspren):** Willpower +1, ignore Exhausted, can disguise as parshman.`,
  },
  {
    id: 2004,
    ancestryId: 2,
    code: 'forms-of-wisdom',
    name: 'Forms of Wisdom',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 2001 }],
    descriptionShort:
      'Gain Mediationform (Presence +1, free Aid) and Scholarform (Intellect +1, temp expertise).',
    description: `You gain two new singer forms—mediationform and scholarform.

**Mediationform (bindspren):** Presence +1, don't spend focus for Aid reaction.

**Scholarform (logicspren):** Intellect +1, gain a temporary expertise and cognitive skill rank.`,
  },
  {
    id: 2005,
    ancestryId: 2,
    code: 'ambitious-mind',
    name: 'Ambitious Mind',
    isKey: false,
    prerequisites: [
      { type: 'skill', skillId: 9, skillRank: 3 },
      {
        type: 'talent',
        talentIds: [2002, 2003, 2004],
        description: 'Forms of Finesse, Resolve, or Wisdom',
      },
    ],
    descriptionShort: '+2 Cognitive defense; can bond Voidspren with forms of power.',
    description: `Your growing thirst for power opens you to Odium's influence.

**Effect:** Cognitive defense +2. With forms of power talents, you can bond Voidspren.

**Voidspren Vulnerability:** Once per day on a Complication, succeed DC 15 Discipline or be Stunned until end of next turn.`,
  },
  {
    id: 2006,
    ancestryId: 2,
    code: 'forms-of-destruction',
    name: 'Forms of Destruction',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 2005 }],
    descriptionShort: 'Gain Direform (Strength +2, Deflect +2) and Stormform (lightning attacks).',
    description: `You gain two forms of power—direform and stormform.

**Direform (callousspren):** Strength +2, deflect +2, can Grapple on Reactive Strike.

**Stormform (stormspren):** Strength +1, Speed +1, deflect +1. Can use **Unleash Lightning** (action, 60 ft, 2d8 energy damage, Disoriented on hit).`,
  },
  {
    id: 2007,
    ancestryId: 2,
    code: 'forms-of-expansion',
    name: 'Forms of Expansion',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 2005 }],
    descriptionShort:
      'Gain Envoyform (know all languages) and Relayform (Speed +2, ignore Slowed).',
    description: `You gain two forms of power—envoyform and relayform.

**Envoyform (zealspren):** Intellect +1, Presence +1, know all languages, advantage on Insight for intentions.

**Relayform (hastespren):** Speed +2, ignore Slowed, spend 1 focus for advantage on Agility/Stealth/Thievery.`,
  },
  {
    id: 2008,
    ancestryId: 2,
    code: 'forms-of-mystery',
    name: 'Forms of Mystery',
    isKey: false,
    // Note: Nightform's "Intervening Premonitions" is a separate action (2009)
    prerequisites: [{ type: 'talent', talentId: 2005 }],
    descriptionShort: 'Gain Decayform (prevent healing) and Nightform (precognitive visions).',
    description: `You gain two forms of power—decayform and nightform.

**Decayform (blightspren):** Willpower +2. **Decaying Touch** reaction: spend 1 focus to prevent a character within reach from recovering health/focus.

**Nightform (nightspren):** Awareness +1, Intellect +1, focus +2. **Intervening Premonitions** reaction: roll 2d20 at session start, replace ally/enemy test result with one.`,
  },
];

// ============================================================================
// WINDRUNNER RADIANT TALENTS (radiantOrderId: 1)
// ============================================================================

const windrunnerTalents: Talent[] = [
  {
    id: 3001,
    radiantOrderId: 1,
    code: 'first-ideal-windrunner',
    name: 'First Ideal (Windrunner)',
    isKey: true,
    prerequisites: [{ type: 'narrative', description: 'Level 2+' }],
    descriptionShort:
      'Begin bonding an honorspren; gain Investiture, Breathe Stormlight, Enhance, Regenerate.',
    description: `You begin bonding an honorspren, allowing you to breathe in and use Stormlight.

**Effect:** Gain Investiture (max = 2 + higher of Awareness/Presence). Use Breathe Stormlight, Enhance, and Regenerate actions.

**Goal: Speak the First Ideal.** Reward: Become Empowered, gain Adhesion and Gravitation surges with 1 rank each.`,
  },
  {
    id: 3002,
    radiantOrderId: 1,
    code: 'second-ideal-windrunner',
    name: 'Second Ideal (Windrunner)',
    isKey: false,
    prerequisites: [{ type: 'narrative', description: 'Level 4+; Speak the First Ideal' }],
    descriptionShort:
      'Goal to speak Second Ideal; Enhance becomes free action without Investiture cost.',
    description: `*"I will protect those who cannot protect themselves."*

**Goal: Speak the Second Ideal.** Reward: Become Empowered, Enhance becomes a free action that doesn't cost Investiture.`,
  },
  {
    id: 3003,
    radiantOrderId: 1,
    code: 'reverse-lashing',
    name: 'Reverse Lashing',
    isKey: false,
    prerequisites: [{ type: 'narrative', description: 'Speak the First Ideal' }],
    descriptionShort: 'Infuse target to attract specific type of objects.',
    description: `Infuse things with a mix of Adhesion and Gravitation to give them a weak gravitational pull.

**Effect:** Instead of a Basic Lashing, infuse a target with a Reverse Lashing. Declare a type of object to attract. Objects within your gravitation rate fly toward and stick to the target.`,
  },
  {
    id: 3004,
    radiantOrderId: 1,
    code: 'third-ideal-windrunner',
    name: 'Third Ideal (Windrunner)',
    isKey: false,
    prerequisites: [{ type: 'narrative', description: 'Level 8+; Speak the Second Ideal' }],
    descriptionShort: 'Goal to speak Third Ideal; summon spren as Radiant Shardblade.',
    description: `*"I will protect even those I hate, so long as it is right."*

**Goal: Speak the Third Ideal.** Reward: Become Empowered, summon your spren as a **Radiant Shardblade**.`,
  },
  {
    id: 3005,
    radiantOrderId: 1,
    code: 'invested',
    name: 'Invested',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 3003 }],
    descriptionShort: 'Max Investiture increases by your tier.',
    description: `You learn to hold greater quantities of Stormlight.

**Effect:** Maximum Investiture increases by your tier. Increases when your tier increases.`,
  },
  {
    id: 3006,
    radiantOrderId: 1,
    code: 'wound-regeneration',
    name: 'Wound Regeneration',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 3005 }],
    descriptionShort: 'Spend Investiture when Regenerating to recover from injuries.',
    description: `Use Stormlight to rapidly recover from injuries.

**Effect:** When using Regenerate, spend 2 Investiture for a temporary injury or 3 for a permanent one.`,
  },
  {
    id: 3007,
    radiantOrderId: 1,
    code: 'fourth-ideal-windrunner',
    name: 'Fourth Ideal (Windrunner)',
    isKey: false,
    prerequisites: [{ type: 'narrative', description: 'Level 13+; Speak the Third Ideal' }],
    descriptionShort: 'Goal to speak Fourth Ideal; call windspren as Radiant Shardplate.',
    description: `**Goal: Speak the Fourth Ideal.** Reward: Become Empowered, call a swarm of windspren as **Radiant Shardplate**.`,
  },
  {
    id: 3008,
    radiantOrderId: 1,
    code: 'deepened-bond',
    name: 'Deepened Bond',
    isKey: false,
    prerequisites: [{ type: 'narrative', description: 'Speak the Third Ideal' }],
    descriptionShort: 'Spren bond range increases to 100 feet; spren tasks cost 1 less focus.',
    description: `Your Nahel bond allows your spren to manifest more fully.

**Effect:** Spren bond range increases to 100 feet. Spren tasks cost 1 less focus (minimum 1).`,
  },
  {
    id: 3009,
    radiantOrderId: 1,
    code: 'take-squire-windrunner',
    name: 'Take Squire (Windrunner)',
    isKey: false,
    prerequisites: [{ type: 'narrative', description: 'Speak the Third Ideal' }],
    descriptionShort: 'Take non-Radiant characters as squires, granting them your surges.',
    description: `Take other people under your wing, allowing them to use surges.

**Effect:** After a long rest, choose a willing character as your squire. Grant them both, one, or neither of your surges. Max squires = 2 x level.`,
  },
];

// ============================================================================
// ADHESION SURGE TALENTS (surgeId: 1)
// ============================================================================

const adhesionSurgeTalents: Talent[] = [
  {
    id: 4001,
    radiantOrderId: 1,
    surgeId: 1,
    code: 'stormlight-reclamation',
    name: 'Stormlight Reclamation',
    isKey: false,
    prerequisites: [{ type: 'narrative', description: 'Speak the First Ideal' }],
    descriptionShort: 'End Adhesion infusions within reach, recover remaining Investiture.',
    description: `Reclaim Stormlight from active infusions.

**Effect:** After infusions expend Investiture, end any within reach and recover remaining Investiture.`,
  },
  {
    id: 4002,
    radiantOrderId: 1,
    surgeId: 1,
    code: 'binding-strike',
    name: 'Binding Strike',
    isKey: false,
    prerequisites: [{ type: 'narrative', description: 'Speak the First Ideal' }],
    descriptionShort: 'Use Adhesion on melee hit without spending an action.',
    description: `Seamlessly use Adhesion while performing melee attacks.

**Effect:** After hitting with a melee attack, spend an action or 2 focus to use Adhesion without spending an action. Automatically succeed on the test.`,
  },
  {
    id: 4003,
    radiantOrderId: 1,
    surgeId: 1,
    code: 'distant-surgebinding',
    name: 'Distant Surgebinding',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 4001 }],
    descriptionShort: 'Use surges as though your reach is 20 feet.',
    description: `Infuse targets from a greater distance.

**Effect:** Use surges as though your reach is 20 feet, without touching the target.`,
  },
  {
    id: 4004,
    radiantOrderId: 1,
    surgeId: 1,
    code: 'binding-shot',
    name: 'Binding Shot',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 4002 }],
    descriptionShort: 'Use Binding Strike with ranged attacks at any distance.',
    description: `"Paint" your ammunition with Adhesion.

**Effect:** Use Binding Strike with ranged attacks at any distance.`,
  },
  {
    id: 4005,
    radiantOrderId: 1,
    surgeId: 1,
    code: 'extended-adhesion',
    name: 'Extended Adhesion',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 4003 }],
    descriptionShort: 'Full Lashings expend 1 Investiture per Adhesion ranks rounds.',
    description: `Your Full Lashings use less Stormlight.

**Effect:** Full Lashings expend 1 Investiture per number of rounds equal to your Adhesion ranks.`,
  },
  {
    id: 4006,
    radiantOrderId: 1,
    surgeId: 1,
    code: 'adhesive-trap',
    name: 'Adhesive Trap',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 4004 }],
    descriptionShort: 'Infuse surfaces; characters touching become Fully Lashed.',
    description: `Infuse Adhesion into surfaces.

**Effect:** Infuse a surface instead of objects. Characters touching it become subject to a Full Lashing.`,
  },
  {
    id: 4007,
    radiantOrderId: 1,
    surgeId: 1,
    code: 'living-adhesion',
    name: 'Living Adhesion',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 4005 }],
    descriptionShort: 'Use Adhesion on characters; target becomes Restrained with disadvantage.',
    description: `Apply Adhesion directly to other living beings.

**Effect:** Use Adhesion on characters. When Lashed to something larger, they become Restrained with disadvantage on physical tests.`,
  },
  {
    id: 4008,
    radiantOrderId: 1,
    surgeId: 1,
    code: 'superior-bond',
    name: 'Superior Bond',
    isKey: false,
    prerequisites: [
      { type: 'talent', talentId: 4006, description: 'Adhesive Trap or Extended Adhesion' },
    ],
    descriptionShort: 'Auto-succeed vs low Strength characters breaking your Lashings.',
    description: `Your Full Lashings can be broken only by the strongest.

**Effect:** If a character's Strength is <= your Adhesion ranks, automatically succeed when they try to break your Lashing.`,
  },
];

// ============================================================================
// GRAVITATION SURGE TALENTS (surgeId: 2)
// ============================================================================

const gravitationSurgeTalents: Talent[] = [
  {
    id: 4101,
    radiantOrderId: 1,
    surgeId: 2,
    code: 'flying-ace',
    name: 'Flying Ace',
    isKey: false,
    prerequisites: [{ type: 'narrative', description: 'Speak the First Ideal' }],
    descriptionShort: 'Fly + melee attack; gravitation rate increases to 40 feet.',
    description: `You are a master of the skies.

**Effect:** While Lashing yourself, fly up to your gravitation rate. Spend 1 focus for a melee attack during movement. Gravitation rate increases to 40 feet.`,
  },
  {
    id: 4102,
    radiantOrderId: 1,
    surgeId: 2,
    code: 'gravitational-slam',
    name: 'Gravitational Slam',
    isKey: false,
    prerequisites: [{ type: 'narrative', description: 'Speak the First Ideal' }],
    descriptionShort: 'Deal 1d4 impact damage per 10 feet moved when Lashing into surfaces.',
    description: `Your Basic Lashings become more forceful.

**Effect:** When moving an unwilling target into a surface, deal 1d4 impact damage per 10 feet moved. Damage dice increase with Gravitation ranks (1d6 at 2, 1d8 at 3, etc.).`,
  },
  {
    id: 4103,
    radiantOrderId: 1,
    surgeId: 2,
    code: 'stable-flight',
    name: 'Stable Flight',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 4101 }],
    descriptionShort: 'No ranged disadvantage while flying.',
    description: `You're an expert in launching attacks from afar in mid-flight.

**Effect:** While Lashing yourself, ranged attacks don't have disadvantage due to flying.`,
  },
  {
    id: 4104,
    radiantOrderId: 1,
    surgeId: 2,
    code: 'multiple-lashings',
    name: 'Multiple Lashings',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 4102 }],
    descriptionShort: 'Infuse unwilling targets with multiple Investiture; effect continues.',
    description: `Apply multiple Basic Lashings to an enemy.

**Effect:** After succeeding on Gravitation vs unwilling character, infuse up to your Gravitation ranks in Investiture. Effect continues until infusion ends.`,
  },
  {
    id: 4105,
    radiantOrderId: 1,
    surgeId: 2,
    code: 'lashing-shot',
    name: 'Lashing Shot',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 4102 }],
    descriptionShort: 'Propel object at target; deal 2d4 impact damage.',
    description: `Apply multiple Lashings to an object, launching it forcefully.

**Effect:** Touch an object and propel it at a target. Make a ranged Gravitation attack dealing 2d4 impact damage. Damage dice increase with Gravitation ranks.`,
  },
  {
    id: 4106,
    radiantOrderId: 1,
    surgeId: 2,
    code: 'group-flight',
    name: 'Group Flight',
    isKey: false,
    prerequisites: [{ type: 'talent', talentId: 4103 }],
    descriptionShort: 'Infuse multiple allies with flight out of combat.',
    description: `Infuse multiple allies with Gravitation at once.

**Effect:** While not in combat, when Lashing yourself or an ally, also infuse up to your Gravitation ranks in additional allies within reach. No additional Investiture needed.`,
  },
  {
    id: 4107,
    radiantOrderId: 1,
    surgeId: 2,
    code: 'aerial-squadron',
    name: 'Aerial Squadron',
    isKey: false,
    prerequisites: [
      { type: 'narrative', description: 'Gravitation 3+' },
      { type: 'talent', talentId: 4106 },
    ],
    descriptionShort: 'Group Flight works in combat.',
    description: `You've trained your allies in aerial combat scenarios.

**Effect:** You can use Group Flight in combat.`,
  },
  {
    id: 4108,
    radiantOrderId: 1,
    surgeId: 2,
    code: 'master-of-the-skies',
    name: 'Master of the Skies',
    isKey: false,
    prerequisites: [
      { type: 'talent', talentId: 4106, description: 'Group Flight or Lashing Shot' },
    ],
    descriptionShort: 'Always infused with Gravitation while you have 1+ Investiture.',
    description: `You've become so efficient at infusing yourself with Gravitation.

**Effect:** While you have 1+ Investiture, gain the benefits of being infused with Gravitation without spending Investiture.`,
  },
];

// ============================================================================
// COMBINED TALENTS EXPORT
// ============================================================================

export const talents: Talent[] = [
  // Agent Path
  agentKeyTalent,
  ...investigatorTalents,
  ...spyTalents,
  ...thiefTalents,

  // Scholar Path
  scholarKeyTalent,
  ...artifabrianTalents,
  ...strategistTalents,
  ...surgeonTalents,

  // Warrior Path
  warriorKeyTalent,
  ...duelistTalents,
  ...shardbearerTalents,
  ...soldierTalents,

  // Singer Ancestry
  ...singerTalents,

  // Windrunner Radiant Order
  ...windrunnerTalents,

  // Adhesion Surge
  ...adhesionSurgeTalents,

  // Gravitation Surge
  ...gravitationSurgeTalents,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// O(1) lookup maps for frequently accessed data
const talentById = new Map<number, Talent>(talents.map((t) => [t.id, t]));
const talentByCode = new Map<string, Talent>(talents.map((t) => [t.code, t]));

// Pre-computed indexes for frequently filtered lookups
const talentsByPath = new Map<number, Talent[]>();
const talentsByAncestry = new Map<number, Talent[]>();
const talentsByRadiantOrder = new Map<number, Talent[]>();
const keyTalentsByPath = new Map<number, Talent>();
const keyTalentsByAncestry = new Map<number, Talent>();

// Build indexes on module load
for (const talent of talents) {
  if (talent.pathId !== undefined) {
    const existing = talentsByPath.get(talent.pathId) ?? [];
    existing.push(talent);
    talentsByPath.set(talent.pathId, existing);
    if (talent.isKey && !talent.specialtyId) {
      keyTalentsByPath.set(talent.pathId, talent);
    }
  }
  if (talent.ancestryId !== undefined) {
    const existing = talentsByAncestry.get(talent.ancestryId) ?? [];
    existing.push(talent);
    talentsByAncestry.set(talent.ancestryId, existing);
    if (talent.isKey) {
      keyTalentsByAncestry.set(talent.ancestryId, talent);
    }
  }
  if (talent.radiantOrderId !== undefined) {
    const existing = talentsByRadiantOrder.get(talent.radiantOrderId) ?? [];
    existing.push(talent);
    talentsByRadiantOrder.set(talent.radiantOrderId, existing);
  }
}

/**
 * Get a talent by its ID (O(1) lookup)
 */
export function getTalentById(id: number): Talent | undefined {
  return talentById.get(id);
}

/**
 * Get a talent by its code (O(1) lookup)
 */
export function getTalentByCode(code: string): Talent | undefined {
  return talentByCode.get(code);
}

/**
 * Get all talents for a specific path (O(1) lookup from pre-computed index)
 */
export function getTalentsByPath(pathId: number): Talent[] {
  return talentsByPath.get(pathId) ?? [];
}

/**
 * Get all talents for a specific specialty
 */
export function getTalentsBySpecialty(specialtyId: number): Talent[] {
  return talents.filter((t) => t.specialtyId === specialtyId);
}

/**
 * Get all talents for a specific ancestry (O(1) lookup from pre-computed index)
 */
export function getTalentsByAncestry(ancestryId: number): Talent[] {
  return talentsByAncestry.get(ancestryId) ?? [];
}

/**
 * Get all talents for a specific Radiant order (O(1) lookup from pre-computed index)
 */
export function getTalentsByRadiantOrder(radiantOrderId: number): Talent[] {
  return talentsByRadiantOrder.get(radiantOrderId) ?? [];
}

/**
 * Get all talents for a specific surge
 */
export function getTalentsBySurge(surgeId: number): Talent[] {
  return talents.filter((t) => t.surgeId === surgeId);
}

/**
 * Get the key talent for a path (O(1) lookup from pre-computed index)
 */
export function getPathKeyTalent(pathId: number): Talent | undefined {
  return keyTalentsByPath.get(pathId);
}

/**
 * Get the key talent for an ancestry (O(1) lookup from pre-computed index)
 */
export function getAncestryKeyTalent(ancestryId: number): Talent | undefined {
  return keyTalentsByAncestry.get(ancestryId);
}

/**
 * Get the key talent for a Radiant order
 */
export function getRadiantOrderKeyTalent(radiantOrderId: number): Talent | undefined {
  return talents.find((t) => t.radiantOrderId === radiantOrderId && t.isKey);
}

/**
 * Check if a character meets a single prerequisite
 */
function checkSinglePrerequisite(
  prereq: TalentPrerequisite,
  characterTalentIds: number[],
  characterSkills: Map<number, number>,
  checkNarrative?: (description: string) => boolean
): boolean {
  switch (prereq.type) {
    case 'talent':
      // Single talent requirement (AND logic)
      if (prereq.talentId !== undefined) {
        return characterTalentIds.includes(prereq.talentId);
      }
      // Multiple talents requirement (OR logic - any of these)
      if (prereq.talentIds !== undefined && prereq.talentIds.length > 0) {
        return prereq.talentIds.some((id) => characterTalentIds.includes(id));
      }
      return true;

    case 'skill':
      if (prereq.skillId !== undefined && prereq.skillRank !== undefined) {
        const currentRank = characterSkills.get(prereq.skillId) ?? 0;
        return currentRank >= prereq.skillRank;
      }
      return true;

    case 'narrative':
      // Narrative prerequisites require GM adjudication
      return checkNarrative ? checkNarrative(prereq.description || '') : false;

    default:
      return true;
  }
}

/**
 * Check if a character meets all talent prerequisites
 * @param talent The talent to check
 * @param characterTalentIds Array of talent IDs the character already has
 * @param characterSkills Map of skill ID to rank
 * @param checkNarrative Optional callback to verify narrative requirements
 * @returns Object with met status and unmet prerequisites
 */
export function checkTalentPrerequisites(
  talent: Talent,
  characterTalentIds: number[],
  characterSkills: Map<number, number>,
  checkNarrative?: (description: string) => boolean
): { met: boolean; unmetPrereqs: TalentPrerequisite[] } {
  if (!talent.prerequisites || !Array.isArray(talent.prerequisites)) {
    return { met: true, unmetPrereqs: [] };
  }

  const unmetPrereqs: TalentPrerequisite[] = [];

  for (const prereq of talent.prerequisites) {
    if (!checkSinglePrerequisite(prereq, characterTalentIds, characterSkills, checkNarrative)) {
      unmetPrereqs.push(prereq);
    }
  }

  return { met: unmetPrereqs.length === 0, unmetPrereqs };
}

/**
 * Get all available talents for a character based on their current talents, skills, and filters
 * @param characterTalentIds Array of talent IDs the character already has
 * @param characterSkills Map of skill ID to rank
 * @param options Filter options for path, ancestry, radiant order
 * @param checkNarrative Optional callback for narrative prerequisites
 */
export function getAvailableTalents(
  characterTalentIds: number[],
  characterSkills: Map<number, number>,
  options?: {
    pathId?: number;
    specialtyId?: number;
    ancestryId?: number;
    radiantOrderId?: number;
    surgeId?: number;
    includeAcquired?: boolean;
  },
  checkNarrative?: (description: string) => boolean
): Talent[] {
  return talents.filter((talent) => {
    // Skip talents already acquired unless explicitly included
    if (!options?.includeAcquired && characterTalentIds.includes(talent.id)) {
      return false;
    }

    // Filter by path if specified (only include path talents matching the filter)
    if (options?.pathId !== undefined) {
      if (talent.pathId && talent.pathId !== options.pathId) {
        return false;
      }
    }

    // Filter by specialty if specified
    if (options?.specialtyId !== undefined) {
      if (talent.specialtyId && talent.specialtyId !== options.specialtyId) {
        return false;
      }
    }

    // Include ancestry talents only if matching
    if (talent.ancestryId) {
      if (options?.ancestryId === undefined || talent.ancestryId !== options.ancestryId) {
        return false;
      }
    }

    // Include Radiant talents only if matching
    if (talent.radiantOrderId) {
      if (
        options?.radiantOrderId === undefined ||
        talent.radiantOrderId !== options.radiantOrderId
      ) {
        return false;
      }
    }

    // Filter by surge if specified
    if (options?.surgeId !== undefined) {
      if (talent.surgeId && talent.surgeId !== options.surgeId) {
        return false;
      }
    }

    // Check prerequisites (key talents have no prerequisites, except narrative ones)
    if (talent.isKey && (!talent.prerequisites || talent.prerequisites.length === 0)) {
      return true;
    }

    const { met } = checkTalentPrerequisites(
      talent,
      characterTalentIds,
      characterSkills,
      checkNarrative
    );
    return met;
  });
}

/**
 * Get talent tree for a path, organized by specialty
 */
export function getPathTalentTree(pathId: number): {
  keyTalent: Talent | undefined;
  specialties: Map<number, Talent[]>;
  generalTalents: Talent[];
} {
  const pathTalents = getTalentsByPath(pathId);
  const keyTalent = pathTalents.find((t) => t.isKey && !t.specialtyId);
  const specialties = new Map<number, Talent[]>();
  const generalTalents: Talent[] = [];

  for (const talent of pathTalents) {
    if (talent.isKey && !talent.specialtyId) continue;

    if (talent.specialtyId) {
      const existing = specialties.get(talent.specialtyId) || [];
      existing.push(talent);
      specialties.set(talent.specialtyId, existing);
    } else {
      generalTalents.push(talent);
    }
  }

  return { keyTalent, specialties, generalTalents };
}

/**
 * Get the prerequisite chain for a talent (all talents needed to unlock it)
 */
export function getTalentPrerequisiteChain(talentId: number): Talent[] {
  const chain: Talent[] = [];
  const visited = new Set<number>();

  function collectPrereqs(id: number) {
    if (visited.has(id)) return;
    visited.add(id);

    const talent = getTalentById(id);
    if (!talent) return;

    if (talent.prerequisites && Array.isArray(talent.prerequisites)) {
      for (const prereq of talent.prerequisites) {
        if (prereq.type === 'talent') {
          // Handle single talentId
          if (prereq.talentId) {
            collectPrereqs(prereq.talentId);
          }
          // Handle OR logic with talentIds array (include all possible paths)
          if (prereq.talentIds?.length) {
            for (const prereqTalentId of prereq.talentIds) {
              collectPrereqs(prereqTalentId);
            }
          }
        }
      }
    }

    chain.push(talent);
  }

  collectPrereqs(talentId);
  return chain;
}

/**
 * Format prerequisite for display
 */
export function formatPrerequisite(prereq: TalentPrerequisite): string {
  switch (prereq.type) {
    case 'talent': {
      if (prereq.description) return prereq.description;
      // Handle OR logic with talentIds
      if (prereq.talentIds?.length) {
        const names = prereq.talentIds
          .map((id) => getTalentById(id)?.name)
          .filter(Boolean)
          .join(' or ');
        return names || 'Unknown talents';
      }
      const talent = prereq.talentId !== undefined ? getTalentById(prereq.talentId) : undefined;
      return talent ? talent.name : 'Unknown talent';
    }
    case 'skill': {
      const skill = prereq.skillId ? getSkillById(prereq.skillId) : undefined;
      const skillName = skill?.name || `Skill ${prereq.skillId}`;
      return `${skillName} ${prereq.skillRank}+`;
    }
    case 'narrative':
      return prereq.description || 'Special requirement';
    default:
      return prereq.description || 'Unknown requirement';
  }
}
