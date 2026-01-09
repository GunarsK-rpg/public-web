import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Hero, ExpertiseSourceData } from 'src/types';
import { useClassifierStore } from './classifiers';
import { logger } from 'src/utils/logger';
import { findById, findByCode, findByProp, removeById } from 'src/utils/arrayUtils';
import { calculateFormulaStat } from 'src/utils/derivedStats';

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

  // Track pending load requests to handle race conditions
  // Prevents stale responses from overwriting newer state
  let loadRequestId = 0;

  // Temporary ID counter for new items (negative to distinguish from DB IDs)
  // Using ref ensures counter persists across HMR and is reactive
  const tempIdCounter = ref(-1);
  function nextTempId(): number {
    return tempIdCounter.value--;
  }

  // ===================
  // COMPUTED
  // ===================
  const isLoaded = computed(() => !!hero.value);
  const isNew = computed(() => hero.value?.id === 0);
  const isRadiant = computed(() => !!hero.value?.radiantOrderId);

  // Array getters - avoid repeating `hero.value?.X ?? []` everywhere
  const talents = computed(() => hero.value?.talents ?? []);
  const skills = computed(() => hero.value?.skills ?? []);
  const expertises = computed(() => hero.value?.expertises ?? []);
  const equipment = computed(() => hero.value?.equipment ?? []);
  const goals = computed(() => hero.value?.goals ?? []);
  const connections = computed(() => hero.value?.connections ?? []);
  const companions = computed(() => hero.value?.companions ?? []);
  const conditions = computed(() => hero.value?.conditions ?? []);
  const injuries = computed(() => hero.value?.injuries ?? []);
  const cultures = computed(() => hero.value?.cultures ?? []);

  // Get classifier store reference once at setup time (not inside computed)
  // This avoids creating new store refs on each computed evaluation
  const classifierStore = useClassifierStore();

  const isSinger = computed(() => {
    if (!hero.value) return false;
    const singerAncestry = findByCode(classifierStore.ancestries, 'singer');
    return hero.value.ancestryId === singerAncestry?.id;
  });

  const levelData = computed(() => {
    return findByProp(classifierStore.levels, 'level', hero.value?.level || 1);
  });

  const tierData = computed(() => {
    return findById(classifierStore.tiers, levelData.value?.tierId);
  });

  // ===================
  // LOOKUP HELPERS
  // ===================
  function getAttributeValue(attrCode: string): number {
    if (!hero.value?.attributes) return 0;
    const classifiers = useClassifierStore();
    const attr = findByCode(classifiers.attributes, attrCode);
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
    const attrType = findByCode(classifiers.attributeTypes, attrTypeCode);
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
    const skillData = findByCode(classifiers.skills, skillCode);
    if (!skillData || !hero.value) return 0;
    const attrValue = getAttributeValueById(skillData.attrId);
    const rank = getSkillRank(skillData.id);
    return attrValue + rank;
  }

  // ===================
  // LOAD / SAVE / INIT
  // ===================
  async function loadHero(id: number): Promise<void> {
    const requestId = ++loadRequestId;
    loading.value = true;
    error.value = null;

    // Clear any existing hero to avoid stale data
    hero.value = null;

    try {
      // TODO: Replace with actual API call
      let heroesModule;
      try {
        heroesModule = await import('src/mock/heroes');
      } catch (importErr) {
        // Only update state if this is still the current request
        if (requestId !== loadRequestId) {
          logger.debug('Stale loadHero response ignored (import error)', {
            requestId,
            current: loadRequestId,
          });
          return;
        }
        error.value = 'Failed to load hero data module';
        logger.error('Failed to import heroes module', {
          id,
          error: importErr instanceof Error ? importErr.message : String(importErr),
          stack: importErr instanceof Error ? importErr.stack : undefined,
        });
        return;
      }

      // Check if this request is still current after async operation
      if (requestId !== loadRequestId) {
        logger.debug('Stale loadHero response ignored', { requestId, current: loadRequestId });
        return;
      }

      const found = heroesModule.heroes.find((h) => h.id === id);
      if (found) {
        // Deep clone to avoid mutating shared mock data
        hero.value = structuredClone(found);
        logger.info('Hero loaded', { id, name: found.name, level: found.level });
      } else {
        error.value = 'Hero not found';
        logger.warn('Hero not found', { id });
      }
    } catch (err) {
      // Only update state if this is still the current request
      if (requestId !== loadRequestId) {
        logger.debug('Stale loadHero response ignored (error)', {
          requestId,
          current: loadRequestId,
        });
        return;
      }
      error.value = 'Failed to load hero';
      logger.error('Failed to load hero', {
        id,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
    } finally {
      // Only update loading state if this is still the current request
      if (requestId === loadRequestId) {
        loading.value = false;
      }
    }
  }

  function initNewHero(campaignId?: number): void {
    hero.value = createEmptyHero();
    if (campaignId !== undefined) {
      hero.value.campaignId = campaignId;
    }
    tempIdCounter.value = -1;
    logger.info('New hero initialized', { campaignId });
  }

  function clearHero(): void {
    hero.value = null;
    error.value = null;
    tempIdCounter.value = -1;
  }

  function setError(message: string): void {
    error.value = message;
  }

  // ===================
  // BASIC INFO
  // ===================
  function setName(name: string) {
    if (!hero.value) return;
    // Validate input type
    if (typeof name !== 'string') {
      logger.warn('Invalid name type', { received: typeof name });
      return;
    }
    // Sanitize: trim whitespace and limit length
    const sanitized = name.trim().slice(0, 100);
    hero.value.name = sanitized;
  }

  function setLevel(level: number) {
    if (!hero.value) return;
    // Validate level is within valid range (1-20 typically)
    if (!Number.isInteger(level) || level < 1 || level > 20) {
      logger.warn('Invalid level value', { level });
      return;
    }
    hero.value.level = level;
  }

  function setCampaignId(campaignId: number | null) {
    if (!hero.value) return;
    hero.value.campaignId = campaignId;
  }

  // ===================
  // ANCESTRY
  // ===================
  function setAncestry(ancestryId: number) {
    if (!hero.value) return;
    const classifiers = useClassifierStore();
    const singerAncestry = findByCode(classifiers.ancestries, 'singer');

    // Remove previous ancestry talents if changing ancestry
    if (hero.value.ancestryId) {
      const prevAncestryId = hero.value.ancestryId;
      const prevAncestryTalentIds = classifiers.talents
        .filter((t) => t.ancestryId === prevAncestryId)
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
    const culture = findById(classifiers.cultures, cultureId);
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
    const stat = findByCode(classifiers.derivedStats, statCode);
    if (!stat) return undefined;
    return hero.value.derivedStats.find((s) => s.statId === stat.id);
  }

  function getDerivedStatValue(statCode: string): number {
    return getHeroDerivedStat(statCode)?.value ?? 0;
  }

  function getDerivedStatTotal(statCode: string): number {
    // Build attribute values map for formula calculation
    const classifiers = useClassifierStore();
    const attrs: Record<string, number> = {};
    for (const attr of classifiers.attributes) {
      attrs[attr.code] = getAttributeValue(attr.code);
    }

    // Calculate base value from formula
    const baseValue = calculateFormulaStat(statCode, attrs, levelData.value, tierData.value);

    // Add modifier from hero's stored stat
    const heroStat = getHeroDerivedStat(statCode);
    const modifier = heroStat?.modifier ?? 0;

    return baseValue + modifier;
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
    const unit = heroStat.unitId ? (findById(classifiers.units, heroStat.unitId)?.code ?? '') : '';
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
      const prevOrder = findById(classifiers.radiantOrders, hero.value.radiantOrderId);
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
    const kitData = findById(classifiers.startingKits, startingKitId);
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
  // Maximum stack size for equipment items
  const MAX_EQUIPMENT_STACK = 999;

  function addEquipment(equipmentId: number, amount: number = 1) {
    if (!hero.value) return;
    // Validate amount - must be positive
    const validAmount = Math.max(1, Math.floor(amount));
    const existing = hero.value.equipment.find((e) => e.equipmentId === equipmentId);
    if (existing) {
      // Cap at max stack size
      existing.amount = Math.min(existing.amount + validAmount, MAX_EQUIPMENT_STACK);
    } else {
      hero.value.equipment.push({
        id: nextTempId(),
        heroId: hero.value.id,
        equipmentId,
        amount: Math.min(validAmount, MAX_EQUIPMENT_STACK),
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
    const activeStatus = findByCode(classifiers.goalStatuses, 'active');
    hero.value.goals.push({
      id: nextTempId(),
      heroId: hero.value.id,
      name,
      ...(description && { description }),
      value: 0,
      statusId: activeStatus?.id || 1,
    });
  }

  function removeGoalById(goalId: number): boolean {
    return removeById(hero.value?.goals, goalId);
  }

  /** @deprecated Use removeGoalById for race-condition safe removal */
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

  function removeConnectionById(connectionId: number): boolean {
    return removeById(hero.value?.connections, connectionId);
  }

  /** @deprecated Use removeConnectionById for race-condition safe removal */
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
      // Validate resource values are non-negative integers
      const validated: Partial<typeof resources> = {};
      if (resources.currentHealth !== undefined) {
        validated.currentHealth = Math.max(0, Math.floor(resources.currentHealth));
      }
      if (resources.currentFocus !== undefined) {
        validated.currentFocus = Math.max(0, Math.floor(resources.currentFocus));
      }
      if (resources.currentInvestiture !== undefined) {
        validated.currentInvestiture = Math.max(0, Math.floor(resources.currentInvestiture));
      }

      // TODO: API call
      Object.assign(hero.value, validated);
      return { success: true };
    } catch (err) {
      error.value = 'Failed to update resources';
      logger.error('Failed to update resources', {
        error: err instanceof Error ? err.message : String(err),
      });
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
    talents,
    skills,
    expertises,
    equipment,
    goals,
    connections,
    companions,
    conditions,
    injuries,
    cultures,

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
    setError,

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
    removeGoalById,

    // Connections
    addConnection,
    removeConnection,
    removeConnectionById,

    // Personal Details
    setAppearance,
    setBiography,
    setNotes,

    // Resources
    updateResources,
  };
});
