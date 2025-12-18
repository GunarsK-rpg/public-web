import type { Skill } from 'src/types';

/**
 * Skills - attrId references attributes.id:
 * 1=Strength, 2=Speed, 3=Intellect, 4=Willpower, 5=Awareness, 6=Presence
 */
export const skills: Skill[] = [
  // Physical (attrTypeId 1)
  {
    id: 1,
    code: 'agility',
    name: 'Agility',
    attrId: 2, // Speed
  },
  {
    id: 2,
    code: 'athletics',
    name: 'Athletics',
    attrId: 1, // Strength
  },
  {
    id: 3,
    code: 'heavy-weaponry',
    name: 'Heavy Weaponry',
    attrId: 1, // Strength
  },
  {
    id: 4,
    code: 'light-weaponry',
    name: 'Light Weaponry',
    attrId: 2, // Speed
  },
  {
    id: 5,
    code: 'stealth',
    name: 'Stealth',
    attrId: 2, // Speed
  },
  {
    id: 6,
    code: 'thievery',
    name: 'Thievery',
    attrId: 2, // Speed
  },
  // Cognitive (attrTypeId 2)
  {
    id: 7,
    code: 'crafting',
    name: 'Crafting',
    attrId: 3, // Intellect
  },
  {
    id: 8,
    code: 'deduction',
    name: 'Deduction',
    attrId: 3, // Intellect
  },
  {
    id: 9,
    code: 'discipline',
    name: 'Discipline',
    attrId: 4, // Willpower
  },
  {
    id: 10,
    code: 'intimidation',
    name: 'Intimidation',
    attrId: 4, // Willpower
  },
  {
    id: 11,
    code: 'lore',
    name: 'Lore',
    attrId: 3, // Intellect
  },
  {
    id: 12,
    code: 'medicine',
    name: 'Medicine',
    attrId: 3, // Intellect
  },
  // Spiritual (attrTypeId 3)
  {
    id: 13,
    code: 'deception',
    name: 'Deception',
    attrId: 6, // Presence
  },
  {
    id: 14,
    code: 'insight',
    name: 'Insight',
    attrId: 5, // Awareness
  },
  {
    id: 15,
    code: 'leadership',
    name: 'Leadership',
    attrId: 6, // Presence
  },
  {
    id: 16,
    code: 'perception',
    name: 'Perception',
    attrId: 5, // Awareness
  },
  {
    id: 17,
    code: 'persuasion',
    name: 'Persuasion',
    attrId: 6, // Presence
  },
  {
    id: 18,
    code: 'survival',
    name: 'Survival',
    attrId: 5, // Awareness
  },
];

// O(1) lookup maps for frequently accessed data
const skillById = new Map<number, Skill>(skills.map((s) => [s.id, s]));
const skillByCode = new Map<string, Skill>(skills.map((s) => [s.code, s]));

/**
 * Helper to get skill by ID (O(1) lookup)
 */
export function getSkillById(id: number): Skill | undefined {
  return skillById.get(id);
}

/**
 * Helper to get skill by code (O(1) lookup)
 */
export function getSkillByCode(code: string): Skill | undefined {
  return skillByCode.get(code);
}

/**
 * Helper to get skills by attribute ID
 */
export function getSkillsByAttrId(attrId: number): Skill[] {
  return skills.filter((s) => s.attrId === attrId);
}
