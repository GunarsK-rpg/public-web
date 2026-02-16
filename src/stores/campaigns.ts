import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Campaign, CampaignWithHeroes, Hero } from 'src/types';
import { logger } from 'src/utils/logger';
import campaignService from 'src/services/campaignService';
import heroService from 'src/services/heroService';
import { handleError } from 'src/utils/errorHandling';

export const useCampaignStore = defineStore('campaigns', () => {
  const campaigns = ref<Campaign[]>([]);
  const currentCampaign = ref<CampaignWithHeroes | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Track pending requests to handle race conditions
  let fetchRequestId = 0;
  let selectRequestId = 0;

  const hasCampaigns = computed(() => campaigns.value.length > 0);

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
        heroes: heroesResult.data.data ?? [],
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
  }

  return {
    campaigns,
    currentCampaign,
    loading,
    error,
    hasCampaigns,
    fetchCampaigns,
    selectCampaign,
    clearCurrentCampaign,
    setError,
    reset,
  };
});
