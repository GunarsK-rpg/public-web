import type { TalentPrerequisite } from 'src/types/talents';

/**
 * Formats a talent prerequisite for display.
 * Prerequisites are enriched by get_talents -- codes are ClassifierRef objects.
 */
export function formatPrerequisite(prereq: TalentPrerequisite): string {
  switch (prereq.type) {
    case 'talent': {
      if (prereq.description) return prereq.description;
      if (prereq.codes?.length) {
        return prereq.codes.map((t) => t.name).join(' or ') || 'Unknown talents';
      }
      return 'Unknown talent';
    }

    case 'skill': {
      const skillName = prereq.codes?.[0]?.name ?? 'Unknown skill';
      return `${skillName} ${prereq.value ?? 0}+`;
    }

    case 'level':
      return `Level ${prereq.value ?? 0}+`;

    case 'narrative':
      return prereq.description ?? 'Special requirement';

    default:
      return prereq.description ?? 'Unknown requirement';
  }
}
