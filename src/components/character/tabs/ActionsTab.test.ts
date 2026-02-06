import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import ActionsTab from './ActionsTab.vue';
import type { HeroEquipment, HeroTalent } from 'src/types';

const mockHero = ref<{
  equipment: Partial<HeroEquipment>[];
  talents: Partial<HeroTalent>[];
  radiantOrder: { id: number; code: string; name: string } | null;
} | null>(null);

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    hero: mockHero.value,
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
            template: '<div class="action-item">{{ action.name }}</div>',
            props: ['action'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockHero.value = {
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
    it('renders equipment actions for owned equipment', () => {
      mockHero.value = {
        equipment: [{ equipment: { id: 1, code: 'e1', name: 'Equip1' } }],
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Sword Slash');
    });

    it('shows empty message when no equipment', () => {
      mockHero.value = {
        equipment: [],
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No equipment available');
    });

    it('does not show actions for unowned equipment', () => {
      mockHero.value = {
        equipment: [{ equipment: { id: 999, code: 'e999', name: 'Equip999' } }], // Non-existent equipment
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Sword Slash');
      expect(wrapper.text()).not.toContain('Bow Shot');
    });

    it('renders multiple equipment actions', () => {
      mockHero.value = {
        equipment: [
          { equipment: { id: 1, code: 'e1', name: 'Equip1' } }, // Sword
          { equipment: { id: 2, code: 'e2', name: 'Equip2' } }, // Bow
        ],
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Sword Slash');
      expect(wrapper.text()).toContain('Bow Shot');
    });
  });

  // ========================================
  // Talent Actions
  // ========================================
  describe('talent actions', () => {
    it('renders talent actions for owned talents', () => {
      mockHero.value = {
        equipment: [],
        talents: [{ talent: { id: 10, code: 't10', name: 'Talent10' } }],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Power Strike');
    });

    it('shows empty message when no talent actions', () => {
      mockHero.value = {
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
        equipment: [],
        talents: [],
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' }, // Windrunner with surge1: { id: 100, ... }
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Lashing');
    });

    it('shows empty message when not radiant', () => {
      mockHero.value = {
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
        equipment: [],
        talents: [],
        radiantOrder: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No equipment available');
    });

    it('handles hero with all action types', () => {
      mockHero.value = {
        equipment: [{ equipment: { id: 1, code: 'e1', name: 'Equip1' } }],
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
        equipment: [],
        talents: [],
        radiantOrder: { id: 999, code: 'ro999', name: 'RadiantOrder999' }, // Non-existent
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No surge available');
    });
  });
});
