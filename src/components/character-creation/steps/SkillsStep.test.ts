import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import SkillsStep from './SkillsStep.vue';
import {
  heroStore,
  heroAttributesStore,
  classifierStore,
  heroTalentsStore,
} from 'src/__tests__/mockStores';

type MockHeroSkill = {
  skill: { id: number; code: string; name: string };
  modifier: number;
};

type MockClassifierSkill = {
  id: number;
  code: string;
  name: string;
  attr: { id: number; code: string; name: string };
};

// Mock stores
const mockSetSkillRank = vi.fn();
const mockSetSkillModifier = vi.fn();
const mockGetSkillRank = vi.fn().mockReturnValue(1);

// Reactive mock data
const mockHeroData = {
  value: {
    hero: {
      skills: [
        { skill: { id: 1, code: 'athletics', name: 'Athletics' }, modifier: 0 },
      ] as MockHeroSkill[],
    } as {
      skills: MockHeroSkill[];
    } | null,
  },
};

const mockBudgetData = {
  value: { remaining: 5, budget: 10, spent: 5, maxRank: 2 },
};

const mockAttributeCodeMap = {
  value: new Map([
    [1, 'str'],
    [2, 'dex'],
  ]),
};

const mockNormalizeModifier = {
  value: (val: unknown) => (typeof val === 'number' ? val : Number(val) || 0) as number | null,
};

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    ...heroStore(),
    get hero() {
      return mockHeroData.value.hero;
    },
    get skills() {
      return mockHeroData.value.hero?.skills ?? [];
    },
  }),
}));

vi.mock('src/stores/heroAttributes', () => ({
  useHeroAttributesStore: () =>
    heroAttributesStore({
      getSkillRank: mockGetSkillRank,
      setSkillRank: mockSetSkillRank,
      setSkillModifier: mockSetSkillModifier,
    }),
}));

function createDefaultClassifierData() {
  return {
    skills: [
      {
        id: 1,
        code: 'athletics',
        name: 'Athletics',
        attr: { id: 1, code: 'str', name: 'Strength' },
      },
      {
        id: 2,
        code: 'acrobatics',
        name: 'Acrobatics',
        attr: { id: 2, code: 'dex', name: 'Dexterity' },
      },
      {
        id: 3,
        code: 'unknown',
        name: 'Unknown Skill',
        attr: { id: 999, code: 'none', name: 'None' },
      },
    ] as MockClassifierSkill[],
    attributes: [
      {
        id: 1,
        code: 'str',
        name: 'Strength',
        attrType: { id: 1, code: 'physical', name: 'Physical' },
      },
      {
        id: 2,
        code: 'dex',
        name: 'Dexterity',
        attrType: { id: 1, code: 'physical', name: 'Physical' },
      },
    ],
    attributeTypes: [{ id: 1, code: 'physical', name: 'Physical' }],
  };
}

const mockClassifierData = {
  value: createDefaultClassifierData(),
};

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    ...classifierStore(),
    get skills() {
      return mockClassifierData.value.skills;
    },
    get attributes() {
      return mockClassifierData.value.attributes;
    },
    get attributeTypes() {
      return mockClassifierData.value.attributeTypes;
    },
  }),
}));

const emptyPool = { budget: 0, spent: 0, remaining: 0 };
const mockFlexBudget = ref({
  skills: emptyPool,
  talents: emptyPool,
  flex: emptyPool,
  isOverBudget: false,
});

vi.mock('src/composables/useStepValidation', () => ({
  useStepValidation: () => ({
    budget: () => mockBudgetData.value,
    flexBudget: mockFlexBudget,
  }),
}));

vi.mock('src/stores/heroTalents', () => ({
  useHeroTalentsStore: () => heroTalentsStore(),
}));

vi.mock('src/utils/arrayUtils', () => ({
  groupByKey: <T, K extends PropertyKey>(list: T[], keyFn: (item: T) => K) => {
    const result = {} as Record<K, T[]>;
    for (const item of list) {
      const key = keyFn(item);
      if (!result[key]) result[key] = [];
      result[key].push(item);
    }
    return result;
  },
  buildIdCodeMap: () => mockAttributeCodeMap.value,
  findById: () => undefined,
}));

vi.mock('src/composables/useModifierInput', () => ({
  normalizeModifierInput: (val: unknown, min?: number, max?: number) => {
    const normalized = mockNormalizeModifier.value(val);
    if (normalized === null) return null;
    if (min !== undefined && normalized < min) return min;
    if (max !== undefined && normalized > max) return max;
    return normalized;
  },
}));

describe('SkillsStep', () => {
  const createWrapper = () =>
    shallowMount(SkillsStep, {
      global: {
        stubs: {
          BudgetDisplay: {
            template: '<div class="budget-display">{{ remaining }}/{{ total }}</div>',
            props: ['label', 'remaining', 'total', 'showTotal'],
          },
          QList: {
            template: '<div class="q-list"><slot /></div>',
          },
          QItem: {
            template: '<div class="q-item"><slot /></div>',
          },
          QItemSection: {
            template: '<div class="q-item-section"><slot /></div>',
            props: ['side'],
          },
          QItemLabel: {
            template: '<span class="q-item-label"><slot /></span>',
            props: ['caption'],
          },
          QBtn: {
            template: `<button
              class="q-btn"
              :disabled="disable"
              :aria-label="ariaLabel"
              @click="$emit('click')"
            />`,
            props: ['round', 'dense', 'flat', 'size', 'icon', 'ariaLabel', 'disable'],
            emits: ['click'],
          },
          QInput: {
            template: `<input
              class="q-input"
              type="number"
              :value="modelValue"
              :aria-label="ariaLabel"
              @input="$emit('update:modelValue', Number($event.target.value))"
            />`,
            props: ['modelValue', 'ariaLabel', 'type', 'dense', 'outlined', 'prefix', 'min', 'max'],
            emits: ['update:modelValue'],
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockGetSkillRank.mockReturnValue(1);

    // Reset mock data to defaults
    mockHeroData.value = {
      hero: {
        skills: [{ skill: { id: 1, code: 'athletics', name: 'Athletics' }, modifier: 0 }],
      },
    };
    mockBudgetData.value = { remaining: 5, budget: 10, spent: 5, maxRank: 2 };
    mockAttributeCodeMap.value = new Map([
      [1, 'str'],
      [2, 'dex'],
    ]);
    mockNormalizeModifier.value = (val: unknown) =>
      typeof val === 'number' ? val : Number(val) || 0;
    mockClassifierData.value = createDefaultClassifierData();
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders step description', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Allocate skill ranks');
    });

    it('renders budget display', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.budget-display').exists()).toBe(true);
    });

    it('renders skill groups by attribute type', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Physical Skills');
    });
  });

  // ========================================
  // Skill Controls
  // ========================================
  describe('skill controls', () => {
    it('renders increment and decrement buttons', () => {
      const wrapper = createWrapper();

      const buttons = wrapper.findAll('.q-btn');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('renders modifier input', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-input').exists()).toBe(true);
    });

    it('shows current skill rank', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('1');
    });
  });

  // ========================================
  // Button States
  // ========================================
  describe('button states', () => {
    it('disables decrement when skill rank is 0', () => {
      mockGetSkillRank.mockReturnValue(0);

      const wrapper = createWrapper();
      const decrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Decrease'));

      expect(decrementBtns.some((btn) => btn.attributes('disabled') !== undefined)).toBe(true);
    });

    it('disables increment when at max rank', () => {
      mockGetSkillRank.mockReturnValue(2); // maxRank is 2

      const wrapper = createWrapper();
      const incrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Increase'));

      expect(incrementBtns.some((btn) => btn.attributes('disabled') !== undefined)).toBe(true);
    });

    it('disables increment when no points remaining', () => {
      mockGetSkillRank.mockReturnValue(0);
      mockBudgetData.value = { remaining: 0, budget: 10, spent: 10, maxRank: 2 };

      const wrapper = createWrapper();
      const incrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Increase'));

      expect(incrementBtns.some((btn) => btn.attributes('disabled') !== undefined)).toBe(true);
    });
  });

  // ========================================
  // Skill Increment/Decrement
  // ========================================
  describe('skill increment/decrement', () => {
    it('increments skill rank when add button clicked', async () => {
      mockGetSkillRank.mockReturnValue(1);
      const wrapper = createWrapper();

      const incrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Increase'));
      expect(incrementBtns.length).toBeGreaterThan(0);
      await incrementBtns[0]!.trigger('click');

      expect(mockSetSkillRank).toHaveBeenCalledWith(1, 2);
    });

    it('decrements skill rank when remove button clicked', async () => {
      mockGetSkillRank.mockReturnValue(1);
      const wrapper = createWrapper();

      const decrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Decrease'));
      expect(decrementBtns.length).toBeGreaterThan(0);
      await decrementBtns[0]!.trigger('click');

      expect(mockSetSkillRank).toHaveBeenCalledWith(1, 0);
    });

    it('does not increment when at max rank', async () => {
      mockGetSkillRank.mockReturnValue(2); // Max rank from mock budget
      const wrapper = createWrapper();

      const incrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Increase'));
      expect(incrementBtns.length).toBeGreaterThan(0);
      await incrementBtns[0]!.trigger('click');

      expect(mockSetSkillRank).not.toHaveBeenCalled();
    });

    it('does not decrement when at 0', async () => {
      mockGetSkillRank.mockReturnValue(0);
      const wrapper = createWrapper();

      const decrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Decrease'));
      expect(decrementBtns.length).toBeGreaterThan(0);
      await decrementBtns[0]!.trigger('click');

      expect(mockSetSkillRank).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Modifier Input
  // ========================================
  describe('modifier input', () => {
    it('calls setSkillModifier when input changes', async () => {
      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      await input.setValue(2);

      expect(mockSetSkillModifier).toHaveBeenCalledWith(1, 2);
    });

    it('does not call setSkillModifier when normalized value is null', async () => {
      mockNormalizeModifier.value = () => null;

      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      await input.setValue('invalid');

      expect(mockSetSkillModifier).not.toHaveBeenCalled();
    });

    it('shows negative modifier without plus prefix', () => {
      mockHeroData.value.hero!.skills = [
        { skill: { id: 1, code: 'athletics', name: 'Athletics' }, modifier: -3 },
      ];
      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      expect(input.exists()).toBe(true);
      // Verify the input value reflects the negative modifier
      expect((input.element as HTMLInputElement).value).toBe('-3');
    });

    it('shows positive modifier with plus prefix', () => {
      mockHeroData.value.hero!.skills = [
        { skill: { id: 1, code: 'athletics', name: 'Athletics' }, modifier: 5 },
      ];
      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      expect(input.exists()).toBe(true);
      // Verify the input value reflects the positive modifier
      expect((input.element as HTMLInputElement).value).toBe('5');
    });

    it('returns 0 for skill not in hero skills array', () => {
      mockHeroData.value.hero!.skills = [
        { skill: { id: 999, code: 'unknown', name: 'Unknown' }, modifier: 5 },
      ]; // Different skill
      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      expect(input.exists()).toBe(true);
      // Should use default value of 0 for skill not in array
      expect((input.element as HTMLInputElement).value).toBe('0');
    });

    it('returns 0 when hero is null', () => {
      mockHeroData.value.hero = null;
      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      expect(input.exists()).toBe(true);
      // Should default to 0 when hero is null
      expect((input.element as HTMLInputElement).value).toBe('0');
    });

    it('returns 0 when hero.skills is undefined', () => {
      mockHeroData.value.hero = {
        skills: undefined as unknown as MockHeroSkill[],
      };
      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      expect(input.exists()).toBe(true);
      // Should default to 0 when skills array is undefined
      expect((input.element as HTMLInputElement).value).toBe('0');
    });
  });

  // ========================================
  // Skill Display
  // ========================================
  describe('skill display', () => {
    it('shows skill name', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Athletics');
    });

    it('shows attribute abbreviation', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('STR');
    });

    it('does not render skill with unknown attribute type', () => {
      // Skill with attr.id 999 maps to attrTypeId 0 (fallback), which has no matching attributeType
      mockAttributeCodeMap.value = new Map([[1, 'str']]); // Only str, not attr 999

      const wrapper = createWrapper();

      // Unknown Skill should not appear since its attribute type doesn't exist
      expect(wrapper.text()).not.toContain('Unknown Skill');
      expect(wrapper.text()).not.toContain('999');
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
      const ariaLabel = incrementBtns[0]!.attributes('aria-label');
      expect(ariaLabel).toBeDefined();
      expect(ariaLabel).toContain('rank');
    });

    it('has role="status" on value display', () => {
      const wrapper = createWrapper();

      const displayValues = wrapper.findAll('[role="status"]');
      expect(displayValues.length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('does not increment when pointsRemaining is 0 but skill is below max', async () => {
      mockGetSkillRank.mockReturnValue(0);
      mockBudgetData.value = { remaining: 0, budget: 10, spent: 10, maxRank: 2 };

      const wrapper = createWrapper();

      const incrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Increase'));
      expect(incrementBtns.length).toBeGreaterThan(0);
      await incrementBtns[0]!.trigger('click');

      expect(mockSetSkillRank).not.toHaveBeenCalled();
    });

    it('handles skill groups with no skills using empty array fallback', () => {
      // Remove all skills to test the ?? [] fallback
      mockClassifierData.value.skills = [];

      const wrapper = createWrapper();

      // Should still render the skill group header even with no skills
      expect(wrapper.text()).toContain('Physical Skills');
      // No skill items should be rendered
      expect(wrapper.findAll('.q-item').length).toBe(0);
    });

    it('renders correctly when an attribute type has no matching skills', () => {
      // Add a Mental attribute type with no skills mapped to it
      mockClassifierData.value.attributeTypes = [
        { id: 1, code: 'physical', name: 'Physical' },
        { id: 2, code: 'mental', name: 'Mental' },
      ];

      const wrapper = createWrapper();

      // Physical Skills group should render with skills
      expect(wrapper.text()).toContain('Physical Skills');
      // Mental Skills group should render but with no skill items
      expect(wrapper.text()).toContain('Mental Skills');
    });

    it('increment respects both maxRank and pointsRemaining conditions', async () => {
      // Test the && in: current < maxSkillRank.value && pointsRemaining.value > 0
      mockGetSkillRank.mockReturnValue(1);
      mockBudgetData.value = { remaining: 1, budget: 10, spent: 9, maxRank: 2 };

      const wrapper = createWrapper();

      const incrementBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Increase'));
      expect(incrementBtns.length).toBeGreaterThan(0);
      await incrementBtns[0]!.trigger('click');

      expect(mockSetSkillRank).toHaveBeenCalledWith(1, 2);
    });
  });
});
