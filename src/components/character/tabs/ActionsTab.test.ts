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
  activeSingerForm: { id: number; code: string; name: string } | null;
} | null>(null);

const mockFavoriteActions = ref<HeroFavoriteAction[]>([]);
const mockUpsertFavoriteAction = vi.fn();
const mockRemoveFavoriteAction = vi.fn();
const mockFindFavoriteAction = vi.fn().mockReturnValue(undefined);

import { heroStore, classifierStore } from 'src/__tests__/mockStores';

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    ...heroStore({
      hero: mockHero.value,
      findFavoriteAction: mockFindFavoriteAction,
      upsertFavoriteAction: mockUpsertFavoriteAction,
      removeFavoriteAction: mockRemoveFavoriteAction,
    }),
    get favoriteActions() {
      return mockFavoriteActions.value;
    },
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () =>
    classifierStore({
      actionTypes: [
        { id: 1, code: 'basic', name: 'Basic' },
        { id: 2, code: 'equipment', name: 'Equipment' },
        { id: 3, code: 'paths', name: 'Paths' },
        { id: 4, code: 'radiant', name: 'Radiant' },
        { id: 5, code: 'adhesion', name: 'Adhesion' },
        { id: 6, code: 'gravitation', name: 'Gravitation' },
        { id: 7, code: 'singer_form', name: 'Singer Form' },
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
        {
          id: 4,
          code: 'free_action',
          name: 'Free Action',
          displayOrder: 4,
          icon: 'free-action.svg',
        },
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
          description: 'Path talent attack',
          actionType: { id: 3, code: 'paths', name: 'Paths' },
          activationType: { id: 1, code: 'action', name: 'Action' },
          damageType: null,
          focusCost: 0,
          investitureCost: 0,
        },
        {
          id: 12,
          code: 'specialty-action',
          name: 'Specialty Action',
          description: 'Specialty talent action',
          actionType: { id: 3, code: 'paths', name: 'Paths' },
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
          actionType: { id: 5, code: 'adhesion', name: 'Adhesion' },
          activationType: { id: 1, code: 'action', name: 'Action' },
          damageType: null,
          focusCost: 0,
          investitureCost: 0,
        },
        {
          id: 10,
          code: 'change_form',
          name: 'Change Form',
          description: 'Change singer form',
          actionType: { id: 7, code: 'singer_form', name: 'Singer Form' },
          activationType: { id: 1, code: 'action', name: 'Action' },
          damageType: null,
          focusCost: 0,
          investitureCost: 0,
        },
        {
          id: 11,
          code: 'unleash_lightning',
          name: 'Unleash Lightning',
          description: 'Stormform attack',
          actionType: { id: 7, code: 'singer_form', name: 'Singer Form' },
          activationType: { id: 2, code: 'double_action', name: 'Double Action' },
          damageType: null,
          focusCost: 0,
          investitureCost: 0,
        },
        {
          id: 13,
          code: 'radiant_action',
          name: 'Radiant Action',
          description: 'Radiant talent action',
          actionType: { id: 4, code: 'radiant', name: 'Radiant' },
          activationType: { id: 1, code: 'action', name: 'Action' },
          damageType: null,
          focusCost: 0,
          investitureCost: 0,
        },
      ],
      actionLinks: [
        {
          id: 1,
          objectId: 1,
          objectType: 'equipment',
          action: { id: 3, code: 'sword-slash', name: 'Sword Slash' },
        }, // Sword -> Sword Slash
        {
          id: 2,
          objectId: 2,
          objectType: 'equipment',
          action: { id: 4, code: 'bow-shot', name: 'Bow Shot' },
        }, // Bow -> Bow Shot
        {
          id: 3,
          objectId: 10,
          objectType: 'talent',
          action: { id: 5, code: 'power-strike', name: 'Power Strike' },
        }, // Talent 10 -> Power Strike
        {
          id: 8,
          objectId: 20,
          objectType: 'talent',
          action: { id: 12, code: 'specialty-action', name: 'Specialty Action' },
        }, // Specialty talent 20 -> Specialty Action
        {
          id: 4,
          objectId: 100,
          objectType: 'surge',
          action: { id: 6, code: 'lashing', name: 'Lashing' },
        }, // Adhesion surge ID -> Lashing
        {
          id: 5,
          objectId: 200,
          objectType: 'singer_form',
          action: { id: 10, code: 'change_form', name: 'Change Form' },
        }, // Dullform -> Change Form
        {
          id: 6,
          objectId: 201,
          objectType: 'singer_form',
          action: { id: 10, code: 'change_form', name: 'Change Form' },
        }, // Stormform -> Change Form
        {
          id: 7,
          objectId: 201,
          objectType: 'singer_form',
          action: { id: 11, code: 'unleash_lightning', name: 'Unleash Lightning' },
        }, // Stormform -> Unleash Lightning
        {
          id: 9,
          objectId: 30,
          objectType: 'talent',
          action: { id: 13, code: 'radiant_action', name: 'Radiant Action' },
        }, // Radiant talent 30 -> Radiant Action
      ],
      surges: [
        { id: 100, code: 'adhesion', name: 'Adhesion' },
        { id: 101, code: 'gravitation', name: 'Gravitation' },
      ],
      talents: [
        {
          id: 10,
          code: 't10',
          name: 'Talent10',
          path: { id: 1, code: 'warrior', name: 'Warrior' },
          radiantOrder: null,
          surge: null,
          ancestry: null,
          specialties: [],
          isKey: false,
          special: [],
        },
        {
          id: 20,
          code: 't20',
          name: 'Talent20',
          path: null,
          radiantOrder: null,
          surge: null,
          ancestry: null,
          specialties: [{ id: 1, code: 'duelist', name: 'Duelist' }],
          isKey: false,
          special: [],
        },
        {
          id: 30,
          code: 't30',
          name: 'Talent30',
          path: null,
          radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
          surge: null,
          ancestry: null,
          specialties: [],
          isKey: false,
          special: [],
        },
      ],
      radiantOrders: [
        {
          id: 1,
          code: 'windrunner',
          name: 'Windrunner',
          surge1: { id: 100, code: 'adhesion', name: 'Adhesion' },
          surge2: { id: 101, code: 'gravitation', name: 'Gravitation' },
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
      activeSingerForm: null,
    };
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders only non-empty action type tabs', () => {
      const wrapper = createWrapper();

      // Basic tab has actions, so it appears
      expect(wrapper.text()).toContain('Basic');
      // Equipment tab has no entries for hero with no equipment — hidden
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text() === 'Equipment')).toBe(false);
      // Paths/Radiant/surge tabs hidden when hero has no relevant talents/order
      expect(tabs.some((t) => t.text() === 'Paths')).toBe(false);
      expect(tabs.some((t) => t.text() === 'Radiant')).toBe(false);
      expect(tabs.some((t) => t.text() === 'Adhesion')).toBe(false);
    });

    it('renders only panels for non-empty tabs', () => {
      const wrapper = createWrapper();

      // Only Basic tab has entries for a hero with no equipment/talents/order
      const panels = wrapper.findAll('.q-tab-panel');
      expect(panels.length).toBe(1);
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
        activeSingerForm: null,
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
        activeSingerForm: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Sword Slash');
      // Equipment tab hidden when no entries
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text() === 'Equipment')).toBe(false);
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
        ],
        talents: [],
        radiantOrder: null,
        activeSingerForm: null,
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
          },
          {
            equipment: { id: 2, code: 'e2', name: 'Equip2' },
            isEquipped: true,
            special: [],
            specialOverrides: [],
            modifications: [],
          },
        ],
        talents: [],
        radiantOrder: null,
        activeSingerForm: null,
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
        activeSingerForm: null,
      };
      const wrapper = createWrapper();

      const panels = wrapper.findAll('.q-tab-panel');
      const equipPanel = panels.find((p) => p.attributes('data-name') === '2')!;
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
          },
          {
            equipment: { id: 2, code: 'e2', name: 'Equip2' },
            isEquipped: false,
            special: [],
            specialOverrides: [],
            modifications: [],
          },
        ],
        talents: [],
        radiantOrder: null,
        activeSingerForm: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Sword Slash');
      expect(wrapper.text()).not.toContain('Bow Shot');
    });
  });

  // ========================================
  // Paths Actions
  // ========================================
  describe('paths actions', () => {
    it('renders paths tab and actions for hero with path talent', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [{ talent: { id: 10, code: 't10', name: 'Talent10' } }],
        radiantOrder: null,
        activeSingerForm: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Paths');
      expect(wrapper.text()).toContain('Power Strike');
    });

    it('renders paths actions for specialty talents (path null, specialties non-empty)', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [{ talent: { id: 20, code: 't20', name: 'Talent20' } }],
        radiantOrder: null,
        activeSingerForm: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Paths');
      expect(wrapper.text()).toContain('Specialty Action');
    });

    it('paths tab hidden when hero has no path talents', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: null,
        activeSingerForm: null,
      };
      const wrapper = createWrapper();

      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text() === 'Paths')).toBe(false);
    });
  });

  // ========================================
  // Radiant Actions
  // ========================================
  describe('radiant actions', () => {
    it('radiant tab hidden when hero has radiant order but no linked radiant talent', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        activeSingerForm: null,
      };
      // No radiant action links in mock, so Radiant tab has 0 entries → hidden
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text() === 'Radiant')).toBe(false);
    });

    it('renders radiant tab and action for hero with radiant talent linked to action', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [{ talent: { id: 30, code: 't30', name: 'Talent30' } }],
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        activeSingerForm: null,
      };
      const wrapper = createWrapper();

      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text() === 'Radiant')).toBe(true);
      expect(wrapper.text()).toContain('Radiant Action');
    });
  });

  // ========================================
  // Surge Actions
  // ========================================
  describe('surge actions', () => {
    it('renders adhesion tab and surge action for Windrunner', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        activeSingerForm: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Adhesion');
      expect(wrapper.text()).toContain('Lashing');
    });

    it('renders gravitation tab for Windrunner (no actions in mock)', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        activeSingerForm: null,
      };
      const wrapper = createWrapper();

      // Gravitation surge has no action links in mock → tab hidden
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text() === 'Gravitation')).toBe(false);
    });

    it('non-radiant hero sees no surge tabs', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: null,
        activeSingerForm: null,
      };
      const wrapper = createWrapper();

      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text() === 'Adhesion')).toBe(false);
      expect(tabs.some((t) => t.text() === 'Gravitation')).toBe(false);
    });

    it('handles non-existent radiant order — surge tabs do not appear', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: { id: 999, code: 'ro999', name: 'RadiantOrder999' },
        activeSingerForm: null,
      };
      const wrapper = createWrapper();

      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text() === 'Adhesion')).toBe(false);
      expect(tabs.some((t) => t.text() === 'Gravitation')).toBe(false);
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
      // Equipment tab hidden — no entries
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text() === 'Equipment')).toBe(false);
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
        activeSingerForm: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Strike'); // Basic
      expect(wrapper.text()).toContain('Sword Slash'); // Equipment
      expect(wrapper.text()).toContain('Power Strike'); // Paths
      expect(wrapper.text()).toContain('Lashing'); // Adhesion surge
    });
  });

  // ========================================
  // Singer Form Actions
  // ========================================
  describe('singer form actions', () => {
    it('singer form tab hidden when no active form', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: null,
        activeSingerForm: null,
      };
      const wrapper = createWrapper();

      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text() === 'Singer Form')).toBe(false);
    });

    it('shows change_form and form action when active form is stormform', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: null,
        activeSingerForm: { id: 201, code: 'stormform', name: 'Stormform' },
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Singer Form');
      expect(wrapper.text()).toContain('Change Form');
      expect(wrapper.text()).toContain('Unleash Lightning');
    });

    it('shows only change_form when active form is dullform', () => {
      mockHero.value = {
        id: 1,
        equipment: [],
        talents: [],
        radiantOrder: null,
        activeSingerForm: { id: 200, code: 'dullform', name: 'Dullform' },
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Singer Form');
      expect(wrapper.text()).toContain('Change Form');
      expect(wrapper.text()).not.toContain('Unleash Lightning');
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

    it('has 2 panels (favorites + Basic) for hero with no equipment/talents/order and favorites', () => {
      mockFavoriteActions.value = [{ id: 1, heroId: 1, actionId: 1, heroEquipmentId: null }];
      const wrapper = createWrapper();

      const panels = wrapper.findAll('.q-tab-panel');
      expect(panels.length).toBe(2);
    });

    it('toggleFavorite calls upsertFavoriteAction for unfavorited classifier action', async () => {
      mockFindFavoriteAction.mockReturnValue(undefined);
      const wrapper = createWrapper();

      const actionItems = wrapper.findAllComponents({ name: 'ActionItem' });
      const moveItem = actionItems.find((ai) => ai.text() === 'Move');
      expect(moveItem).toBeDefined();
      await moveItem!.vm.$emit('toggle-favorite');
      await wrapper.vm.$nextTick();

      expect(mockUpsertFavoriteAction).toHaveBeenCalledWith({
        heroId: 1,
        actionId: 2,
        heroEquipmentId: null,
      });
    });

    it('toggleFavorite calls removeFavoriteAction for favorited classifier action', async () => {
      const existingFavorite = { id: 42, heroId: 1, actionId: 2, heroEquipmentId: null };
      mockFindFavoriteAction.mockImplementation(
        (actionId: number, heroEquipmentId: number | null) =>
          actionId === 2 && heroEquipmentId === null ? existingFavorite : undefined
      );
      const wrapper = createWrapper();

      const actionItems = wrapper.findAllComponents({ name: 'ActionItem' });
      const moveItem = actionItems.find((ai) => ai.text() === 'Move');
      expect(moveItem).toBeDefined();
      await moveItem!.vm.$emit('toggle-favorite');
      await wrapper.vm.$nextTick();

      expect(mockFindFavoriteAction).toHaveBeenCalledWith(2, null);
      expect(mockRemoveFavoriteAction).toHaveBeenCalledWith(existingFavorite.id);
    });
  });
});
