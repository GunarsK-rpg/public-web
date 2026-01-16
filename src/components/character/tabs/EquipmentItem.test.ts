import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { computed, ref } from 'vue';
import EquipmentItem from './EquipmentItem.vue';
import type { HeroEquipment } from 'src/types';

// Mock equipment ID for reactive mock
const mockEquipmentId = ref(1);

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    equipment: [
      {
        id: 1,
        name: 'Longsword',
        equipTypeId: 1,
        damageTypeId: 1,
        special: { damage: '2d6' },
      },
      {
        id: 2,
        name: 'Longbow',
        equipTypeId: 1,
        special: { damage: '1d8', range: '120 ft' },
      },
      {
        id: 3,
        name: 'Chain Mail',
        equipTypeId: 2,
        special: { deflect: '+2' },
      },
      {
        id: 4,
        name: 'Healing Potion',
        equipTypeId: 3,
        special: { charges: 3, maxCharges: 3 },
      },
      {
        id: 5,
        name: 'Backpack',
        equipTypeId: 4,
        special: null,
      },
    ],
    equipmentTypes: [
      { id: 1, code: 'weapon', name: 'Weapon', icon: 'weapon.svg' },
      { id: 2, code: 'armor', name: 'Armor', icon: 'armor.svg' },
      { id: 3, code: 'consumable', name: 'Consumable', icon: 'consumable.svg' },
      { id: 4, code: 'gear', name: 'Gear', icon: 'gear.svg' },
    ],
    damageTypes: [
      { id: 1, name: 'Slashing' },
      { id: 2, name: 'Piercing' },
    ],
  }),
}));

const equipmentMap: Record<
  number,
  {
    id: number;
    name: string;
    equipTypeId: number;
    damageTypeId?: number;
    special: {
      damage?: string;
      range?: string;
      deflect?: string;
      charges?: number;
      maxCharges?: number;
    } | null;
  }
> = {
  1: {
    id: 1,
    name: 'Longsword',
    equipTypeId: 1,
    damageTypeId: 1,
    special: { damage: '2d6' },
  },
  2: {
    id: 2,
    name: 'Longbow',
    equipTypeId: 1,
    special: { damage: '1d8', range: '120 ft' },
  },
  3: {
    id: 3,
    name: 'Chain Mail',
    equipTypeId: 2,
    special: { deflect: '+2' },
  },
  4: {
    id: 4,
    name: 'Healing Potion',
    equipTypeId: 3,
    special: { charges: 3, maxCharges: 3 },
  },
  5: {
    id: 5,
    name: 'Backpack',
    equipTypeId: 4,
    special: null,
  },
};

vi.mock('src/composables/useEntityIcon', () => ({
  useChainedEntityIcon: (equipmentIdRef: { value: number }) => {
    // Update mock ref when composable is called
    mockEquipmentId.value = equipmentIdRef.value;
    const primaryEntity = computed(() => equipmentMap[mockEquipmentId.value]);
    const relatedEntity = computed(() => {
      const eq = primaryEntity.value;
      return eq ? { id: eq.equipTypeId, name: 'Weapon', icon: 'weapon.svg' } : undefined;
    });
    const iconUrl = computed(() =>
      relatedEntity.value?.icon ? '/icons/equipment/weapon.svg' : ''
    );
    return { primaryEntity, relatedEntity, iconUrl };
  },
}));

vi.mock('src/constants/theme', () => ({
  RPG_COLORS: {
    equipmentPrimary: 'amber',
    badgeMuted: 'grey',
  },
}));

describe('EquipmentItem', () => {
  const createWrapper = (heroEquipment: Partial<HeroEquipment>) =>
    shallowMount(EquipmentItem, {
      props: {
        heroEquipment: {
          id: 1,
          equipmentId: 1,
          amount: 1,
          isEquipped: false,
          isPrimary: false,
          customName: undefined,
          notes: undefined,
          ...heroEquipment,
        } as HeroEquipment,
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
            template: '<span class="q-badge" :aria-label="$attrs[\'aria-label\']"><slot /></span>',
            props: ['color'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders equipment name', () => {
      const wrapper = createWrapper({ equipmentId: 1 });

      expect(wrapper.text()).toContain('Longsword');
    });

    it('renders custom name when provided', () => {
      const wrapper = createWrapper({
        equipmentId: 1,
        customName: 'Syladin',
      });

      expect(wrapper.text()).toContain('Syladin');
    });

    it('renders equipment type icon', () => {
      const wrapper = createWrapper({ equipmentId: 1 });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toBe('/icons/equipment/weapon.svg');
    });
  });

  // ========================================
  // Status Badges
  // ========================================
  describe('status badges', () => {
    it('shows Equipped badge when equipped', () => {
      const wrapper = createWrapper({
        equipmentId: 1,
        isEquipped: true,
      });

      expect(wrapper.text()).toContain('Equipped');
    });

    it('does not show Equipped badge when not equipped', () => {
      const wrapper = createWrapper({
        equipmentId: 1,
        isEquipped: false,
      });

      expect(wrapper.text()).not.toContain('Equipped');
    });

    it('shows Primary badge when primary', () => {
      const wrapper = createWrapper({
        equipmentId: 1,
        isPrimary: true,
      });

      expect(wrapper.text()).toContain('Primary');
    });

    it('does not show Primary badge when not primary', () => {
      const wrapper = createWrapper({
        equipmentId: 1,
        isPrimary: false,
      });

      expect(wrapper.text()).not.toContain('Primary');
    });

    it('shows both badges when equipped and primary', () => {
      const wrapper = createWrapper({
        equipmentId: 1,
        isEquipped: true,
        isPrimary: true,
      });

      expect(wrapper.text()).toContain('Equipped');
      expect(wrapper.text()).toContain('Primary');
    });
  });

  // ========================================
  // Quantity Badge
  // ========================================
  describe('quantity badge', () => {
    it('shows quantity badge when amount > 1', () => {
      const wrapper = createWrapper({
        equipmentId: 1,
        amount: 3,
      });

      expect(wrapper.text()).toContain('x3');
    });

    it('does not show quantity badge when amount is 1', () => {
      const wrapper = createWrapper({
        equipmentId: 1,
        amount: 1,
      });

      expect(wrapper.text()).not.toContain('x1');
    });

    it('quantity badge has correct aria-label', () => {
      const wrapper = createWrapper({
        equipmentId: 1,
        amount: 5,
      });

      const badge = wrapper.find('.q-badge[aria-label="Quantity: 5"]');
      expect(badge.exists()).toBe(true);
    });
  });

  // ========================================
  // Details Line
  // ========================================
  describe('details line', () => {
    it('shows damage for weapons', () => {
      const wrapper = createWrapper({ equipmentId: 1 });

      expect(wrapper.text()).toContain('2d6');
      expect(wrapper.text()).toContain('Slashing');
    });

    it('shows range for ranged weapons', () => {
      const wrapper = createWrapper({ equipmentId: 2 });

      expect(wrapper.text()).toContain('120 ft');
    });

    it('shows deflect for armor', () => {
      const wrapper = createWrapper({ equipmentId: 3 });

      expect(wrapper.text()).toContain('Deflect +2');
    });

    it('shows charges for consumables', () => {
      const wrapper = createWrapper({ equipmentId: 4 });

      expect(wrapper.text()).toContain('3/3 charges');
    });

    it('does not show details for items without special', () => {
      const wrapper = createWrapper({ equipmentId: 5 });

      // Backpack has no special properties
      expect(wrapper.text()).not.toContain('Deflect');
      expect(wrapper.text()).not.toContain('charges');
    });
  });

  // ========================================
  // Notes
  // ========================================
  describe('notes', () => {
    it('renders notes when provided', () => {
      const wrapper = createWrapper({
        equipmentId: 1,
        notes: 'Family heirloom',
      });

      expect(wrapper.text()).toContain('Family heirloom');
    });

    it('does not render notes section when empty', () => {
      const wrapper = createWrapper({
        equipmentId: 1,
        notes: null,
      });

      expect(wrapper.text()).not.toContain('heirloom');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles unknown equipment ID gracefully', () => {
      const wrapper = createWrapper({ equipmentId: 999 });

      // Should not crash
      expect(wrapper.exists()).toBe(true);
    });

    it('handles zero amount', () => {
      const wrapper = createWrapper({
        equipmentId: 1,
        amount: 0,
      });

      // Should not show quantity badge for 0
      expect(wrapper.text()).not.toContain('x0');
    });

    it('renders all badges and details together', () => {
      const wrapper = createWrapper({
        equipmentId: 1,
        isEquipped: true,
        isPrimary: true,
        amount: 2,
        notes: 'Special item',
      });

      expect(wrapper.text()).toContain('Equipped');
      expect(wrapper.text()).toContain('Primary');
      expect(wrapper.text()).toContain('x2');
      expect(wrapper.text()).toContain('Special item');
      expect(wrapper.text()).toContain('2d6');
    });
  });
});
