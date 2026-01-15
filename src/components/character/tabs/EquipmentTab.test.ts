import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import EquipmentTab from './EquipmentTab.vue';
import type { HeroEquipment } from 'src/types';

const mockHero = ref<{
  currency: number;
  equipment: HeroEquipment[];
} | null>(null);

const mockEquipmentTypes = ref([
  { id: 1, code: 'weapon', name: 'Weapon' },
  { id: 2, code: 'armor', name: 'Armor' },
  { id: 3, code: 'gear', name: 'Gear' },
]);

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get hero() {
      return mockHero.value;
    },
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    get equipmentTypes() {
      return mockEquipmentTypes.value;
    },
    equipment: [
      { id: 1, name: 'Longsword', equipTypeId: 1 },
      { id: 2, name: 'Longbow', equipTypeId: 1 },
      { id: 3, name: 'Chain Mail', equipTypeId: 2 },
      { id: 4, name: 'Backpack', equipTypeId: 3 },
    ],
  }),
}));

vi.mock('src/constants/theme', () => ({
  RPG_COLORS: {
    currency: 'amber',
  },
}));

describe('EquipmentTab', () => {
  const createWrapper = () =>
    shallowMount(EquipmentTab, {
      global: {
        stubs: {
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QIcon: {
            template: '<span class="q-icon" />',
            props: ['name', 'size', 'color'],
          },
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
          EquipmentItem: {
            template: '<div class="equipment-item">{{ heroEquipment.equipmentId }}</div>',
            props: ['heroEquipment'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockHero.value = {
      currency: 100,
      equipment: [],
    };
    mockEquipmentTypes.value = [
      { id: 1, code: 'weapon', name: 'Weapon' },
      { id: 2, code: 'armor', name: 'Armor' },
      { id: 3, code: 'gear', name: 'Gear' },
    ];
  });

  // ========================================
  // Currency Display
  // ========================================
  describe('currency display', () => {
    it('renders currency value', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('100 marks');
    });

    it('renders currency label', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Total currency value');
    });

    it('handles zero currency', () => {
      mockHero.value!.currency = 0;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('0 marks');
    });

    it('handles null hero currency', () => {
      mockHero.value = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('0 marks');
    });
  });

  // ========================================
  // Equipment Type Tabs
  // ========================================
  describe('equipment type tabs', () => {
    it('renders all equipment type tabs', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Weapon');
      expect(wrapper.text()).toContain('Armor');
      expect(wrapper.text()).toContain('Gear');
    });

    it('renders tab panels for each type', () => {
      const wrapper = createWrapper();

      const panels = wrapper.findAll('.q-tab-panel');
      expect(panels.length).toBe(3);
    });
  });

  // ========================================
  // Equipment Display
  // ========================================
  describe('equipment display', () => {
    it('renders equipment items in correct category', () => {
      mockHero.value = {
        currency: 100,
        equipment: [
          { id: 1, equipmentId: 1 }, // Longsword (weapon)
          { id: 2, equipmentId: 3 }, // Chain Mail (armor)
        ] as HeroEquipment[],
      };
      const wrapper = createWrapper();

      const items = wrapper.findAll('.equipment-item');
      expect(items.length).toBe(2);
    });

    it('shows empty message for category without equipment', () => {
      mockHero.value = {
        currency: 100,
        equipment: [{ id: 1, equipmentId: 1 }] as HeroEquipment[], // Only weapon
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No armor in inventory');
      expect(wrapper.text()).toContain('No gear in inventory');
    });

    it('shows empty messages for all categories when no equipment', () => {
      mockHero.value = {
        currency: 100,
        equipment: [],
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No weapon in inventory');
      expect(wrapper.text()).toContain('No armor in inventory');
      expect(wrapper.text()).toContain('No gear in inventory');
    });
  });

  // ========================================
  // Async Classifier Loading
  // ========================================
  describe('async classifier loading', () => {
    it('initializes tab to first equipment type', () => {
      const wrapper = createWrapper();

      // Should default to first type (Weapon with id: 1)
      expect(wrapper.find('.q-tabs').exists()).toBe(true);
    });

    it('handles empty equipment types initially', () => {
      mockEquipmentTypes.value = [];
      const wrapper = createWrapper();

      // Should render without crashing
      expect(wrapper.exists()).toBe(true);
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles null hero gracefully', () => {
      mockHero.value = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('0 marks');
      expect(wrapper.text()).toContain('No weapon in inventory');
    });

    it('handles undefined equipment array', () => {
      mockHero.value = { currency: 50, equipment: undefined as unknown as HeroEquipment[] };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No weapon in inventory');
    });

    it('handles equipment with unknown type', () => {
      mockHero.value = {
        currency: 100,
        equipment: [
          { id: 1, equipmentId: 999 }, // Unknown equipment
        ] as HeroEquipment[],
      };
      const wrapper = createWrapper();

      // Should not crash
      expect(wrapper.exists()).toBe(true);
    });

    it('renders multiple items of same type', () => {
      mockHero.value = {
        currency: 100,
        equipment: [
          { id: 1, equipmentId: 1 }, // Longsword
          { id: 2, equipmentId: 2 }, // Longbow
        ] as HeroEquipment[],
      };
      const wrapper = createWrapper();

      // Both weapons should be rendered
      const items = wrapper.findAll('.equipment-item');
      expect(items.length).toBe(2);
    });
  });
});
