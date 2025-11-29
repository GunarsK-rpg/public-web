import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Campaign, CampaignWithCharacters } from 'src/types';

export const useCampaignStore = defineStore('campaigns', () => {
  const campaigns = ref<Campaign[]>([]);
  const currentCampaign = ref<CampaignWithCharacters | null>(null);
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
    } catch (err) {
      error.value = 'Failed to load campaigns';
      console.error('Failed to load campaigns:', err);
    } finally {
      loading.value = false;
    }
  }

  async function selectCampaign(id: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual API call
      // const response = await campaignService.getById(id);
      // currentCampaign.value = response.data;

      // Mock: Import from mock data
      const { campaignsWithCharacters } = await import('src/mock/campaigns');
      const found = campaignsWithCharacters.find((c) => c.id === id);
      if (found) {
        currentCampaign.value = found;
      } else {
        error.value = 'Campaign not found';
      }
    } catch (err) {
      error.value = 'Failed to load campaign';
      console.error('Failed to load campaign:', err);
    } finally {
      loading.value = false;
    }
  }

  function clearCurrentCampaign(): void {
    currentCampaign.value = null;
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
    reset,
  };
});
