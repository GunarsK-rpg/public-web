import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Hero, HeroSheet, HeroEquipment } from 'src/types';
import type { ClassifierRef } from 'src/types/shared';
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
  async function addEquipment(equipmentCode: string, amount: number = 1): Promise<boolean> {
    if (!hero.value) return false;
    savingCount.value++;
    try {
      const existing = hero.value.equipment.find((e) => e.equipment.code === equipmentCode);
      const payload = {
        heroId: hero.value.id,
        equipment: { code: equipmentCode },
        amount: clamp(Math.floor(amount), 1, MAX_EQUIPMENT_STACK),
        isEquipped: existing?.isEquipped ?? false,
      };
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
    } catch (err) {
      handleError(err, { errorRef: error, message: 'Failed to remove equipment' });
    } finally {
      savingCount.value--;
    }
  }

  async function updateEquipment(
    heroEquipmentId: number,
    changes: Partial<Pick<HeroEquipment, 'amount' | 'isEquipped' | 'notes' | 'customName'>>
  ): Promise<void> {
    if (!hero.value) return;
    const existing = hero.value.equipment.find((e) => e.id === heroEquipmentId);
    if (!existing) return;
    savingCount.value++;
    try {
      const payload = {
        id: heroEquipmentId,
        heroId: hero.value.id,
        equipment: { code: existing.equipment.code },
        amount: clamp(Math.floor(changes.amount ?? existing.amount), 1, MAX_EQUIPMENT_STACK),
        isEquipped: changes.isEquipped ?? existing.isEquipped,
        notes: changes.notes !== undefined ? changes.notes : existing.notes,
        customName: changes.customName !== undefined ? changes.customName : existing.customName,
      };
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

    // Equipment (sheet)
    addEquipment,
    removeEquipment,
    updateEquipment,
  };
});
