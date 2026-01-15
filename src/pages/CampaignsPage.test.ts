import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import CampaignsPage from './CampaignsPage.vue';

const mockPush = vi.fn();
const mockFetchCampaigns = vi.fn();

// Use refs for reactive mock values
const mockCampaigns = ref([
  { id: 1, name: 'Campaign 1', description: 'Description 1', updatedAt: '2024-01-01' },
  { id: 2, name: 'Campaign 2', description: 'Description 2', updatedAt: '2024-01-02' },
]);
const mockLoading = ref(false);
const mockError = ref<string | null>(null);

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('stores/campaigns', () => ({
  useCampaignStore: () => ({
    campaigns: mockCampaigns.value,
    loading: mockLoading.value,
    error: mockError.value,
    fetchCampaigns: mockFetchCampaigns,
  }),
}));

vi.mock('src/utils/dateUtils', () => ({
  formatDate: (date: string) => date,
}));

describe('CampaignsPage', () => {
  const createWrapper = () =>
    shallowMount(CampaignsPage, {
      global: {
        stubs: {
          QPage: {
            template: '<div class="q-page"><slot /></div>',
          },
          QBtn: {
            template: '<button class="q-btn" @click="$emit(\'click\')">{{ label }}</button>',
            props: ['color', 'icon', 'label'],
            emits: ['click'],
          },
          QSpinnerDots: {
            template: '<div class="q-spinner-dots" />',
            props: ['size', 'color'],
          },
          QBanner: {
            template: '<div class="q-banner"><slot /></div>',
          },
          QIcon: {
            template: '<span class="q-icon" />',
          },
          QCard: {
            template: `<div
              class="q-card"
              :role="$attrs.role"
              :tabindex="$attrs.tabindex"
              @click="$emit('click')"
              @keydown="$emit('keydown', $event)"
            ><slot /></div>`,
            emits: ['click', 'keydown'],
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
          QSpace: {
            template: '<span class="q-space" />',
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCampaigns.value = [
      { id: 1, name: 'Campaign 1', description: 'Description 1', updatedAt: '2024-01-01' },
      { id: 2, name: 'Campaign 2', description: 'Description 2', updatedAt: '2024-01-02' },
    ];
    mockLoading.value = false;
    mockError.value = null;
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders page title', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('My Campaigns');
    });

    it('renders create character button', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Create Character');
    });

    it('renders campaign cards', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Campaign 1');
      expect(wrapper.text()).toContain('Campaign 2');
    });
  });

  // ========================================
  // Loading State
  // ========================================
  describe('loading state', () => {
    it('shows spinner when loading', () => {
      mockLoading.value = true;

      const wrapper = createWrapper();

      expect(wrapper.find('.q-spinner-dots').exists()).toBe(true);
    });
  });

  // ========================================
  // Error State
  // ========================================
  describe('error state', () => {
    it('shows error banner when error', () => {
      mockError.value = 'Failed to load campaigns';

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Failed to load campaigns');
    });
  });

  // ========================================
  // Empty State
  // ========================================
  describe('empty state', () => {
    it('shows empty state when no campaigns', () => {
      mockCampaigns.value = [];

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No campaigns found');
    });
  });

  // ========================================
  // Navigation
  // ========================================
  describe('navigation', () => {
    it('navigates to campaign detail on card click', async () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.q-card');
      expect(cards.length).toBeGreaterThan(0);
      await cards[0]!.trigger('click');

      expect(mockPush).toHaveBeenCalledWith({
        name: 'campaign-detail',
        params: { campaignId: '1' },
      });
    });

    it('navigates to character creation on button click', async () => {
      const wrapper = createWrapper();

      const createBtn = wrapper
        .findAll('.q-btn')
        .find((b) => b.text().includes('Create Character'));
      await createBtn?.trigger('click');

      expect(mockPush).toHaveBeenCalledWith({ name: 'character-create-standalone' });
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('campaign cards have button role', () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.q-card[role="button"]');
      expect(cards.length).toBe(2);
    });
  });
});
