import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useHeroStore } from './hero';
import { useClassifierStore } from './classifiers';
import { useHeroAttributesStore } from './heroAttributes';
import { findById, findByCode, toClassifierRef } from 'src/utils/arrayUtils';
import { clamp } from 'src/utils/numberUtils';

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
    if (!singerAncestry) return false;
    return heroStore.hero.ancestry?.id === singerAncestry.id;
  });

  const isRadiant = computed(() => !!heroStore.hero?.radiantOrder);

  // Radiant-specific computed values for consistent state derivation
  const radiantOrderId = computed(() => heroStore.hero?.radiantOrder?.id ?? null);
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
    if (heroStore.hero.ancestry?.id) {
      const prevAncestryId = heroStore.hero.ancestry.id;
      const prevAncestryTalentIds = new Set(
        classifierStore.talents.filter((t) => t.ancestry?.id === prevAncestryId).map((t) => t.id)
      );
      heroStore.hero.talents = heroStore.hero.talents.filter(
        (t) => !prevAncestryTalentIds.has(t.talent.id)
      );
    }

    const ancestry = findById(classifierStore.ancestries, ancestryId);
    if (!ancestry) return;
    heroStore.hero.ancestry = toClassifierRef(ancestry);

    // Reset singer form if not singer
    if (!singerAncestry || ancestryId !== singerAncestry.id) {
      heroStore.hero.activeSingerForm = null;
    } else {
      // Add singer key talent
      const singerKeyTalent = classifierStore.talents.find(
        (t) => t.ancestry?.id === singerAncestry.id && t.isKey
      );
      if (
        singerKeyTalent &&
        !heroStore.hero.talents.find((t) => t.talent.id === singerKeyTalent.id)
      ) {
        heroStore.hero.talents.push({
          id: heroStore.nextTempId(),
          heroId: heroStore.hero.id,
          talent: toClassifierRef(singerKeyTalent),
          special: singerKeyTalent.special ?? [],
        });
      }
    }
  }

  function setSingerForm(singerFormId: number | null) {
    if (!heroStore.hero) return;
    if (singerFormId === null) {
      heroStore.hero.activeSingerForm = null;
    } else {
      const form = findById(classifierStore.singerForms, singerFormId);
      if (!form) return;
      heroStore.hero.activeSingerForm = toClassifierRef(form);
    }
  }

  // ===================
  // CULTURE
  // ===================
  function addCulture(cultureId: number) {
    if (!heroStore.hero) return;
    if (!heroStore.hero.cultures.find((c) => c.culture.id === cultureId)) {
      const cult = findById(classifierStore.cultures, cultureId);
      if (!cult) return;
      heroStore.hero.cultures.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        culture: toClassifierRef(cult),
      });
      applyCulturalExpertise(cultureId);
    }
  }

  function removeCulture(cultureId: number) {
    if (!heroStore.hero) return;
    heroStore.hero.cultures = heroStore.hero.cultures.filter((c) => c.culture.id !== cultureId);
    removeCulturalExpertise(cultureId);
  }

  function applyCulturalExpertise(cultureId: number) {
    if (!heroStore.hero) return;
    const culture = findById(classifierStore.cultures, cultureId);
    if (!culture) return;

    attrStore.addExpertise(culture.expertise.id, { sourceType: 'culture', sourceId: cultureId });
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
    if (!heroStore.hero.talents.find((t) => t.talent.id === talentId)) {
      const tal = findById(classifierStore.talents, talentId);
      if (!tal) return;
      heroStore.hero.talents.push({
        id: heroStore.nextTempId(),
        heroId: heroStore.hero.id,
        talent: toClassifierRef(tal),
        special: tal.special ?? [],
      });
    }
  }

  function removeTalent(talentId: number) {
    if (!heroStore.hero) return;
    heroStore.hero.talents = heroStore.hero.talents.filter((t) => t.talent.id !== talentId);
  }

  function addKeyTalentForPath(pathId: number) {
    const keyTalent = classifierStore.talents.find((t) => t.path?.id === pathId && t.isKey);
    if (keyTalent) {
      addTalent(keyTalent.id);
    }
  }

  // ===================
  // RADIANT
  // ===================
  function getSurgeSkillIds(orderId: number): number[] {
    const order = findById(classifierStore.radiantOrders, orderId);
    if (!order) return [];
    const surgeIds = new Set([order.surge1.id, order.surge2.id]);
    return classifierStore.skills
      .filter((s) => s.surge && surgeIds.has(s.surge.id))
      .map((s) => s.id);
  }

  function setRadiantOrder(orderId: number | null) {
    if (!heroStore.hero) return;

    // No-op if same order
    if (orderId === (heroStore.hero.radiantOrder?.id ?? null)) return;

    // Validate new order before destructive removal of previous data
    const newOrder = orderId !== null ? findById(classifierStore.radiantOrders, orderId) : null;
    if (orderId !== null && !newOrder) return;

    // Remove all radiant talents and surge skills from previous order
    if (heroStore.hero.radiantOrder) {
      const prevOrderId = heroStore.hero.radiantOrder.id;
      const prevOrder = findById(classifierStore.radiantOrders, prevOrderId);
      if (prevOrder) {
        // Collect all talent IDs for this order in single pass
        const allRadiantTalentIds = new Set<number>();
        for (const talent of classifierStore.talents) {
          if (
            talent.radiantOrder?.id === prevOrder.id ||
            talent.surge?.id === prevOrder.surge1?.id ||
            talent.surge?.id === prevOrder.surge2?.id
          ) {
            allRadiantTalentIds.add(talent.id);
          }
        }
        heroStore.hero.talents = heroStore.hero.talents.filter(
          (t) => !allRadiantTalentIds.has(t.talent.id)
        );

        // Remove previous surge skills
        const prevSurgeSkillIds = new Set(getSurgeSkillIds(prevOrderId));
        heroStore.hero.skills = heroStore.hero.skills.filter(
          (s) => !prevSurgeSkillIds.has(s.skill.id)
        );
      }
    }

    if (orderId === null) {
      heroStore.hero.radiantOrder = null;
      heroStore.hero.radiantIdeal = 0;
    } else {
      heroStore.hero.radiantOrder = toClassifierRef(newOrder!);
      // Ensure radiantIdeal is at least 1 when order is set (database constraint)
      if (heroStore.hero.radiantIdeal === 0) {
        heroStore.hero.radiantIdeal = 1;
      }
      // Add new radiant key talent
      const keyTalent = classifierStore.talents.find(
        (t) => t.radiantOrder?.id === orderId && t.isKey
      );
      if (keyTalent && !heroStore.hero.talents.find((t) => t.talent.id === keyTalent.id)) {
        heroStore.hero.talents.push({
          id: heroStore.nextTempId(),
          heroId: heroStore.hero.id,
          talent: toClassifierRef(keyTalent),
          special: keyTalent.special ?? [],
        });
      }

      // Grant rank 1 in each surge skill (don't downgrade existing higher ranks)
      for (const skillId of getSurgeSkillIds(orderId)) {
        if (attrStore.getSkillRank(skillId) < 1) {
          attrStore.setSkillRank(skillId, 1);
        }
      }
    }
  }

  function setRadiantIdeal(level: number) {
    if (!heroStore.hero) return;
    const min = heroStore.hero.radiantOrder ? 1 : 0;
    heroStore.hero.radiantIdeal = clamp(level, min, 5);
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
