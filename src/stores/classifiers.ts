import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { logger } from 'src/utils/logger';
import classifierService from 'src/services/classifierService';
import { handleError } from 'src/utils/errorHandling';
import type {
  Classifiers,
  AttributeType,
  Attribute,
  DerivedStat,
  DerivedStatValue,
  Skill,
  ExpertiseType,
  Expertise,
  ActivationType,
  ActionType,
  Action,
  ActionLink,
  Path,
  Specialty,
  Surge,
  RadiantOrder,
  SingerForm,
  Talent,
  Unit,
  EquipmentType,
  EquipmentAttribute,
  DamageType,
  Equipment,
  ModificationClassifier,
  Condition,
  Injury,
  GoalStatus,
  ConnectionType,
  CompanionType,
  StartingKit,
  Ancestry,
  Culture,
  Tier,
  Level,
} from 'src/types';

export const useClassifierStore = defineStore('classifiers', () => {
  const data = ref<Classifiers | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  // Concurrency lock: prevents parallel initialize() calls from double-loading
  let initPromise: Promise<void> | null = null;

  // Attributes & Stats
  const attributeTypes = computed((): AttributeType[] => data.value?.attributeTypes || []);
  const attributes = computed((): Attribute[] => data.value?.attributes || []);
  const derivedStats = computed((): DerivedStat[] => data.value?.derivedStats || []);
  const derivedStatValues = computed((): DerivedStatValue[] => data.value?.derivedStatValues || []);

  // Skills & Expertises
  const skills = computed((): Skill[] => data.value?.skills || []);
  const expertiseTypes = computed((): ExpertiseType[] => data.value?.expertiseTypes || []);
  const expertises = computed((): Expertise[] => data.value?.expertises || []);

  // Actions
  const activationTypes = computed((): ActivationType[] => data.value?.activationTypes || []);
  const actionTypes = computed((): ActionType[] => data.value?.actionTypes || []);
  const actions = computed((): Action[] => data.value?.actions || []);
  const actionLinks = computed((): ActionLink[] => data.value?.actionLinks || []);

  // Paths & Talents
  const paths = computed((): Path[] => data.value?.paths || []);
  const specialties = computed((): Specialty[] => data.value?.specialties || []);
  const surges = computed((): Surge[] => data.value?.surges || []);
  const radiantOrders = computed((): RadiantOrder[] => data.value?.radiantOrders || []);
  const singerForms = computed((): SingerForm[] => data.value?.singerForms || []);
  const talents = computed((): Talent[] => data.value?.talents || []);

  // Equipment
  const units = computed((): Unit[] => data.value?.units || []);
  const equipmentTypes = computed((): EquipmentType[] => data.value?.equipmentTypes || []);
  const damageTypes = computed((): DamageType[] => data.value?.damageTypes || []);
  const equipmentAttributes = computed(
    (): EquipmentAttribute[] => data.value?.equipmentAttributes || []
  );
  const equipment = computed((): Equipment[] => data.value?.equipment || []);
  const modifications = computed((): ModificationClassifier[] => data.value?.modifications || []);

  // Conditions & Status
  const conditions = computed((): Condition[] => data.value?.conditions || []);
  const injuries = computed((): Injury[] => data.value?.injuries || []);

  // Character Details
  const goalStatuses = computed((): GoalStatus[] => data.value?.goalStatuses || []);
  const connectionTypes = computed((): ConnectionType[] => data.value?.connectionTypes || []);
  const companionTypes = computed((): CompanionType[] => data.value?.companionTypes || []);

  // Starting & Ancestry
  const startingKits = computed((): StartingKit[] => data.value?.startingKits || []);
  const ancestries = computed((): Ancestry[] => data.value?.ancestries || []);
  const cultures = computed((): Culture[] => data.value?.cultures || []);

  // Progression
  const tiers = computed((): Tier[] => data.value?.tiers || []);
  const levels = computed((): Level[] => data.value?.levels || []);

  // Memoized lookup map for derived stat values: Map<derivedStatId, Map<attrValue, configValue>>
  // Cleared when data changes (via computed reactivity on derivedStatValues)
  // Max attribute value per Cosmere RPG rules (attributes range 0-10)
  const MAX_ATTRIBUTE_VALUE = 10;

  const derivedStatValueCache = computed(() => {
    const cache = new Map<number, Map<number, number>>();
    // Pre-build the cache for O(1) lookups
    for (const v of derivedStatValues.value) {
      if (!cache.has(v.derivedStat.id)) {
        cache.set(v.derivedStat.id, new Map());
      }
      // Store for each attribute value in the range
      const statMap = cache.get(v.derivedStat.id)!;
      const maxVal = v.attrMax ?? MAX_ATTRIBUTE_VALUE;
      for (let attr = v.attrMin; attr <= maxVal; attr++) {
        statMap.set(attr, v.value);
      }
    }
    return cache;
  });

  /**
   * Lookup derived stat value from config table (memoized)
   * @param derivedStatId - the derived stat id
   * @param attrValue - hero's attribute value for the stat's driving attribute
   * @returns the config value or undefined if no lookup exists
   */
  function getDerivedStatValue(
    derivedStatId: number | undefined | null,
    attrValue: number
  ): number | undefined {
    if (derivedStatId == null) return undefined;

    // Use memoized cache for O(1) lookup
    return derivedStatValueCache.value.get(derivedStatId)?.get(attrValue);
  }

  // Note: For array utilities (groupByKey, groupByChainedKey, buildLookupMap),
  // import directly from 'src/utils/arrayUtils'

  /**
   * Initialize classifiers from API or mock data
   * Concurrency-safe: parallel calls will wait for the first to complete
   */
  async function initialize(): Promise<void> {
    // Already initialized
    if (initialized.value) return;

    // If initialization is in progress, wait for it
    if (initPromise) {
      return initPromise;
    }

    // Start initialization
    initPromise = (async () => {
      loading.value = true;
      error.value = null;

      try {
        const response = await classifierService.getAll();
        data.value = response.data;
        initialized.value = true;
        logger.info('Classifiers loaded');
      } catch (err) {
        handleError(err, { errorRef: error, message: 'Failed to load classifiers' });
        // Reset promise on failure to allow retry
        initPromise = null;
      } finally {
        loading.value = false;
      }
    })();

    return initPromise;
  }

  /**
   * Reset store to initial state
   * Clears initialization promise to allow re-initialization
   */
  function reset(): void {
    data.value = null;
    loading.value = false;
    error.value = null;
    initialized.value = false;
    initPromise = null;
  }

  return {
    data,
    loading,
    error,
    initialized,

    // Attributes & Stats
    attributeTypes,
    attributes,
    derivedStats,
    derivedStatValues,

    // Skills & Expertises
    skills,
    expertiseTypes,
    expertises,

    // Actions
    activationTypes,
    actionTypes,
    actions,
    actionLinks,

    // Paths & Talents
    paths,
    specialties,
    surges,
    radiantOrders,
    singerForms,
    talents,

    // Equipment
    units,
    equipmentTypes,
    damageTypes,
    equipmentAttributes,
    equipment,
    modifications,

    // Conditions & Status
    conditions,
    injuries,

    // Character Details
    goalStatuses,
    connectionTypes,
    companionTypes,

    // Starting & Ancestry
    startingKits,
    ancestries,
    cultures,

    // Progression
    tiers,
    levels,

    // Lookups
    getDerivedStatValue,
    initialize,
    reset,
  };
});
