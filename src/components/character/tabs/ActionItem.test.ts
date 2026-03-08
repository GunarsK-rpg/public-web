import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ActionItem from './ActionItem.vue';
import type { Action, ClassifierRef } from 'src/types';

// Hero store mock
const mockPatchFocus = vi.fn().mockResolvedValue(undefined);
const mockPatchInvestiture = vi.fn().mockResolvedValue(undefined);
const mockHeroData = {
  value: {
    id: 1,
    currentFocus: 10,
    currentInvestiture: 5,
  } as { id: number; currentFocus: number; currentInvestiture: number } | null,
};

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get hero() {
      return mockHeroData.value;
    },
    patchFocus: mockPatchFocus,
    patchInvestiture: mockPatchInvestiture,
  }),
}));

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

const mockGetSkillRank = vi.fn().mockReturnValue(0);
const mockGetSkillModifier = vi.fn().mockReturnValue(0);

vi.mock('src/stores/heroAttributes', () => ({
  useHeroAttributesStore: () => ({
    getSkillRank: mockGetSkillRank,
    getSkillModifier: mockGetSkillModifier,
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    activationTypes: [
      { id: 1, code: 'action', name: 'Action', icon: 'action.svg' },
      { id: 2, code: 'reaction', name: 'Reaction', icon: 'reaction.svg' },
      { id: 3, code: 'free', name: 'Free Action', icon: 'free.svg' },
      { id: 4, code: 'no-icon', name: 'No Icon', icon: null },
    ],
    skills: [
      { id: 10, code: 'division', name: 'Division' },
      { id: 11, code: 'cohesion', name: 'Cohesion' },
      { id: 12, code: 'light_weaponry', name: 'Light Weaponry' },
      { id: 13, code: 'heavy_weaponry', name: 'Heavy Weaponry' },
      { id: 14, code: 'athletics', name: 'Athletics' },
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
    badgeMuted: 'grey',
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
          activationType: { id: 1, code: 'action', name: 'Action' },
          actionType: { id: 1, code: 'action-type', name: 'Action Type' },
          focusCost: 0,
          investitureCost: 0,
          special: [],
          ...action,
        } as Action,
      },
      global: {
        stubs: {
          QExpansionItem: {
            template:
              '<div class="q-expansion-item"><div class="header"><slot name="header" /></div><div class="content"><slot /></div></div>',
          },
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
          SpecialBadges: {
            template:
              '<span v-for="(s, i) in specials" :key="i" class="q-badge" :title="s.type">{{ s.display_value || s.value }}</span>',
            props: ['specials'],
          },
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QBtn: {
            template:
              '<button class="q-btn" :class="$attrs.class" :disable="disable || undefined" @click="$emit(\'click\', $event)"><slot /></button>',
            props: [
              'disable',
              'size',
              'flat',
              'round',
              'dense',
              'icon',
              'color',
              'loading',
              'title',
            ],
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
    mockHeroData.value = { id: 1, currentFocus: 10, currentInvestiture: 5 };
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders action name', () => {
      const wrapper = createWrapper({ name: 'Power Strike' });

      expect(wrapper.text()).toContain('Power Strike');
    });

    it('renders action description in expanded content', () => {
      const wrapper = createWrapper({ description: 'A powerful attack' });

      expect(wrapper.text()).toContain('A powerful attack');
    });

    it('renders short description in header when available', () => {
      const wrapper = createWrapper({
        description: 'A very long description',
        descriptionShort: 'Short summary',
      });

      const header = wrapper.find('.header');
      expect(header.text()).toContain('Short summary');
    });

    it('falls back to full description in header when no short description', () => {
      const wrapper = createWrapper({
        description: 'A basic attack',
        descriptionShort: null,
      });

      const header = wrapper.find('.header');
      expect(header.text()).toContain('A basic attack');
    });

    it('hides header description when both descriptions are falsy', () => {
      const wrapper = createWrapper({
        description: '',
        descriptionShort: null,
      });

      const header = wrapper.find('.header');
      expect(header.find('.text-muted').exists()).toBe(false);
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
    it('renders narrative entries as italic text in body', () => {
      const wrapper = createWrapper({
        special: [{ type: 'narrative', display_value: 'Deals double damage on critical' }],
      });

      const content = wrapper.find('.content');
      expect(content.text()).toContain('Deals double damage on critical');
      expect(content.find('.text-italic').exists()).toBe(true);
    });

    it('renders typed entries as badges in header', () => {
      const wrapper = createWrapper({
        special: [{ type: 'defense', display_value: 'Physical defense' }],
      });

      const header = wrapper.find('.header');
      const badges = header.findAll('.q-badge');
      expect(badges.some((b) => b.text().includes('Physical defense'))).toBe(true);
    });

    it('splits mixed entries between header badges and body text', () => {
      const wrapper = createWrapper({
        special: [
          { type: 'defense', display_value: 'Physical defense' },
          { type: 'skill', display_value: 'Athletics' },
          { type: 'narrative', display_value: 'Once per scene' },
        ],
      });

      const header = wrapper.find('.header');
      const content = wrapper.find('.content');

      // Typed entries in header as badges
      expect(header.text()).toContain('Physical defense');
      expect(header.text()).toContain('Athletics');

      // Narrative entries in body as italic text
      expect(content.text()).toContain('Once per scene');
      expect(content.find('.text-italic').exists()).toBe(true);
    });

    it('does not render special sections when empty', () => {
      const wrapper = createWrapper({ special: [] });

      const header = wrapper.find('.header');
      expect(header.findAll('.q-badge').length).toBe(0);
      expect(wrapper.find('.content .text-italic').exists()).toBe(false);
    });
  });

  // ========================================
  // Damage Scaling
  // ========================================
  describe('damage scaling', () => {
    it('resolves damage_scaling display_value with hero skill rank', () => {
      mockGetSkillRank.mockReturnValue(3);
      const wrapper = createWrapper({
        special: [
          {
            type: 'damage_scaling',
            display_value: '3d{dice_size} spirit',
            skill: 'division',
            die_progression: [4, 4, 6, 8, 10, 12, 20],
          },
        ],
      });

      const header = wrapper.find('.header');
      expect(header.text()).toContain('3d8 spirit');
    });

    it('uses first die when skill rank is 0', () => {
      mockGetSkillRank.mockReturnValue(0);
      const wrapper = createWrapper({
        special: [
          {
            type: 'damage_scaling',
            display_value: '2d{dice_size} impact',
            skill: 'cohesion',
            die_progression: [4, 4, 6, 8, 10, 12, 20],
          },
        ],
      });

      const header = wrapper.find('.header');
      expect(header.text()).toContain('2d4 impact');
    });

    it('clamps to last die when rank exceeds progression length', () => {
      mockGetSkillRank.mockReturnValue(10);
      const wrapper = createWrapper({
        special: [
          {
            type: 'damage_scaling',
            display_value: '1d{dice_size} healing',
            skill: 'division',
            die_progression: [4, 4, 6, 8, 10, 12, 20],
          },
        ],
      });

      const header = wrapper.find('.header');
      expect(header.text()).toContain('1d20 healing');
    });

    it('does not show damage_scaling in narrative entries', () => {
      mockGetSkillRank.mockReturnValue(2);
      const wrapper = createWrapper({
        special: [
          {
            type: 'damage_scaling',
            display_value: '3d{dice_size} spirit',
            skill: 'division',
            die_progression: [4, 4, 6, 8, 10, 12, 20],
          },
        ],
      });

      const content = wrapper.find('.content');
      expect(content.find('.text-italic').exists()).toBe(false);
    });
  });

  // ========================================
  // Skill Modifier Display
  // ========================================
  describe('skill modifier display', () => {
    it('prepends skill modifier to skill badge when skill code is present', () => {
      mockGetSkillModifier.mockReturnValue(4);
      const wrapper = createWrapper({
        special: [{ type: 'skill', display_value: 'Light Weaponry', skill: 'light_weaponry' }],
      });

      const header = wrapper.find('.header');
      expect(header.text()).toContain('+4 Light Weaponry');
    });

    it('shows +0 modifier when skill modifier is zero', () => {
      mockGetSkillModifier.mockReturnValue(0);
      const wrapper = createWrapper({
        special: [{ type: 'skill', display_value: 'Heavy Weaponry', skill: 'heavy_weaponry' }],
      });

      const header = wrapper.find('.header');
      expect(header.text()).toContain('+0 Heavy Weaponry');
    });

    it('shows negative modifier without double sign', () => {
      mockGetSkillModifier.mockReturnValue(-1);
      const wrapper = createWrapper({
        special: [{ type: 'skill', display_value: 'Athletics', skill: 'athletics' }],
      });

      const header = wrapper.find('.header');
      expect(header.text()).toContain('-1 Athletics');
    });

    it('does not prepend modifier when skill code is absent', () => {
      const wrapper = createWrapper({
        special: [{ type: 'skill', display_value: 'Athletics' }],
      });

      const header = wrapper.find('.header');
      expect(header.text()).toContain('Athletics');
      expect(header.text()).not.toContain('+');
    });

    it('calls getSkillModifier with the correct skill code', () => {
      mockGetSkillModifier.mockReturnValue(3);
      createWrapper({
        special: [{ type: 'skill', display_value: 'Light Weaponry', skill: 'light_weaponry' }],
      });

      expect(mockGetSkillModifier).toHaveBeenCalledWith('light_weaponry');
    });
  });

  // ========================================
  // Dice Display
  // ========================================
  describe('dice display', () => {
    it('renders dice as badge in header when present', () => {
      const wrapper = createWrapper({ dice: '2d6+4' });

      const header = wrapper.find('.header');
      const badges = header.findAll('.q-badge');
      expect(badges.some((b) => b.text().includes('2d6+4'))).toBe(true);
    });

    it('does not render dice badge when absent', () => {
      const wrapper = createWrapper({ dice: null });

      const header = wrapper.find('.header');
      const badges = header.findAll('.q-badge');
      expect(badges.some((b) => /\b\d+d\d+\b/.test(b.text()))).toBe(false);
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
      mockEntityIconData.value = {
        entity: null,
        iconUrl: null,
      };

      const wrapper = createWrapper({
        activationType: { id: 999, code: 'at999', name: 'ActType999' },
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('img').exists()).toBe(false);
    });

    it('renders action with all optional fields', () => {
      const wrapper = createWrapper({
        name: 'Ultimate Strike',
        description: 'The most powerful attack',
        special: [
          { type: 'defense', display_value: 'Physical defense' },
          { type: 'narrative', display_value: 'Ignores armor' },
        ],
        dice: '4d10+8',
        focusCost: 5,
        investitureCost: 10,
      });

      expect(wrapper.text()).toContain('Ultimate Strike');
      expect(wrapper.text()).toContain('The most powerful attack');
      expect(wrapper.find('.header').text()).toContain('Physical defense');
      expect(wrapper.find('.content').text()).toContain('Ignores armor');
      expect(wrapper.find('.header').text()).toContain('4d10+8');
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

      const wrapper = createWrapper({
        activationType: { id: 4, code: 'no-icon', name: 'No Icon' },
      });

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

    it('handles empty special array', () => {
      const wrapper = createWrapper({ special: [] });

      // Empty array should not show special section
      const content = wrapper.find('.content');
      expect(content.find('.text-italic').exists()).toBe(false);
    });

    it('handles empty dice string as falsy', () => {
      const wrapper = createWrapper({ dice: '' });

      const header = wrapper.find('.header');
      const badges = header.findAll('.q-badge');
      expect(badges.length).toBe(0);
    });

    it('handles activationType with id 0', () => {
      const wrapper = createWrapper({ activationType: { id: 0, code: 'at0', name: 'ActType0' } });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toContain('Strike');
    });

    it('handles undefined activationType', () => {
      const wrapper = createWrapper({
        activationType: undefined as unknown as ClassifierRef,
      });

      expect(wrapper.exists()).toBe(true);
    });
  });

  // ========================================
  // Use Action Button
  // ========================================
  describe('use action button', () => {
    // Visibility
    it('shows use button when focusCost > 0', () => {
      const wrapper = createWrapper({ focusCost: 1 });
      expect(wrapper.find('.use-action-btn').exists()).toBe(true);
    });

    it('shows use button when investitureCost > 0', () => {
      const wrapper = createWrapper({ investitureCost: 1 });
      expect(wrapper.find('.use-action-btn').exists()).toBe(true);
    });

    it('shows use button when both costs > 0', () => {
      const wrapper = createWrapper({ focusCost: 1, investitureCost: 1 });
      expect(wrapper.find('.use-action-btn').exists()).toBe(true);
    });

    it('does not show use button when both costs are 0', () => {
      const wrapper = createWrapper({ focusCost: 0, investitureCost: 0 });
      expect(wrapper.find('.use-action-btn').exists()).toBe(false);
    });

    // Disabled state
    it('disables button when focus insufficient', () => {
      mockHeroData.value = { id: 1, currentFocus: 0, currentInvestiture: 5 };
      const wrapper = createWrapper({ focusCost: 1 });
      expect(wrapper.find('.use-action-btn').attributes('disable')).toBeDefined();
    });

    it('disables button when investiture insufficient', () => {
      mockHeroData.value = { id: 1, currentFocus: 10, currentInvestiture: 0 };
      const wrapper = createWrapper({ investitureCost: 1 });
      expect(wrapper.find('.use-action-btn').attributes('disable')).toBeDefined();
    });

    it('disables button when both resources insufficient', () => {
      mockHeroData.value = { id: 1, currentFocus: 0, currentInvestiture: 0 };
      const wrapper = createWrapper({ focusCost: 1, investitureCost: 1 });
      expect(wrapper.find('.use-action-btn').attributes('disable')).toBeDefined();
    });

    it('enables button when resources are sufficient', () => {
      mockHeroData.value = { id: 1, currentFocus: 10, currentInvestiture: 5 };
      const wrapper = createWrapper({ focusCost: 1, investitureCost: 1 });
      expect(wrapper.find('.use-action-btn').attributes('disable')).toBeUndefined();
    });

    it('disables button when hero is null', () => {
      mockHeroData.value = null;
      const wrapper = createWrapper({ focusCost: 1 });
      expect(wrapper.find('.use-action-btn').attributes('disable')).toBeDefined();
    });

    // Behavior
    it('calls patchFocus on use when focusCost > 0', async () => {
      mockHeroData.value = { id: 1, currentFocus: 10, currentInvestiture: 5 };
      const wrapper = createWrapper({ focusCost: 2 });
      await wrapper.find('.use-action-btn').trigger('click');
      expect(mockPatchFocus).toHaveBeenCalledWith(8);
    });

    it('calls patchInvestiture on use when investitureCost > 0', async () => {
      mockHeroData.value = { id: 1, currentFocus: 10, currentInvestiture: 5 };
      const wrapper = createWrapper({ investitureCost: 3 });
      await wrapper.find('.use-action-btn').trigger('click');
      expect(mockPatchInvestiture).toHaveBeenCalledWith(2);
    });

    it('calls both patch methods when both costs > 0', async () => {
      mockHeroData.value = { id: 1, currentFocus: 10, currentInvestiture: 5 };
      const wrapper = createWrapper({ focusCost: 1, investitureCost: 1 });
      await wrapper.find('.use-action-btn').trigger('click');
      expect(mockPatchFocus).toHaveBeenCalledWith(9);
      expect(mockPatchInvestiture).toHaveBeenCalledWith(4);
    });

    it('does not call patchFocus when focusCost is 0', async () => {
      mockHeroData.value = { id: 1, currentFocus: 10, currentInvestiture: 5 };
      const wrapper = createWrapper({ focusCost: 0, investitureCost: 1 });
      await wrapper.find('.use-action-btn').trigger('click');
      expect(mockPatchFocus).not.toHaveBeenCalled();
      expect(mockPatchInvestiture).toHaveBeenCalledWith(4);
    });

    it('does not call any patch when resources insufficient', async () => {
      mockHeroData.value = { id: 1, currentFocus: 0, currentInvestiture: 0 };
      const wrapper = createWrapper({ focusCost: 1 });
      await wrapper.find('.use-action-btn').trigger('click');
      expect(mockPatchFocus).not.toHaveBeenCalled();
      expect(mockPatchInvestiture).not.toHaveBeenCalled();
    });
  });
});
