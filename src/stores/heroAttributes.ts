import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useHeroStore } from './hero';
import { useClassifierStore } from './classifiers';
import { findById, findByCode, findByProp, toClassifierRef } from 'src/utils/arrayUtils';
import { calculateFormulaStat } from 'src/utils/derivedStats';
import { MIN_ATTRIBUTE_VALUE, MAX_ATTRIBUTE_VALUE } from 'src/constants';
import { clamp } from 'src/utils/numberUtils';
import type { ExpertiseSourceData } from 'src/types';

export const useHeroAttributesStore = defineStore('heroAttributes', () => {
  const heroStore = useHeroStore();
  const classifierStore = useClassifierStore();

  // ===================
  // COMPUTED
  // ===================
  const levelData = computed(() => {
    return findByProp(classifierStore.levels, 'level', heroStore.hero?.level ?? 1);
  });

  const tierData = computed(() => {
    return findById(classifierStore.tiers, levelData.value?.tier.id);
  });

  // ===================
  // ATTRIBUTE LOOKUPS
  // ===================
  function getAttributeValue(attrCode: string): number {
    if (!heroStore.hero?.attributes) return 0;
    const attr = findByCode(classifierStore.attributes, attrCode);
    if (!attr) return 0;
    const heroAttr = heroStore.hero.attributes.find((a) => a.attribute.id === attr.id);
    return heroAttr?.value ?? 0;
  }

  function getAttributeValueById(attrId: number): number {
    if (!heroStore.hero?.attributes) return 0;
    const heroAttr = heroStore.hero.attributes.find((a) => a.attribute.id === attrId);
    return heroAttr?.value ?? 0;
  }

  function getDefenseValue(attrTypeCode: string): number {
    if (!heroStore.hero?.defenses) return 10;
    const attrType = findByCode(classifierStore.attributeTypes, attrTypeCode);
    if (!attrType) return 10;
    const defense = heroStore.hero.defenses.find((d) => d.attributeType.id === attrType.id);
    return defense?.totalValue ?? 10;
  }

  // ===================
  // SKILL LOOKUPS
  // ===================
  function getSkillRank(skillId: number): number {
    if (!heroStore.hero?.skills) return 0;
    const skill = heroStore.hero.skills.find((s) => s.skill.id === skillId);
    return skill?.rank ?? 0;
  }

  function getSkillModifier(skillCode: string): number {
    const skillData = findByCode(classifierStore.skills, skillCode);
    if (!skillData || !heroStore.hero) return 0;
    const attrValue = getAttributeValueById(skillData.attr.id);
    const rank = getSkillRank(skillData.id);
    return attrValue + rank;
  }

  // ===================
  // DERIVED STATS
  // ===================
  // Memoized attribute values for derived stat calculations
  const attributeValues = computed(() => {
    const attrs: Record<string, number> = {};
    for (const attr of classifierStore.attributes) {
      attrs[attr.code] = getAttributeValue(attr.code);
    }
    return attrs;
  });

  function getHeroDerivedStat(statCode: string) {
    if (!heroStore.hero?.derivedStats) return undefined;
    const stat = findByCode(classifierStore.derivedStats, statCode);
    if (!stat) return undefined;
    return heroStore.hero.derivedStats.find((s) => s.derivedStat.id === stat.id);
  }

  function getDerivedStatValue(statCode: string): number {
    return getHeroDerivedStat(statCode)?.totalValue ?? 0;
  }

  function getDerivedStatTotal(statCode: string): number {
    const baseValue = calculateFormulaStat(
      statCode,
      attributeValues.value,
      levelData.value,
      tierData.value
    );
    const heroStat = getHeroDerivedStat(statCode);
    const modifier = heroStat?.modifier ?? 0;

    return baseValue + modifier;
  }

  function getDerivedStatModifier(statId: number): number {
    if (!heroStore.hero?.derivedStats) return 0;
    const stat = heroStore.hero.derivedStats.find((s) => s.derivedStat.id === statId);
    return stat?.modifier ?? 0;
  }

  function getDerivedStatDisplay(statCode: string): string {
    const heroStat = getHeroDerivedStat(statCode);
    if (!heroStat) return '';
    const modifier = heroStat.modifier ?? 0;
    const total = getDerivedStatTotal(statCode);
    if (modifier) {
      const baseValue = total - modifier;
      return `${total} (${baseValue} + ${modifier})`;
    }
    return `${total}`;
  }

  // ===================
  // MUTATIONS
  // ===================
  function setAttribute(attrId: number, value: number) {
    if (!heroStore.hero) return;
    const clampedValue = clamp(value, MIN_ATTRIBUTE_VALUE, MAX_ATTRIBUTE_VALUE);
    const existing = heroStore.hero.attributes.find((a) => a.attribute.id === attrId);
    if (existing) {
      existing.value = clampedValue;
    } else {
      const attr = findById(classifierStore.attributes, attrId);
      if (!attr) return;
      heroStore.hero.attributes.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        attribute: toClassifierRef(attr),
        value: clampedValue,
      });
    }
  }

  function setSkillRank(skillId: number, rank: number) {
    if (!heroStore.hero) return;
    const maxRank = levelData.value?.maxSkillRank ?? 2;
    const clampedRank = clamp(rank, 0, maxRank);
    const existing = heroStore.hero.skills.find((s) => s.skill.id === skillId);
    if (existing) {
      existing.rank = clampedRank;
    } else {
      const skillData = findById(classifierStore.skills, skillId);
      if (!skillData) return;
      heroStore.hero.skills.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        skill: toClassifierRef(skillData),
        rank: clampedRank,
        modifier: 0,
      });
    }
  }

  function setSkillModifier(skillId: number, modifier: number) {
    if (!heroStore.hero) return;
    const clampedModifier = clamp(modifier, MIN_ATTRIBUTE_VALUE, MAX_ATTRIBUTE_VALUE);
    const existing = heroStore.hero.skills.find((s) => s.skill.id === skillId);
    if (existing) {
      existing.modifier = clampedModifier;
    } else {
      const skillData = findById(classifierStore.skills, skillId);
      if (!skillData) return;
      heroStore.hero.skills.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        skill: toClassifierRef(skillData),
        rank: 0,
        modifier: clampedModifier,
      });
    }
  }

  function setDerivedStatModifier(statId: number, modifier: number) {
    if (!heroStore.hero) return;
    const existing = heroStore.hero.derivedStats.find((s) => s.derivedStat.id === statId);
    if (existing) {
      existing.modifier = modifier;
    } else {
      const stat = findById(classifierStore.derivedStats, statId);
      if (!stat) return;
      heroStore.hero.derivedStats.push({
        derivedStat: toClassifierRef(stat),
        baseValue: null,
        modifier,
        totalValue: null,
        valueDisplay: null,
      });
    }
  }

  function addExpertise(expertiseId: number, source?: ExpertiseSourceData) {
    if (!heroStore.hero) return;
    if (!heroStore.hero.expertises.find((e) => e.expertise.id === expertiseId)) {
      const exp = findById(classifierStore.expertises, expertiseId);
      if (!exp) return;
      heroStore.hero.expertises.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        expertise: toClassifierRef(exp),
        ...(source && { source }),
      });
    }
  }

  function removeExpertise(expertiseId: number) {
    if (!heroStore.hero) return;
    heroStore.hero.expertises = heroStore.hero.expertises.filter(
      (e) => e.expertise.id !== expertiseId
    );
  }

  function removeExpertiseBySource(sourceType: string, sourceId: number) {
    if (!heroStore.hero) return;
    heroStore.hero.expertises = heroStore.hero.expertises.filter(
      (e) => !(e.source?.sourceType === sourceType && e.source?.sourceId === sourceId)
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
    removeExpertiseBySource,
  };
});
