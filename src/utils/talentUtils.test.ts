import { describe, it, expect } from 'vitest';
import { formatPrerequisite } from './talentUtils';
import type { TalentPrerequisite } from 'src/types';

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
        codes: [{ id: 1, code: 'power_attack', name: 'Power Attack' }],
      };

      const result = formatPrerequisite(prereq);

      expect(result).toBe('Power Attack');
    });

    it('formats multiple talents with OR logic', () => {
      const prereq: TalentPrerequisite = {
        type: 'talent',
        codes: [
          { id: 1, code: 'talent_a', name: 'Talent A' },
          { id: 2, code: 'talent_b', name: 'Talent B' },
          { id: 3, code: 'talent_c', name: 'Talent C' },
        ],
      };

      const result = formatPrerequisite(prereq);

      expect(result).toBe('Talent A or Talent B or Talent C');
    });

    it('uses description when provided', () => {
      const prereq: TalentPrerequisite = {
        type: 'talent',
        codes: [{ id: 1, code: 'power_attack', name: 'Power Attack' }],
        description: 'Any combat talent',
      };

      const result = formatPrerequisite(prereq);

      expect(result).toBe('Any combat talent');
    });

    it('returns "Unknown talent" when no codes provided', () => {
      const prereq: TalentPrerequisite = {
        type: 'talent',
      };

      const result = formatPrerequisite(prereq);

      expect(result).toBe('Unknown talent');
    });

    it('returns "Unknown talent" when codes array is empty', () => {
      const prereq: TalentPrerequisite = {
        type: 'talent',
        codes: [],
      };

      const result = formatPrerequisite(prereq);

      expect(result).toBe('Unknown talent');
    });
  });

  // ---------------------------------------------------------------------------
  // Skill Prerequisites
  // ---------------------------------------------------------------------------
  describe('skill type', () => {
    it('formats skill prerequisite with value', () => {
      const prereq: TalentPrerequisite = {
        type: 'skill',
        codes: [{ id: 1, code: 'athletics', name: 'Athletics' }],
        value: 3,
      };

      const result = formatPrerequisite(prereq);

      expect(result).toBe('Athletics 3+');
    });

    it('handles missing codes gracefully', () => {
      const prereq: TalentPrerequisite = {
        type: 'skill',
        value: 2,
      };

      const result = formatPrerequisite(prereq);

      expect(result).toBe('Unknown skill 2+');
    });

    it('defaults value to 0 when not provided', () => {
      const prereq: TalentPrerequisite = {
        type: 'skill',
        codes: [{ id: 1, code: 'stealth', name: 'Stealth' }],
      };

      const result = formatPrerequisite(prereq);

      expect(result).toBe('Stealth 0+');
    });
  });

  // ---------------------------------------------------------------------------
  // Level and Narrative Prerequisites
  // ---------------------------------------------------------------------------
  describe('level type', () => {
    it('formats level prerequisite', () => {
      const prereq: TalentPrerequisite = {
        type: 'level',
        value: 5,
      };

      const result = formatPrerequisite(prereq);

      expect(result).toBe('Level 5+');
    });

    it('defaults to 0 when value not provided', () => {
      const prereq: TalentPrerequisite = {
        type: 'level',
      };

      const result = formatPrerequisite(prereq);

      expect(result).toBe('Level 0+');
    });
  });

  describe('narrative type', () => {
    it('formats narrative with description', () => {
      const prereq: TalentPrerequisite = {
        type: 'narrative',
        description: 'Must have sworn the First Ideal',
      };

      const result = formatPrerequisite(prereq);

      expect(result).toBe('Must have sworn the First Ideal');
    });

    it('returns default when no description', () => {
      const prereq: TalentPrerequisite = {
        type: 'narrative',
      };

      const result = formatPrerequisite(prereq);

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

      const result = formatPrerequisite(prereq);

      expect(result).toBe('Custom requirement text');
    });

    it('returns default for unknown type without description', () => {
      const prereq = {
        type: 'unknown_type',
      } as unknown as TalentPrerequisite;

      const result = formatPrerequisite(prereq);

      expect(result).toBe('Unknown requirement');
    });
  });
});
