import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import CampaignDetailPage from './CampaignDetailPage.vue';

// Use refs for reactive mock values
const mockCampaign = ref({
  id: 1,
  name: 'Test Campaign',
  description: 'Campaign description',
  code: 'test-code',
  heroes: [
    { id: 1, name: 'Hero 1', level: 5, currentHealth: 20, maxHealth: 30, radiantOrder: null },
    {
      id: 2,
      name: 'Hero 2',
      level: 3,
      currentHealth: 15,
      maxHealth: 15,
      radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
    },
  ],
});
const mockLoading = ref(false);
const mockError = ref<string | null>(null);
const mockIsOwner = ref(false);
const mockSaving = ref(false);
const mockRemoveHero = vi.fn();

vi.mock('src/stores/campaigns', () => ({
  useCampaignStore: () => ({
    get currentCampaign() {
      return mockCampaign.value;
    },
    get loading() {
      return mockLoading.value;
    },
    get error() {
      return mockError.value;
    },
    get isOwner() {
      return mockIsOwner.value;
    },
    get saving() {
      return mockSaving.value;
    },
    selectCampaign: vi.fn().mockResolvedValue(undefined),
    deleteCampaign: vi.fn().mockResolvedValue(true),
    removeHero: mockRemoveHero,
    setError: vi.fn(),
  }),
}));

vi.mock('src/stores/combat', () => ({
  useCombatStore: () => ({
    combats: [],
    saving: false,
    fetchCombats: vi.fn().mockResolvedValue(undefined),
    createCombat: vi.fn().mockResolvedValue(null),
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    initialized: true,
    initialize: vi.fn().mockResolvedValue(undefined),
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

let dialogOkCallback: (() => void) | null = null;
const mockDialog = vi.fn(() => ({
  onOk: vi.fn((cb: () => void) => {
    dialogOkCallback = cb;
    return { onCancel: vi.fn() };
  }),
}));

vi.mock('quasar', () => ({
  useQuasar: () => ({
    dialog: mockDialog,
  }),
  copyToClipboard: vi.fn().mockResolvedValue(undefined),
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
            template:
              '<button class="q-btn" :data-to="to ? JSON.stringify(to) : undefined" @click="$emit(\'click\', $event)"><slot />{{ label }}</button>',
            props: ['color', 'icon', 'label', 'flat', 'to', 'dense', 'round', 'size', 'disable'],
            emits: ['click'],
          },
          QSpinnerDots: {
            template: '<div class="q-spinner-dots" />',
            props: ['size', 'color'],
          },
          HeroCard: {
            template: `<div class="card-link">
              <div class="text-h6">{{ hero.name }}</div>
              <div>Level {{ hero.level }}</div>
              <div v-if="hero.radiantOrder">{{ hero.radiantOrder.name }}</div>
              <div>HP: {{ hero.currentHealth }}</div>
              <div v-if="hero.user">{{ hero.user.displayName }}</div>
              <slot name="actions" />
            </div>`,
            props: ['hero', 'subtitle'],
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
          QTooltip: {
            template: '<span />',
          },
          QBadge: {
            template: '<span class="q-badge"><slot /></span>',
          },
          CreateCombatDialog: {
            template: '<div class="create-combat-dialog-stub" />',
          },
          RouterLink: {
            template:
              '<a class="router-link-stub" :href="to"><slot v-bind="{ href: to, navigate: () => {} }" /></a>',
            props: ['to', 'custom'],
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
      code: 'test-code',
      heroes: [
        { id: 1, name: 'Hero 1', level: 5, currentHealth: 20, maxHealth: 30, radiantOrder: null },
        {
          id: 2,
          name: 'Hero 2',
          level: 3,
          currentHealth: 15,
          maxHealth: 15,
          radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        },
      ],
    };
    mockLoading.value = false;
    mockError.value = null;
    mockIsOwner.value = false;
    mockSaving.value = false;
    dialogOkCallback = null;
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders campaign name', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Test Campaign');
    });

    it('renders campaign description', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Campaign description');
    });

    it('renders characters section title', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Characters');
    });

    it('renders add character button', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Add Character');
    });
  });

  // ========================================
  // Character Cards
  // ========================================
  describe('character cards', () => {
    it('renders character cards', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Hero 1');
      expect(wrapper.text()).toContain('Hero 2');
    });

    it('displays character level', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Level 5');
      expect(wrapper.text()).toContain('Level 3');
    });

    it('displays radiant order for radiant characters', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Windrunner');
    });

    it('shows health display', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('HP: 20');
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
    it('shows error banner when error', async () => {
      mockError.value = 'Failed to load campaign';

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Failed to load campaign');
    });
  });

  // ========================================
  // Empty State
  // ========================================
  describe('empty state', () => {
    it('shows empty state when no heroes', async () => {
      mockCampaign.value = { ...mockCampaign.value, heroes: [] };

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('No characters');
    });
  });

  // ========================================
  // Remove Hero
  // ========================================
  describe('remove hero', () => {
    it('renders remove button on hero cards when user is owner', async () => {
      mockIsOwner.value = true;
      const wrapper = createWrapper();
      await flushPromises();

      const removeBtns = wrapper.findAll('button').filter((b) => {
        const label = b.attributes('aria-label') ?? '';
        return label.includes('Remove') && label.includes('from campaign');
      });
      expect(removeBtns.length).toBe(2);
    });

    it('calls removeHero after confirming removal dialog', async () => {
      mockIsOwner.value = true;
      mockRemoveHero.mockResolvedValue(true);
      const wrapper = createWrapper();
      await flushPromises();

      const removeBtns = wrapper.findAll('button').filter((b) => {
        const label = b.attributes('aria-label') ?? '';
        return label.includes('Remove') && label.includes('from campaign');
      });
      expect(removeBtns.length).toBeGreaterThan(0);
      await removeBtns[0]!.trigger('click');

      expect(mockDialog).toHaveBeenCalled();
      expect(dialogOkCallback).not.toBeNull();

      dialogOkCallback!();
      await flushPromises();

      expect(mockRemoveHero).toHaveBeenCalledWith(1);
    });

    it('does not render remove button when user is not owner', async () => {
      mockIsOwner.value = false;
      const wrapper = createWrapper();
      await flushPromises();

      const removeBtns = wrapper.findAll('button').filter((b) => {
        const label = b.attributes('aria-label') ?? '';
        return label.includes('Remove') && label.includes('from campaign');
      });
      expect(removeBtns.length).toBe(0);
    });
  });

  // ========================================
  // Navigation
  // ========================================
  describe('navigation', () => {
    it('renders character card links', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const links = wrapper.findAll('.card-link');
      expect(links.length).toBe(2);
    });

    it('add character button links to join page', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const addBtns = wrapper.findAll('.q-btn').filter((b) => b.text().includes('Add Character'));
      expect(addBtns.length).toBeGreaterThan(0);

      const to = JSON.parse(addBtns[0]!.attributes('data-to')!);
      expect(to).toEqual({
        name: 'join-campaign',
        params: { code: 'test-code' },
      });
    });
  });
});
