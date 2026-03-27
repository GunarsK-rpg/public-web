import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSavingState } from 'src/composables/useSavingState';
import type {
  Hero,
  HeroSheet,
  HeroEquipment,
  HeroFavoriteAction,
  HeroFavoriteActionBase,
  HeroCondition,
} from 'src/types';
import type { HeroConditionBase, HeroInjury, HeroInjuryBase, Injury } from 'src/types/conditions';
import type { HeroGoal, HeroGoalBase, HeroConnectionBase, HeroConnection } from 'src/types/goals';
import type { NpcOption, NpcInstance } from 'src/types';
import type { HeroNote, HeroNoteBase } from 'src/types/notes';
import type { CampaignRef, ClassifierRef, SpecialEntry } from 'src/types/shared';
import { useAuthStore } from 'src/stores/auth';
import { logger } from 'src/utils/logger';
import filesApi, { FILE_TYPE_HERO_AVATAR } from 'src/services/filesApi';
import heroService from 'src/services/heroService';
import npcInstanceService from 'src/services/npcInstanceService';
import { useErrorHandler } from 'src/composables/useErrorHandler';
import { MAX_EQUIPMENT_STACK } from 'src/constants';
import { clamp } from 'src/utils/numberUtils';

/**
 * Default empty Hero for new character creation
 */
function createEmptyHero(): HeroSheet {
  return {
    id: 0,
    userId: 0,
    user: { id: 0, username: '', displayName: '' },
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
    heroNotes: [],
    cultures: [],
    favoriteActions: [],
    avatarKey: null,
  };
}

export const useHeroStore = defineStore('hero', () => {
  const { handleError } = useErrorHandler();
  const hero = ref<HeroSheet | null>(null);
  const loading = ref(false);
  const { saving, startSaving, stopSaving, resetSaving } = useSavingState();
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

  const isOwner = computed(() => {
    const authStore = useAuthStore();
    return !!authStore.userId && !!hero.value?.userId && authStore.userId === hero.value.userId;
  });

  // Array getters - avoid repeating `hero.value?.X ?? []` everywhere
  const talents = computed(() => hero.value?.talents ?? []);
  const skills = computed(() => hero.value?.skills ?? []);
  const expertises = computed(() => hero.value?.expertises ?? []);
  const equipment = computed(() => hero.value?.equipment ?? []);
  const goals = computed(() => hero.value?.goals ?? []);
  const connections = computed(() => hero.value?.connections ?? []);
  const companions = computed(() => hero.value?.companions ?? []);
  const heroNotes = computed(() => hero.value?.heroNotes ?? []);
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
      handleError(err as Error, { retryKey: 'hero-load', entityName: 'Hero' });
      error.value =
        (err as { response?: { status?: number } }).response?.status === 404
          ? 'Hero not found'
          : 'Failed to load hero';
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
    resetSaving();
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
    if (!Number.isInteger(level) || level < 1) {
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
    startSaving();
    try {
      const response = await serviceFn(hero.value.id, Math.max(0, Math.floor(value)));
      hero.value[field] = response.data[field];
    } catch (err) {
      handleError(err as Error, { retryKey: 'hero-patch-resource' });
      error.value = errorMessage;
    } finally {
      stopSaving();
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
  // AVATAR
  // ===================
  async function uploadAvatar(file: File): Promise<boolean> {
    if (!hero.value) return false;
    startSaving();
    try {
      const uploadRes = await filesApi.upload(file, FILE_TYPE_HERO_AVATAR);
      // Extract S3 key from URL path (last segment: /api/v1/files/hero-avatar/{key})
      const key = uploadRes.data.url.split('/').pop();
      if (!key) throw new Error('Invalid upload response: missing key');
      await heroService.setAvatar(hero.value.id, key);
      if (hero.value) hero.value.avatarKey = key;
      return true;
    } catch (err) {
      handleError(err as Error, { retryKey: 'hero-upload-avatar' });
      error.value = 'Failed to upload avatar';
      return false;
    } finally {
      stopSaving();
    }
  }

  async function deleteAvatar(): Promise<boolean> {
    if (!hero.value) return false;
    startSaving();
    try {
      await heroService.deleteAvatar(hero.value.id);
      if (hero.value) hero.value.avatarKey = null;
      return true;
    } catch (err) {
      handleError(err as Error, { retryKey: 'hero-delete-avatar' });
      error.value = 'Failed to delete avatar';
      return false;
    } finally {
      stopSaving();
    }
  }

  // ===================
  // EQUIPMENT (sheet)
  // ===================
  async function addEquipment(
    equipmentCode: string,
    amount: number = 1,
    maxCharges?: number | null
  ): Promise<boolean> {
    if (!hero.value) return false;
    startSaving();
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
      handleError(err as Error, { retryKey: 'hero-add-equipment' });
      error.value = 'Failed to add equipment';
      return false;
    } finally {
      stopSaving();
    }
  }

  async function removeEquipment(heroEquipmentId: number): Promise<void> {
    if (!hero.value) return;
    startSaving();
    try {
      await heroService.deleteSubResource(hero.value.id, 'equipment', heroEquipmentId);
      if (!hero.value) return;
      hero.value.equipment = hero.value.equipment.filter((e) => e.id !== heroEquipmentId);
      hero.value.favoriteActions = hero.value.favoriteActions.filter(
        (f) => f.heroEquipmentId !== heroEquipmentId
      );
    } catch (err) {
      handleError(err as Error, { retryKey: 'hero-remove-equipment' });
      error.value = 'Failed to remove equipment';
    } finally {
      stopSaving();
    }
  }

  async function addCustomEquipment(
    equipTypeCode: string,
    customName: string,
    options?: { notes?: string; maxCharges?: number; specialOverrides?: SpecialEntry[] }
  ): Promise<boolean> {
    if (!hero.value) return false;
    startSaving();
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
      handleError(err as Error, { retryKey: 'hero-add-custom-equipment' });
      error.value = 'Failed to add custom equipment';
      return false;
    } finally {
      stopSaving();
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
    startSaving();
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
      handleError(err as Error, { retryKey: 'hero-update-equipment' });
      error.value = 'Failed to update equipment';
    } finally {
      stopSaving();
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

  const { upsert: upsertFavoriteAction, remove: removeFavoriteAction } = createSubResourceActions<
    HeroFavoriteActionBase,
    HeroFavoriteAction
  >('favorites', 'favoriteActions', 'favorite');

  // ===================
  // SUB-RESOURCE FACTORY
  // ===================
  function createSubResourceActions<TPayload, TResponse extends { id: number }>(
    resource: string,
    field: keyof HeroSheet,
    label: string
  ) {
    async function upsert(payload: TPayload): Promise<TResponse | null> {
      if (!hero.value) return null;
      const currentHeroId = hero.value.id;
      startSaving();
      try {
        const response = await heroService.upsertSubResource<TResponse>(
          currentHeroId,
          resource,
          payload
        );
        if (!hero.value || hero.value.id !== currentHeroId) return null;
        const arr = hero.value[field] as TResponse[];
        const idx = arr.findIndex((item) => item.id === response.data.id);
        if (idx !== -1) {
          arr[idx] = response.data;
        } else {
          arr.push(response.data);
        }
        return response.data;
      } catch (err) {
        handleError(err as Error, { retryKey: `hero-save-${label}` });
        error.value = `Failed to save ${label}`;
        return null;
      } finally {
        stopSaving();
      }
    }

    async function remove(itemId: number): Promise<void> {
      if (!hero.value) return;
      const currentHeroId = hero.value.id;
      startSaving();
      try {
        await heroService.deleteSubResource(currentHeroId, resource, itemId);
        if (!hero.value || hero.value.id !== currentHeroId) return;
        const arr = hero.value[field] as TResponse[];
        const idx = arr.findIndex((item) => item.id === itemId);
        if (idx !== -1) arr.splice(idx, 1);
      } catch (err) {
        handleError(err as Error, { retryKey: `hero-remove-${label}` });
        error.value = `Failed to remove ${label}`;
      } finally {
        stopSaving();
      }
    }

    return { upsert, remove };
  }

  // ===================
  // CONDITIONS (sheet)
  // ===================
  const { upsert: upsertCondition, remove: removeCondition } = createSubResourceActions<
    HeroConditionBase,
    HeroCondition
  >('conditions', 'conditions', 'condition');

  // ===================
  // INJURIES (sheet)
  // ===================
  async function upsertInjury(
    payload: HeroInjuryBase,
    injuryClassifier?: Injury
  ): Promise<HeroInjury | null> {
    if (!hero.value) return null;
    const currentHeroId = hero.value.id;
    startSaving();
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
          sourceInjuryId: response.data.id,
        });
      }

      return response.data;
    } catch (err) {
      handleError(err as Error, { retryKey: 'hero-save-injury' });
      error.value = 'Failed to save injury';
      return null;
    } finally {
      stopSaving();
    }
  }

  async function removeInjury(injuryId: number): Promise<void> {
    if (!hero.value) return;
    const currentHeroId = hero.value.id;
    startSaving();
    try {
      await heroService.deleteSubResource(currentHeroId, 'injuries', injuryId);
      if (!hero.value || hero.value.id !== currentHeroId) return;
      hero.value.injuries = hero.value.injuries.filter((i) => i.id !== injuryId);

      // DB CASCADE removes linked condition — sync local state
      hero.value.conditions = hero.value.conditions.filter((c) => c.sourceInjuryId !== injuryId);
    } catch (err) {
      handleError(err as Error, { retryKey: 'hero-remove-injury' });
      error.value = 'Failed to remove injury';
    } finally {
      stopSaving();
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
    startSaving();
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
      handleError(err as Error, { retryKey: 'hero-update-goal' });
      error.value = 'Failed to update goal';
      return null;
    } finally {
      stopSaving();
    }
  }

  const { upsert: upsertGoal, remove: removeGoal } = createSubResourceActions<
    HeroGoalBase,
    HeroGoal
  >('goals', 'goals', 'goal');

  const { upsert: upsertConnection, remove: removeConnection } = createSubResourceActions<
    HeroConnectionBase,
    HeroConnection
  >('connections', 'connections', 'connection');

  const companionNpcOptions = ref<NpcOption[]>([]);

  async function fetchCompanionNpcOptions(): Promise<boolean> {
    if (!hero.value) return false;
    const currentHeroId = hero.value.id;
    companionNpcOptions.value = [];
    try {
      const response = await heroService.getCompanionNpcOptions(currentHeroId);
      if (hero.value?.id !== currentHeroId) return false;
      companionNpcOptions.value = response.data;
      return true;
    } catch (err) {
      handleError(err as Error, { retryKey: 'hero-companion-options' });
      error.value = 'Failed to load companion options';
      return false;
    }
  }

  async function addCompanion(data: {
    npcId: number;
    heroId: number;
    displayName?: string | null;
  }): Promise<NpcInstance | null> {
    if (!hero.value) return null;
    const currentHeroId = hero.value.id;
    startSaving();
    try {
      const response = await npcInstanceService.create({ ...data, heroId: currentHeroId });
      if (hero.value?.id === currentHeroId) {
        hero.value.companions.push(response.data);
      }
      logger.info('Companion added', { id: response.data.id });
      return response.data;
    } catch (err) {
      handleError(err as Error, { retryKey: 'hero-add-companion' });
      error.value = 'Failed to add companion';
      return null;
    } finally {
      stopSaving();
    }
  }

  async function patchCompanion(
    instanceId: number,
    data: { displayName?: string | null; notes?: string | null }
  ): Promise<boolean> {
    if (!hero.value) return false;
    const currentHeroId = hero.value.id;
    startSaving();
    try {
      const response = await npcInstanceService.patch(instanceId, data);
      if (hero.value?.id !== currentHeroId) return false;
      const comp = hero.value.companions.find((c) => c.id === instanceId);
      if (comp) {
        comp.displayName = response.data.displayName ?? null;
        comp.notes = response.data.notes ?? null;
      }
      return true;
    } catch (err) {
      handleError(err as Error, { retryKey: 'hero-update-companion' });
      error.value = 'Failed to update companion';
      return false;
    } finally {
      stopSaving();
    }
  }

  async function removeCompanion(instanceId: number): Promise<boolean> {
    if (!hero.value) return false;
    const currentHeroId = hero.value.id;
    startSaving();
    try {
      await npcInstanceService.delete(instanceId);
      if (hero.value?.id === currentHeroId) {
        hero.value.companions = hero.value.companions.filter((c) => c.id !== instanceId);
      }
      logger.info('Companion removed', { id: instanceId });
      return true;
    } catch (err) {
      handleError(err as Error, { retryKey: 'hero-remove-companion' });
      error.value = 'Failed to remove companion';
      return false;
    } finally {
      stopSaving();
    }
  }

  async function patchCompanionResource(
    instanceId: number,
    field: 'current_hp' | 'current_focus' | 'current_investiture',
    value: number,
    npcField: 'currentHp' | 'currentFocus' | 'currentInvestiture',
    errorMessage: string
  ): Promise<void> {
    if (!hero.value) return;
    const currentHeroId = hero.value.id;
    startSaving();
    try {
      const response = await npcInstanceService.patchResource(
        instanceId,
        field,
        Math.max(0, Math.floor(value))
      );
      if (hero.value?.id !== currentHeroId) return;
      const comp = hero.value.companions.find((c) => c.id === instanceId);
      const newValue = response.data[field];
      if (comp && typeof newValue === 'number') comp[npcField] = newValue;
    } catch (err) {
      handleError(err as Error, { retryKey: 'hero-patch-companion' });
      error.value = errorMessage;
    } finally {
      stopSaving();
    }
  }

  const patchCompanionHp = (id: number, v: number) =>
    patchCompanionResource(id, 'current_hp', v, 'currentHp', 'Failed to update companion HP');
  const patchCompanionFocus = (id: number, v: number) =>
    patchCompanionResource(
      id,
      'current_focus',
      v,
      'currentFocus',
      'Failed to update companion focus'
    );
  const patchCompanionInvestiture = (id: number, v: number) =>
    patchCompanionResource(
      id,
      'current_investiture',
      v,
      'currentInvestiture',
      'Failed to update companion investiture'
    );

  const { upsert: upsertNote, remove: removeNote } = createSubResourceActions<
    HeroNoteBase,
    HeroNote
  >('notes', 'heroNotes', 'note');

  async function deleteHero(): Promise<boolean> {
    if (!hero.value || hero.value.id === 0) return false;
    try {
      await heroService.delete(hero.value.id);
      loadRequestId++;
      clearHero();
      return true;
    } catch (err) {
      handleError(err as Error, { retryKey: 'hero-delete' });
      error.value = 'Failed to delete character';
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
    isOwner,
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

    // Avatar
    uploadAvatar,
    deleteAvatar,

    // Equipment (sheet)
    addEquipment,
    addCustomEquipment,
    removeEquipment,
    updateEquipment,

    // Favorite actions
    findFavoriteAction,
    upsertFavoriteAction,
    removeFavoriteAction,

    // Conditions (sheet)
    upsertCondition,
    removeCondition,

    // Injuries (sheet)
    upsertInjury,
    removeInjury,

    // Goals (sheet)
    updateGoalValue,
    upsertGoal,
    removeGoal,

    // Connections (sheet)
    upsertConnection,
    removeConnection,

    // Companions (sheet)
    addCompanion,
    removeCompanion,
    companionNpcOptions,
    fetchCompanionNpcOptions,
    patchCompanion,
    patchCompanionHp,
    patchCompanionFocus,
    patchCompanionInvestiture,

    // Notes (sheet)
    heroNotes,
    upsertNote,
    removeNote,
  };
});
