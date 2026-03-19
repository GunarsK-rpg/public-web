import type { Talent, TalentPrerequisite } from 'src/types/talents';
import type { Specialty } from 'src/types/paths';

/**
 * Formats a talent prerequisite for display.
 * Prerequisites are enriched by get_talents -- codes are ClassifierRef objects.
 */
export function formatPrerequisite(prereq: TalentPrerequisite): string {
  switch (prereq.type) {
    case 'talent': {
      if (prereq.description) return prereq.description;
      if (prereq.codes?.length) {
        return [...new Set(prereq.codes.map((t) => t.name))].join(' or ') || 'Unknown talents';
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

/** Build a Map of specialty ID -> path ID for quick lookups. */
export function buildSpecialtyPathMap(specialties: Specialty[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const s of specialties) {
    map.set(s.id, s.path.id);
  }
  return map;
}

/** Resolve a talent's path ID (direct path or via specialty -> path). */
export function getTalentPathId(
  talent: Pick<Talent, 'path' | 'specialties'>,
  specialtyPathMap: Map<number, number>
): number | null {
  if (talent.path) return talent.path.id;
  for (const s of talent.specialties) {
    const pathId = specialtyPathMap.get(s.id);
    if (pathId !== undefined) return pathId;
  }
  return null;
}

/** Check if a talent belongs to a path (direct or via specialty). */
export function talentBelongsToPath(
  talent: Pick<Talent, 'path' | 'specialties'>,
  pathId: number,
  specialtyPathMap: Map<number, number>
): boolean {
  if (talent.path?.id === pathId) return true;
  return talent.specialties.some((s) => specialtyPathMap.get(s.id) === pathId);
}
