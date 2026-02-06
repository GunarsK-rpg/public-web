import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ActionItem from './ActionItem.vue';
import type { Action } from 'src/types';

// Reactive mock data
const mockEntityIconData = {
  value: {
    entity: { id: 1, code: 'action', name: 'Action', icon: 'action.svg' } as {
      id: number;
      code: string;
      name: string;
      icon: string | null;
    } | null,
    iconUrl: '/icons/actions/action.svg' as string | null,
  },
};

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    activationTypes: [
      { id: 1, code: 'action', name: 'Action', icon: 'action.svg' },
      { id: 2, code: 'reaction', name: 'Reaction', icon: 'reaction.svg' },
      { id: 3, code: 'free', name: 'Free Action', icon: 'free.svg' },
      { id: 4, code: 'no-icon', name: 'No Icon', icon: null },
    ],
  }),
}));

vi.mock('src/composables/useEntityIcon', () => ({
  useEntityIcon: () => ({
    get entity() {
      return mockEntityIconData.value.entity;
    },
    get iconUrl() {
      return mockEntityIconData.value.iconUrl;
    },
  }),
}));

vi.mock('src/constants/theme', () => ({
  RPG_COLORS: {
    focusCost: 'blue',
    investitureCost: 'amber',
    specialAbility: 'purple',
  },
}));

describe('ActionItem', () => {
  const createWrapper = (action: Partial<Action>) =>
    shallowMount(ActionItem, {
      props: {
        action: {
          id: 1,
          name: 'Strike',
          description: 'A basic attack',
          activationType: { id: 1, code: 'at1', name: 'ActType1' },
          actionType: { id: 1, code: 'act1', name: 'ActionType1' },
          focusCost: 0,
          investitureCost: 0,
          ...action,
        } as Action,
      },
      global: {
        stubs: {
          QItem: {
            template: '<div class="q-item"><slot /></div>',
          },
          QItemSection: {
            template: '<div class="q-item-section"><slot /></div>',
          },
          QItemLabel: {
            template: '<div class="q-item-label"><slot /></div>',
          },
          QBadge: {
            template: '<span class="q-badge" :title="title"><slot /></span>',
            props: ['color', 'title', 'outline'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock data to defaults
    mockEntityIconData.value = {
      entity: { id: 1, code: 'action', name: 'Action', icon: 'action.svg' },
      iconUrl: '/icons/actions/action.svg',
    };
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders action name', () => {
      const wrapper = createWrapper({ name: 'Power Strike' });

      expect(wrapper.text()).toContain('Power Strike');
    });

    it('renders action description', () => {
      const wrapper = createWrapper({ description: 'A powerful attack' });

      expect(wrapper.text()).toContain('A powerful attack');
    });

    it('renders activation type icon', () => {
      const wrapper = createWrapper({});

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toBe('/icons/actions/action.svg');
    });

    it('renders icon with alt text', () => {
      const wrapper = createWrapper({});

      const img = wrapper.find('img');
      expect(img.attributes('alt')).toBe('Action');
    });

    it('renders icon with title attribute', () => {
      const wrapper = createWrapper({});

      const img = wrapper.find('img');
      expect(img.attributes('title')).toBe('Action');
    });
  });

  // ========================================
  // Special Ability
  // ========================================
  describe('special ability', () => {
    it('renders special text when present', () => {
      const wrapper = createWrapper({
        special: 'Deals double damage on critical',
      });

      expect(wrapper.text()).toContain('Deals double damage on critical');
    });

    it('does not render special section when absent', () => {
      const wrapper = createWrapper({ special: null });

      expect(wrapper.text()).not.toContain('critical');
    });
  });

  // ========================================
  // Dice Display
  // ========================================
  describe('dice display', () => {
    it('renders dice when present', () => {
      const wrapper = createWrapper({ dice: '2d6+4' });

      expect(wrapper.text()).toContain('Dice: 2d6+4');
    });

    it('does not render dice section when absent', () => {
      const wrapper = createWrapper({ dice: null });

      expect(wrapper.text()).not.toContain('Dice:');
    });
  });

  // ========================================
  // Cost Badges
  // ========================================
  describe('cost badges', () => {
    it('renders focus cost badge when > 0', () => {
      const wrapper = createWrapper({ focusCost: 2 });

      expect(wrapper.text()).toContain('2 Focus');
    });

    it('does not render focus badge when cost is 0', () => {
      const wrapper = createWrapper({ focusCost: 0 });

      expect(wrapper.text()).not.toContain('Focus');
    });

    it('renders investiture cost badge when > 0', () => {
      const wrapper = createWrapper({ investitureCost: 3 });

      expect(wrapper.text()).toContain('3 Inv');
    });

    it('does not render investiture badge when cost is 0', () => {
      const wrapper = createWrapper({ investitureCost: 0 });

      expect(wrapper.text()).not.toContain('Inv');
    });

    it('renders both cost badges when both > 0', () => {
      const wrapper = createWrapper({
        focusCost: 2,
        investitureCost: 3,
      });

      expect(wrapper.text()).toContain('2 Focus');
      expect(wrapper.text()).toContain('3 Inv');
    });

    it('badge has correct title for investiture', () => {
      const wrapper = createWrapper({ investitureCost: 3 });

      const badge = wrapper.find('.q-badge');
      expect(badge.attributes('title')).toBe('Investiture');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles missing description gracefully', () => {
      const wrapper = createWrapper({ description: '' });

      expect(wrapper.exists()).toBe(true);
    });

    it('handles missing activation type gracefully', () => {
      const wrapper = createWrapper({
        activationType: { id: 999, code: 'at999', name: 'ActType999' },
      });

      // Should render without crashing
      expect(wrapper.exists()).toBe(true);
    });

    it('renders action with all optional fields', () => {
      const wrapper = createWrapper({
        name: 'Ultimate Strike',
        description: 'The most powerful attack',
        special: 'Ignores armor',
        dice: '4d10+8',
        focusCost: 5,
        investitureCost: 10,
      });

      expect(wrapper.text()).toContain('Ultimate Strike');
      expect(wrapper.text()).toContain('The most powerful attack');
      expect(wrapper.text()).toContain('Ignores armor');
      expect(wrapper.text()).toContain('Dice: 4d10+8');
      expect(wrapper.text()).toContain('5 Focus');
      expect(wrapper.text()).toContain('10 Inv');
    });

    it('handles zero costs correctly', () => {
      const wrapper = createWrapper({
        focusCost: 0,
        investitureCost: 0,
      });

      const badges = wrapper.findAll('.q-badge');
      expect(badges.length).toBe(0);
    });

    it('does not render icon when activationType has no icon', () => {
      mockEntityIconData.value = {
        entity: { id: 4, code: 'no-icon', name: 'No Icon', icon: null },
        iconUrl: null,
      };

      const wrapper = createWrapper({ activationType: { id: 4, code: 'at4', name: 'ActType4' } });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(false);
    });

    it('uses fallback "Action" for alt/title when activationType is null', () => {
      mockEntityIconData.value = {
        entity: null,
        iconUrl: null,
      };

      const wrapper = createWrapper({
        activationType: { id: 999, code: 'at999', name: 'ActType999' },
      });

      // Icon should not render when entity is null (no icon property)
      const img = wrapper.find('img');
      expect(img.exists()).toBe(false);
    });

    it('uses "Action" fallback in alt when entity name is undefined', () => {
      mockEntityIconData.value = {
        entity: { id: 1, code: 'test', name: undefined as unknown as string, icon: 'test.svg' },
        iconUrl: '/icons/test.svg',
      };

      const wrapper = createWrapper({});

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('alt')).toBe('Action');
      expect(img.attributes('title')).toBe('Action');
    });

    it('handles empty special string as falsy', () => {
      const wrapper = createWrapper({ special: '' });

      // Empty string should not show special section - check element doesn't exist
      expect(wrapper.find('.text-italic').exists()).toBe(false);
    });

    it('handles empty dice string as falsy', () => {
      const wrapper = createWrapper({ dice: '' });

      expect(wrapper.text()).not.toContain('Dice:');
    });

    it('handles activationType with id 0', () => {
      const wrapper = createWrapper({ activationType: { id: 0, code: 'at0', name: 'ActType0' } });

      // Should render without crashing
      expect(wrapper.exists()).toBe(true);
    });

    it('handles undefined activationType', () => {
      const wrapper = createWrapper({
        activationType: undefined as unknown as { id: number; code: string; name: string },
      });

      expect(wrapper.exists()).toBe(true);
    });
  });
});
