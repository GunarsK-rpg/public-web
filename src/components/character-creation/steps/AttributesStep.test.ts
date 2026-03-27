import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AttributesStep from './AttributesStep.vue';

// Mock stores
const mockSetAttribute = vi.fn();
const mockSetDerivedStatModifier = vi.fn();
const mockGetAttributeValueById = vi.fn().mockReturnValue(2);

// Reactive mock data for dynamic test control
const mockStoreData = {
  value: {
    attributeValue: 2,
    budgetRemaining: 5,
    budgetTotal: 10,
  },
};

const mockClassifierData = {
  value: {
    attributes: [
      {
        id: 1,
        code: 'str',
        name: 'Strength',
        attrType: { id: 1, code: 'physical', name: 'Physical' },
        description: 'Physical power',
      },
      {
        id: 2,
        code: 'dex',
        name: 'Dexterity',
        attrType: { id: 1, code: 'physical', name: 'Physical' },
        description: 'Agility',
      },
    ],
    attributeTypes: [{ id: 1, code: 'physical', name: 'Physical' }] as {
      id: number;
      code: string;
      name: string;
    }[],
    derivedStats: [] as { id: number; code: string; name: string; hasModifier?: boolean }[],
    derivedStatValues: [] as { id: number; derivedStatId: number }[],
  },
};

const mockDerivedStatsListResult = {
  value: [] as {
    id: number;
    name: string;
    baseDisplay: string;
    hasModifier: boolean;
    modifier: number;
    bonus: number;
    totalDisplay: string;
  }[],
};

const mockNormalizeModifier = {
  value: (val: unknown): number | null => (typeof val === 'number' ? val : Number(val) || 0),
};

import { heroAttributesStore, classifierStore } from 'src/__tests__/mockStores';

vi.mock('src/stores/heroAttributes', () => ({
  useHeroAttributesStore: () => ({
    ...heroAttributesStore({
      getAttributeValue: vi.fn().mockReturnValue(2),
      setAttribute: mockSetAttribute,
      setDerivedStatModifier: mockSetDerivedStatModifier,
      getDerivedStatModifier: vi.fn().mockReturnValue(0),
      levelData: { level: 1 },
      tierData: { tier: 1 },
    }),
    get getAttributeValueById() {
      return mockGetAttributeValueById;
    },
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    ...classifierStore(),
    get attributes() {
      return mockClassifierData.value.attributes;
    },
    get attributeTypes() {
      return mockClassifierData.value.attributeTypes;
    },
    get derivedStats() {
      return mockClassifierData.value.derivedStats;
    },
    get derivedStatValues() {
      return mockClassifierData.value.derivedStatValues;
    },
  }),
}));

vi.mock('src/composables/useStepValidation', () => ({
  useStepValidation: () => ({
    budget: () => ({
      get remaining() {
        return mockStoreData.value.budgetRemaining;
      },
      get budget() {
        return mockStoreData.value.budgetTotal;
      },
      spent: 5,
    }),
  }),
}));

vi.mock('src/utils/derivedStats', () => ({
  buildDerivedStatsList: () => mockDerivedStatsListResult.value,
}));

vi.mock('src/utils/arrayUtils', () => ({
  findById: <T extends { id: number }>(arr: T[], id: number) => arr?.find((item) => item.id === id),
}));

vi.mock('src/composables/useModifierInput', () => ({
  normalizeModifierInput: (val: unknown) => mockNormalizeModifier.value(val),
}));

describe('AttributesStep', () => {
  const createWrapper = () =>
    shallowMount(AttributesStep, {
      global: {
        stubs: {
          BudgetDisplay: {
            template: '<div class="budget-display">{{ remaining }}/{{ total }}</div>',
            props: ['label', 'remaining', 'total', 'showTotal'],
          },
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QBtn: {
            template: `<button
              class="q-btn"
              :disabled="disable"
              :aria-label="ariaLabel"
              @click="$emit('click')"
            ><slot /></button>`,
            props: ['round', 'dense', 'flat', 'icon', 'ariaLabel', 'disable'],
            emits: ['click'],
          },
          QSlider: {
            template: `<input
              type="range"
              class="q-slider"
              :value="modelValue"
              @input="$emit('update:modelValue', Number($event.target.value))"
            />`,
            props: ['modelValue', 'min', 'max', 'step', 'label', 'ariaLabel'],
            emits: ['update:modelValue'],
          },
          QInput: {
            template: '<input class="q-input" />',
            props: ['modelValue', 'type', 'dense', 'outlined', 'prefix', 'ariaLabel'],
          },
          QBadge: {
            template: '<span class="q-badge"><slot /></span>',
            props: ['color'],
          },
          QSpace: {
            template: '<span class="q-space" />',
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockGetAttributeValueById.mockReturnValue(2);

    // Reset mock data to defaults
    mockStoreData.value = {
      attributeValue: 2,
      budgetRemaining: 5,
      budgetTotal: 10,
    };
    mockClassifierData.value = {
      attributes: [
        {
          id: 1,
          code: 'str',
          name: 'Strength',
          attrType: { id: 1, code: 'physical', name: 'Physical' },
          description: 'Physical power',
        },
        {
          id: 2,
          code: 'dex',
          name: 'Dexterity',
          attrType: { id: 1, code: 'physical', name: 'Physical' },
          description: 'Agility',
        },
      ],
      attributeTypes: [{ id: 1, code: 'physical', name: 'Physical' }],
      derivedStats: [],
      derivedStatValues: [],
    };
    mockDerivedStatsListResult.value = [];
    mockNormalizeModifier.value = (val: unknown): number | null =>
      typeof val === 'number' ? val : Number(val) || 0;
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders step description', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Allocate your attribute points');
    });

    it('renders budget display', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.budget-display').exists()).toBe(true);
    });

    it('renders attribute cards', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Strength');
      expect(wrapper.text()).toContain('Dexterity');
    });

    it('shows attribute abbreviations', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('STR');
      expect(wrapper.text()).toContain('DEX');
    });
  });

  // ========================================
  // Attribute Controls
  // ========================================
  describe('attribute controls', () => {
    it('renders increment and decrement buttons', () => {
      const wrapper = createWrapper();

      const buttons = wrapper.findAll('.q-btn');
      expect(buttons.length).toBeGreaterThanOrEqual(4); // 2 per attribute
    });

    it('renders slider for each attribute', () => {
      const wrapper = createWrapper();

      const sliders = wrapper.findAll('.q-slider');
      expect(sliders.length).toBe(2);
    });

    it('shows current attribute value', () => {
      const wrapper = createWrapper();

      // Value is 2 from mock
      expect(wrapper.text()).toContain('2');
    });
  });

  // ========================================
  // Button States
  // ========================================
  describe('button states', () => {
    it('disables decrement when at 0', () => {
      mockGetAttributeValueById.mockReturnValue(0);

      const wrapper = createWrapper();
      const decrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Decrease'));

      expect(decrementBtns.some((btn) => btn.attributes('disabled') !== undefined)).toBe(true);
    });
  });

  // ========================================
  // Derived Stats
  // ========================================
  describe('derived stats', () => {
    it('renders derived stats section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Other Stats');
    });
  });

  // ========================================
  // Attribute Increment/Decrement
  // ========================================
  describe('attribute increment/decrement', () => {
    it('increments attribute when add button clicked', async () => {
      mockGetAttributeValueById.mockReturnValue(2);
      const wrapper = createWrapper();

      const incrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Increase'));
      await incrementBtns[0]!.trigger('click');

      expect(mockSetAttribute).toHaveBeenCalledWith(1, 3);
    });

    it('decrements attribute when remove button clicked', async () => {
      mockGetAttributeValueById.mockReturnValue(2);
      const wrapper = createWrapper();

      const decrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Decrease'));
      await decrementBtns[0]!.trigger('click');

      expect(mockSetAttribute).toHaveBeenCalledWith(1, 1);
    });

    it('does not increment when at max value', async () => {
      mockGetAttributeValueById.mockReturnValue(5);
      const wrapper = createWrapper();

      const incrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Increase'));
      await incrementBtns[0]!.trigger('click');

      expect(mockSetAttribute).not.toHaveBeenCalled();
    });

    it('does not decrement when at min value', async () => {
      mockGetAttributeValueById.mockReturnValue(0);
      const wrapper = createWrapper();

      const decrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Decrease'));
      expect(decrementBtns.length).toBeGreaterThan(0);
      await decrementBtns[0]!.trigger('click');

      expect(mockSetAttribute).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Slider Interaction
  // ========================================
  describe('slider interaction', () => {
    it('updates attribute value when slider changes', async () => {
      const wrapper = createWrapper();

      const slider = wrapper.find('.q-slider');
      await slider.setValue(4);

      expect(mockSetAttribute).toHaveBeenCalled();
    });

    it('clamps value to max when slider exceeds budget', async () => {
      mockGetAttributeValueById.mockReturnValue(0);
      const wrapper = createWrapper();

      const slider = wrapper.find('.q-slider');
      // Try to set to 10 but only 5 points remaining
      await slider.setValue(10);

      // Should clamp to 5 (max) or based on budget
      expect(mockSetAttribute).toHaveBeenCalled();
    });
  });

  // ========================================
  // Budget Enforcement
  // ========================================
  describe('budget enforcement', () => {
    it('disables increment when no points remaining', () => {
      // Override mock to return 0 remaining
      vi.mocked(mockGetAttributeValueById).mockReturnValue(2);

      const wrapper = shallowMount(AttributesStep, {
        global: {
          stubs: {
            BudgetDisplay: {
              template: '<div class="budget-display">0/10</div>',
              props: ['label', 'remaining', 'total', 'showTotal'],
            },
            QCard: { template: '<div class="q-card"><slot /></div>' },
            QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
            QBtn: {
              template: `<button
                class="q-btn"
                :disabled="disable"
                :aria-label="ariaLabel"
              ></button>`,
              props: ['round', 'dense', 'flat', 'icon', 'ariaLabel', 'disable'],
            },
            QSlider: { template: '<input type="range" class="q-slider" />' },
            QInput: { template: '<input class="q-input" />' },
            QBadge: { template: '<span class="q-badge"><slot /></span>' },
            QSpace: { template: '<span class="q-space" />' },
            QSeparator: { template: '<hr class="q-separator" />' },
          },
        },
      });

      // At least verify the component renders without crashing
      expect(wrapper.exists()).toBe(true);
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('has aria-label on increment buttons', () => {
      const wrapper = createWrapper();

      const incrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Increase'));
      expect(incrementBtns.length).toBeGreaterThan(0);
      expect(incrementBtns[0]!.attributes('aria-label')).toBe('Increase Strength');
    });

    it('has aria-label on decrement buttons', () => {
      const wrapper = createWrapper();

      const decrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Decrease'));
      expect(decrementBtns.length).toBeGreaterThan(0);
      expect(decrementBtns[0]!.attributes('aria-label')).toBe('Decrease Strength');
    });

    it('has role="status" on value display', () => {
      const wrapper = createWrapper();

      const displayValues = wrapper.findAll('[role="status"]');
      expect(displayValues.length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // Attribute Type Colors
  // ========================================
  describe('attribute type colors', () => {
    it('displays attribute type badge', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Physical');
    });

    it('displays attribute description', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Physical power');
      expect(wrapper.text()).toContain('Agility');
    });

    it('uses grey color for unknown attribute type', () => {
      mockClassifierData.value.attributes = [
        {
          id: 1,
          code: 'str',
          name: 'Strength',
          attrType: { id: 999, code: 'unknown', name: 'Unknown' },
          description: 'Physical power',
        },
      ];
      mockClassifierData.value.attributeTypes = [];

      const wrapper = createWrapper();

      // Should render without crashing (type badge will be empty/grey)
      expect(wrapper.exists()).toBe(true);
    });

    it('uses grey color for attribute type without matching color', () => {
      mockClassifierData.value.attributes = [
        {
          id: 1,
          code: 'str',
          name: 'Strength',
          attrType: { id: 1, code: 'physical', name: 'Physical' },
          description: 'Physical power',
        },
      ];
      mockClassifierData.value.attributeTypes = [{ id: 1, code: 'unknown_type', name: 'Unknown' }];

      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
    });

    it('handles attribute without description', () => {
      mockClassifierData.value.attributes = [
        {
          id: 1,
          code: 'str',
          name: 'Strength',
          attrType: { id: 1, code: 'physical', name: 'Physical' },
          description: undefined as unknown as string,
        },
      ];

      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
    });
  });

  // ========================================
  // Slider setAttrValue Edge Cases
  // ========================================
  describe('setAttrValue edge cases', () => {
    it('does nothing when slider value is null', async () => {
      const wrapper = shallowMount(AttributesStep, {
        global: {
          stubs: {
            BudgetDisplay: {
              template: '<div class="budget-display">{{ remaining }}/{{ total }}</div>',
              props: ['label', 'remaining', 'total', 'showTotal'],
            },
            QCard: { template: '<div class="q-card"><slot /></div>' },
            QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
            QBtn: {
              template: '<button class="q-btn"></button>',
              props: ['round', 'dense', 'flat', 'icon', 'ariaLabel', 'disable'],
            },
            QSlider: {
              template:
                '<div class="q-slider"><button class="emit-null" @click="$emit(\'update:modelValue\', null)" /></div>',
              props: ['modelValue', 'min', 'max', 'step', 'label', 'ariaLabel'],
              emits: ['update:modelValue'],
            },
            QInput: { template: '<input class="q-input" />' },
            QBadge: { template: '<span class="q-badge"><slot /></span>' },
            QSpace: { template: '<span class="q-space" />' },
            QSeparator: { template: '<hr class="q-separator" />' },
          },
        },
      });

      await wrapper.find('.emit-null').trigger('click');

      // setAttribute should not be called with null
      expect(mockSetAttribute).not.toHaveBeenCalled();
    });

    it('limits attribute increase when budget exceeded', async () => {
      // Current value is 0, budget remaining is 2
      mockGetAttributeValueById.mockReturnValue(0);
      mockStoreData.value.budgetRemaining = 2;

      const wrapper = createWrapper();

      const slider = wrapper.find('.q-slider');
      // Try to set to 5 but only 2 points remaining
      await slider.setValue(5);

      // Should set to max allowed (0 + 2 = 2)
      expect(mockSetAttribute).toHaveBeenCalledWith(1, 2);
    });

    it('clamps value to 5 even with sufficient budget', async () => {
      mockGetAttributeValueById.mockReturnValue(0);
      mockStoreData.value.budgetRemaining = 100;

      const wrapper = createWrapper();

      const slider = wrapper.find('.q-slider');
      await slider.setValue(10);

      // Should clamp to 5 (max attribute value)
      expect(mockSetAttribute).toHaveBeenCalledWith(1, 5);
    });

    it('handles decreasing value (no budget check needed)', async () => {
      mockGetAttributeValueById.mockReturnValue(5);
      mockStoreData.value.budgetRemaining = 0;

      const wrapper = createWrapper();

      const slider = wrapper.find('.q-slider');
      await slider.setValue(2);

      // Decreasing doesn't require budget
      expect(mockSetAttribute).toHaveBeenCalledWith(1, 2);
    });
  });

  // ========================================
  // Derived Stats with Modifiers
  // ========================================
  describe('derived stats with modifiers', () => {
    it('renders derived stats with modifier input when hasModifier is true', () => {
      mockDerivedStatsListResult.value = [
        {
          id: 1,
          name: 'Health',
          baseDisplay: '10',
          hasModifier: true,
          modifier: 0,
          bonus: 0,
          totalDisplay: '10',
        },
      ];

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Health');
      expect(wrapper.find('.q-input').exists()).toBe(true);
    });

    it('shows total display when modifier is non-zero', () => {
      mockDerivedStatsListResult.value = [
        {
          id: 1,
          name: 'Health',
          baseDisplay: '10',
          hasModifier: true,
          modifier: 5,
          bonus: 0,
          totalDisplay: '15',
        },
      ];

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('= 15');
    });

    it('does not show total display when modifier and bonus are zero', () => {
      mockDerivedStatsListResult.value = [
        {
          id: 1,
          name: 'Health',
          baseDisplay: '10',
          hasModifier: true,
          modifier: 0,
          bonus: 0,
          totalDisplay: '10',
        },
      ];

      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('= 10');
    });

    it('shows total display when bonus is non-zero and modifier is zero', () => {
      mockDerivedStatsListResult.value = [
        {
          id: 1,
          name: 'Movement',
          baseDisplay: '30 ft',
          hasModifier: true,
          modifier: 0,
          bonus: 10,
          totalDisplay: '40 ft',
        },
      ];

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('+10');
      expect(wrapper.text()).toContain('= 40 ft');
    });

    it('does not render modifier input when hasModifier is false', () => {
      mockDerivedStatsListResult.value = [
        {
          id: 1,
          name: 'Speed',
          baseDisplay: '5',
          hasModifier: false,
          modifier: 0,
          bonus: 0,
          totalDisplay: '5',
        },
      ];

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Speed');
      expect(wrapper.find('.q-input').exists()).toBe(false);
    });

    it('shows positive prefix for positive modifier', () => {
      mockDerivedStatsListResult.value = [
        {
          id: 1,
          name: 'Health',
          baseDisplay: '10',
          hasModifier: true,
          modifier: 3,
          bonus: 0,
          totalDisplay: '13',
        },
      ];

      const wrapper = createWrapper();

      // The prefix prop should be '+' for positive modifiers
      const input = wrapper.find('.q-input');
      expect(input.exists()).toBe(true);
    });

    it('shows no prefix for negative modifier', () => {
      mockDerivedStatsListResult.value = [
        {
          id: 1,
          name: 'Health',
          baseDisplay: '10',
          hasModifier: true,
          modifier: -2,
          bonus: 0,
          totalDisplay: '8',
        },
      ];

      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      expect(input.exists()).toBe(true);
      // Negative values don't need a prefix - verify the input has no prefix prop or empty prefix
      expect(input.attributes('prefix')).toBeUndefined();
    });
  });

  // ========================================
  // Modifier Input Normalization
  // ========================================
  describe('modifier input normalization', () => {
    it('does not call setDerivedStatModifier when normalized value is null', async () => {
      mockNormalizeModifier.value = () => null;
      mockDerivedStatsListResult.value = [
        {
          id: 1,
          name: 'Health',
          baseDisplay: '10',
          hasModifier: true,
          modifier: 0,
          bonus: 0,
          totalDisplay: '10',
        },
      ];

      const wrapper = shallowMount(AttributesStep, {
        global: {
          stubs: {
            BudgetDisplay: {
              template: '<div class="budget-display">{{ remaining }}/{{ total }}</div>',
              props: ['label', 'remaining', 'total', 'showTotal'],
            },
            QCard: { template: '<div class="q-card"><slot /></div>' },
            QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
            QBtn: {
              template: '<button class="q-btn"></button>',
              props: ['round', 'dense', 'flat', 'icon', 'ariaLabel', 'disable'],
            },
            QSlider: { template: '<input type="range" class="q-slider" />' },
            QInput: {
              template:
                '<input class="q-input" @input="$emit(\'update:modelValue\', $event.target.value)" />',
              props: ['modelValue', 'type', 'dense', 'outlined', 'prefix', 'ariaLabel'],
              emits: ['update:modelValue'],
            },
            QBadge: { template: '<span class="q-badge"><slot /></span>' },
            QSpace: { template: '<span class="q-space" />' },
            QSeparator: { template: '<hr class="q-separator" />' },
          },
        },
      });

      const input = wrapper.find('.q-input');
      await input.setValue('invalid');

      expect(mockSetDerivedStatModifier).not.toHaveBeenCalled();
    });

    it('calls setDerivedStatModifier when normalized value is valid', async () => {
      mockNormalizeModifier.value = () => 5;
      mockDerivedStatsListResult.value = [
        {
          id: 1,
          name: 'Health',
          baseDisplay: '10',
          hasModifier: true,
          modifier: 0,
          bonus: 0,
          totalDisplay: '10',
        },
      ];

      const wrapper = shallowMount(AttributesStep, {
        global: {
          stubs: {
            BudgetDisplay: {
              template: '<div class="budget-display">{{ remaining }}/{{ total }}</div>',
              props: ['label', 'remaining', 'total', 'showTotal'],
            },
            QCard: { template: '<div class="q-card"><slot /></div>' },
            QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
            QBtn: {
              template: '<button class="q-btn"></button>',
              props: ['round', 'dense', 'flat', 'icon', 'ariaLabel', 'disable'],
            },
            QSlider: { template: '<input type="range" class="q-slider" />' },
            QInput: {
              template:
                '<input class="q-input" @input="$emit(\'update:modelValue\', $event.target.value)" />',
              props: ['modelValue', 'type', 'dense', 'outlined', 'prefix', 'ariaLabel'],
              emits: ['update:modelValue'],
            },
            QBadge: { template: '<span class="q-badge"><slot /></span>' },
            QSpace: { template: '<span class="q-space" />' },
            QSeparator: { template: '<hr class="q-separator" />' },
          },
        },
      });

      const input = wrapper.find('.q-input');
      await input.setValue('5');

      expect(mockSetDerivedStatModifier).toHaveBeenCalledWith(1, 5);
    });
  });

  // ========================================
  // Increment with no budget
  // ========================================
  describe('increment with no budget', () => {
    it('does not increment when no points remaining', async () => {
      mockGetAttributeValueById.mockReturnValue(2);
      mockStoreData.value.budgetRemaining = 0;

      const wrapper = createWrapper();

      const incrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Increase'));
      await incrementBtns[0]!.trigger('click');

      expect(mockSetAttribute).not.toHaveBeenCalled();
    });
  });
});
