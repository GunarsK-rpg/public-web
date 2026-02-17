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
        special: [{ type: 'damage', display_value: '2d6' }],
        maxCharges: null,
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
        special: [
          { type: 'damage', display_value: '1d8' },
          { type: 'range', display_value: '120 ft' },
        ],
        maxCharges: null,
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
        special: [{ type: 'deflect', value: 2 }],
        maxCharges: null,
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
        special: [],
        maxCharges: 3,
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
        special: [],
        maxCharges: null,
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
      { id: 1, code: 'slashing', name: 'Slashing' },
      { id: 2, code: 'piercing', name: 'Piercing' },
    ],
  }),
}));

const equipmentMap: Record<
  number,
  Pick<Equipment, 'id' | 'code' | 'name' | 'equipType' | 'damageType' | 'special'>
> = {
  1: {
    id: 1,
    code: 'longsword',
    name: 'Longsword',
    equipType: { id: 1, code: 'weapon', name: 'Weapon' },
    damageType: { id: 1, code: 'slashing', name: 'Slashing' },
    special: [{ type: 'damage', display_value: '2d6' }],
  },
  2: {
    id: 2,
    code: 'longbow',
    name: 'Longbow',
    equipType: { id: 1, code: 'weapon', name: 'Weapon' },
    damageType: null,
    special: [
      { type: 'damage', display_value: '1d8' },
      { type: 'range', display_value: '120 ft' },
    ],
  },
  3: {
    id: 3,
    code: 'chain-mail',
    name: 'Chain Mail',
    equipType: { id: 2, code: 'armor', name: 'Armor' },
    damageType: null,
    special: [{ type: 'deflect', value: 2 }],
  },
  4: {
    id: 4,
    code: 'healing-potion',
    name: 'Healing Potion',
    equipType: { id: 3, code: 'consumable', name: 'Consumable' },
    damageType: null,
    special: [],
  },
  5: {
    id: 5,
    code: 'backpack',
    name: 'Backpack',
    equipType: { id: 4, code: 'gear', name: 'Gear' },
    damageType: null,
    special: [],
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

const mockUpdateEquipment = vi.fn();
const mockRemoveEquipment = vi.fn();
const mockSaving = ref(false);

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get saving() {
      return mockSaving.value;
    },
    updateEquipment: mockUpdateEquipment,
    removeEquipment: mockRemoveEquipment,
  }),
}));

let dialogOkCallback: (() => void) | null = null;
const mockDialog = vi.fn(() => ({
  onOk: vi.fn((cb: () => void) => {
    dialogOkCallback = cb;
    return { onCancel: vi.fn() };
  }),
}));

vi.mock('quasar', () => ({
  useQuasar: () => ({
    dialog: mockDialog,
  }),
}));

const eqRef = (id: number) => {
  const eq = equipmentMap[id];
  return eq
    ? { id: eq.id, code: eq.code, name: eq.name }
    : { id, code: `e${id}`, name: `Equip${id}` };
};

describe('EquipmentItem', () => {
  const createWrapper = (heroEquipment: Partial<HeroEquipment>) =>
    shallowMount(EquipmentItem, {
      props: {
        heroEquipment: {
          id: 1,
          equipment: eqRef(1),
          special: [],
          charges: null,
          maxCharges: null,
          amount: 1,
          isEquipped: false,
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
          QBtn: {
            template:
              '<button class="q-btn-stub" :aria-label="$attrs[\'aria-label\']" :disabled="$attrs.disable" />',
          },
          QTooltip: {
            template: '<span class="q-tooltip-stub" />',
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaving.value = false;
    dialogOkCallback = null;
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
  });

  // ========================================
  // Quantity Badge
  // ========================================
  describe('amount display', () => {
    it('shows amount in controls', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        amount: 3,
      });

      expect(wrapper.text()).toContain('3');
    });

    it('shows amount of 1', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        amount: 1,
      });

      expect(wrapper.text()).toContain('1');
    });

    it('shows amount of 5', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        amount: 5,
      });

      expect(wrapper.text()).toContain('5');
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

      expect(wrapper.text()).toContain('Deflect 2');
    });

    it('shows charges for consumables', () => {
      const wrapper = createWrapper({
        equipment: eqRef(4),
        charges: 3,
        maxCharges: 3,
      });

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
  // Interactions
  // ========================================
  describe('interactions', () => {
    it('calls updateEquipment with increased amount on + click', async () => {
      const wrapper = createWrapper({ equipment: eqRef(1), amount: 3 });
      const increaseBtn = wrapper.find('button[aria-label="Increase amount"]');
      await increaseBtn.trigger('click');

      expect(mockUpdateEquipment).toHaveBeenCalledWith(1, { amount: 4 });
    });

    it('calls updateEquipment with decreased amount on - click', async () => {
      const wrapper = createWrapper({ equipment: eqRef(1), amount: 3 });
      const decreaseBtn = wrapper.find('button[aria-label="Decrease amount"]');
      await decreaseBtn.trigger('click');

      expect(mockUpdateEquipment).toHaveBeenCalledWith(1, { amount: 2 });
    });

    it('does not decrease amount below 1', async () => {
      const wrapper = createWrapper({ equipment: eqRef(1), amount: 1 });
      const decreaseBtn = wrapper.find('button[aria-label="Decrease amount"]');
      await decreaseBtn.trigger('click');

      expect(mockUpdateEquipment).not.toHaveBeenCalled();
    });

    it('calls updateEquipment to equip item', async () => {
      const wrapper = createWrapper({ equipment: eqRef(1), isEquipped: false });
      const equipBtn = wrapper.find('button[aria-label="Equip"]');
      await equipBtn.trigger('click');

      expect(mockUpdateEquipment).toHaveBeenCalledWith(1, { isEquipped: true });
    });

    it('calls updateEquipment to unequip item', async () => {
      const wrapper = createWrapper({ equipment: eqRef(1), isEquipped: true });
      const unequipBtn = wrapper.find('button[aria-label="Unequip"]');
      await unequipBtn.trigger('click');

      expect(mockUpdateEquipment).toHaveBeenCalledWith(1, { isEquipped: false });
    });

    it('opens confirmation dialog on remove click', async () => {
      const wrapper = createWrapper({ equipment: eqRef(1) });
      const removeBtn = wrapper.find('button[aria-label="Remove equipment"]');
      await removeBtn.trigger('click');

      expect(mockDialog).toHaveBeenCalled();
    });

    it('calls removeEquipment when dialog confirmed', async () => {
      const wrapper = createWrapper({ equipment: eqRef(1), id: 42 } as Partial<HeroEquipment>);
      const removeBtn = wrapper.find('button[aria-label="Remove equipment"]');
      await removeBtn.trigger('click');

      expect(dialogOkCallback).not.toBeNull();
      dialogOkCallback!();

      expect(mockRemoveEquipment).toHaveBeenCalledWith(42);
    });

    it('does not call removeEquipment when dialog not confirmed', async () => {
      const wrapper = createWrapper({ equipment: eqRef(1) });
      const removeBtn = wrapper.find('button[aria-label="Remove equipment"]');
      await removeBtn.trigger('click');

      // Don't call dialogOkCallback
      expect(mockRemoveEquipment).not.toHaveBeenCalled();
    });

    it('disables all action buttons when saving', () => {
      mockSaving.value = true;
      const wrapper = createWrapper({ equipment: eqRef(1), amount: 3 });

      const decreaseBtn = wrapper.find('button[aria-label="Decrease amount"]');
      const increaseBtn = wrapper.find('button[aria-label="Increase amount"]');
      const equipBtn = wrapper.find('button[aria-label="Equip"]');
      const removeBtn = wrapper.find('button[aria-label="Remove equipment"]');

      expect(decreaseBtn.attributes('disabled')).toBeDefined();
      expect(increaseBtn.attributes('disabled')).toBeDefined();
      expect(equipBtn.attributes('disabled')).toBeDefined();
      expect(removeBtn.attributes('disabled')).toBeDefined();
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles unknown equipment ID gracefully', () => {
      const wrapper = createWrapper({ equipment: eqRef(999) });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('img').exists()).toBe(false);
    });

    it('handles zero amount', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        amount: 0,
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('renders all badges and details together', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        isEquipped: true,
        amount: 2,
        notes: 'Special item',
      });

      expect(wrapper.text()).toContain('Equipped');
      expect(wrapper.text()).toContain('2');
      expect(wrapper.text()).toContain('Special item');
      expect(wrapper.text()).toContain('2d6');
    });
  });
});
