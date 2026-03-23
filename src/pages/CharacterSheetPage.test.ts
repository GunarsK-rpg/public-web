import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import CharacterSheetPage from './CharacterSheetPage.vue';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRouteQuery = ref<Record<string, string>>({});

// Use refs for reactive mock values
const mockIsLoaded = ref(true);
const mockLoading = ref(false);
const mockError = ref<string | null>(null);
const mockHero = ref<{ user?: { id: number; username: string } } | null>({
  user: { id: 1, username: 'testuser' },
});
const mockClassifierInitialized = ref(true);
const mockClassifierLoading = ref(false);
const mockClassifierError = ref<string | null>(null);

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useRoute: () => ({
    query: mockRouteQuery.value,
    params: {},
  }),
}));

vi.mock('stores/hero', () => ({
  useHeroStore: () => ({
    get isLoaded() {
      return mockIsLoaded.value;
    },
    get loading() {
      return mockLoading.value;
    },
    get hero() {
      return mockHero.value;
    },
    get error() {
      return mockError.value;
    },
    get isOwner() {
      const heroUsername = mockHero.value?.user?.username?.trim().toLowerCase();
      return !!heroUsername && heroUsername === 'testuser';
    },
    loadHero: vi.fn().mockResolvedValue(undefined),
    clearHero: vi.fn(),
    setError: vi.fn(),
  }),
}));

vi.mock('stores/classifiers', () => ({
  useClassifierStore: () => ({
    get initialized() {
      return mockClassifierInitialized.value;
    },
    initialize: vi.fn().mockResolvedValue(undefined),
    get loading() {
      return mockClassifierLoading.value;
    },
    get error() {
      return mockClassifierError.value;
    },
  }),
}));

vi.mock('stores/auth', () => ({
  useAuthStore: () => ({
    username: 'testuser',
  }),
}));

vi.mock('src/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

describe('CharacterSheetPage', () => {
  const createWrapper = () =>
    shallowMount(CharacterSheetPage, {
      props: {
        campaignId: '1',
        characterId: '1',
      },
      global: {
        stubs: {
          QPage: {
            template: '<div class="q-page"><slot /></div>',
          },
          QSpinnerDots: {
            template: '<div class="q-spinner-dots" />',
            props: ['size', 'color'],
          },
          QBanner: {
            template: '<div class="q-banner"><slot /><slot name="action" /></div>',
          },
          QBtn: {
            template: '<button class="q-btn" @click="$emit(\'click\')">{{ label }}</button>',
            props: ['flat', 'label'],
            emits: ['click'],
          },
          CharacterHeader: {
            template: '<div class="character-header" :data-readonly="readonly" />',
            props: ['characterId', 'readonly'],
          },
          QTabs: {
            name: 'QTabs',
            template: '<div class="q-tabs"><slot /></div>',
            props: [
              'modelValue',
              'dense',
              'activeColor',
              'indicatorColor',
              'align',
              'narrowIndicator',
            ],
            emits: ['update:modelValue'],
          },
          QTab: {
            template: '<button class="q-tab"><slot />{{ label }}</button>',
            props: ['name', 'icon', 'label'],
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
          QTabPanels: {
            template: '<div class="q-tab-panels" :data-active-tab="modelValue"><slot /></div>',
            props: ['modelValue', 'animated'],
          },
          QTabPanel: {
            template: '<div class="q-tab-panel"><slot /></div>',
            props: ['name'],
          },
          StatsTab: { template: '<div class="stats-tab" />' },
          SkillsTab: { template: '<div class="skills-tab" />' },
          ActionsTab: { template: '<div class="actions-tab" />' },
          EquipmentTab: { template: '<div class="equipment-tab" />' },
          TalentsTab: { template: '<div class="talents-tab" />' },
          ExpertisesTab: { template: '<div class="expertises-tab" />' },
          OthersTab: { template: '<div class="others-tab" />' },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoaded.value = true;
    mockLoading.value = false;
    mockError.value = null;
    mockHero.value = { user: { id: 1, username: 'testuser' } };
    mockClassifierInitialized.value = true;
    mockClassifierLoading.value = false;
    mockClassifierError.value = null;
    mockRouteQuery.value = {};
    sessionStorage.clear();
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders character header when loaded', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.character-header').exists()).toBe(true);
    });

    it('renders tab navigation', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.q-tabs').exists()).toBe(true);
    });

    it('renders all tabs', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.length).toBe(9);
    });
  });

  // ========================================
  // Tab Labels
  // ========================================
  describe('tab labels', () => {
    it('shows stats tab', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Stats');
    });

    it('shows skills tab', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Skills');
    });

    it('shows actions tab', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Actions');
    });

    it('shows equipment tab', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Equipment');
    });
  });

  // ========================================
  // Loading State
  // ========================================
  describe('loading state', () => {
    it('shows spinner when loading', () => {
      mockLoading.value = true;
      mockIsLoaded.value = false;

      const wrapper = createWrapper();

      expect(wrapper.find('.q-spinner-dots').exists()).toBe(true);
    });

    it('shows spinner when classifiers loading', () => {
      mockClassifierLoading.value = true;
      mockIsLoaded.value = false;

      const wrapper = createWrapper();

      expect(wrapper.find('.q-spinner-dots').exists()).toBe(true);
    });
  });

  // ========================================
  // Error State
  // ========================================
  describe('error state', () => {
    it('shows error banner when hero error', async () => {
      mockError.value = 'Failed to load character';
      mockIsLoaded.value = false;

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Failed to load character');
    });

    it('shows error banner when classifier error', async () => {
      mockClassifierError.value = 'Failed to load classifiers';
      mockIsLoaded.value = false;

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Failed to load classifiers');
    });
  });

  // ========================================
  // Ownership / Readonly
  // ========================================
  describe('ownership', () => {
    it('passes readonly=false when hero username matches auth user', async () => {
      mockHero.value = { user: { id: 1, username: 'testuser' } };

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.character-header').attributes('data-readonly')).toBe('false');
    });

    it('passes readonly=true when hero username differs from auth user', async () => {
      mockHero.value = { user: { id: 2, username: 'otherplayer' } };

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.character-header').attributes('data-readonly')).toBe('true');
    });

    it('passes readonly=true when hero has no user', async () => {
      mockHero.value = {};

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.character-header').attributes('data-readonly')).toBe('true');
    });
  });

  // ========================================
  // Tab Resolution
  // ========================================
  describe('tab resolution', () => {
    it('initializes to query tab when valid', async () => {
      mockRouteQuery.value = { tab: 'equipment' };

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.q-tab-panels').attributes('data-active-tab')).toBe('equipment');
    });

    it('clears query param after using it', async () => {
      mockRouteQuery.value = { tab: 'skills' };

      createWrapper();
      await flushPromises();

      expect(mockReplace).toHaveBeenCalledWith(
        expect.objectContaining({ query: expect.objectContaining({ tab: undefined }) })
      );
    });

    it('falls back to sessionStorage when query tab is missing', async () => {
      sessionStorage.setItem('hero-tab-1', 'talents');

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.q-tab-panels').attributes('data-active-tab')).toBe('talents');
    });

    it('falls back to sessionStorage when query tab is invalid', async () => {
      mockRouteQuery.value = { tab: 'nonexistent' };
      sessionStorage.setItem('hero-tab-1', 'actions');

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.q-tab-panels').attributes('data-active-tab')).toBe('actions');
    });

    it('defaults to stats when no query tab and no sessionStorage', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.q-tab-panels').attributes('data-active-tab')).toBe('stats');
    });

    it('persists tab change to sessionStorage', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const tabs = wrapper.findComponent({ name: 'QTabs' });
      tabs.vm.$emit('update:modelValue', 'companions');
      await flushPromises();

      expect(sessionStorage.getItem('hero-tab-1')).toBe('companions');
    });
  });
});
