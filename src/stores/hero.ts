import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { HeroSheet } from 'src/types';
import { logger } from 'src/utils/logger';
import heroService from 'src/services/heroService';
import { handleError } from 'src/utils/errorHandling';

/**
 * Default empty Hero for new character creation
 */
function createEmptyHero(): HeroSheet {
  return {
    id: 0,
    userId: 0,
    user: { id: 0, username: '' },
    campaignId: null,
    campaign: { id: 0, code: '', name: '' },
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
  const saving = ref(false);
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
      if (resources.currentHealth !== undefined) {
        hero.value.currentHealth = Math.max(0, Math.floor(resources.currentHealth));
      }
      if (resources.currentFocus !== undefined) {
        hero.value.currentFocus = Math.max(0, Math.floor(resources.currentFocus));
      }
      if (resources.currentInvestiture !== undefined) {
        hero.value.currentInvestiture = Math.max(0, Math.floor(resources.currentInvestiture));
      }
      return { success: true };
    } catch (err) {
      const msg = 'Failed to update resources';
      handleError(err, { errorRef: error, message: msg });
      return { success: false, error: msg };
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

    // Resources
    updateResources,
  };
});
