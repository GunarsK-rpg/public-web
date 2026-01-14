import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useHeroStore } from './hero';
import { useClassifierStore } from './classifiers';
import { findById, findByCode, findByProp } from 'src/utils/arrayUtils';
import { calculateFormulaStat } from 'src/utils/derivedStats';
import type { ExpertiseSourceData } from 'src/types';

export const useHeroAttributesStore = defineStore('heroAttributes', () => {
  const heroStore = useHeroStore();
  const classifierStore = useClassifierStore();

  // ===================
  // COMPUTED
  // ===================
  const levelData = computed(() => {
    return findByProp(classifierStore.levels, 'level', heroStore.hero?.level || 1);
  });

  const tierData = computed(() => {
    return findById(classifierStore.tiers, levelData.value?.tierId);
  });

  // ===================
  // ATTRIBUTE LOOKUPS
  // ===================
  function getAttributeValue(attrCode: string): number {
    if (!heroStore.hero?.attributes) return 0;
    const attr = findByCode(classifierStore.attributes, attrCode);
    if (!attr) return 0;
    const heroAttr = heroStore.hero.attributes.find((a) => a.attrId === attr.id);
    return heroAttr?.value || 0;
  }

  function getAttributeValueById(attrId: number): number {
    if (!heroStore.hero?.attributes) return 0;
    const heroAttr = heroStore.hero.attributes.find((a) => a.attrId === attrId);
    return heroAttr?.value || 0;
  }

  function getDefenseValue(attrTypeCode: string): number {
    if (!heroStore.hero?.defenses) return 10;
    const attrType = findByCode(classifierStore.attributeTypes, attrTypeCode);
    if (!attrType) return 10;
    const defense = heroStore.hero.defenses.find((d) => d.attrTypeId === attrType.id);
    return defense?.value || 10;
  }

  // ===================
  // SKILL LOOKUPS
  // ===================
  function getSkillRank(skillId: number): number {
    if (!heroStore.hero?.skills) return 0;
    const skill = heroStore.hero.skills.find((s) => s.skillId === skillId);
    return skill?.rank || 0;
  }

  function getSkillModifier(skillCode: string): number {
    const skillData = findByCode(classifierStore.skills, skillCode);
    if (!skillData || !heroStore.hero) return 0;
    const attrValue = getAttributeValueById(skillData.attrId);
    const rank = getSkillRank(skillData.id);
    return attrValue + rank;
  }

  // ===================
  // DERIVED STATS
  // ===================
  function getHeroDerivedStat(statCode: string) {
    if (!heroStore.hero?.derivedStats) return undefined;
    const stat = findByCode(classifierStore.derivedStats, statCode);
    if (!stat) return undefined;
    return heroStore.hero.derivedStats.find((s) => s.statId === stat.id);
  }

  function getDerivedStatValue(statCode: string): number {
    return getHeroDerivedStat(statCode)?.value ?? 0;
  }

  function getDerivedStatTotal(statCode: string): number {
    const attrs: Record<string, number> = {};
    for (const attr of classifierStore.attributes) {
      attrs[attr.code] = getAttributeValue(attr.code);
    }

    const baseValue = calculateFormulaStat(statCode, attrs, levelData.value, tierData.value);
    const heroStat = getHeroDerivedStat(statCode);
    const modifier = heroStat?.modifier ?? 0;

    return baseValue + modifier;
  }

  function getDerivedStatModifier(statId: number): number {
    if (!heroStore.hero?.derivedStats) return 0;
    const stat = heroStore.hero.derivedStats.find((s) => s.statId === statId);
    return stat?.modifier ?? 0;
  }

  function getDerivedStatDisplay(statCode: string): string {
    const heroStat = getHeroDerivedStat(statCode);
    if (!heroStat) return '';
    const unit = heroStat.unitId
      ? (findById(classifierStore.units, heroStat.unitId)?.code ?? '')
      : '';
    const modifier = heroStat.modifier ?? 0;
    const total = heroStat.value + modifier;
    if (modifier) {
      return `${total}${unit} (${heroStat.value} + ${modifier})`;
    }
    return `${total}${unit}`;
  }

  // ===================
  // MUTATIONS
  // ===================
  function setAttribute(attrId: number, value: number) {
    if (!heroStore.hero) return;
    const existing = heroStore.hero.attributes.find((a) => a.attrId === attrId);
    if (existing) {
      existing.value = value;
    } else {
      heroStore.hero.attributes.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        attrId,
        value,
      });
    }
  }

  function setSkillRank(skillId: number, rank: number) {
    if (!heroStore.hero) return;
    const existing = heroStore.hero.skills.find((s) => s.skillId === skillId);
    if (existing) {
      existing.rank = rank;
    } else {
      heroStore.hero.skills.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        skillId,
        rank,
        modifier: 0,
      });
    }
  }

  function setSkillModifier(skillId: number, modifier: number) {
    if (!heroStore.hero) return;
    const existing = heroStore.hero.skills.find((s) => s.skillId === skillId);
    if (existing) {
      existing.modifier = modifier;
    } else {
      heroStore.hero.skills.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        skillId,
        rank: 0,
        modifier,
      });
    }
  }

  function setDerivedStatModifier(statId: number, modifier: number) {
    if (!heroStore.hero) return;
    const existing = heroStore.hero.derivedStats.find((s) => s.statId === statId);
    if (existing) {
      existing.modifier = modifier;
    } else {
      heroStore.hero.derivedStats.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        statId,
        value: 0,
        modifier,
      });
    }
  }

  function addExpertise(expertiseId: number, source?: ExpertiseSourceData) {
    if (!heroStore.hero) return;
    if (!heroStore.hero.expertises.find((e) => e.expertiseId === expertiseId)) {
      heroStore.hero.expertises.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        expertiseId,
        ...(source && { source }),
      });
    }
  }

  function removeExpertise(expertiseId: number) {
    if (!heroStore.hero) return;
    heroStore.hero.expertises = heroStore.hero.expertises.filter(
      (e) => e.expertiseId !== expertiseId
    );
  }

  return {
    // Computed
    levelData,
    tierData,

    // Attribute lookups
    getAttributeValue,
    getAttributeValueById,
    getDefenseValue,

    // Skill lookups
    getSkillRank,
    getSkillModifier,

    // Derived stats
    getDerivedStatValue,
    getDerivedStatTotal,
    getDerivedStatModifier,
    getDerivedStatDisplay,

    // Mutations
    setAttribute,
    setSkillRank,
    setSkillModifier,
    setDerivedStatModifier,
    addExpertise,
    removeExpertise,
  };
});
