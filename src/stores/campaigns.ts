import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Campaign, CampaignWithHeroes } from 'src/types';
import { logger } from 'src/utils/logger';

export const useCampaignStore = defineStore('campaigns', () => {
  const campaigns = ref<Campaign[]>([]);
  const currentCampaign = ref<CampaignWithHeroes | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const hasCampaigns = computed(() => campaigns.value.length > 0);

  async function fetchCampaigns(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual API call
      // const response = await campaignService.getAll();
      // campaigns.value = response.data;

      // Mock: Import from mock data
      const { campaigns: mockCampaigns } = await import('src/mock/campaigns');
      campaigns.value = mockCampaigns;
      logger.info('Campaigns loaded', { count: mockCampaigns.length });
    } catch (err: unknown) {
      error.value = 'Failed to load campaigns';
      logger.error('Failed to load campaigns', {
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      loading.value = false;
    }
  }

  async function selectCampaign(id: number): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual API call
      // const response = await campaignService.getById(id);
      // currentCampaign.value = response.data;

      // Mock: Import from mock data
      // Note: campaignsWithHeroes has hero details, while campaigns list may not
      const { campaignsWithHeroes } = await import('src/mock/campaigns');
      const found = campaignsWithHeroes.find((c) => c.id === id);
      if (found) {
        currentCampaign.value = found;
        logger.info('Campaign selected', { id, name: found.name, heroCount: found.heroes.length });
      } else {
        currentCampaign.value = null;
        error.value = 'Campaign not found';
        logger.warn('Campaign not found', { id });
      }
    } catch (err: unknown) {
      error.value = 'Failed to load campaign';
      logger.error('Failed to load campaign', {
        id,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      loading.value = false;
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
