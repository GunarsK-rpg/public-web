import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref, computed } from 'vue';
import StepNavigation from './StepNavigation.vue';

// Mock values that can be changed per test
const mockCurrentStep = ref(1);
const mockPreviousStep = vi.fn();

vi.mock('src/stores/wizard', () => ({
  useWizardStore: () => ({
    get currentStep() {
      return mockCurrentStep.value;
    },
    previousStep: mockPreviousStep,
  }),
}));

// Mock validation values
const mockCurrentStepCode = ref('basic-setup');
const mockCurrentValidation = ref({
  isValid: true,
  errors: [] as string[],
  warnings: [] as string[],
});
const mockAllStepsValidation = ref({
  isValid: true,
  errors: [] as string[],
  warnings: [] as string[],
});

vi.mock('src/composables/useStepValidation', () => ({
  useStepValidation: () => ({
    currentStepCode: computed(() => mockCurrentStepCode.value),
    currentValidation: computed(() => mockCurrentValidation.value),
    allStepsValidation: computed(() => mockAllStepsValidation.value),
  }),
}));

// Mock STEP_CODES
vi.mock('src/types/wizard', () => ({
  STEP_CODES: {
    BASIC_SETUP: 'basic-setup',
    ATTRIBUTES: 'attributes',
    SKILLS: 'skills',
    TALENTS: 'talents',
    REVIEW: 'review',
  },
}));

describe('StepNavigation', () => {
  const createWrapper = (props: { saving?: boolean; saveError?: string | null } = {}) =>
    shallowMount(StepNavigation, {
      props,
      global: {
        stubs: {
          QBtn: {
            template: `<button
              class="q-btn"
              :class="{ 'q-btn--loading': loading }"
              :disabled="disable"
              @click="$emit('click')"
            >
              <slot />
              {{ label }}
            </button>`,
            props: ['label', 'loading', 'disable', 'icon', 'iconRight', 'color', 'flat', 'dense'],
            emits: ['click'],
          },
          QSpace: {
            template: '<span class="q-space" />',
          },
          QIcon: {
            template: '<span class="q-icon" />',
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockCurrentStep.value = 1;
    mockCurrentStepCode.value = 'basic-setup';
    mockCurrentValidation.value = { isValid: true, errors: [], warnings: [] };
    mockAllStepsValidation.value = { isValid: true, errors: [], warnings: [] };
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders Next button on non-last step', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Next');
    });

    it('renders Finish button on last step', () => {
      mockCurrentStepCode.value = 'review';

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Finish');
    });

    it('does not render Back button on first step', () => {
      mockCurrentStep.value = 1;

      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Back');
    });

    it('renders Back button on steps after first', () => {
      mockCurrentStep.value = 2;

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Back');
    });
  });

  // ========================================
  // Navigation Actions
  // ========================================
  describe('navigation actions', () => {
    it('calls previousStep when Back clicked', async () => {
      mockCurrentStep.value = 2;

      const wrapper = createWrapper();
      const buttons = wrapper.findAll('.q-btn');
      const backButton = buttons.find((b) => b.text().includes('Back'));
      expect(backButton).toBeDefined();

      await backButton!.trigger('click');

      expect(mockPreviousStep).toHaveBeenCalled();
    });

    it('emits next event when Next clicked', async () => {
      const wrapper = createWrapper();
      const buttons = wrapper.findAll('.q-btn');
      const nextButton = buttons.find((b) => b.text().includes('Next'));
      expect(nextButton).toBeDefined();

      await nextButton!.trigger('click');

      expect(wrapper.emitted('next')).toBeTruthy();
    });

    it('emits finish event when Finish clicked', async () => {
      mockCurrentStepCode.value = 'review';
      mockAllStepsValidation.value = { isValid: true, errors: [], warnings: [] };

      const wrapper = createWrapper();
      const buttons = wrapper.findAll('.q-btn');
      const finishButton = buttons.find((b) => b.text().includes('Finish'));
      expect(finishButton).toBeDefined();

      await finishButton!.trigger('click');

      expect(wrapper.emitted('finish')).toBeTruthy();
    });
  });

  // ========================================
  // Validation Errors
  // ========================================
  describe('validation errors', () => {
    it('shows error message when current step has errors', () => {
      mockCurrentValidation.value = { isValid: false, errors: ['Name is required'], warnings: [] };

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Name is required');
    });

    it('shows first error when multiple errors exist', () => {
      mockCurrentValidation.value = {
        isValid: false,
        errors: ['First error', 'Second error'],
        warnings: [],
      };

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('First error');
    });

    it('does not show error section when no errors', () => {
      mockCurrentValidation.value = { isValid: true, errors: [], warnings: [] };

      const wrapper = createWrapper();

      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    });

    it('has alert role for error message', () => {
      mockCurrentValidation.value = { isValid: false, errors: ['Error message'], warnings: [] };

      const wrapper = createWrapper();

      expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    });

    it('has aria-live for error updates', () => {
      mockCurrentValidation.value = { isValid: false, errors: ['Error message'], warnings: [] };

      const wrapper = createWrapper();

      expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true);
    });

    it('shows saveError with priority over validation errors', () => {
      mockCurrentValidation.value = {
        isValid: false,
        errors: ['Validation error'],
        warnings: [],
      };

      const wrapper = createWrapper({ saveError: 'Network error' });

      expect(wrapper.text()).toContain('Network error');
    });
  });

  // ========================================
  // Finish Button State
  // ========================================
  describe('finish button state', () => {
    it('disables Finish when all steps not valid', () => {
      mockCurrentStepCode.value = 'review';
      mockAllStepsValidation.value = { isValid: false, errors: ['Not complete'], warnings: [] };

      const wrapper = createWrapper();
      const buttons = wrapper.findAll('.q-btn');
      const finishButton = buttons.find((b) => b.text().includes('Finish'));

      expect(finishButton?.attributes('disabled')).toBeDefined();
    });

    it('enables Finish when all steps valid', () => {
      mockCurrentStepCode.value = 'review';
      mockAllStepsValidation.value = { isValid: true, errors: [], warnings: [] };

      const wrapper = createWrapper();
      const buttons = wrapper.findAll('.q-btn');
      const finishButton = buttons.find((b) => b.text().includes('Finish'));

      expect(finishButton?.attributes('disabled')).toBeUndefined();
    });
  });

  // ========================================
  // Loading State
  // ========================================
  describe('loading state', () => {
    it('shows loading state on Next button when saving', () => {
      const wrapper = createWrapper({ saving: true });
      const buttons = wrapper.findAll('.q-btn');
      const nextButton = buttons.find((b) => b.text().includes('Next'));

      expect(nextButton?.classes()).toContain('q-btn--loading');
    });

    it('does not show loading state by default', () => {
      const wrapper = createWrapper();
      const buttons = wrapper.findAll('.q-btn');
      const nextButton = buttons.find((b) => b.text().includes('Next'));

      expect(nextButton?.classes()).not.toContain('q-btn--loading');
    });
  });

  // ========================================
  // Step Visibility Logic
  // ========================================
  describe('step visibility logic', () => {
    it('shows Next on step 1', () => {
      mockCurrentStep.value = 1;
      mockCurrentStepCode.value = 'basic-setup';

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Next');
      expect(wrapper.text()).not.toContain('Finish');
    });

    it('shows both Back and Next on middle steps', () => {
      mockCurrentStep.value = 3;
      mockCurrentStepCode.value = 'skills';

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Back');
      expect(wrapper.text()).toContain('Next');
    });

    it('shows Back and Finish on last step', () => {
      mockCurrentStep.value = 5;
      mockCurrentStepCode.value = 'review';

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Back');
      expect(wrapper.text()).toContain('Finish');
      expect(wrapper.text()).not.toContain('Next');
    });
  });
});
