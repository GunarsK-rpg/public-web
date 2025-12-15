import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
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
   * Generic lookup by any property with null safety
   * @param list - classifier array to search
   * @param prop - property name to match
   * @param value - value to find
   * @returns matching classifier or undefined
   */
  function getByProp<T extends Classifier, K extends keyof T>(
    list: T[],
    prop: K,
    value: T[K] | undefined | null
  ): T | undefined {
    if (value == null) return undefined;
    return list.find((item) => item[prop] === value);
  }

  /**
   * Lookup classifier by id
   * Note: This assumes IDs are non-overlapping within each classifier type.
   * Each classifier table has its own ID sequence in the database.
   * @param list - classifier array to search
   * @param id - id to find
   * @returns matching classifier or undefined
   */
  function getById<T extends Classifier>(list: T[], id: number | undefined | null): T | undefined {
    return getByProp(list, 'id', id);
  }

  /**
   * Lookup classifier by code
   * @param list - classifier array to search
   * @param code - code to find
   * @returns matching classifier or undefined
   */
  function getByCode<T extends Classifier>(
    list: T[],
    code: string | undefined | null
  ): T | undefined {
    return getByProp(list, 'code', code);
  }

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
      } catch (err) {
        error.value = 'Failed to load classifiers';
        console.error('Failed to load classifiers:', err);
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
   */
  function reset(): void {
    data.value = null;
    loading.value = false;
    error.value = null;
    initialized.value = false;
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

    // Generic lookups
    getByProp,
    getById,
    getByCode,
    getDerivedStatValue,
    initialize,
    reset,
  };
});
