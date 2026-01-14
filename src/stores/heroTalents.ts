import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useHeroStore } from './hero';
import { useClassifierStore } from './classifiers';
import { useHeroAttributesStore } from './heroAttributes';
import { findById, findByCode } from 'src/utils/arrayUtils';

export const useHeroTalentsStore = defineStore('heroTalents', () => {
  const heroStore = useHeroStore();
  const classifierStore = useClassifierStore();
  const attrStore = useHeroAttributesStore();

  // ===================
  // COMPUTED
  // ===================
  const isSinger = computed(() => {
    if (!heroStore.hero) return false;
    const singerAncestry = findByCode(classifierStore.ancestries, 'singer');
    return heroStore.hero.ancestryId === singerAncestry?.id;
  });

  const isRadiant = computed(() => !!heroStore.hero?.radiantOrderId);

  // Radiant-specific computed values for consistent state derivation
  const radiantOrderId = computed(() => heroStore.hero?.radiantOrderId ?? null);
  const radiantIdeal = computed(() => heroStore.hero?.radiantIdeal ?? 0);

  // ===================
  // ANCESTRY
  // ===================
  function setAncestry(ancestryId: number) {
    if (!heroStore.hero) return;
    const singerAncestry = findByCode(classifierStore.ancestries, 'singer');
    if (!singerAncestry) {
      console.warn('Singer ancestry not found in classifiers');
    }

    // Remove previous ancestry talents if changing ancestry
    if (heroStore.hero.ancestryId) {
      const prevAncestryId = heroStore.hero.ancestryId;
      const prevAncestryTalentIds = new Set(
        classifierStore.talents.filter((t) => t.ancestryId === prevAncestryId).map((t) => t.id)
      );
      heroStore.hero.talents = heroStore.hero.talents.filter(
        (t) => !prevAncestryTalentIds.has(t.talentId)
      );
    }

    heroStore.hero.ancestryId = ancestryId;

    // Reset singer form if not singer
    if (!singerAncestry || ancestryId !== singerAncestry.id) {
      heroStore.hero.activeSingerFormId = null;
    } else {
      // Add singer key talent
      const singerKeyTalent = classifierStore.talents.find(
        (t) => t.ancestryId === singerAncestry.id && t.isKey
      );
      if (
        singerKeyTalent &&
        !heroStore.hero.talents.find((t) => t.talentId === singerKeyTalent.id)
      ) {
        heroStore.hero.talents.push({
          id: heroStore.nextTempId(),
          heroId: heroStore.hero.id,
          talentId: singerKeyTalent.id,
        });
      }
    }
  }

  function setSingerForm(singerFormId: number | null) {
    if (!heroStore.hero) return;
    heroStore.hero.activeSingerFormId = singerFormId;
  }

  // ===================
  // CULTURE
  // ===================
  function addCulture(cultureId: number) {
    if (!heroStore.hero) return;
    if (!heroStore.hero.cultures.find((c) => c.cultureId === cultureId)) {
      heroStore.hero.cultures.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        cultureId,
      });
      applyCulturalExpertise(cultureId);
    }
  }

  function removeCulture(cultureId: number) {
    if (!heroStore.hero) return;
    heroStore.hero.cultures = heroStore.hero.cultures.filter((c) => c.cultureId !== cultureId);
    removeCulturalExpertise(cultureId);
  }

  function applyCulturalExpertise(cultureId: number) {
    if (!heroStore.hero) return;
    const culture = findById(classifierStore.cultures, cultureId);
    if (!culture) return;

    attrStore.addExpertise(culture.expertiseId, { sourceType: 'culture', sourceId: cultureId });
  }

  function removeCulturalExpertise(cultureId: number) {
    // Delegate to attrStore for consistent expertise mutation ownership
    attrStore.removeExpertiseBySource('culture', cultureId);
  }

  // ===================
  // TALENTS
  // ===================
  function addTalent(talentId: number) {
    if (!heroStore.hero) return;
    if (!heroStore.hero.talents.find((t) => t.talentId === talentId)) {
      heroStore.hero.talents.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        talentId,
      });
    }
  }

  function removeTalent(talentId: number) {
    if (!heroStore.hero) return;
    heroStore.hero.talents = heroStore.hero.talents.filter((t) => t.talentId !== talentId);
  }

  function addKeyTalentForPath(pathId: number) {
    const keyTalent = classifierStore.talents.find((t) => t.pathId === pathId && t.isKey);
    if (keyTalent) {
      addTalent(keyTalent.id);
    }
  }

  // ===================
  // RADIANT
  // ===================
  function setRadiantOrder(orderId: number | null) {
    if (!heroStore.hero) return;

    // Remove all radiant talents from previous order
    if (heroStore.hero.radiantOrderId) {
      const prevOrder = findById(classifierStore.radiantOrders, heroStore.hero.radiantOrderId);
      if (prevOrder) {
        // Collect all talent IDs for this order in single pass
        const allRadiantTalentIds = new Set<number>();
        for (const talent of classifierStore.talents) {
          if (
            talent.radiantOrderId === prevOrder.id ||
            talent.surgeId === prevOrder.surge1Id ||
            talent.surgeId === prevOrder.surge2Id
          ) {
            allRadiantTalentIds.add(talent.id);
          }
        }
        heroStore.hero.talents = heroStore.hero.talents.filter(
          (t) => !allRadiantTalentIds.has(t.talentId)
        );
      }
    }

    heroStore.hero.radiantOrderId = orderId;
    if (!orderId) {
      heroStore.hero.radiantIdeal = 0;
    } else {
      // Add new radiant key talent
      const keyTalent = classifierStore.talents.find(
        (t) => t.radiantOrderId === orderId && t.isKey
      );
      if (keyTalent && !heroStore.hero.talents.find((t) => t.talentId === keyTalent.id)) {
        heroStore.hero.talents.push({
          id: heroStore.nextTempId(),
          heroId: heroStore.hero.id,
          talentId: keyTalent.id,
        });
      }
    }
  }

  function setRadiantIdeal(level: number) {
    if (!heroStore.hero) return;
    heroStore.hero.radiantIdeal = Math.max(0, Math.min(5, level));
  }

  return {
    // Computed
    isSinger,
    isRadiant,
    radiantOrderId,
    radiantIdeal,

    // Ancestry
    setAncestry,
    setSingerForm,

    // Culture
    addCulture,
    removeCulture,

    // Talents
    addTalent,
    removeTalent,
    addKeyTalentForPath,

    // Radiant
    setRadiantOrder,
    setRadiantIdeal,
  };
});
