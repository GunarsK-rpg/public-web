import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent, ref } from 'vue';
import StepTabs from './StepTabs.vue';

// Mock the wizard store
const mockGoToStep = vi.fn();
const mockMarkStepCompleted = vi.fn();
const mockIsStepCompleted = vi.fn();
const mockCurrentStep = ref(1);
const mockMode = ref('create');

vi.mock('src/stores/wizard', () => ({
  useWizardStore: () => ({
    get currentStep() {
      return mockCurrentStep.value;
    },
    get mode() {
      return mockMode.value;
    },
    goToStep: mockGoToStep,
    markStepCompleted: mockMarkStepCompleted,
    isStepCompleted: mockIsStepCompleted,
  }),
}));

// Mock the validation composable
const mockValidate = vi.fn();

vi.mock('src/composables/useStepValidation', () => ({
  useStepValidation: () => ({
    validate: mockValidate,
  }),
}));

// Mock WIZARD_STEPS
vi.mock('src/types', () => ({
  WIZARD_STEPS: [
    { id: 1, code: 'basic-setup', name: 'Basics' },
    { id: 2, code: 'attributes', name: 'Attributes' },
    { id: 3, code: 'skills', name: 'Skills' },
    { id: 4, code: 'talents', name: 'Talents' },
    { id: 5, code: 'review', name: 'Review' },
  ],
}));

// Named stub components for findComponent to work
const QTabsStub = defineComponent({
  name: 'QTabs',
  props: [
    'modelValue',
    'dense',
    'align',
    'narrowIndicator',
    'mobileArrows',
    'outsideArrows',
    'activeColor',
    'indicatorColor',
  ],
  emits: ['update:modelValue'],
  template: '<div class="q-tabs" role="tablist"><slot /></div>',
});

const QTabStub = defineComponent({
  name: 'QTab',
  props: ['name', 'label', 'disable', 'alert', 'alertIcon'],
  emits: ['click'],
  template:
    '<button class="q-tab" :data-name="name" :disabled="disable || undefined" @click="$emit(\'click\')">{{ label }}</button>',
});

describe('StepTabs', () => {
  const createWrapper = () =>
    mount(StepTabs, {
      global: {
        stubs: {
          QTabs: QTabsStub,
          QTab: QTabStub,
        },
      },
    });

  function findTab(wrapper: ReturnType<typeof createWrapper>, stepId: number) {
    return wrapper.find(`.q-tab[data-name="${stepId}"]`);
  }

  function findAllTabs(wrapper: ReturnType<typeof createWrapper>) {
    return wrapper.findAll('.q-tab');
  }

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockCurrentStep.value = 1;
    mockMode.value = 'create';
    mockIsStepCompleted.mockReturnValue(false);
    mockValidate.mockReturnValue({ isValid: true, errors: [], warnings: [] });
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders all step tabs', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Basics');
      expect(wrapper.text()).toContain('Attributes');
      expect(wrapper.text()).toContain('Skills');
      expect(wrapper.text()).toContain('Talents');
      expect(wrapper.text()).toContain('Review');
    });

    it('renders 5 tabs', () => {
      const wrapper = createWrapper();

      expect(findAllTabs(wrapper).length).toBe(5);
    });

    it('renders q-tabs container', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-tabs').exists()).toBe(true);
    });

    it('passes current step as model-value to q-tabs', () => {
      mockCurrentStep.value = 3;
      const wrapper = createWrapper();

      const qTabs = wrapper.findComponent(QTabsStub);
      expect(qTabs.props('modelValue')).toBe(3);
    });
  });

  // ========================================
  // Disabled State (Create Mode)
  // ========================================
  describe('disabled state', () => {
    it('disables future uncompleted steps in create mode', () => {
      mockCurrentStep.value = 1;
      mockIsStepCompleted.mockReturnValue(false);

      const wrapper = createWrapper();

      expect(findTab(wrapper, 2).attributes('disabled')).toBeDefined();
      expect(findTab(wrapper, 3).attributes('disabled')).toBeDefined();
    });

    it('enables current step', () => {
      const wrapper = createWrapper();

      expect(findTab(wrapper, 1).attributes('disabled')).toBeUndefined();
    });

    it('enables completed steps in create mode', () => {
      mockCurrentStep.value = 3;
      mockIsStepCompleted.mockImplementation((stepId: number) => stepId <= 2);

      const wrapper = createWrapper();

      expect(findTab(wrapper, 1).attributes('disabled')).toBeUndefined();
      expect(findTab(wrapper, 2).attributes('disabled')).toBeUndefined();
    });

    it('enables all steps in edit mode', () => {
      mockMode.value = 'edit';
      const wrapper = createWrapper();

      const tabs = findAllTabs(wrapper);
      tabs.forEach((tab) => {
        expect(tab.attributes('disabled')).toBeUndefined();
      });
    });
  });

  // ========================================
  // Validation Errors
  // ========================================
  describe('validation errors', () => {
    it('shows error styling for steps with validation errors', () => {
      mockIsStepCompleted.mockReturnValue(true);
      mockValidate.mockReturnValue({ isValid: false, errors: ['Error'], warnings: [] });

      const wrapper = createWrapper();

      const tabs = findAllTabs(wrapper);
      const hasNegativeClass = tabs.some((tab) => tab.classes().includes('text-negative'));
      expect(hasNegativeClass).toBe(true);
    });

    it('passes alert props for steps with validation errors', () => {
      mockIsStepCompleted.mockReturnValue(true);
      mockValidate.mockReturnValue({ isValid: false, errors: ['Error'], warnings: [] });

      const wrapper = createWrapper();

      const tabs = wrapper.findAllComponents(QTabStub);
      expect(tabs[0]!.props('alert')).toBe('negative');
      expect(tabs[0]!.props('alertIcon')).toBe('error');
    });

    it('does not show error styling for valid completed steps', () => {
      mockIsStepCompleted.mockReturnValue(true);
      mockValidate.mockReturnValue({ isValid: true, errors: [], warnings: [] });

      const wrapper = createWrapper();

      const tabs = findAllTabs(wrapper);
      const hasNegativeClass = tabs.some((tab) => tab.classes().includes('text-negative'));
      expect(hasNegativeClass).toBe(false);
    });

    it('does not validate uncompleted steps', () => {
      mockIsStepCompleted.mockReturnValue(false);
      mockValidate.mockReturnValue({ isValid: false, errors: ['Error'], warnings: [] });

      const wrapper = createWrapper();

      const tabs = findAllTabs(wrapper);
      const hasNegativeClass = tabs.some((tab) => tab.classes().includes('text-negative'));
      expect(hasNegativeClass).toBe(false);
    });

    it('does not pass alert props for valid steps', () => {
      mockIsStepCompleted.mockReturnValue(true);
      mockValidate.mockReturnValue({ isValid: true, errors: [], warnings: [] });

      const wrapper = createWrapper();

      const tabs = wrapper.findAllComponents(QTabStub);
      expect(tabs[0]!.props('alert')).toBe(false);
    });
  });

  // ========================================
  // Click Navigation
  // ========================================
  describe('click navigation', () => {
    it('navigates to clicked step via q-tabs update event', () => {
      // Navigate backward from step 3 to step 1 (always allowed in create mode)
      mockCurrentStep.value = 3;
      const wrapper = createWrapper();

      const qTabs = wrapper.findComponent(QTabsStub);
      qTabs.vm.$emit('update:modelValue', 1);

      expect(mockGoToStep).toHaveBeenCalledWith(1);
    });

    it('marks current step completed when navigating forward', () => {
      mockCurrentStep.value = 1;
      mockIsStepCompleted.mockReturnValue(true);
      const wrapper = createWrapper();

      const qTabs = wrapper.findComponent(QTabsStub);
      qTabs.vm.$emit('update:modelValue', 3);

      expect(mockMarkStepCompleted).toHaveBeenCalledWith(1);
    });

    it('does not mark step completed when navigating backward', () => {
      mockCurrentStep.value = 3;
      const wrapper = createWrapper();

      const qTabs = wrapper.findComponent(QTabsStub);
      qTabs.vm.$emit('update:modelValue', 1);

      expect(mockMarkStepCompleted).not.toHaveBeenCalled();
    });

    it('does not mark step completed when selecting current step', () => {
      const wrapper = createWrapper();

      const qTabs = wrapper.findComponent(QTabsStub);
      qTabs.vm.$emit('update:modelValue', 1);

      expect(mockMarkStepCompleted).not.toHaveBeenCalled();
    });
  });
});
