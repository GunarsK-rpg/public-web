import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import ActionsTab from './ActionsTab.vue';
import type { HeroEquipment, HeroFavoriteAction, HeroTalent } from 'src/types';

const mockHero = ref<{
  id: number;
  equipment: Partial<HeroEquipment>[];
  talents: Partial<HeroTalent>[];
  radiantOrder: { id: number; code: string; name: string } | null;
} | null>(null);

const mockFavoriteActions = ref<HeroFavoriteAction[]>([]);
const mockUpsertFavoriteAction = vi.fn();
const mockRemoveFavoriteAction = vi.fn();
const mockFindFavoriteAction = vi.fn().mockReturnValue(undefined);

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    hero: mockHero.value,
    get favoriteActions() {
      return mockFavoriteActions.value;
    },
    findFavoriteAction: mockFindFavoriteAction,
    upsertFavoriteAction: mockUpsertFavoriteAction,
    removeFavoriteAction: mockRemoveFavoriteAction,
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    actionTypes: [
      { id: 1, code: 'basic', name: 'Basic' },
      { id: 2, code: 'equipment', name: 'Equipment' },
      { id: 3, code: 'talent', name: 'Talent' },
      { id: 4, code: 'surge', name: 'Surge' },
    ],
    activationTypes: [
      { id: 1, code: 'action', name: 'Action', displayOrder: 1, icon: 'action.svg' },
      {
        id: 2,
        code: 'double_action',
        name: 'Double Action',
        displayOrder: 2,
        icon: 'double-action.svg',
      },
      { id: 4, code: 'free_action', name: 'Free Action', displayOrder: 4, icon: 'free-action.svg' },
      { id: 5, code: 'reaction', name: 'Reaction', displayOrder: 5, icon: 'reaction.svg' },
    ],
    actions: [
      {
        id: 1,
        code: 'strike',
        name: 'Strike',
        description: 'Basic attack',
        actionType: { id: 1, code: 'basic', name: 'Basic' },
        activationType: { id: 1, code: 'action', name: 'Action' },
        damageType: null,
        focusCost: 0,
        investitureCost: 0,
      },
      {
        id: 2,
        code: 'move',
        name: 'Move',
        description: 'Movement',
        actionType: { id: 1, code: 'basic', name: 'Basic' },
        activationType: { id: 1, code: 'action', name: 'Action' },
        damageType: null,
        focusCost: 0,
        investitureCost: 0,
      },
      {
        id: 7,
        code: 'dodge',
        name: 'Dodge',
        description: 'Dodge an attack',
        actionType: { id: 1, code: 'basic', name: 'Basic' },
        activationType: { id: 5, code: 'reaction', name: 'Reaction' },
        damageType: null,
        focusCost: 1,
        investitureCost: 0,
      },
      {
        id: 8,
        code: 'banter',
        name: 'Banter',
        description: 'Speak briefly',
        actionType: { id: 1, code: 'basic', name: 'Basic' },
        activationType: { id: 4, code: 'free_action', name: 'Free Action' },
        damageType: null,
        focusCost: 0,
        investitureCost: 0,
      },
      {
        id: 9,
        code: 'recover',
        name: 'Recover',
        description: 'Recover health',
        actionType: { id: 1, code: 'basic', name: 'Basic' },
        activationType: { id: 2, code: 'double_action', name: 'Double Action' },
        damageType: null,
        focusCost: 0,
        investitureCost: 0,
      },
      {
        id: 3,
        code: 'sword-slash',
        name: 'Sword Slash',
        description: 'Sword attack',
        actionType: { id: 2, code: 'equipment', name: 'Equipment' },
        activationType: { id: 1, code: 'action', name: 'Action' },
        damageType: null,
        focusCost: 0,
        investitureCost: 0,
      },
      {
        id: 4,
        code: 'bow-shot',
        name: 'Bow Shot',
        description: 'Ranged attack',
        actionType: { id: 2, code: 'equipment', name: 'Equipment' },
        activationType: { id: 1, code: 'action', name: 'Action' },
        damageType: null,
        focusCost: 0,
        investitureCost: 0,
      },
      {
        id: 5,
        code: 'power-strike',
        name: 'Power Strike',
        description: 'Talent attack',
        actionType: { id: 3, code: 'talent', name: 'Talent' },
        activationType: { id: 1, code: 'action', name: 'Action' },
        damageType: null,
        focusCost: 0,
        investitureCost: 0,
      },
      {
        id: 6,
        code: 'lashing',
        name: 'Lashing',
        description: 'Gravity manipulation',
        actionType: { id: 4, code: 'surge', name: 'Surge' },
        activationType: { id: 1, code: 'action', name: 'Action' },
        damageType: null,
        focusCost: 0,
        investitureCost: 0,
      },
    ],
    actionLinks: [
      { id: 1, objectId: 1, action: { id: 3, code: 'sword-slash', name: 'Sword Slash' } }, // Sword -> Sword Slash
      { id: 2, objectId: 2, action: { id: 4, code: 'bow-shot', name: 'Bow Shot' } }, // Bow -> Bow Shot
      { id: 3, objectId: 10, action: { id: 5, code: 'power-strike', name: 'Power Strike' } }, // Talent 10 -> Power Strike
      { id: 4, objectId: 100, action: { id: 6, code: 'lashing', name: 'Lashing' } }, // Surge 100 -> Lashing
    ],
    radiantOrders: [
      {
        id: 1,
        code: 'windrunner',
        name: 'Windrunner',
        surge1: { id: 100, code: 'surge1', name: 'Surge 1' },
        surge2: { id: 101, code: 'surge2', name: 'Surge 2' },
      },
    ],
  }),
}));

describe('ActionsTab', () => {
  const createWrapper = () =>
    shallowMount(ActionsTab, {
      global: {
        stubs: {
          QTabs: {
            template: '<div class="q-tabs"><slot /></div>',
            props: ['modelValue', 'dense', 'align', 'narrowIndicator'],
          },
          QTab: {
            template: '<button class="q-tab" :data-name="name">{{ label }}</button>',
            props: ['name', 'label'],
          },
          QTabPanels: {
            template: '<div class="q-tab-panels"><slot /></div>',
            props: ['modelValue', 'animated'],
          },
          QTabPanel: {
            template: '<div class="q-tab-panel" :data-name="name"><slot /></div>',
            props: ['name'],
          },
          QList: {
            template: '<div class="q-list"><slot /></div>',
            props: ['bordered', 'separator'],
          },
          ActionItem: {
            name: 'ActionItem',
            template:
              '<div class="action-item" :data-equip-id="equipmentInstance?.heroEquipment?.id">{{ action.name }}</div>',
            props: ['action', 'equipmentInstance', 'readonly', 'isFavorite'],
            emits: ['toggle-favorite'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockFavoriteActions.value = [];
    mockFindFavoriteAction.mockReturnValue(undefined);
    mockHero.value = {
      id: 1,
      equipment: [],
      talents: [],
      radiantOrder: null,
    };
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders all action type tabs', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Basic');
      expect(wrapper.text()).toContain('Equipment');
      expect(wrapper.text()).toContain('Talent');
      expect(wrapper.text()).toContain('Surge');
    });

    it('renders tab panels for each action type', () => {
      const wrapper = createWrapper();

      const panels = wrapper.findAll('.q-tab-panel');
      expect(panels.length).toBe(4);
    });
  });

  // ========================================
  // Basic Actions
  // ========================================
  describe('basic actions', () => {
    it('renders basic actions for everyone', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Strike');
      expect(wrapper.text()).toContain('Move');
    });
  });

  // ========================================
  // Equipment Actions
  // ========================================
  describe('equipment actions', () => {
    it('renders equipment actions for equipped equipment', () => {
      mockHero.value = {
        id: 1,
        equipment: [
          {
            equipment: { id: 1, code: 'e1', name: 'Equip1' },
            isEquipped: true,
            special: [],
            specialOverrides: [],
            modifications: [],
          },
        ],
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Sword Slash');
    });

    it('does not show actions for unequipped equipment', () => {
      mockHero.value = {
        id: 1,
        equipment: [
          {
            equipment: { id: 1, code: 'e1', name: 'Equip1' },
            isEquipped: false,
            special: [],
            specialOverrides: [],
            modifications: [],
          },
        ],
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Sword Slash');
      expect(wrapper.text()).toContain('No equipment available');
    });

    it('shows empty message when no equipment', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No equipment available');
    });

    it('does not show actions for unowned equipment', () => {
      mockHero.value = {
        id: 1,
        equipment: [
          {
            equipment: { id: 999, code: 'e999', name: 'Equip999' },
            isEquipped: true,
            special: [],
            specialOverrides: [],
            modifications: [],
          },
        ], // Non-existent equipment
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Sword Slash');
      expect(wrapper.text()).not.toContain('Bow Shot');
    });

    it('renders multiple equipment actions for equipped items', () => {
      mockHero.value = {
        id: 1,
        equipment: [
          {
            equipment: { id: 1, code: 'e1', name: 'Equip1' },
            isEquipped: true,
            special: [],
            specialOverrides: [],
            modifications: [],
          }, // Sword
          {
            equipment: { id: 2, code: 'e2', name: 'Equip2' },
            isEquipped: true,
            special: [],
            specialOverrides: [],
            modifications: [],
          }, // Bow
        ],
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Sword Slash');
      expect(wrapper.text()).toContain('Bow Shot');
    });

    it('renders separate action instances for two equipped items sharing the same equipment id', () => {
      mockHero.value = {
        id: 1,
        equipment: [
          {
            id: 10,
            equipment: { id: 1, code: 'e1', name: 'Sword A' },
            isEquipped: true,
            special: [],
            specialOverrides: [],
            modifications: [],
          },
          {
            id: 11,
            equipment: { id: 1, code: 'e1', name: 'Sword B' },
            isEquipped: true,
            special: [],
            specialOverrides: [],
            modifications: [],
          },
        ],
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      const equipPanel = wrapper.findAll('.q-tab-panel')[1]!;
      const items = equipPanel.findAll('.action-item');
      const names = items.map((item) => item.text());
      expect(names.filter((n) => n === 'Sword Slash')).toHaveLength(2);
      const equipIds = items.map((item) => item.attributes('data-equip-id'));
      expect(equipIds).toContain('10');
      expect(equipIds).toContain('11');
    });

    it('only shows actions for equipped items in mixed inventory', () => {
      mockHero.value = {
        id: 1,
        equipment: [
          {
            equipment: { id: 1, code: 'e1', name: 'Equip1' },
            isEquipped: true,
            special: [],
            specialOverrides: [],
            modifications: [],
          }, // Sword - equipped
          {
            equipment: { id: 2, code: 'e2', name: 'Equip2' },
            isEquipped: false,
            special: [],
            specialOverrides: [],
            modifications: [],
          }, // Bow - in backpack
        ],
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Sword Slash');
      expect(wrapper.text()).not.toContain('Bow Shot');
    });
  });

  // ========================================
  // Talent Actions
  // ========================================
  describe('talent actions', () => {
    it('renders talent actions for owned talents', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [{ talent: { id: 10, code: 't10', name: 'Talent10' } }],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Power Strike');
    });

    it('shows empty message when no talent actions', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [{ talent: { id: 999, code: 't999', name: 'Talent999' } }], // Talent without actions
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No talent available');
    });
  });

  // ========================================
  // Surge Actions
  // ========================================
  describe('surge actions', () => {
    it('renders surge actions for radiant orders', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' }, // Windrunner with surge1: { id: 100, ... }
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Lashing');
    });

    it('shows empty message when not radiant', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No surge available');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles null hero gracefully', () => {
      mockHero.value = null;
      const wrapper = createWrapper();

      // Should still render basic actions
      expect(wrapper.text()).toContain('Strike');
      expect(wrapper.text()).toContain('No equipment available');
    });

    it('handles empty equipment array', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No equipment available');
    });

    it('handles hero with all action types', () => {
      mockHero.value = {
        id: 1,
        equipment: [
          {
            equipment: { id: 1, code: 'e1', name: 'Equip1' },
            isEquipped: true,
            special: [],
            specialOverrides: [],
            modifications: [],
          },
        ],
        talents: [{ talent: { id: 10, code: 't10', name: 'Talent10' } }],
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Strike'); // Basic
      expect(wrapper.text()).toContain('Sword Slash'); // Equipment
      expect(wrapper.text()).toContain('Power Strike'); // Talent
      expect(wrapper.text()).toContain('Lashing'); // Surge
    });

    it('handles non-existent radiant order', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: { id: 999, code: 'ro999', name: 'RadiantOrder999' }, // Non-existent
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No surge available');
    });
  });

  // ========================================
  // Action Sorting
  // ========================================
  describe('action sorting', () => {
    it('sorts basic actions by activation type then alphabetically', () => {
      const wrapper = createWrapper();

      // Basic tab contains actions, double actions, free actions, reactions
      // Expected order: actions (Move, Strike), double (Recover), free (Banter), reaction (Dodge)
      const basicPanel = wrapper.findAll('.q-tab-panel')[0]!;
      const items = basicPanel.findAll('.action-item');
      const names = items.map((item) => item.text());

      expect(names).toEqual(['Move', 'Strike', 'Recover', 'Banter', 'Dodge']);
    });
  });

  // ========================================
  // Icon Legend
  // ========================================
  describe('icon legend', () => {
    it('renders all activation types in legend', () => {
      const wrapper = createWrapper();

      const legend = wrapper.find('.icon-legend');
      expect(legend.exists()).toBe(true);
      expect(legend.text()).toContain('Action');
      expect(legend.text()).toContain('Double Action');
      expect(legend.text()).toContain('Free Action');
      expect(legend.text()).toContain('Reaction');
    });

    it('renders legend title', () => {
      const wrapper = createWrapper();

      const legend = wrapper.find('.icon-legend');
      expect(legend.text()).toContain('Action Types');
    });
  });

  // ========================================
  // Favorites Tab
  // ========================================
  describe('favorites tab', () => {
    it('does not render favorites tab when no favorites', () => {
      mockFavoriteActions.value = [];
      const wrapper = createWrapper();

      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.attributes('data-name') === 'favorites')).toBe(false);
    });

    it('renders favorites tab when favorites exist', () => {
      mockFavoriteActions.value = [{ id: 1, heroId: 1, actionId: 1, heroEquipmentId: null }];
      const wrapper = createWrapper();

      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.attributes('data-name') === 'favorites')).toBe(true);
    });

    it('favorites tab appears before other tabs', () => {
      mockFavoriteActions.value = [{ id: 1, heroId: 1, actionId: 1, heroEquipmentId: null }];
      const wrapper = createWrapper();

      const tabs = wrapper.findAll('.q-tab');
      expect(tabs[0]?.attributes('data-name')).toBe('favorites');
    });

    it('renders favorites tab panel when favorites exist', () => {
      mockFavoriteActions.value = [{ id: 1, heroId: 1, actionId: 1, heroEquipmentId: null }];
      const wrapper = createWrapper();

      const panels = wrapper.findAll('.q-tab-panel');
      expect(panels.some((p) => p.attributes('data-name') === 'favorites')).toBe(true);
    });

    it('has 5 panels (favorites + 4 action types) when favorites exist', () => {
      mockFavoriteActions.value = [{ id: 1, heroId: 1, actionId: 1, heroEquipmentId: null }];
      const wrapper = createWrapper();

      const panels = wrapper.findAll('.q-tab-panel');
      expect(panels.length).toBe(5);
    });

    it('toggleFavorite calls addFavoriteAction for unfavorited classifier action', async () => {
      mockFindFavoriteAction.mockReturnValue(undefined);
      const wrapper = createWrapper();

      const actionItems = wrapper.findAllComponents({ name: 'ActionItem' });
      expect(actionItems.length).toBeGreaterThan(0);
      await actionItems[0]!.vm.$emit('toggle-favorite');
      await wrapper.vm.$nextTick();

      expect(mockUpsertFavoriteAction).toHaveBeenCalledWith({
        heroId: 1,
        actionId: 2, // Move (first basic action after sorting)
        heroEquipmentId: null,
      });
    });

    it('toggleFavorite calls removeFavoriteAction for favorited classifier action', async () => {
      const existingFavorite = { id: 42, heroId: 1, actionId: 1, heroEquipmentId: null };
      mockFindFavoriteAction.mockReturnValue(existingFavorite);
      const wrapper = createWrapper();

      const actionItems = wrapper.findAllComponents({ name: 'ActionItem' });
      expect(actionItems.length).toBeGreaterThan(0);
      await actionItems[0]!.vm.$emit('toggle-favorite');
      await wrapper.vm.$nextTick();

      expect(mockRemoveFavoriteAction).toHaveBeenCalledWith(existingFavorite.id);
    });
  });
});
