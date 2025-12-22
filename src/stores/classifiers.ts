import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { logger } from 'src/utils/logger';
import type {
  Classifier,
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

interface Classifiers {
  // Attributes & Stats
  attributeTypes: AttributeType[];
  attributes: Attribute[];
  derivedStats: DerivedStat[];
  derivedStatValues: DerivedStatValue[];

  // Skills & Expertises
  skills: Skill[];
  expertiseTypes: ExpertiseType[];
  expertises: Expertise[];

  // Actions
  activationTypes: ActivationType[];
  actionTypes: ActionType[];
  actions: Action[];
  actionLinks: ActionLink[];

  // Paths & Talents
  paths: Path[];
  specialties: Specialty[];
  surges: Surge[];
  radiantOrders: RadiantOrder[];
  singerForms: SingerForm[];
  talents: Talent[];

  // Equipment
  units: Unit[];
  equipmentTypes: EquipmentType[];
  damageTypes: DamageType[];
  equipmentAttributes: EquipmentAttribute[];
  equipment: Equipment[];

  // Conditions & Status
  conditions: Condition[];
  injuries: Injury[];

  // Character Details
  goalStatuses: GoalStatus[];
  connectionTypes: ConnectionType[];
  companionTypes: CompanionType[];

  // Starting & Ancestry
  startingKits: StartingKit[];
  ancestries: Ancestry[];
  cultures: Culture[];

  // Progression
  tiers: Tier[];
  levels: Level[];
}

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

  /**
   * Lookup derived stat value from config table
   * @param derivedStatId - the derived stat id
   * @param attrValue - hero's attribute value for the stat's driving attribute
   * @returns the config value or undefined if no lookup exists
   */
  function getDerivedStatValue(
    derivedStatId: number | undefined | null,
    attrValue: number
  ): number | undefined {
    if (derivedStatId == null) return undefined;

    const entry = derivedStatValues.value.find(
      (v) =>
        v.derivedStatId === derivedStatId &&
        attrValue >= v.attrMin &&
        (v.attrMax === null || attrValue <= v.attrMax)
    );
    return entry?.value;
  }

  /**
   * Group classifiers by a property.
   * @param list - classifier array to group
   * @param keyFn - function to extract the grouping key from each item
   * @returns Record mapping keys to arrays of items
   */
  function groupByKey<T, K extends PropertyKey>(list: T[], keyFn: (item: T) => K): Record<K, T[]> {
    const result = {} as Record<K, T[]>;
    for (const item of list) {
      const key = keyFn(item);
      if (!result[key]) result[key] = [];
      result[key].push(item);
    }
    return result;
  }

  /**
   * Group classifiers by a foreign key ID property.
   * @param list - classifier array to group
   * @param propName - property name containing the foreign key ID
   * @returns Record mapping IDs to arrays of items
   */
  function groupByForeignKey<T extends Classifier, K extends keyof T>(
    list: T[],
    propName: K
  ): Record<number, T[]> {
    return groupByKey(list, (item) => item[propName] as number);
  }

  /**
   * Build a lookup map from one foreign key to another property.
   * Useful for chained lookups like: skill.attrId -> attribute.attrTypeId
   * @param list - classifier array to index
   * @param valueProp - property name for the value to map to
   * @returns Record mapping item IDs to the specified property value
   */
  function buildLookupMap<T extends Classifier, K extends keyof T>(
    list: T[],
    valueProp: K
  ): Record<number, T[K]> {
    const map: Record<number, T[K]> = {};
    for (const item of list) {
      map[item.id] = item[valueProp];
    }
    return map;
  }

  /**
   * Group items by a chained foreign key lookup.
   * Example: group skills by attrTypeId via skill.attrId -> attribute.attrTypeId
   * @param items - items to group
   * @param foreignKeyProp - property on item containing the foreign key
   * @param lookupList - classifier list to look up the foreign key in
   * @param targetProp - property on lookup item to group by
   * @returns Record mapping target property values to arrays of items
   */
  function groupByChainedKey<T, FK extends keyof T, L extends Classifier, TP extends keyof L>(
    items: T[],
    foreignKeyProp: FK,
    lookupList: L[],
    targetProp: TP
  ): Record<number, T[]> {
    // Build lookup map: lookupItem.id -> lookupItem[targetProp]
    const lookupMap: Record<number, number> = {};
    for (const item of lookupList) {
      lookupMap[item.id] = item[targetProp] as number;
    }

    // Group items by the chained lookup
    return groupByKey(items, (item) => lookupMap[item[foreignKeyProp] as number] ?? 0);
  }

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
        // TODO: Replace with actual API call
        // const response = await classifierService.getAll();
        // data.value = response.data;

        // Mock: Import from mock data
        const mockData = await import('src/mock/classifiers');
        data.value = mockData.classifiers;
        initialized.value = true;
        logger.info('Classifiers loaded');
      } catch (err) {
        error.value = 'Failed to load classifiers';
        logger.error(
          'Failed to load classifiers',
          err instanceof Error ? err : { error: String(err) }
        );
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
    groupByKey,
    groupByForeignKey,
    groupByChainedKey,
    buildLookupMap,
    initialize,
    reset,
  };
});
