import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Campaign, CampaignBase, CampaignWithHeroes, Hero } from 'src/types';
import { logger } from 'src/utils/logger';
import campaignService from 'src/services/campaignService';
import heroService from 'src/services/heroService';
import { handleError } from 'src/utils/errorHandling';
import { useAuthStore } from './auth';

export const useCampaignStore = defineStore('campaigns', () => {
  const campaigns = ref<Campaign[]>([]);
  const currentCampaign = ref<CampaignWithHeroes | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const savingCount = ref(0);

  // Track pending requests to handle race conditions
  let fetchRequestId = 0;
  let selectRequestId = 0;

  const hasCampaigns = computed(() => campaigns.value.length > 0);
  const saving = computed(() => savingCount.value > 0);

  const isOwner = computed(() => {
    if (!currentCampaign.value) return false;
    const authStore = useAuthStore();
    return currentCampaign.value.user?.username === authStore.username;
  });

  async function fetchCampaigns(): Promise<void> {
    const requestId = ++fetchRequestId;
    loading.value = true;
    error.value = null;

    try {
      const response = await campaignService.getAll();

      // Only update state if this is still the latest request
      if (requestId !== fetchRequestId) {
        logger.debug('Stale fetchCampaigns response ignored', {
          requestId,
          current: fetchRequestId,
        });
        return;
      }

      campaigns.value = response.data;
      logger.info('Campaigns loaded', { count: response.data.length });
    } catch (err: unknown) {
      if (requestId === fetchRequestId) {
        handleError(err, { errorRef: error, message: 'Failed to load campaigns' });
      }
    } finally {
      if (requestId === fetchRequestId) {
        loading.value = false;
      }
    }
  }

  async function selectCampaign(id: number): Promise<void> {
    const requestId = ++selectRequestId;
    loading.value = true;
    error.value = null;

    try {
      const [campaignResponse, heroesResult] = await Promise.all([
        campaignService.getById(id),
        heroService.getAll(id).catch((err) => {
          logger.warn('Failed to load heroes for campaign', { id, error: err });
          return { data: { data: [] as Hero[], total: 0 } };
        }),
      ]);

      // Only update state if this is still the latest request
      if (requestId !== selectRequestId) {
        logger.debug('Stale selectCampaign response ignored', {
          requestId,
          current: selectRequestId,
          id,
        });
        return;
      }

      currentCampaign.value = {
        ...campaignResponse.data,
        heroes: heroesResult.data?.data ?? [],
      };
      logger.info('Campaign selected', { id, name: campaignResponse.data.name });
    } catch (err: unknown) {
      if (requestId === selectRequestId) {
        handleError(err, {
          errorRef: error,
          message: 'Failed to load campaign',
          notFoundMessage: 'Campaign not found',
          context: { id },
          onNotFound: () => {
            currentCampaign.value = null;
          },
        });
      }
    } finally {
      if (requestId === selectRequestId) {
        loading.value = false;
      }
    }
  }

  async function createCampaign(data: CampaignBase): Promise<Campaign | null> {
    savingCount.value++;
    error.value = null;

    try {
      const response = await campaignService.create(data);
      campaigns.value.unshift(response.data);
      logger.info('Campaign created', { id: response.data.id, name: response.data.name });
      return response.data;
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: 'Failed to create campaign' });
      return null;
    } finally {
      savingCount.value--;
    }
  }

  async function updateCampaign(id: number, data: CampaignBase): Promise<Campaign | null> {
    savingCount.value++;
    error.value = null;

    try {
      const response = await campaignService.update(id, data);
      const updated = response.data;

      // Update in campaigns list
      const index = campaigns.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        campaigns.value[index] = updated;
      }

      // Update currentCampaign if it's the one being edited
      if (currentCampaign.value?.id === id) {
        currentCampaign.value = { ...currentCampaign.value, ...updated };
      }

      logger.info('Campaign updated', { id, name: updated.name });
      return updated;
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: 'Failed to update campaign' });
      return null;
    } finally {
      savingCount.value--;
    }
  }

  async function deleteCampaign(id: number): Promise<boolean> {
    savingCount.value++;
    error.value = null;

    try {
      await campaignService.delete(id);
      campaigns.value = campaigns.value.filter((c) => c.id !== id);

      if (currentCampaign.value?.id === id) {
        currentCampaign.value = null;
      }

      logger.info('Campaign deleted', { id });
      return true;
    } catch (err: unknown) {
      handleError(err, { errorRef: error, message: 'Failed to delete campaign' });
      return false;
    } finally {
      savingCount.value--;
    }
  }

  function clearCurrentCampaign(): void {
    currentCampaign.value = null;
  }

  function setError(message: string): void {
    error.value = message;
  }

  function reset(): void {
    campaigns.value = [];
    currentCampaign.value = null;
    loading.value = false;
    error.value = null;
    savingCount.value = 0;
  }

  return {
    campaigns,
    currentCampaign,
    loading,
    error,
    saving,
    hasCampaigns,
    isOwner,
    fetchCampaigns,
    selectCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    clearCurrentCampaign,
    setError,
    reset,
  };
});
