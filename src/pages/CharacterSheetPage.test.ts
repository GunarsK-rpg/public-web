import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import CharacterSheetPage from './CharacterSheetPage.vue';

const mockPush = vi.fn();

// Use refs for reactive mock values
const mockIsLoaded = ref(true);
const mockLoading = ref(false);
const mockError = ref<string | null>(null);
const mockClassifierInitialized = ref(true);
const mockClassifierLoading = ref(false);
const mockClassifierError = ref<string | null>(null);

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
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
    get error() {
      return mockError.value;
    },
    loadHero: vi.fn(),
    clearHero: vi.fn(),
    setError: vi.fn(),
  }),
}));

vi.mock('stores/classifiers', () => ({
  useClassifierStore: () => ({
    get initialized() {
      return mockClassifierInitialized.value;
    },
    initialize: vi.fn(),
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
            template: '<div class="character-header" />',
          },
          QTabs: {
            template: '<div class="q-tabs"><slot /></div>',
            props: [
              'modelValue',
              'dense',
              'activeColor',
              'indicatorColor',
              'align',
              'narrowIndicator',
            ],
          },
          QTab: {
            template: '<button class="q-tab"><slot />{{ label }}</button>',
            props: ['name', 'icon', 'label'],
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
          QTabPanels: {
            template: '<div class="q-tab-panels"><slot /></div>',
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
    mockClassifierInitialized.value = true;
    mockClassifierLoading.value = false;
    mockClassifierError.value = null;
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders character header when loaded', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.character-header').exists()).toBe(true);
    });

    it('renders tab navigation', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-tabs').exists()).toBe(true);
    });

    it('renders all tabs', () => {
      const wrapper = createWrapper();

      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.length).toBe(7);
    });
  });

  // ========================================
  // Tab Labels
  // ========================================
  describe('tab labels', () => {
    it('shows stats tab', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Stats');
    });

    it('shows skills tab', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Skills');
    });

    it('shows actions tab', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Actions');
    });

    it('shows equipment tab', () => {
      const wrapper = createWrapper();

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
    it('shows error banner when hero error', () => {
      mockError.value = 'Failed to load character';
      mockIsLoaded.value = false;

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Failed to load character');
    });

    it('shows error banner when classifier error', () => {
      mockClassifierError.value = 'Failed to load classifiers';
      mockIsLoaded.value = false;

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Failed to load classifiers');
    });
  });
});
