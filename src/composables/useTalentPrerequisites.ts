import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById } from 'src/utils/arrayUtils';
import type { Talent, TalentPrerequisite } from 'src/types';

/**
 * Talent with prerequisite status information
 */
export interface TalentWithStatus {
  talent: Talent;
  available: boolean;
  unmetPrereqs: TalentPrerequisite[];
}

/**
 * Composable for talent prerequisite checking and formatting.
 * Provides reactive access to hero talents, skills, and prerequisite validation.
 */
export function useTalentPrerequisites() {
  const heroStore = useHeroStore();
  const talentStore = useHeroTalentsStore();
  const classifiers = useClassifierStore();

  // Hero's selected talent IDs as Set for O(1) lookups
  const heroTalentIds = computed(() => new Set(heroStore.talents.map((t) => t.talent.id)));

  // Build character skills map from hero
  const characterSkills = computed(() => {
    const skills = new Map<number, number>();
    for (const skill of heroStore.skills) {
      skills.set(skill.skill.id, skill.rank);
    }
    return skills;
  });

  // Hero level
  const heroLevel = computed(() => heroStore.hero?.level ?? 1);

  /**
   * Check if all prerequisites for a talent are met
   */
  function checkTalentPrerequisites(
    talent: Talent,
    selectedTalentIds: Set<number>,
    skills: Map<number, number>
  ): { met: boolean; unmetPrereqs: TalentPrerequisite[] } {
    if (!talent.prerequisites || talent.prerequisites.length === 0) {
      return { met: true, unmetPrereqs: [] };
    }

    const unmetPrereqs: TalentPrerequisite[] = [];

    for (const prereq of talent.prerequisites) {
      let isMet = false;

      switch (prereq.type) {
        case 'talent':
          if (prereq.codes?.length) {
            isMet = prereq.codes.some((ref) => selectedTalentIds.has(ref.id));
          }
          break;
        case 'skill':
          if (prereq.codes?.length && prereq.value !== undefined) {
            const skillId = prereq.codes[0]!.id;
            const currentRank = skills.get(skillId) ?? 0;
            isMet = currentRank >= prereq.value;
          }
          break;
        case 'level':
          isMet = heroLevel.value >= (prereq.value ?? 0);
          break;
        case 'narrative':
          isMet = true;
          break;
        default:
          isMet = true;
      }

      if (!isMet) {
        unmetPrereqs.push(prereq);
      }
    }

    return { met: unmetPrereqs.length === 0, unmetPrereqs };
  }

  /**
   * Map talents to TalentWithStatus using current hero state
   */
  function mapTalentsWithStatus(talents: Talent[]): TalentWithStatus[] {
    return talents.map((talent) => {
      const { met, unmetPrereqs } = checkTalentPrerequisites(
        talent,
        heroTalentIds.value,
        characterSkills.value
      );
      return { talent, available: met, unmetPrereqs };
    });
  }

  /**
   * Toggle a talent selection (add or remove from hero)
   */
  function toggleTalent(talentId: number, available: boolean) {
    if (heroTalentIds.value.has(talentId)) {
      talentStore.removeTalent(talentId);
    } else if (available) {
      talentStore.addTalent(talentId);
    }
  }

  /**
   * Check if a talent is currently selected
   */
  function isTalentSelected(talentId: number): boolean {
    return heroTalentIds.value.has(talentId);
  }

  // Talent lookup helpers
  function getTalentsByPath(pathId: number): Talent[] {
    return classifiers.talents.filter((t) => t.path?.id === pathId && t.specialties.length === 0);
  }

  function getTalentsBySpecialty(specialtyId: number): Talent[] {
    return classifiers.talents.filter((t) => t.specialties.some((s) => s.id === specialtyId));
  }

  function getPathKeyTalent(pathId: number): Talent | undefined {
    return classifiers.talents.find((t) => t.path?.id === pathId && t.isKey);
  }

  function getTalentsByAncestry(ancestryId: number): Talent[] {
    return classifiers.talents.filter((t) => t.ancestry?.id === ancestryId);
  }

  function getAncestryKeyTalent(ancestryId: number): Talent | undefined {
    return classifiers.talents.find((t) => t.ancestry?.id === ancestryId && t.isKey);
  }

  function getTalentsByRadiantOrder(orderId: number): Talent[] {
    return classifiers.talents.filter((t) => t.radiantOrder?.id === orderId && !t.surge);
  }

  function getRadiantOrderKeyTalent(orderId: number): Talent | undefined {
    return classifiers.talents.find((t) => t.radiantOrder?.id === orderId && t.isKey);
  }

  function getTalentsBySurge(surgeId: number): Talent[] {
    return classifiers.talents.filter((t) => t.surge?.id === surgeId);
  }

  function getSpecialtiesByPath(pathId: number) {
    return classifiers.specialties.filter((s) => s.path.id === pathId);
  }

  function getPrerequisitesArray(talent: Talent): TalentPrerequisite[] {
    return talent.prerequisites ?? [];
  }

  return {
    // State
    heroTalentIds,
    characterSkills,
    heroLevel,

    // Prerequisite checking
    checkTalentPrerequisites,
    mapTalentsWithStatus,
    getPrerequisitesArray,

    // Talent actions
    toggleTalent,
    isTalentSelected,

    // Talent lookups
    getTalentsByPath,
    getTalentsBySpecialty,
    getPathKeyTalent,
    getTalentsByAncestry,
    getAncestryKeyTalent,
    getTalentsByRadiantOrder,
    getRadiantOrderKeyTalent,
    getTalentsBySurge,
    getSpecialtiesByPath,

    // Re-export findById for convenience
    findById,
  };
}
