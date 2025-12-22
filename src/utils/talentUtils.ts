import type { TalentPrerequisite, Talent } from 'src/types/talents';
import type { Skill } from 'src/types';

/**
 * Lookup functions for formatting prerequisites.
 * Allows dependency injection for use with different data sources.
 */
export interface PrerequisiteLookups {
  getTalent: (id: number) => { name: string } | undefined;
  getSkill: (id: number) => { name: string } | undefined;
}

/**
 * Formats a talent prerequisite for display.
 *
 * @param prereq - The prerequisite to format
 * @param lookups - Lookup functions for talents and skills
 * @returns Formatted prerequisite string
 */
export function formatPrerequisite(
  prereq: TalentPrerequisite,
  lookups: PrerequisiteLookups
): string {
  switch (prereq.type) {
    case 'talent': {
      // Use description if provided
      if (prereq.description) return prereq.description;

      // Handle OR logic with talentIds
      if (prereq.talentIds?.length) {
        const names = prereq.talentIds
          .map((id) => lookups.getTalent(id)?.name)
          .filter(Boolean)
          .join(' or ');
        return names || 'Unknown talents';
      }

      // Single talent
      const talent = prereq.talentId !== undefined ? lookups.getTalent(prereq.talentId) : undefined;
      return talent?.name ?? 'Unknown talent';
    }

    case 'skill': {
      const skill = prereq.skillId ? lookups.getSkill(prereq.skillId) : undefined;
      const skillName = skill?.name ?? 'Unknown skill';
      return `${skillName} ${prereq.skillRank ?? 0}+`;
    }

    case 'ideal':
      return `Ideal ${prereq.skillRank ?? 0}+`;

    case 'level':
      return `Level ${prereq.skillRank ?? 0}+`;

    case 'narrative':
      return prereq.description ?? 'Special requirement';

    default:
      return prereq.description ?? 'Unknown requirement';
  }
}

/**
 * Creates a prerequisite formatter bound to classifier store lookups.
 *
 * @param talents - Array of talents from classifier store
 * @param skills - Array of skills from classifier store
 * @returns Function that formats prerequisites
 */
export function createPrerequisiteFormatter(talents: Talent[], skills: Skill[]) {
  const lookups: PrerequisiteLookups = {
    getTalent: (id) => talents.find((t) => t.id === id),
    getSkill: (id) => skills.find((s) => s.id === id),
  };

  return (prereq: TalentPrerequisite) => formatPrerequisite(prereq, lookups);
}
