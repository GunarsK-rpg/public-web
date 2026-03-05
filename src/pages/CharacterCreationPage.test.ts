import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import CharacterCreationPage from './CharacterCreationPage.vue';

const mockBack = vi.fn();
const mockPush = vi.fn();
const mockNotify = vi.fn();
const mockReset = vi.fn();
const mockStartCreate = vi.fn();
const mockClearHero = vi.fn();
const mockGoToStep = vi.fn();
const mockMarkStepCompleted = vi.fn();
const mockSaveCurrentStep = vi.fn().mockResolvedValue(true);

// Use refs for reactive mock values
const mockCurrentStep = ref(1);
const mockIsActive = ref(true);
const mockInitialized = ref(true);
const mockMode = ref('create');
let mockRouteQuery: Record<string, string> = {};

vi.mock('vue-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    replace: vi.fn(),
  }),
  useRoute: () => ({
    query: mockRouteQuery,
  }),
}));

vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: mockNotify,
  }),
}));

vi.mock('stores/wizard', () => ({
  useWizardStore: () => ({
    currentStep: mockCurrentStep.value,
    mode: mockMode.value,
    isActive: mockIsActive.value,
    reset: mockReset,
    startCreate: mockStartCreate,
    markStepCompleted: mockMarkStepCompleted,
    goToStep: mockGoToStep,
  }),
}));

vi.mock('stores/hero', () => ({
  useHeroStore: () => ({
    hero: { id: 42 },
    clearHero: mockClearHero,
  }),
}));

vi.mock('stores/classifiers', () => ({
  useClassifierStore: () => ({
    initialized: mockInitialized.value,
    initialize: vi.fn(),
  }),
}));

vi.mock('stores/campaigns', () => ({
  useCampaignStore: () => ({
    hasCampaigns: false,
    campaigns: [],
    fetchCampaigns: vi.fn(),
  }),
}));

vi.mock('src/composables/useSwipeNavigation', () => ({
  useSwipeNavigation: vi.fn(),
}));

vi.mock('src/composables/useDeletionTracker', () => ({
  useDeletionTracker: () => ({
    trackDeletion: vi.fn(),
    getDeletions: vi.fn(() => []),
    clearDeletions: vi.fn(),
    clearAll: vi.fn(),
  }),
}));

vi.mock('src/composables/useWizardSave', () => ({
  useWizardSave: () => ({
    saving: ref(false),
    saveError: ref(null),
    saveCurrentStep: mockSaveCurrentStep,
  }),
}));

vi.mock('src/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

vi.mock('src/utils/errorHandling', () => ({
  toError: (e: unknown) => (e instanceof Error ? e : new Error(String(e))),
}));

vi.mock('src/types', () => ({
  WIZARD_STEPS: [
    { id: 1, code: 'basic-setup', name: 'Basics' },
    { id: 10, code: 'review', name: 'Review' },
  ],
}));

describe('CharacterCreationPage', () => {
  const createWrapper = () =>
    shallowMount(CharacterCreationPage, {
      global: {
        stubs: {
          QPage: {
            template: '<div class="q-page"><slot /></div>',
          },
          QBtn: {
            template: `<button
              class="q-btn"
              :aria-label="ariaLabel"
              @click="$emit('click')"
            ><slot /></button>`,
            props: ['flat', 'round', 'dense', 'icon', 'color', 'ariaLabel'],
            emits: ['click'],
          },
          QTooltip: {
            template: '<span class="q-tooltip"><slot /></span>',
          },
          QSpace: {
            template: '<span class="q-space" />',
          },
          QSpinnerDots: {
            template: '<div class="q-spinner-dots" />',
            props: ['size', 'color', 'ariaLabel'],
          },
          QDialog: {
            template: '<div class="q-dialog" v-if="modelValue"><slot /></div>',
            props: ['modelValue', 'ariaModal', 'ariaLabelledby'],
          },
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QCardActions: {
            template: '<div class="q-card-actions"><slot /></div>',
          },
          StepTabs: {
            name: 'StepTabs',
            template: '<div class="step-tabs" />',
            emits: ['navigate'],
          },
          StepNavigation: {
            name: 'StepNavigation',
            template: '<div class="step-navigation" />',
            props: ['saving', 'saveError'],
            emits: ['previous', 'next', 'finish', 'save-close'],
          },
          BasicSetupStep: { template: '<div class="basic-setup-step" />' },
          CultureStep: { template: '<div class="culture-step" />' },
          AttributesStep: { template: '<div class="attributes-step" />' },
          SkillsStep: { template: '<div class="skills-step" />' },
          ExpertisesStep: { template: '<div class="expertises-step" />' },
          PathsStep: { template: '<div class="paths-step" />' },
          StartingKitStep: { template: '<div class="starting-kit-step" />' },
          EquipmentStep: { template: '<div class="equipment-step" />' },
          PersonalDetailsStep: { template: '<div class="personal-details-step" />' },
          ReviewStep: { template: '<div class="review-step" />' },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentStep.value = 1;
    mockIsActive.value = true;
    mockInitialized.value = true;
    mockMode.value = 'create';
    mockRouteQuery = {};
    mockSaveCurrentStep.mockResolvedValue(true);
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders reset button', () => {
      const wrapper = createWrapper();

      const resetBtn = wrapper.find('.q-btn[aria-label="Reset character creation"]');
      expect(resetBtn.exists()).toBe(true);
    });

    it('renders step tabs', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.step-tabs').exists()).toBe(true);
    });

    it('renders step navigation', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.step-navigation').exists()).toBe(true);
    });
  });

  // ========================================
  // Step Display
  // ========================================
  describe('step display', () => {
    it('shows current step component after initialization', async () => {
      mockCurrentStep.value = 1;

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.basic-setup-step').exists()).toBe(true);
    });
  });

  // ========================================
  // Navigation (auto-save on every step change)
  // ========================================
  describe('navigation', () => {
    it('saves and navigates forward on tab click', async () => {
      mockCurrentStep.value = 1;
      const wrapper = createWrapper();
      await flushPromises();

      wrapper.findComponent({ name: 'StepTabs' }).vm.$emit('navigate', 3);
      await flushPromises();

      expect(mockSaveCurrentStep).toHaveBeenCalled();
      expect(mockMarkStepCompleted).toHaveBeenCalledWith(1);
      expect(mockGoToStep).toHaveBeenCalledWith(3);
    });

    it('saves and navigates backward on tab click', async () => {
      mockCurrentStep.value = 3;
      const wrapper = createWrapper();
      await flushPromises();

      wrapper.findComponent({ name: 'StepTabs' }).vm.$emit('navigate', 1);
      await flushPromises();

      expect(mockSaveCurrentStep).toHaveBeenCalled();
      expect(mockMarkStepCompleted).not.toHaveBeenCalled();
      expect(mockGoToStep).toHaveBeenCalledWith(1);
    });

    it('saves on next arrow click', async () => {
      mockCurrentStep.value = 1;
      const wrapper = createWrapper();
      await flushPromises();

      wrapper.findComponent({ name: 'StepNavigation' }).vm.$emit('next');
      await flushPromises();

      expect(mockSaveCurrentStep).toHaveBeenCalled();
      expect(mockMarkStepCompleted).toHaveBeenCalledWith(1);
      expect(mockGoToStep).toHaveBeenCalledWith(2);
    });

    it('saves on previous arrow click', async () => {
      mockCurrentStep.value = 3;
      const wrapper = createWrapper();
      await flushPromises();

      wrapper.findComponent({ name: 'StepNavigation' }).vm.$emit('previous');
      await flushPromises();

      expect(mockSaveCurrentStep).toHaveBeenCalled();
      expect(mockMarkStepCompleted).not.toHaveBeenCalled();
      expect(mockGoToStep).toHaveBeenCalledWith(2);
    });

    it('stays on current step when save fails', async () => {
      mockCurrentStep.value = 1;
      mockSaveCurrentStep.mockResolvedValueOnce(false);
      const wrapper = createWrapper();
      await flushPromises();

      wrapper.findComponent({ name: 'StepTabs' }).vm.$emit('navigate', 3);
      await flushPromises();

      expect(mockSaveCurrentStep).toHaveBeenCalled();
      expect(mockMarkStepCompleted).not.toHaveBeenCalled();
      expect(mockGoToStep).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Reset
  // ========================================
  describe('reset', () => {
    it('shows reset button in create mode', () => {
      mockMode.value = 'create';
      const wrapper = createWrapper();

      expect(wrapper.find('.q-btn[aria-label="Reset character creation"]').exists()).toBe(true);
    });

    it('hides reset button in edit mode', () => {
      mockMode.value = 'edit';
      const wrapper = createWrapper();

      expect(wrapper.find('.q-btn[aria-label="Reset character creation"]').exists()).toBe(false);
    });

    it('shows reset dialog when reset button clicked', async () => {
      const wrapper = createWrapper();

      const resetBtn = wrapper.find('.q-btn[aria-label="Reset character creation"]');
      await resetBtn.trigger('click');

      expect(wrapper.find('.q-dialog').exists()).toBe(true);
    });

    it('reset dialog has confirmation text', async () => {
      const wrapper = createWrapper();

      const resetBtn = wrapper.find('.q-btn[aria-label="Reset character creation"]');
      await resetBtn.trigger('click');

      expect(wrapper.text()).toContain('Reset Character Creation');
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('has tabpanel role for step content after initialization', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const tabpanel = wrapper.find('[role="tabpanel"]');
      expect(tabpanel.exists()).toBe(true);
    });

    it('tabpanel has aria-labelledby for current step', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const tabpanel = wrapper.find('[role="tabpanel"]');
      expect(tabpanel.attributes('aria-labelledby')).toBe('step-tab-1');
    });
  });
});
