import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import CampaignDetailPage from './CampaignDetailPage.vue';

const mockPush = vi.fn();

// Use refs for reactive mock values
const mockCampaign = ref({
  id: 1,
  name: 'Test Campaign',
  description: 'Campaign description',
  heroes: [
    { id: 1, name: 'Hero 1', level: 5, currentHealth: 20, maxHealth: 30, radiantOrderId: null },
    { id: 2, name: 'Hero 2', level: 3, currentHealth: 15, maxHealth: 15, radiantOrderId: 1 },
  ],
});
const mockLoading = ref(false);
const mockError = ref<string | null>(null);

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('src/stores/campaigns', () => ({
  useCampaignStore: () => ({
    currentCampaign: mockCampaign.value,
    loading: mockLoading.value,
    error: mockError.value,
    selectCampaign: vi.fn(),
    setError: vi.fn(),
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    initialized: true,
    initialize: vi.fn(),
    radiantOrders: [{ id: 1, code: 'windrunner', name: 'Windrunner' }],
  }),
}));

vi.mock('src/composables/useErrorHandler', () => ({
  useErrorHandler: () => ({
    showWarning: vi.fn(),
  }),
}));

vi.mock('src/utils/arrayUtils', () => ({
  findById: <T extends { id: number }>(arr: T[], id: number | null | undefined) =>
    arr?.find((item) => item.id === id),
}));

vi.mock('src/utils/logger', () => ({
  logger: { error: vi.fn() },
}));

describe('CampaignDetailPage', () => {
  const createWrapper = () =>
    shallowMount(CampaignDetailPage, {
      props: {
        campaignId: '1',
      },
      global: {
        stubs: {
          QPage: {
            template: '<div class="q-page"><slot /></div>',
          },
          QBtn: {
            template: '<button class="q-btn" @click="$emit(\'click\')">{{ label }}</button>',
            props: ['color', 'icon', 'label', 'flat'],
            emits: ['click'],
          },
          QSpinnerDots: {
            template: '<div class="q-spinner-dots" />',
            props: ['size', 'color'],
          },
          QBanner: {
            template: '<div class="q-banner"><slot /><slot name="action" /></div>',
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
            ><slot /></div>`,
            emits: ['click'],
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QLinearProgress: {
            template: '<div class="q-linear-progress" />',
            props: ['value', 'color'],
          },
          QSpace: {
            template: '<span class="q-space" />',
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCampaign.value = {
      id: 1,
      name: 'Test Campaign',
      description: 'Campaign description',
      heroes: [
        { id: 1, name: 'Hero 1', level: 5, currentHealth: 20, maxHealth: 30, radiantOrderId: null },
        { id: 2, name: 'Hero 2', level: 3, currentHealth: 15, maxHealth: 15, radiantOrderId: 1 },
      ],
    };
    mockLoading.value = false;
    mockError.value = null;
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders campaign name', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Test Campaign');
    });

    it('renders campaign description', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Campaign description');
    });

    it('renders characters section title', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Characters');
    });

    it('renders create character button', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Create Character');
    });
  });

  // ========================================
  // Character Cards
  // ========================================
  describe('character cards', () => {
    it('renders character cards', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Hero 1');
      expect(wrapper.text()).toContain('Hero 2');
    });

    it('displays character level', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Level 5');
      expect(wrapper.text()).toContain('Level 3');
    });

    it('displays radiant order for radiant characters', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Windrunner');
    });

    it('shows health progress bar', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-linear-progress').exists()).toBe(true);
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
      mockError.value = 'Failed to load campaign';

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Failed to load campaign');
    });
  });

  // ========================================
  // Empty State
  // ========================================
  describe('empty state', () => {
    it('shows empty state when no heroes', () => {
      mockCampaign.value = { ...mockCampaign.value, heroes: [] };

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No characters');
    });
  });

  // ========================================
  // Navigation
  // ========================================
  describe('navigation', () => {
    it('navigates to character sheet on card click', async () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.q-card[role="button"]');
      expect(cards.length).toBeGreaterThan(0);
      await cards[0]!.trigger('click');

      expect(mockPush).toHaveBeenCalledWith({
        name: 'character-sheet',
        params: { campaignId: '1', characterId: '1' },
      });
    });

    it('navigates to character creation on button click', async () => {
      const wrapper = createWrapper();

      const createBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.text().includes('Create Character'));
      expect(createBtns.length).toBeGreaterThan(0);
      await createBtns[0]!.trigger('click');

      expect(mockPush).toHaveBeenCalledWith({
        name: 'character-create',
        params: { campaignId: '1' },
      });
    });
  });
});
