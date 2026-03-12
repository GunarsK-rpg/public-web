import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Hero, HeroSheet, HeroEquipment, HeroFavoriteAction, HeroCondition } from 'src/types';
import type { HeroConditionBase, HeroInjury, HeroInjuryBase, Injury } from 'src/types/conditions';
import type { HeroGoal } from 'src/types/goals';
import type { CampaignRef, ClassifierRef, SpecialEntry } from 'src/types/shared';
import { logger } from 'src/utils/logger';
import heroService from 'src/services/heroService';
import { handleError } from 'src/utils/errorHandling';
import { MAX_EQUIPMENT_STACK } from 'src/constants';
import { clamp } from 'src/utils/numberUtils';

/**
 * Default empty Hero for new character creation
 */
function createEmptyHero(): HeroSheet {
  return {
    id: 0,
    userId: 0,
    user: { id: 0, username: '' },
    campaignId: null,
    campaign: null,
    ancestry: { id: 0, code: '', name: '' },
    startingKit: null,
    activeSingerForm: null,
    radiantOrder: null,
    radiantIdeal: 0,
    name: '',
    level: 1,
    currentHealth: 0,
    currentFocus: 0,
    currentInvestiture: 0,
    currency: 0,
    attributes: [],
    defenses: [],
    derivedStats: [],
    skills: [],
    talents: [],
    expertises: [],
    equipment: [],
    conditions: [],
    injuries: [],
    goals: [],
    connections: [],
    companions: [],
    cultures: [],
    favoriteActions: [],
  };
}

export const useHeroStore = defineStore('hero', () => {
  const hero = ref<HeroSheet | null>(null);
  const loading = ref(false);
  const savingCount = ref(0);
  const saving = computed(() => savingCount.value > 0);
  const error = ref<string | null>(null);

  // Track pending load requests to handle race conditions
  let loadRequestId = 0;

  // Temporary ID counter for new items (negative to distinguish from DB IDs)
  const tempIdCounter = ref(-1);
  function nextTempId(): number {
    return tempIdCounter.value--;
  }

  // ===================
  // COMPUTED
  // ===================
  const isLoaded = computed(() => !!hero.value);
  const isNew = computed(() => hero.value?.id === 0);

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
  const favoriteActions = computed(() => hero.value?.favoriteActions ?? []);

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
      const response = await heroService.getSheet(id);

      if (requestId !== loadRequestId) {
        logger.debug('Stale loadHero response ignored', { requestId, current: loadRequestId });
        return;
      }

      hero.value = response.data;
      logger.info('Hero loaded', { id, name: response.data.name, level: response.data.level });
    } catch (err) {
      if (requestId !== loadRequestId) {
        logger.debug('Stale loadHero response ignored (error)', {
          requestId,
          current: loadRequestId,
        });
        return;
      }
      handleError(err, {
        errorRef: error,
        message: 'Failed to load hero',
        notFoundMessage: 'Hero not found',
        context: { id },
      });
    } finally {
      if (requestId === loadRequestId) {
        loading.value = false;
      }
    }
  }

  function initNewHero(campaign?: CampaignRef): void {
    hero.value = createEmptyHero();
    if (campaign) {
      hero.value.campaignId = campaign.id;
      hero.value.campaign = { id: campaign.id, code: campaign.code, name: campaign.name };
    }
    tempIdCounter.value = -1;
    logger.info('New hero initialized', { campaignId: campaign?.id });
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
    if (typeof name !== 'string') {
      logger.warn('Invalid name type', { received: typeof name });
      return;
    }
    const sanitized = name.trim().slice(0, 100);
    hero.value.name = sanitized;
  }

  function setLevel(level: number) {
    if (!hero.value) return;
    if (!Number.isInteger(level) || level < 1 || level > 20) {
      logger.warn('Invalid level value', { level });
      return;
    }
    hero.value.level = level;
  }

  function setCampaignId(campaignId: number | null) {
    if (!hero.value) return;
    hero.value.campaignId = campaignId;
    if (campaignId === null) {
      hero.value.campaign = null;
    }
  }

  function setCampaign(campaign: ClassifierRef | null) {
    if (!hero.value) return;
    if (campaign) {
      hero.value.campaignId = campaign.id;
      hero.value.campaign = { id: campaign.id, code: campaign.code, name: campaign.name };
    } else {
      hero.value.campaignId = null;
      hero.value.campaign = null;
    }
  }

  function updateFromResponse(data: Hero): void {
    if (!hero.value) return;
    hero.value.id = data.id;
    hero.value.userId = data.userId;
    hero.value.user = data.user;
    hero.value.campaignId = data.campaignId;
    hero.value.campaign = data.campaign;
    hero.value.ancestry = data.ancestry;
    hero.value.startingKit = data.startingKit;
    hero.value.activeSingerForm = data.activeSingerForm;
    hero.value.radiantOrder = data.radiantOrder;
    hero.value.name = data.name;
    hero.value.level = data.level;
    hero.value.radiantIdeal = data.radiantIdeal;
    hero.value.currentHealth = data.currentHealth;
    hero.value.currentFocus = data.currentFocus;
    hero.value.currentInvestiture = data.currentInvestiture;
    hero.value.currency = data.currency;
  }

  // ===================
  // RESOURCES
  // ===================
  async function patchResource<K extends keyof HeroSheet>(
    serviceFn: (heroId: number, value: number) => Promise<{ data: Pick<HeroSheet, K> }>,
    field: K,
    value: number,
    errorMessage: string
  ): Promise<void> {
    if (!hero.value) return;
    savingCount.value++;
    try {
      const response = await serviceFn(hero.value.id, Math.max(0, Math.floor(value)));
      hero.value[field] = response.data[field];
    } catch (err) {
      handleError(err, { errorRef: error, message: errorMessage });
    } finally {
      savingCount.value--;
    }
  }

  const patchHealth = (v: number) =>
    patchResource(
      (id, val) => heroService.patchHealth(id, val),
      'currentHealth',
      v,
      'Failed to update health'
    );

  const patchFocus = (v: number) =>
    patchResource(
      (id, val) => heroService.patchFocus(id, val),
      'currentFocus',
      v,
      'Failed to update focus'
    );

  const patchInvestiture = (v: number) =>
    patchResource(
      (id, val) => heroService.patchInvestiture(id, val),
      'currentInvestiture',
      v,
      'Failed to update investiture'
    );

  const patchCurrency = (v: number) =>
    patchResource(
      (id, val) => heroService.patchCurrency(id, val),
      'currency',
      v,
      'Failed to update currency'
    );

  // ===================
  // EQUIPMENT (sheet)
  // ===================
  async function addEquipment(
    equipmentCode: string,
    amount: number = 1,
    maxCharges?: number | null
  ): Promise<boolean> {
    if (!hero.value) return false;
    savingCount.value++;
    try {
      const existing = hero.value.equipment.find((e) => e.equipment?.code === equipmentCode);
      const payload: Record<string, unknown> = {
        heroId: hero.value.id,
        equipment: { code: equipmentCode },
        amount: clamp(Math.floor(amount), 1, MAX_EQUIPMENT_STACK),
        isEquipped: existing?.isEquipped ?? false,
      };
      if (maxCharges != null) {
        payload.charges = maxCharges;
        payload.maxCharges = maxCharges;
      }
      const response = await heroService.upsertSubResource<HeroEquipment>(
        hero.value.id,
        'equipment',
        payload
      );
      if (!hero.value) return false;
      const idx = hero.value.equipment.findIndex((e) => e.id === response.data.id);
      if (idx !== -1) {
        hero.value.equipment[idx] = response.data;
      } else {
        hero.value.equipment.push(response.data);
      }
      return true;
    } catch (err) {
      handleError(err, { errorRef: error, message: 'Failed to add equipment' });
      return false;
    } finally {
      savingCount.value--;
    }
  }

  async function removeEquipment(heroEquipmentId: number): Promise<void> {
    if (!hero.value) return;
    savingCount.value++;
    try {
      await heroService.deleteSubResource(hero.value.id, 'equipment', heroEquipmentId);
      if (!hero.value) return;
      hero.value.equipment = hero.value.equipment.filter((e) => e.id !== heroEquipmentId);
      hero.value.favoriteActions = hero.value.favoriteActions.filter(
        (f) => f.heroEquipmentId !== heroEquipmentId
      );
    } catch (err) {
      handleError(err, { errorRef: error, message: 'Failed to remove equipment' });
    } finally {
      savingCount.value--;
    }
  }

  async function addCustomEquipment(
    equipTypeCode: string,
    customName: string,
    options?: { notes?: string; maxCharges?: number; specialOverrides?: SpecialEntry[] }
  ): Promise<boolean> {
    if (!hero.value) return false;
    savingCount.value++;
    try {
      const payload: Record<string, unknown> = {
        heroId: hero.value.id,
        equipType: { code: equipTypeCode },
        customName,
        amount: 1,
        isEquipped: false,
      };
      if (options?.notes) payload.notes = options.notes;
      if (options?.maxCharges != null) {
        payload.maxCharges = options.maxCharges;
        payload.charges = options.maxCharges;
      }
      if (options?.specialOverrides?.length) {
        payload.specialOverrides = options.specialOverrides;
      }
      const response = await heroService.upsertSubResource<HeroEquipment>(
        hero.value.id,
        'equipment',
        payload
      );
      if (!hero.value) return false;
      hero.value.equipment.push(response.data);
      return true;
    } catch (err) {
      handleError(err, { errorRef: error, message: 'Failed to add custom equipment' });
      return false;
    } finally {
      savingCount.value--;
    }
  }

  async function updateEquipment(
    heroEquipmentId: number,
    changes: Partial<
      Pick<
        HeroEquipment,
        | 'amount'
        | 'isEquipped'
        | 'notes'
        | 'customName'
        | 'charges'
        | 'maxCharges'
        | 'specialOverrides'
      >
    >
  ): Promise<void> {
    if (!hero.value) return;
    const existing = hero.value.equipment.find((e) => e.id === heroEquipmentId);
    if (!existing) return;
    savingCount.value++;
    try {
      const payload: Record<string, unknown> = {
        id: heroEquipmentId,
        heroId: hero.value.id,
        amount: clamp(Math.floor(changes.amount ?? existing.amount), 1, MAX_EQUIPMENT_STACK),
        isEquipped: changes.isEquipped ?? existing.isEquipped,
        notes: changes.notes !== undefined ? changes.notes : existing.notes,
        customName: changes.customName !== undefined ? changes.customName : existing.customName,
      };
      if (existing.equipment) {
        payload.equipment = { code: existing.equipment.code };
      }
      // Always send charges/maxCharges as a pair (ck_equipment_charges_pairing constraint)
      if (changes.charges !== undefined || changes.maxCharges !== undefined) {
        const newMaxCharges =
          changes.maxCharges !== undefined ? changes.maxCharges : existing.maxCharges;
        payload.maxCharges = newMaxCharges;
        // If maxCharges is cleared, charges must also be cleared to preserve pairing
        payload.charges =
          changes.charges !== undefined
            ? changes.charges
            : newMaxCharges === null
              ? null
              : existing.charges;
      }
      if (changes.specialOverrides !== undefined)
        payload.specialOverrides = changes.specialOverrides;
      const response = await heroService.upsertSubResource<HeroEquipment>(
        hero.value.id,
        'equipment',
        payload
      );
      if (!hero.value) return;
      const idx = hero.value.equipment.findIndex((e) => e.id === heroEquipmentId);
      if (idx !== -1) hero.value.equipment[idx] = response.data;
    } catch (err) {
      handleError(err, { errorRef: error, message: 'Failed to update equipment' });
    } finally {
      savingCount.value--;
    }
  }

  // ===================
  // FAVORITE ACTIONS
  // ===================
  function findFavoriteAction(
    actionId: number | null,
    heroEquipmentId: number | null = null
  ): HeroFavoriteAction | undefined {
    return hero.value?.favoriteActions.find(
      (f) => f.actionId === actionId && f.heroEquipmentId === heroEquipmentId
    );
  }

  async function addFavoriteAction(
    actionId: number | null,
    heroEquipmentId: number | null = null
  ): Promise<void> {
    if (!hero.value) return;
    const currentHeroId = hero.value.id;
    savingCount.value++;
    try {
      const response = await heroService.upsertSubResource<HeroFavoriteAction>(
        currentHeroId,
        'favorites',
        { heroId: currentHeroId, actionId, heroEquipmentId }
      );
      if (!hero.value || hero.value.id !== currentHeroId) return;
      const idx = hero.value.favoriteActions.findIndex((f) => f.id === response.data.id);
      if (idx !== -1) {
        hero.value.favoriteActions[idx] = response.data;
      } else {
        hero.value.favoriteActions.push(response.data);
      }
    } catch (err) {
      handleError(err, { errorRef: error, message: 'Failed to add favorite' });
    } finally {
      savingCount.value--;
    }
  }

  async function removeFavoriteAction(favoriteId: number): Promise<void> {
    if (!hero.value) return;
    const currentHeroId = hero.value.id;
    savingCount.value++;
    try {
      await heroService.deleteSubResource(currentHeroId, 'favorites', favoriteId);
      if (!hero.value || hero.value.id !== currentHeroId) return;
      hero.value.favoriteActions = hero.value.favoriteActions.filter((f) => f.id !== favoriteId);
    } catch (err) {
      handleError(err, { errorRef: error, message: 'Failed to remove favorite' });
    } finally {
      savingCount.value--;
    }
  }

  // ===================
  // CONDITIONS (sheet)
  // ===================
  async function upsertCondition(payload: HeroConditionBase): Promise<HeroCondition | null> {
    if (!hero.value) return null;
    const currentHeroId = hero.value.id;
    savingCount.value++;
    try {
      const response = await heroService.upsertSubResource<HeroCondition>(
        currentHeroId,
        'conditions',
        payload
      );
      if (!hero.value || hero.value.id !== currentHeroId) return null;
      const idx = hero.value.conditions.findIndex((c) => c.id === response.data.id);
      if (idx !== -1) {
        hero.value.conditions[idx] = response.data;
      } else {
        hero.value.conditions.push(response.data);
      }
      return response.data;
    } catch (err) {
      handleError(err, { errorRef: error, message: 'Failed to save condition' });
      return null;
    } finally {
      savingCount.value--;
    }
  }

  async function removeCondition(conditionId: number): Promise<void> {
    if (!hero.value) return;
    const currentHeroId = hero.value.id;
    savingCount.value++;
    try {
      await heroService.deleteSubResource(currentHeroId, 'conditions', conditionId);
      if (!hero.value || hero.value.id !== currentHeroId) return;
      hero.value.conditions = hero.value.conditions.filter((c) => c.id !== conditionId);
    } catch (err) {
      handleError(err, { errorRef: error, message: 'Failed to remove condition' });
    } finally {
      savingCount.value--;
    }
  }

  // ===================
  // INJURIES (sheet)
  // ===================
  async function upsertInjury(
    payload: HeroInjuryBase,
    injuryClassifier?: Injury
  ): Promise<HeroInjury | null> {
    if (!hero.value) return null;
    const currentHeroId = hero.value.id;
    savingCount.value++;
    try {
      const response = await heroService.upsertSubResource<HeroInjury>(
        currentHeroId,
        'injuries',
        payload
      );
      if (!hero.value || hero.value.id !== currentHeroId) return null;
      const idx = hero.value.injuries.findIndex((i) => i.id === response.data.id);
      if (idx !== -1) {
        hero.value.injuries[idx] = response.data;
      } else {
        hero.value.injuries.push(response.data);
      }

      // Auto-apply linked condition (if classifier provides mapping and this is a new injury)
      if (idx === -1 && injuryClassifier?.condition) {
        await upsertCondition({
          heroId: currentHeroId,
          condition: { code: injuryClassifier.condition.code },
          notes: `From injury: ${injuryClassifier.name}`,
          special: injuryClassifier.special ?? null,
        });
      }

      return response.data;
    } catch (err) {
      handleError(err, { errorRef: error, message: 'Failed to save injury' });
      return null;
    } finally {
      savingCount.value--;
    }
  }

  async function removeInjury(injuryId: number, linkedConditionId?: number): Promise<void> {
    if (!hero.value) return;
    const currentHeroId = hero.value.id;
    savingCount.value++;
    try {
      await heroService.deleteSubResource(currentHeroId, 'injuries', injuryId);
      if (!hero.value || hero.value.id !== currentHeroId) return;
      hero.value.injuries = hero.value.injuries.filter((i) => i.id !== injuryId);

      // Auto-remove linked condition
      if (linkedConditionId) {
        await removeCondition(linkedConditionId);
      }
    } catch (err) {
      handleError(err, { errorRef: error, message: 'Failed to remove injury' });
    } finally {
      savingCount.value--;
    }
  }

  // ===================
  // GOALS (sheet)
  // ===================
  async function updateGoalValue(goalId: number, value: number): Promise<HeroGoal | null> {
    if (!hero.value) return null;
    if (!Number.isInteger(value) || value < 0 || value > 3) return null;
    const goal = hero.value.goals.find((g) => g.id === goalId);
    if (!goal) return null;
    const currentHeroId = hero.value.id;
    savingCount.value++;
    try {
      const response = await heroService.upsertSubResource<HeroGoal>(currentHeroId, 'goals', {
        ...goal,
        heroId: currentHeroId,
        status: { code: goal.status.code },
        value,
      });
      if (!hero.value || hero.value.id !== currentHeroId) return null;
      const idx = hero.value.goals.findIndex((g) => g.id === response.data.id);
      if (idx !== -1) hero.value.goals[idx] = response.data;
      return response.data;
    } catch (err) {
      handleError(err, { errorRef: error, message: 'Failed to update goal' });
      return null;
    } finally {
      savingCount.value--;
    }
  }

  async function deleteHero(): Promise<boolean> {
    if (!hero.value || hero.value.id === 0) return false;
    try {
      await heroService.delete(hero.value.id);
      loadRequestId++;
      clearHero();
      return true;
    } catch (err) {
      handleError(err, { errorRef: error, message: 'Failed to delete character' });
      return false;
    }
  }

  return {
    // State
    hero,
    loading,
    saving,
    error,

    // Utilities
    nextTempId,

    // Computed
    isLoaded,
    isNew,
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
    favoriteActions,

    // Load/Save/Init
    loadHero,
    initNewHero,
    clearHero,
    setError,

    // Basic Info
    setName,
    setLevel,
    setCampaignId,
    setCampaign,
    updateFromResponse,

    // Resources
    patchHealth,
    patchFocus,
    patchInvestiture,
    patchCurrency,

    // Hero deletion
    deleteHero,

    // Equipment (sheet)
    addEquipment,
    addCustomEquipment,
    removeEquipment,
    updateEquipment,

    // Favorite actions
    findFavoriteAction,
    addFavoriteAction,
    removeFavoriteAction,

    // Conditions (sheet)
    upsertCondition,
    removeCondition,

    // Injuries (sheet)
    upsertInjury,
    removeInjury,

    // Goals (sheet)
    updateGoalValue,
  };
});
