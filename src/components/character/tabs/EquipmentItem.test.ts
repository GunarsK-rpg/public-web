import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { computed, ref } from 'vue';
import EquipmentItem from './EquipmentItem.vue';
import type { Equipment, HeroEquipment } from 'src/types';

// Mock equipment ID for reactive mock
const mockEquipmentId = ref(1);

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    equipment: [
      {
        id: 1,
        code: 'longsword',
        name: 'Longsword',
        equipType: { id: 1, code: 'weapon', name: 'Weapon' },
        damageType: { id: 1, code: 'slashing', name: 'Slashing' },
        special: { damage: '2d6' },
        weight: 3,
        cost: 15,
        isCustom: false,
        attributes: [],
        unit: null,
      },
      {
        id: 2,
        code: 'longbow',
        name: 'Longbow',
        equipType: { id: 1, code: 'weapon', name: 'Weapon' },
        damageType: null,
        special: { damage: '1d8', range: '120 ft' },
        weight: 2,
        cost: 25,
        isCustom: false,
        attributes: [],
        unit: null,
      },
      {
        id: 3,
        code: 'chain-mail',
        name: 'Chain Mail',
        equipType: { id: 2, code: 'armor', name: 'Armor' },
        damageType: null,
        special: { deflect: '+2' },
        weight: 40,
        cost: 75,
        isCustom: false,
        attributes: [],
        unit: null,
      },
      {
        id: 4,
        code: 'healing-potion',
        name: 'Healing Potion',
        equipType: { id: 3, code: 'consumable', name: 'Consumable' },
        damageType: null,
        special: { charges: 3, maxCharges: 3 },
        weight: 0.5,
        cost: 50,
        isCustom: false,
        attributes: [],
        unit: null,
      },
      {
        id: 5,
        code: 'backpack',
        name: 'Backpack',
        equipType: { id: 4, code: 'gear', name: 'Gear' },
        damageType: null,
        special: null,
        weight: 5,
        cost: 2,
        isCustom: false,
        attributes: [],
        unit: null,
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
  Pick<Equipment, 'id' | 'code' | 'name' | 'equipType' | 'damageType'> & {
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
    code: 'longsword',
    name: 'Longsword',
    equipType: { id: 1, code: 'weapon', name: 'Weapon' },
    damageType: { id: 1, code: 'slashing', name: 'Slashing' },
    special: { damage: '2d6' },
  },
  2: {
    id: 2,
    code: 'longbow',
    name: 'Longbow',
    equipType: { id: 1, code: 'weapon', name: 'Weapon' },
    damageType: null,
    special: { damage: '1d8', range: '120 ft' },
  },
  3: {
    id: 3,
    code: 'chain-mail',
    name: 'Chain Mail',
    equipType: { id: 2, code: 'armor', name: 'Armor' },
    damageType: null,
    special: { deflect: '+2' },
  },
  4: {
    id: 4,
    code: 'healing-potion',
    name: 'Healing Potion',
    equipType: { id: 3, code: 'consumable', name: 'Consumable' },
    damageType: null,
    special: { charges: 3, maxCharges: 3 },
  },
  5: {
    id: 5,
    code: 'backpack',
    name: 'Backpack',
    equipType: { id: 4, code: 'gear', name: 'Gear' },
    damageType: null,
    special: null,
  },
};

const equipmentTypeMap: Record<number, { id: number; code: string; name: string; icon: string }> = {
  1: { id: 1, code: 'weapon', name: 'Weapon', icon: 'weapon.svg' },
  2: { id: 2, code: 'armor', name: 'Armor', icon: 'armor.svg' },
  3: { id: 3, code: 'consumable', name: 'Consumable', icon: 'consumable.svg' },
  4: { id: 4, code: 'gear', name: 'Gear', icon: 'gear.svg' },
};

vi.mock('src/composables/useEntityIcon', () => ({
  useChainedEntityIcon: (equipmentIdRef: { value: number }) => {
    // Update mock ref when composable is called
    mockEquipmentId.value = equipmentIdRef.value;
    const primaryEntity = computed(() => equipmentMap[mockEquipmentId.value]);
    const relatedEntity = computed(() => {
      const eq = primaryEntity.value;
      if (!eq) return undefined;
      return equipmentTypeMap[eq.equipType.id];
    });
    const iconUrl = computed(() =>
      relatedEntity.value?.icon ? `/icons/equipment/${relatedEntity.value.icon}` : ''
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

const eqRef = (id: number) => ({ id, code: `e${id}`, name: `Equip${id}` });

describe('EquipmentItem', () => {
  const createWrapper = (heroEquipment: Partial<HeroEquipment>) =>
    shallowMount(EquipmentItem, {
      props: {
        heroEquipment: {
          id: 1,
          equipment: eqRef(1),
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
      const wrapper = createWrapper({ equipment: eqRef(1) });

      expect(wrapper.text()).toContain('Longsword');
    });

    it('renders custom name when provided', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        customName: 'Syladin',
      });

      expect(wrapper.text()).toContain('Syladin');
    });

    it('renders equipment type icon', () => {
      const wrapper = createWrapper({ equipment: eqRef(1) });

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
        equipment: eqRef(1),
        isEquipped: true,
      });

      expect(wrapper.text()).toContain('Equipped');
    });

    it('does not show Equipped badge when not equipped', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        isEquipped: false,
      });

      expect(wrapper.text()).not.toContain('Equipped');
    });

    it('shows Primary badge when primary', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        isPrimary: true,
      });

      expect(wrapper.text()).toContain('Primary');
    });

    it('does not show Primary badge when not primary', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        isPrimary: false,
      });

      expect(wrapper.text()).not.toContain('Primary');
    });

    it('shows both badges when equipped and primary', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
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
        equipment: eqRef(1),
        amount: 3,
      });

      expect(wrapper.text()).toContain('x3');
    });

    it('does not show quantity badge when amount is 1', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        amount: 1,
      });

      expect(wrapper.text()).not.toContain('x1');
    });

    it('quantity badge has correct aria-label', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
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
      const wrapper = createWrapper({ equipment: eqRef(1) });

      expect(wrapper.text()).toContain('2d6');
      expect(wrapper.text()).toContain('Slashing');
    });

    it('shows range for ranged weapons', () => {
      const wrapper = createWrapper({ equipment: eqRef(2) });

      expect(wrapper.text()).toContain('120 ft');
    });

    it('shows deflect for armor', () => {
      const wrapper = createWrapper({ equipment: eqRef(3) });

      expect(wrapper.text()).toContain('Deflect +2');
    });

    it('shows charges for consumables', () => {
      const wrapper = createWrapper({ equipment: eqRef(4) });

      expect(wrapper.text()).toContain('3/3 charges');
    });

    it('does not show details for items without special', () => {
      const wrapper = createWrapper({ equipment: eqRef(5) });

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
        equipment: eqRef(1),
        notes: 'Family heirloom',
      });

      expect(wrapper.text()).toContain('Family heirloom');
    });

    it('does not render notes section when empty', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
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
      const wrapper = createWrapper({ equipment: eqRef(999) });

      // Should not crash
      expect(wrapper.exists()).toBe(true);
    });

    it('handles zero amount', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        amount: 0,
      });

      // Should not show quantity badge for 0
      expect(wrapper.text()).not.toContain('x0');
    });

    it('renders all badges and details together', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
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
