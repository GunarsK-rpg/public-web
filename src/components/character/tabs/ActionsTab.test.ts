import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import ActionsTab from './ActionsTab.vue';
import type { HeroEquipment, HeroTalent } from 'src/types';

const mockHero = ref<{
  equipment: HeroEquipment[];
  talents: HeroTalent[];
  radiantOrderId: number | null;
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
      { id: 1, name: 'Strike', description: 'Basic attack', actionTypeId: 1 },
      { id: 2, name: 'Move', description: 'Movement', actionTypeId: 1 },
      { id: 3, name: 'Sword Slash', description: 'Sword attack', actionTypeId: 2 },
      { id: 4, name: 'Bow Shot', description: 'Ranged attack', actionTypeId: 2 },
      { id: 5, name: 'Power Strike', description: 'Talent attack', actionTypeId: 3 },
      { id: 6, name: 'Lashing', description: 'Gravity manipulation', actionTypeId: 4 },
    ],
    actionLinks: [
      { objectId: 1, actionId: 3 }, // Sword -> Sword Slash
      { objectId: 2, actionId: 4 }, // Bow -> Bow Shot
      { objectId: 10, actionId: 5 }, // Talent 10 -> Power Strike
      { objectId: 100, actionId: 6 }, // Surge 100 -> Lashing
    ],
    radiantOrders: [{ id: 1, name: 'Windrunner', surge1Id: 100, surge2Id: 101 }],
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
      radiantOrderId: null,
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
        equipment: [{ equipmentId: 1 }] as HeroEquipment[],
        talents: [],
        radiantOrderId: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Sword Slash');
    });

    it('shows empty message when no equipment', () => {
      mockHero.value = {
        equipment: [],
        talents: [],
        radiantOrderId: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No equipment available');
    });

    it('does not show actions for unowned equipment', () => {
      mockHero.value = {
        equipment: [{ equipmentId: 999 }] as HeroEquipment[], // Non-existent equipment
        talents: [],
        radiantOrderId: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Sword Slash');
      expect(wrapper.text()).not.toContain('Bow Shot');
    });

    it('renders multiple equipment actions', () => {
      mockHero.value = {
        equipment: [
          { equipmentId: 1 }, // Sword
          { equipmentId: 2 }, // Bow
        ] as HeroEquipment[],
        talents: [],
        radiantOrderId: null,
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
        talents: [{ talentId: 10 }] as HeroTalent[],
        radiantOrderId: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Power Strike');
    });

    it('shows empty message when no talent actions', () => {
      mockHero.value = {
        equipment: [],
        talents: [{ talentId: 999 }] as HeroTalent[], // Talent without actions
        radiantOrderId: null,
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
        radiantOrderId: 1, // Windrunner with surge1Id: 100
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Lashing');
    });

    it('shows empty message when not radiant', () => {
      mockHero.value = {
        equipment: [],
        talents: [],
        radiantOrderId: null,
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
        radiantOrderId: null,
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No equipment available');
    });

    it('handles hero with all action types', () => {
      mockHero.value = {
        equipment: [{ equipmentId: 1 }] as HeroEquipment[],
        talents: [{ talentId: 10 }] as HeroTalent[],
        radiantOrderId: 1,
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
        radiantOrderId: 999, // Non-existent
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No surge available');
    });
  });
});
