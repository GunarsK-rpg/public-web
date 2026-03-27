import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import ConditionsTab from './ConditionsTab.vue';
import type { HeroCondition } from 'src/types';
import { heroStore, classifierStore } from 'src/__tests__/mockStores';

const mockHero = ref<{ id: number; conditions: HeroCondition[] } | null>(null);
const mockConditions = ref<HeroCondition[]>([]);
const mockUpsertCondition = vi.fn();
const mockRemoveCondition = vi.fn();

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    ...heroStore({ upsertCondition: mockUpsertCondition, removeCondition: mockRemoveCondition }),
    get hero() {
      return mockHero.value;
    },
    get conditions() {
      return mockConditions.value;
    },
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () =>
    classifierStore({
      conditions: [
        {
          id: 1,
          code: 'afflicted',
          name: 'Afflicted',
          description: 'Takes damage over time',
          isPositive: false,
          isParameterized: true,
        },
        {
          id: 2,
          code: 'determined',
          name: 'Determined',
          description: 'Add Opportunity',
          isPositive: true,
          isParameterized: false,
        },
        {
          id: 3,
          code: 'disoriented',
          name: 'Disoriented',
          description: 'Senses disrupted',
          isPositive: false,
          isParameterized: false,
        },
        {
          id: 4,
          code: 'empowered',
          name: 'Empowered',
          description: 'Advantage on all tests',
          isPositive: true,
          isParameterized: false,
        },
        {
          id: 5,
          code: 'enhanced',
          name: 'Enhanced',
          description: 'Attribute bonus',
          isPositive: true,
          isParameterized: true,
        },
        {
          id: 6,
          code: 'exhausted',
          name: 'Exhausted',
          description: 'Penalty to tests',
          isPositive: false,
          isParameterized: true,
        },
        {
          id: 7,
          code: 'focused',
          name: 'Focused',
          description: 'Focus costs -1',
          isPositive: true,
          isParameterized: false,
        },
        {
          id: 8,
          code: 'immobilized',
          name: 'Immobilized',
          description: 'Movement = 0',
          isPositive: false,
          isParameterized: false,
        },
        {
          id: 9,
          code: 'prone',
          name: 'Prone',
          description: 'Lying flat',
          isPositive: false,
          isParameterized: false,
        },
        {
          id: 10,
          code: 'restrained',
          name: 'Restrained',
          description: 'Movement = 0',
          isPositive: false,
          isParameterized: false,
        },
        {
          id: 11,
          code: 'slowed',
          name: 'Slowed',
          description: 'Movement halved',
          isPositive: false,
          isParameterized: false,
        },
        {
          id: 12,
          code: 'stunned',
          name: 'Stunned',
          description: 'Lose actions',
          isPositive: false,
          isParameterized: false,
        },
        {
          id: 13,
          code: 'surprised',
          name: 'Surprised',
          description: 'Lose reactions',
          isPositive: false,
          isParameterized: false,
        },
        {
          id: 14,
          code: 'unconscious',
          name: 'Unconscious',
          description: 'Movement = 0',
          isPositive: false,
          isParameterized: false,
        },
      ],
      attributes: [
        { id: 1, code: 'str', name: 'Strength' },
        { id: 2, code: 'spd', name: 'Speed' },
      ],
    }),
}));

function createWrapper(readonly = false) {
  return shallowMount(ConditionsTab, {
    props: { readonly },
  });
}

describe('ConditionsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHero.value = { id: 1, conditions: [] };
    mockConditions.value = [];
  });

  // ========================================
  // Rendering
  // ========================================
  describe('rendering', () => {
    it('renders all 14 condition cards', () => {
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      expect(cards.length).toBe(14);
    });

    it('renders condition names', () => {
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      expect(cards[0]?.text()).toContain('Afflicted');
      expect(cards[1]?.text()).toContain('Determined');
    });

    it('active condition has condition-active class', () => {
      mockConditions.value = [
        {
          id: 1,
          heroId: 1,
          condition: { id: 11, code: 'slowed', name: 'Slowed' },
          notes: null,
          special: null,
          sourceInjuryId: null,
        },
      ];
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      const slowedCard = cards.find((c) => c.text().includes('Slowed'));
      expect(slowedCard?.classes()).toContain('condition-active');
      expect(slowedCard?.classes()).toContain('condition-negative');
    });

    it('positive condition has condition-positive class when active', () => {
      mockConditions.value = [
        {
          id: 1,
          heroId: 1,
          condition: { id: 2, code: 'determined', name: 'Determined' },
          notes: null,
          special: null,
          sourceInjuryId: null,
        },
      ];
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      const determinedCard = cards.find((c) => c.text().includes('Determined'));
      expect(determinedCard?.classes()).toContain('condition-positive');
    });
  });

  // ========================================
  // Simple toggle
  // ========================================
  describe('simple toggle', () => {
    it('clicking inactive simple condition calls upsertCondition', async () => {
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      const slowedCard = cards.find((c) => c.text().includes('Slowed'));
      await slowedCard?.trigger('click');
      expect(mockUpsertCondition).toHaveBeenCalledWith(
        expect.objectContaining({ heroId: 1, condition: { code: 'slowed' } })
      );
    });

    it('clicking active simple condition calls removeCondition', async () => {
      mockConditions.value = [
        {
          id: 42,
          heroId: 1,
          condition: { id: 11, code: 'slowed', name: 'Slowed' },
          notes: null,
          special: null,
          sourceInjuryId: null,
        },
      ];
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      const slowedCard = cards.find((c) => c.text().includes('Slowed'));
      await slowedCard?.trigger('click');
      expect(mockRemoveCondition).toHaveBeenCalledWith(42);
    });
  });

  // ========================================
  // Injury-locked conditions
  // ========================================
  describe('injury-locked conditions', () => {
    it('injury-only condition has condition-locked class', () => {
      mockConditions.value = [
        {
          id: 1,
          heroId: 1,
          condition: { id: 11, code: 'slowed', name: 'Slowed' },
          notes: null,
          special: null,
          sourceInjuryId: 99,
        },
      ];
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      const slowedCard = cards.find((c) => c.text().includes('Slowed'));
      expect(slowedCard?.classes()).toContain('condition-locked');
      expect(slowedCard?.classes()).not.toContain('condition-interactive');
    });

    it('clicking injury-locked condition does not toggle', async () => {
      mockConditions.value = [
        {
          id: 1,
          heroId: 1,
          condition: { id: 11, code: 'slowed', name: 'Slowed' },
          notes: null,
          special: null,
          sourceInjuryId: 99,
        },
      ];
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      const slowedCard = cards.find((c) => c.text().includes('Slowed'));
      await slowedCard?.trigger('click');
      expect(mockUpsertCondition).not.toHaveBeenCalled();
      expect(mockRemoveCondition).not.toHaveBeenCalled();
    });

    it('condition with both manual and injury instances is interactive', () => {
      mockConditions.value = [
        {
          id: 1,
          heroId: 1,
          condition: { id: 11, code: 'slowed', name: 'Slowed' },
          notes: null,
          special: null,
          sourceInjuryId: 99,
        },
        {
          id: 2,
          heroId: 1,
          condition: { id: 11, code: 'slowed', name: 'Slowed' },
          notes: null,
          special: null,
          sourceInjuryId: null,
        },
      ];
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      const slowedCard = cards.find((c) => c.text().includes('Slowed'));
      expect(slowedCard?.classes()).not.toContain('condition-locked');
      expect(slowedCard?.classes()).toContain('condition-interactive');
    });
  });

  // ========================================
  // Focused toggle
  // ========================================
  describe('focused toggle', () => {
    it('toggling Focused on calls upsertCondition with special', async () => {
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      const focusedCard = cards.find((c) => c.text().includes('Focused'));
      await focusedCard?.trigger('click');
      expect(mockUpsertCondition).toHaveBeenCalledWith(
        expect.objectContaining({
          condition: { code: 'focused' },
          special: [{ type: 'focused', value: 1, display_value: 'Focus costs -1' }],
        })
      );
    });

    it('toggling Focused off calls removeCondition', async () => {
      mockConditions.value = [
        {
          id: 50,
          heroId: 1,
          condition: { id: 7, code: 'focused', name: 'Focused' },
          notes: null,
          special: [{ type: 'focused', value: 1, display_value: 'Focus costs -1' }],
          sourceInjuryId: null,
        },
      ];
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      const focusedCard = cards.find((c) => c.text().includes('Focused'));
      await focusedCard?.trigger('click');
      expect(mockRemoveCondition).toHaveBeenCalledWith(50);
    });
  });

  // ========================================
  // Enhanced expansion
  // ========================================
  describe('enhanced expansion', () => {
    it('shows enhanced expansion when Enhanced has instances', () => {
      mockConditions.value = [
        {
          id: 10,
          heroId: 1,
          condition: { id: 5, code: 'enhanced', name: 'Enhanced' },
          notes: null,
          special: [{ type: 'attribute_str', value: 2, display_value: 'STR +2' }],
          sourceInjuryId: null,
        },
      ];
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Enhanced Attributes');
      expect(wrapper.text()).toContain('STR +2');
    });

    it('does not show enhanced expansion when not active', () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).not.toContain('Enhanced Attributes');
    });

    it('clicking Enhanced card expands form without creating instance', async () => {
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      const enhancedCard = cards.find((c) => c.text().includes('Enhanced'));
      await enhancedCard?.trigger('click');
      expect(mockUpsertCondition).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain('Enhanced Attributes');
    });

    it('clicking Enhanced card again collapses form', async () => {
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      const enhancedCard = cards.find((c) => c.text().includes('Enhanced'));
      await enhancedCard?.trigger('click');
      expect(wrapper.text()).toContain('Enhanced Attributes');
      await enhancedCard?.trigger('click');
      expect(wrapper.text()).not.toContain('Enhanced Attributes');
    });
  });

  // ========================================
  // Exhausted expansion
  // ========================================
  describe('exhausted expansion', () => {
    it('shows exhausted expansion when Exhausted is active', () => {
      mockConditions.value = [
        {
          id: 20,
          heroId: 1,
          condition: { id: 6, code: 'exhausted', name: 'Exhausted' },
          notes: null,
          special: [{ type: 'exhausted_penalty', value: -2, display_value: '-2 to all tests' }],
          sourceInjuryId: null,
        },
      ];
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Exhausted Penalty');
      expect(wrapper.text()).toContain('-2');
    });
  });

  // ========================================
  // Afflicted expansion
  // ========================================
  describe('afflicted expansion', () => {
    it('shows afflicted expansion when Afflicted has instances', () => {
      mockConditions.value = [
        {
          id: 30,
          heroId: 1,
          condition: { id: 1, code: 'afflicted', name: 'Afflicted' },
          notes: null,
          special: [{ type: 'afflicted_damage', display_value: '1d4 vital' }],
          sourceInjuryId: null,
        },
      ];
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Afflicted Effects');
      expect(wrapper.text()).toContain('1d4 vital');
    });

    it('clicking Afflicted card expands form without creating instance', async () => {
      const wrapper = createWrapper();
      const cards = wrapper.findAll('.condition-card');
      const afflictedCard = cards.find((c) => c.text().includes('Afflicted'));
      await afflictedCard?.trigger('click');
      expect(mockUpsertCondition).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain('Afflicted Effects');
    });
  });

  // ========================================
  // Readonly mode
  // ========================================
  describe('readonly mode', () => {
    it('does not toggle conditions in readonly mode', async () => {
      const wrapper = createWrapper(true);
      const cards = wrapper.findAll('.condition-card');
      const slowedCard = cards.find((c) => c.text().includes('Slowed'));
      await slowedCard?.trigger('click');
      expect(mockUpsertCondition).not.toHaveBeenCalled();
      expect(mockRemoveCondition).not.toHaveBeenCalled();
    });
  });
});
