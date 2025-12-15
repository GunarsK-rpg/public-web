import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Hero, ExpertiseSourceData } from 'src/types';
import { useClassifierStore } from './classifiers';
import { logger } from 'src/utils/logger';

/**
 * Default empty Hero for new character creation
 */
function createEmptyHero(): Hero {
  return {
    id: 0,
    userId: 0,
    campaignId: 0,
    ancestryId: 0,
    startingKitId: null,
    activeSingerFormId: null,
    radiantOrderId: null,
    radiantIdeal: 0,
    name: '',
    level: 1,
    currentHealth: 0,
    currentFocus: 0,
    currentInvestiture: 0,
    attributes: [],
    defenses: [],
    derivedStats: [],
    skills: [],
    talents: [],
    expertises: [],
    equipment: [],
    currency: 0,
    conditions: [],
    injuries: [],
    goals: [],
    connections: [],
    companions: [],
    cultures: [],
  };
}

export const useHeroStore = defineStore('hero', () => {
  const hero = ref<Hero | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);

  // Temporary ID counter for new items (negative to distinguish from DB IDs)
  let tempIdCounter = -1;
  function nextTempId(): number {
    return tempIdCounter--;
  }

  // ===================
  // COMPUTED
  // ===================
  const isLoaded = computed(() => !!hero.value);
  const isNew = computed(() => hero.value?.id === 0);
  const isRadiant = computed(() => !!hero.value?.radiantOrderId);

  const isSinger = computed(() => {
    if (!hero.value) return false;
    const classifiers = useClassifierStore();
    const singerAncestry = classifiers.getByCode(classifiers.ancestries, 'singer');
    return hero.value.ancestryId === singerAncestry?.id;
  });

  const levelData = computed(() => {
    const classifiers = useClassifierStore();
    return classifiers.getByProp(classifiers.levels, 'level', hero.value?.level || 1);
  });

  const tierData = computed(() => {
    const classifiers = useClassifierStore();
    return classifiers.getById(classifiers.tiers, levelData.value?.tierId);
  });

  // ===================
  // LOOKUP HELPERS
  // ===================
  function getAttributeValue(attrCode: string): number {
    if (!hero.value?.attributes) return 0;
    const classifiers = useClassifierStore();
    const attr = classifiers.getByCode(classifiers.attributes, attrCode);
    if (!attr) return 0;
    const heroAttr = hero.value.attributes.find((a) => a.attrId === attr.id);
    return heroAttr?.value || 0;
  }

  function getAttributeValueById(attrId: number): number {
    if (!hero.value?.attributes) return 0;
    const heroAttr = hero.value.attributes.find((a) => a.attrId === attrId);
    return heroAttr?.value || 0;
  }

  function getDefenseValue(attrTypeCode: string): number {
    if (!hero.value?.defenses) return 10;
    const classifiers = useClassifierStore();
    const attrType = classifiers.getByCode(classifiers.attributeTypes, attrTypeCode);
    if (!attrType) return 10;
    const defense = hero.value.defenses.find((d) => d.attrTypeId === attrType.id);
    return defense?.value || 10;
  }

  function getSkillRank(skillId: number): number {
    if (!hero.value?.skills) return 0;
    const skill = hero.value.skills.find((s) => s.skillId === skillId);
    return skill?.rank || 0;
  }

  function getSkillModifier(skillCode: string): number {
    const classifiers = useClassifierStore();
    const skillData = classifiers.getByCode(classifiers.skills, skillCode);
    if (!skillData || !hero.value) return 0;
    const attrValue = getAttributeValueById(skillData.attrId);
    const rank = getSkillRank(skillData.id);
    return attrValue + rank;
  }

  // ===================
  // LOAD / SAVE / INIT
  // ===================
  async function loadHero(id: number): Promise<void> {
    loading.value = true;
    error.value = null;

    // Clear any existing hero to avoid stale data
    hero.value = null;

    try {
      // TODO: Replace with actual API call
      const { heroes } = await import('src/mock/heroes');
      const found = heroes.find((h) => h.id === id);
      if (found) {
        // Deep clone to avoid mutating shared mock data
        hero.value = JSON.parse(JSON.stringify(found));
        logger.info('Hero loaded', { id, name: found.name, level: found.level });
      } else {
        error.value = 'Hero not found';
        logger.warn('Hero not found', { id });
      }
    } catch (err) {
      error.value = 'Failed to load hero';
      logger.error('Failed to load hero', {
        id,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      loading.value = false;
    }
  }

  function initNewHero(campaignId?: number): void {
    hero.value = createEmptyHero();
    if (campaignId !== undefined) {
      hero.value.campaignId = campaignId;
    }
    tempIdCounter = -1;
    logger.info('New hero initialized', { campaignId });
  }

  function clearHero(): void {
    hero.value = null;
    error.value = null;
    tempIdCounter = -1;
  }

  // ===================
  // BASIC INFO
  // ===================
  function setName(name: string) {
    if (!hero.value) return;
    hero.value.name = name;
  }

  function setLevel(level: number) {
    if (!hero.value) return;
    hero.value.level = level;
  }

  function setCampaignId(campaignId: number) {
    if (!hero.value) return;
    hero.value.campaignId = campaignId;
  }

  // ===================
  // ANCESTRY
  // ===================
  function setAncestry(ancestryId: number) {
    if (!hero.value) return;
    const classifiers = useClassifierStore();
    const singerAncestry = classifiers.getByCode(classifiers.ancestries, 'singer');

    // Remove previous ancestry talents if changing ancestry
    if (hero.value.ancestryId) {
      const prevAncestryTalentIds = classifiers.talents
        .filter((t) => t.ancestryId === hero.value!.ancestryId)
        .map((t) => t.id);
      hero.value.talents = hero.value.talents.filter(
        (t) => !prevAncestryTalentIds.includes(t.talentId)
      );
    }

    hero.value.ancestryId = ancestryId;

    // Reset singer form if not singer
    if (ancestryId !== singerAncestry?.id) {
      hero.value.activeSingerFormId = null;
    } else {
      // Add singer key talent
      const singerKeyTalent = classifiers.talents.find(
        (t) => t.ancestryId === singerAncestry.id && t.isKey
      );
      if (singerKeyTalent && !hero.value.talents.find((t) => t.talentId === singerKeyTalent.id)) {
        hero.value.talents.push({
          id: nextTempId(),
          heroId: hero.value.id,
          talentId: singerKeyTalent.id,
        });
      }
    }
  }

  function setSingerForm(singerFormId: number | null) {
    if (!hero.value) return;
    hero.value.activeSingerFormId = singerFormId;
  }

  // ===================
  // CULTURE
  // ===================
  function addCulture(cultureId: number) {
    if (!hero.value) return;
    if (!hero.value.cultures.find((c) => c.cultureId === cultureId)) {
      hero.value.cultures.push({
        id: nextTempId(),
        heroId: hero.value.id,
        cultureId,
      });
      applyCulturalExpertise(cultureId);
    }
  }

  function removeCulture(cultureId: number) {
    if (!hero.value) return;
    hero.value.cultures = hero.value.cultures.filter((c) => c.cultureId !== cultureId);
    removeCulturalExpertise(cultureId);
  }

  function applyCulturalExpertise(cultureId: number) {
    if (!hero.value) return;
    const classifiers = useClassifierStore();
    const culture = classifiers.getById(classifiers.cultures, cultureId);
    if (!culture) return;

    addExpertise(culture.expertiseId, { sourceType: 'culture', sourceId: cultureId });
  }

  function removeCulturalExpertise(cultureId: number) {
    if (!hero.value) return;
    hero.value.expertises = hero.value.expertises.filter(
      (e) => !(e.source?.sourceType === 'culture' && e.source?.sourceId === cultureId)
    );
  }

  // ===================
  // DERIVED STATS
  // ===================
  function getHeroDerivedStat(statCode: string) {
    if (!hero.value?.derivedStats) return undefined;
    const classifiers = useClassifierStore();
    const stat = classifiers.getByCode(classifiers.derivedStats, statCode);
    if (!stat) return undefined;
    return hero.value.derivedStats.find((s) => s.statId === stat.id);
  }

  function getDerivedStatValue(statCode: string): number {
    return getHeroDerivedStat(statCode)?.value ?? 0;
  }

  function getDerivedStatTotal(statCode: string): number {
    const heroStat = getHeroDerivedStat(statCode);
    if (!heroStat) return 0;
    return heroStat.value + (heroStat.modifier ?? 0);
  }

  function getDerivedStatModifier(statId: number): number {
    if (!hero.value?.derivedStats) return 0;
    const stat = hero.value.derivedStats.find((s) => s.statId === statId);
    return stat?.modifier ?? 0;
  }

  function getDerivedStatDisplay(statCode: string): string {
    const heroStat = getHeroDerivedStat(statCode);
    if (!heroStat) return '';
    const classifiers = useClassifierStore();
    const unit = heroStat.unitId
      ? (classifiers.getById(classifiers.units, heroStat.unitId)?.code ?? '')
      : '';
    const modifier = heroStat.modifier ?? 0;
    const total = heroStat.value + modifier;
    if (modifier) {
      return `${total}${unit} (${heroStat.value} + ${modifier})`;
    }
    return `${total}${unit}`;
  }

  function setDerivedStatModifier(statId: number, modifier: number) {
    if (!hero.value) return;
    const existing = hero.value.derivedStats.find((s) => s.statId === statId);
    if (existing) {
      existing.modifier = modifier;
    } else {
      hero.value.derivedStats.push({
        id: nextTempId(),
        heroId: hero.value.id,
        statId,
        value: 0,
        modifier,
      });
    }
  }

  // ===================
  // ATTRIBUTES
  // ===================
  function setAttribute(attrId: number, value: number) {
    if (!hero.value) return;
    const existing = hero.value.attributes.find((a) => a.attrId === attrId);
    if (existing) {
      existing.value = value;
    } else {
      hero.value.attributes.push({
        id: nextTempId(),
        heroId: hero.value.id,
        attrId,
        value,
      });
    }
  }

  // ===================
  // SKILLS
  // ===================
  function setSkillRank(skillId: number, rank: number) {
    if (!hero.value) return;
    const existing = hero.value.skills.find((s) => s.skillId === skillId);
    if (existing) {
      existing.rank = rank;
    } else {
      hero.value.skills.push({
        id: nextTempId(),
        heroId: hero.value.id,
        skillId,
        rank,
        modifier: 0,
      });
    }
  }

  function setSkillModifier(skillId: number, modifier: number) {
    if (!hero.value) return;
    const existing = hero.value.skills.find((s) => s.skillId === skillId);
    if (existing) {
      existing.modifier = modifier;
    } else {
      hero.value.skills.push({
        id: nextTempId(),
        heroId: hero.value.id,
        skillId,
        rank: 0,
        modifier,
      });
    }
  }

  // ===================
  // EXPERTISES
  // ===================
  function addExpertise(expertiseId: number, source?: ExpertiseSourceData) {
    if (!hero.value) return;
    if (!hero.value.expertises.find((e) => e.expertiseId === expertiseId)) {
      hero.value.expertises.push({
        id: nextTempId(),
        heroId: hero.value.id,
        expertiseId,
        ...(source && { source }),
      });
    }
  }

  function removeExpertise(expertiseId: number) {
    if (!hero.value) return;
    hero.value.expertises = hero.value.expertises.filter((e) => e.expertiseId !== expertiseId);
  }

  // ===================
  // TALENTS
  // ===================
  function addTalent(talentId: number) {
    if (!hero.value) return;
    if (!hero.value.talents.find((t) => t.talentId === talentId)) {
      hero.value.talents.push({
        id: nextTempId(),
        heroId: hero.value.id,
        talentId,
      });
    }
  }

  function removeTalent(talentId: number) {
    if (!hero.value) return;
    hero.value.talents = hero.value.talents.filter((t) => t.talentId !== talentId);
  }

  function addKeyTalentForPath(pathId: number) {
    const classifiers = useClassifierStore();
    const keyTalent = classifiers.talents.find((t) => t.pathId === pathId && t.isKey);
    if (keyTalent) {
      addTalent(keyTalent.id);
    }
  }

  // ===================
  // RADIANT
  // ===================
  function setRadiantOrder(orderId: number | null) {
    if (!hero.value) return;
    const classifiers = useClassifierStore();

    // Remove all radiant talents from previous order
    if (hero.value.radiantOrderId) {
      const prevOrder = classifiers.getById(classifiers.radiantOrders, hero.value.radiantOrderId);
      if (prevOrder) {
        // Get all talent IDs for this order (order talents + surge talents)
        const orderTalentIds = classifiers.talents
          .filter((t) => t.radiantOrderId === prevOrder.id)
          .map((t) => t.id);
        const surge1TalentIds = classifiers.talents
          .filter((t) => t.surgeId === prevOrder.surge1Id)
          .map((t) => t.id);
        const surge2TalentIds = classifiers.talents
          .filter((t) => t.surgeId === prevOrder.surge2Id)
          .map((t) => t.id);
        const allRadiantTalentIds = [...orderTalentIds, ...surge1TalentIds, ...surge2TalentIds];
        hero.value.talents = hero.value.talents.filter(
          (t) => !allRadiantTalentIds.includes(t.talentId)
        );
      }
    }

    hero.value.radiantOrderId = orderId;
    if (!orderId) {
      hero.value.radiantIdeal = 0;
    } else {
      // Add new radiant key talent
      const keyTalent = classifiers.talents.find((t) => t.radiantOrderId === orderId && t.isKey);
      if (keyTalent && !hero.value.talents.find((t) => t.talentId === keyTalent.id)) {
        hero.value.talents.push({
          id: nextTempId(),
          heroId: hero.value.id,
          talentId: keyTalent.id,
        });
      }
    }
  }

  function setRadiantIdeal(level: number) {
    if (!hero.value) return;
    hero.value.radiantIdeal = level;
  }

  // ===================
  // STARTING KIT
  // ===================
  function setStartingKit(startingKitId: number) {
    if (!hero.value) return;
    hero.value.startingKitId = startingKitId;
    applyStartingKitBonuses(startingKitId);
  }

  function applyStartingKitBonuses(startingKitId: number) {
    if (!hero.value) return;
    const classifiers = useClassifierStore();
    const kitData = classifiers.getById(classifiers.startingKits, startingKitId);
    if (!kitData) return;

    // Clear previous starting kit expertises
    hero.value.expertises = hero.value.expertises.filter(
      (e) => e.source?.sourceType !== 'starting_kit'
    );

    // Apply expertise bonuses from kit
    if (kitData.expertises) {
      for (const exp of kitData.expertises) {
        addExpertise(exp.expertiseId, { sourceType: 'starting_kit', sourceId: startingKitId });
      }
    }

    // Apply equipment from kit
    hero.value.equipment = [];
    if (kitData.equipment) {
      for (const item of kitData.equipment) {
        addEquipment(item.equipmentId, item.quantity);
      }
    }
  }

  // ===================
  // CURRENCY
  // ===================
  function setCurrency(amount: number) {
    if (!hero.value) return;
    hero.value.currency = amount;
  }

  // ===================
  // EQUIPMENT
  // ===================
  function addEquipment(equipmentId: number, amount: number = 1) {
    if (!hero.value) return;
    // Validate amount - must be positive
    const validAmount = Math.max(1, Math.floor(amount));
    const existing = hero.value.equipment.find((e) => e.equipmentId === equipmentId);
    if (existing) {
      existing.amount += validAmount;
    } else {
      hero.value.equipment.push({
        id: nextTempId(),
        heroId: hero.value.id,
        equipmentId,
        amount: validAmount,
        isEquipped: false,
        isPrimary: false,
      });
    }
  }

  function removeEquipment(equipmentId: number) {
    if (!hero.value) return;
    hero.value.equipment = hero.value.equipment.filter((e) => e.equipmentId !== equipmentId);
  }

  function setEquipmentEquipped(equipmentId: number, isEquipped: boolean) {
    if (!hero.value) return;
    const item = hero.value.equipment.find((e) => e.equipmentId === equipmentId);
    if (item) {
      item.isEquipped = isEquipped;
    }
  }

  // ===================
  // GOALS
  // ===================
  function addGoal(name: string, description?: string) {
    if (!hero.value) return;
    const classifiers = useClassifierStore();
    const activeStatus = classifiers.getByCode(classifiers.goalStatuses, 'active');
    hero.value.goals.push({
      id: nextTempId(),
      heroId: hero.value.id,
      name,
      ...(description && { description }),
      value: 0,
      statusId: activeStatus?.id || 1,
    });
  }

  function removeGoal(index: number) {
    if (!hero.value) return;
    hero.value.goals.splice(index, 1);
  }

  // ===================
  // CONNECTIONS
  // ===================
  function addConnection(connTypeId: number, description: string, notes?: string) {
    if (!hero.value) return;
    hero.value.connections.push({
      id: nextTempId(),
      heroId: hero.value.id,
      connTypeId,
      description,
      ...(notes ? { notes } : {}),
    });
  }

  function removeConnection(index: number) {
    if (!hero.value) return;
    hero.value.connections.splice(index, 1);
  }

  // ===================
  // PERSONAL DETAILS
  // ===================
  function setAppearance(appearance: string) {
    if (!hero.value) return;
    hero.value.appearance = appearance;
  }

  function setBiography(biography: string) {
    if (!hero.value) return;
    hero.value.biography = biography;
  }

  function setNotes(notes: string) {
    if (!hero.value) return;
    hero.value.notes = notes;
  }

  // ===================
  // RESOURCES
  // ===================
  function updateResources(resources: {
    currentHealth?: number;
    currentFocus?: number;
    currentInvestiture?: number;
  }): { success: boolean; error?: string } {
    if (!hero.value) return { success: false, error: 'No hero loaded' };

    saving.value = true;
    error.value = null;

    try {
      // TODO: API call
      Object.assign(hero.value, resources);
      return { success: true };
    } catch {
      error.value = 'Failed to update resources';
      return { success: false, error: error.value };
    } finally {
      saving.value = false;
    }
  }

  return {
    // State
    hero,
    loading,
    saving,
    error,

    // Computed
    isLoaded,
    isNew,
    isRadiant,
    isSinger,
    levelData,
    tierData,

    // Lookup helpers
    getAttributeValue,
    getAttributeValueById,
    getDefenseValue,
    getSkillRank,
    getSkillModifier,

    // Load/Save/Init
    loadHero,
    initNewHero,
    clearHero,

    // Basic Info
    setName,
    setLevel,
    setCampaignId,

    // Ancestry
    setAncestry,
    setSingerForm,

    // Culture
    addCulture,
    removeCulture,

    // Derived Stats
    getDerivedStatValue,
    getDerivedStatTotal,
    getDerivedStatModifier,
    getDerivedStatDisplay,
    setDerivedStatModifier,

    // Attributes
    setAttribute,

    // Skills
    setSkillRank,
    setSkillModifier,

    // Expertises
    addExpertise,
    removeExpertise,

    // Talents
    addTalent,
    removeTalent,
    addKeyTalentForPath,

    // Radiant
    setRadiantOrder,
    setRadiantIdeal,

    // Starting Kit
    setStartingKit,

    // Currency
    setCurrency,

    // Equipment
    addEquipment,
    removeEquipment,
    setEquipmentEquipped,

    // Goals
    addGoal,
    removeGoal,

    // Connections
    addConnection,
    removeConnection,

    // Personal Details
    setAppearance,
    setBiography,
    setNotes,

    // Resources
    updateResources,
  };
});
