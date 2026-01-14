import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Hero } from 'src/types';
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
      // TODO: Replace with actual API call
      let heroesModule;
      try {
        heroesModule = await import('src/mock/heroes');
      } catch (importErr) {
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

      if (requestId !== loadRequestId) {
        logger.debug('Stale loadHero response ignored', { requestId, current: loadRequestId });
        return;
      }

      const found = heroesModule.heroes.find((h) => h.id === id);
      if (found) {
        hero.value = structuredClone(found);
        logger.info('Hero loaded', { id, name: found.name, level: found.level });
      } else {
        error.value = 'Hero not found';
        logger.warn('Hero not found', { id });
      }
    } catch (err) {
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
