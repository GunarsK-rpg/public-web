import { describe, it, expect } from 'vitest';
import {
  formatPrerequisite,
  createPrerequisiteFormatter,
  type PrerequisiteLookups,
} from './talentUtils';
import type { TalentPrerequisite, Talent, Skill } from 'src/types';

// =============================================================================
// Test Fixtures
// =============================================================================

const createTalent = (overrides: Partial<Talent> = {}): Talent => ({
  id: 1,
  code: 'test_talent',
  name: 'Test Talent',
  isKey: false,
  ...overrides,
});

const createSkill = (overrides: Partial<Skill> = {}): Skill => ({
  id: 1,
  code: 'athletics',
  name: 'Athletics',
  attrId: 1,
  ...overrides,
});

const createLookups = (
  talents: { id: number; name: string }[] = [],
  skills: { id: number; name: string }[] = []
): PrerequisiteLookups => ({
  getTalent: (id) => talents.find((t) => t.id === id),
  getSkill: (id) => skills.find((s) => s.id === id),
});

// =============================================================================
// formatPrerequisite - Prerequisite Display Formatting
// =============================================================================

describe('formatPrerequisite', () => {
  // ---------------------------------------------------------------------------
  // Talent Prerequisites
  // ---------------------------------------------------------------------------
  describe('talent type', () => {
    it('formats single talent prerequisite', () => {
      const prereq: TalentPrerequisite = {
        type: 'talent',
        talentIds: [1],
      };
      const lookups = createLookups([{ id: 1, name: 'Power Attack' }]);

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Power Attack');
    });

    it('formats multiple talents with OR logic', () => {
      const prereq: TalentPrerequisite = {
        type: 'talent',
        talentIds: [1, 2, 3],
      };
      const lookups = createLookups([
        { id: 1, name: 'Talent A' },
        { id: 2, name: 'Talent B' },
        { id: 3, name: 'Talent C' },
      ]);

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Talent A or Talent B or Talent C');
    });

    it('uses description when provided', () => {
      const prereq: TalentPrerequisite = {
        type: 'talent',
        talentIds: [1],
        description: 'Any combat talent',
      };
      const lookups = createLookups([{ id: 1, name: 'Power Attack' }]);

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Any combat talent');
    });

    it('returns "Unknown talents" when no talents found', () => {
      const prereq: TalentPrerequisite = {
        type: 'talent',
        talentIds: [999],
      };
      const lookups = createLookups([]);

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Unknown talents');
    });

    it('returns "Unknown talent" when no talentIds provided', () => {
      const prereq: TalentPrerequisite = {
        type: 'talent',
      };
      const lookups = createLookups();

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Unknown talent');
    });

    it('filters out unfound talents in OR list', () => {
      const prereq: TalentPrerequisite = {
        type: 'talent',
        talentIds: [1, 999, 2],
      };
      const lookups = createLookups([
        { id: 1, name: 'Found Talent' },
        { id: 2, name: 'Another Found' },
      ]);

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Found Talent or Another Found');
    });
  });

  // ---------------------------------------------------------------------------
  // Skill Prerequisites
  // ---------------------------------------------------------------------------
  describe('skill type', () => {
    it('formats skill prerequisite with rank', () => {
      const prereq: TalentPrerequisite = {
        type: 'skill',
        skillId: 1,
        skillRank: 3,
      };
      const lookups = createLookups([], [{ id: 1, name: 'Athletics' }]);

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Athletics 3+');
    });

    it('handles missing skill gracefully', () => {
      const prereq: TalentPrerequisite = {
        type: 'skill',
        skillId: 999,
        skillRank: 2,
      };
      const lookups = createLookups();

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Unknown skill 2+');
    });

    it('defaults rank to 0 when not provided', () => {
      const prereq: TalentPrerequisite = {
        type: 'skill',
        skillId: 1,
      };
      const lookups = createLookups([], [{ id: 1, name: 'Stealth' }]);

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Stealth 0+');
    });

    it('handles undefined skillId', () => {
      const prereq: TalentPrerequisite = {
        type: 'skill',
        skillRank: 2,
      };
      const lookups = createLookups();

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Unknown skill 2+');
    });
  });

  // ---------------------------------------------------------------------------
  // Ideal, Level, Narrative Prerequisites
  // ---------------------------------------------------------------------------
  describe('ideal type', () => {
    it('formats ideal prerequisite', () => {
      const prereq: TalentPrerequisite = {
        type: 'ideal',
        skillRank: 3,
      };
      const lookups = createLookups();

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Ideal 3+');
    });

    it('defaults to 0 when rank not provided', () => {
      const prereq: TalentPrerequisite = {
        type: 'ideal',
      };
      const lookups = createLookups();

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Ideal 0+');
    });
  });

  describe('level type', () => {
    it('formats level prerequisite', () => {
      const prereq: TalentPrerequisite = {
        type: 'level',
        skillRank: 5,
      };
      const lookups = createLookups();

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Level 5+');
    });

    it('defaults to 0 when rank not provided', () => {
      const prereq: TalentPrerequisite = {
        type: 'level',
      };
      const lookups = createLookups();

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Level 0+');
    });
  });

  describe('narrative type', () => {
    it('formats narrative with description', () => {
      const prereq: TalentPrerequisite = {
        type: 'narrative',
        description: 'Must have sworn the First Ideal',
      };
      const lookups = createLookups();

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Must have sworn the First Ideal');
    });

    it('returns default when no description', () => {
      const prereq: TalentPrerequisite = {
        type: 'narrative',
      };
      const lookups = createLookups();

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Special requirement');
    });
  });

  // ---------------------------------------------------------------------------
  // Unknown Types & Edge Cases
  // ---------------------------------------------------------------------------
  describe('unknown type', () => {
    it('uses description for unknown type', () => {
      const prereq = {
        type: 'custom_type',
        description: 'Custom requirement text',
      } as unknown as TalentPrerequisite;
      const lookups = createLookups();

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Custom requirement text');
    });

    it('returns default for unknown type without description', () => {
      const prereq = {
        type: 'unknown_type',
      } as unknown as TalentPrerequisite;
      const lookups = createLookups();

      const result = formatPrerequisite(prereq, lookups);

      expect(result).toBe('Unknown requirement');
    });
  });
});

// =============================================================================
// createPrerequisiteFormatter - Factory Function
// =============================================================================

describe('createPrerequisiteFormatter', () => {
  it('creates a working formatter function', () => {
    const talents = [createTalent({ id: 1, name: 'Power Strike' })];
    const skills = [createSkill({ id: 1, name: 'Athletics' })];

    const format = createPrerequisiteFormatter(talents, skills);

    expect(typeof format).toBe('function');
  });

  it('formatter uses provided talents for lookup', () => {
    const talents = [
      createTalent({ id: 1, name: 'Talent One' }),
      createTalent({ id: 2, name: 'Talent Two' }),
    ];
    const skills: Skill[] = [];

    const format = createPrerequisiteFormatter(talents, skills);
    const result = format({ type: 'talent', talentIds: [2] });

    expect(result).toBe('Talent Two');
  });

  it('formatter uses provided skills for lookup', () => {
    const talents: Talent[] = [];
    const skills = [
      createSkill({ id: 10, name: 'Stealth' }),
      createSkill({ id: 20, name: 'Intimidation' }),
    ];

    const format = createPrerequisiteFormatter(talents, skills);
    const result = format({ type: 'skill', skillId: 20, skillRank: 2 });

    expect(result).toBe('Intimidation 2+');
  });

  it('formatter handles missing lookups gracefully', () => {
    const format = createPrerequisiteFormatter([], []);

    const result = format({ type: 'talent', talentIds: [999] });

    expect(result).toBe('Unknown talents');
  });

  it('formatter works with multiple prerequisite types', () => {
    const talents = [createTalent({ id: 1, name: 'Base Talent' })];
    const skills = [createSkill({ id: 1, name: 'Combat' })];

    const format = createPrerequisiteFormatter(talents, skills);

    expect(format({ type: 'talent', talentIds: [1] })).toBe('Base Talent');
    expect(format({ type: 'skill', skillId: 1, skillRank: 3 })).toBe('Combat 3+');
    expect(format({ type: 'ideal', skillRank: 2 })).toBe('Ideal 2+');
    expect(format({ type: 'level', skillRank: 10 })).toBe('Level 10+');
    expect(format({ type: 'narrative', description: 'Story requirement' })).toBe(
      'Story requirement'
    );
  });
});
