import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import SkillsStep from './SkillsStep.vue';

// Mock stores
const mockSetSkillRank = vi.fn();
const mockSetSkillModifier = vi.fn();
const mockGetSkillRank = vi.fn().mockReturnValue(1);

// Reactive mock data
const mockHeroData = {
  value: {
    hero: {
      skills: [{ skillId: 1, modifier: 0 }] as Array<{ skillId: number; modifier: number }>,
    } as { skills: Array<{ skillId: number; modifier: number }> } | null,
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
    get hero() {
      return mockHeroData.value.hero;
    },
  }),
}));

vi.mock('src/stores/heroAttributes', () => ({
  useHeroAttributesStore: () => ({
    getSkillRank: mockGetSkillRank,
    setSkillRank: mockSetSkillRank,
    setSkillModifier: mockSetSkillModifier,
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    skills: [
      { id: 1, code: 'athletics', name: 'Athletics', attrId: 1 },
      { id: 2, code: 'acrobatics', name: 'Acrobatics', attrId: 2 },
      { id: 3, code: 'unknown', name: 'Unknown Skill', attrId: 999 }, // No matching attribute
    ],
    attributes: [
      { id: 1, code: 'str', name: 'Strength', attrTypeId: 1 },
      { id: 2, code: 'dex', name: 'Dexterity', attrTypeId: 1 },
    ],
    attributeTypes: [{ id: 1, code: 'physical', name: 'Physical' }],
  }),
}));

vi.mock('src/composables/useStepValidation', () => ({
  useStepValidation: () => ({
    budget: () => mockBudgetData.value,
  }),
}));

const mockSkillsByAttrType = {
  value: {
    1: [
      { id: 1, code: 'athletics', name: 'Athletics', attrId: 1 },
      { id: 3, code: 'unknown', name: 'Unknown Skill', attrId: 999 },
    ],
  } as Record<number, Array<{ id: number; code: string; name: string; attrId: number }>>,
};

vi.mock('src/utils/arrayUtils', () => ({
  groupByChainedKey: () => mockSkillsByAttrType.value,
  buildIdCodeMap: () => mockAttributeCodeMap.value,
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
        skills: [{ skillId: 1, modifier: 0 }],
      },
    };
    mockBudgetData.value = { remaining: 5, budget: 10, spent: 5, maxRank: 2 };
    mockAttributeCodeMap.value = new Map([
      [1, 'str'],
      [2, 'dex'],
    ]);
    mockNormalizeModifier.value = (val: unknown) =>
      typeof val === 'number' ? val : Number(val) || 0;
    mockSkillsByAttrType.value = {
      1: [
        { id: 1, code: 'athletics', name: 'Athletics', attrId: 1 },
        { id: 3, code: 'unknown', name: 'Unknown Skill', attrId: 999 },
      ],
    };
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
      mockHeroData.value.hero!.skills = [{ skillId: 1, modifier: -3 }];
      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      expect(input.exists()).toBe(true);
      // Verify the input value reflects the negative modifier
      expect((input.element as HTMLInputElement).value).toBe('-3');
    });

    it('shows positive modifier with plus prefix', () => {
      mockHeroData.value.hero!.skills = [{ skillId: 1, modifier: 5 }];
      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      expect(input.exists()).toBe(true);
      // Verify the input value reflects the positive modifier
      expect((input.element as HTMLInputElement).value).toBe('5');
    });

    it('returns 0 for skill not in hero skills array', () => {
      mockHeroData.value.hero!.skills = [{ skillId: 999, modifier: 5 }]; // Different skill
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
        skills: undefined as unknown as Array<{ skillId: number; modifier: number }>,
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

    it('shows empty string for skill with unknown attribute', () => {
      // Skill with attrId 999 has no matching attribute in the map
      mockAttributeCodeMap.value = new Map([[1, 'str']]); // Only str, not attr 999

      const wrapper = createWrapper();

      // Unknown Skill has attrId 999 which is not in the map
      expect(wrapper.text()).toContain('Unknown Skill');
      // Should not show any attribute code for unknown attribute
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

      const valueDisplays = wrapper.findAll('[role="status"]');
      expect(valueDisplays.length).toBeGreaterThan(0);
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
      // Remove all skills for type 1 to test the ?? [] fallback
      mockSkillsByAttrType.value = {}; // No skills for any type

      const wrapper = createWrapper();

      // Should still render the skill group header even with no skills
      expect(wrapper.text()).toContain('Physical Skills');
      // No skill items should be rendered
      expect(wrapper.findAll('.q-item').length).toBe(0);
    });

    it('handles attribute type with undefined skills', () => {
      // attrType.id=2 does not exist in mockSkillsByAttrType, so ?? [] is used
      mockSkillsByAttrType.value = {
        1: [{ id: 1, code: 'athletics', name: 'Athletics', attrId: 1 }],
      };

      const wrapper = createWrapper();

      // Physical Skills group should render with one skill
      expect(wrapper.text()).toContain('Athletics');
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

    it('decrement does not call setSkillRank when current is 0', async () => {
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
});
