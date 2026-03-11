import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { computed, ref } from 'vue';
import EquipmentItem from './EquipmentItem.vue';
import type { Equipment, HeroEquipment } from 'src/types';

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
        attributes: [
          { id: 1, code: 'two_handed', name: 'Two-Handed', value: null, isExpert: false },
          { id: 2, code: 'deadly', name: 'Deadly', value: null, isExpert: false },
        ],
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
        attributes: [{ id: 3, code: 'cumbersome', name: 'Cumbersome', value: 5, isExpert: false }],
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
      {
        id: 6,
        code: 'expert-weapon',
        name: 'Expert Weapon',
        equipType: { id: 1, code: 'weapon', name: 'Weapon' },
        damageType: null,
        special: [],
        maxCharges: null,
        weight: 3,
        cost: 20,
        isCustom: false,
        attributes: [
          { id: 4, code: 'specialist', name: 'Specialist', value: null, isExpert: true },
        ],
        unit: null,
      },
    ],
    equipmentTypes: [
      { id: 1, code: 'weapon', name: 'Weapon', icon: 'weapon.svg' },
      { id: 2, code: 'armor', name: 'Armor', icon: 'armor.svg' },
      { id: 3, code: 'consumable', name: 'Consumable', icon: 'consumable.svg' },
      { id: 4, code: 'gear', name: 'Gear', icon: 'gear.svg' },
    ],
    equipmentAttributes: [
      {
        id: 1,
        code: 'two_handed',
        name: 'Two-Handed',
        description: 'Requires both hands to wield',
      },
      {
        id: 2,
        code: 'deadly',
        name: 'Deadly',
        description: 'Spend Opportunity to cause an injury on a hit',
      },
      {
        id: 3,
        code: 'cumbersome',
        name: 'Cumbersome',
        description: 'Requires STR >= value or Slowed',
      },
      {
        id: 4,
        code: 'specialist',
        name: 'Specialist',
        description: 'Requires expertise to use effectively',
      },
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
  6: {
    id: 6,
    code: 'expert-weapon',
    name: 'Expert Weapon',
    equipType: { id: 1, code: 'weapon', name: 'Weapon' },
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
  useEntityIcon: (entityIdRef: { value: number | undefined }) => {
    const entity = computed(() =>
      entityIdRef.value ? equipmentTypeMap[entityIdRef.value] : undefined
    );
    const iconUrl = computed(() =>
      entity.value?.icon ? `/icons/equipment/${entity.value.icon}` : ''
    );
    return { entity, iconUrl };
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
          equipType: { id: 1, code: 'weapon', name: 'Weapon' },
          special: [],
          specialOverrides: [],
          charges: null,
          maxCharges: null,
          amount: 1,
          isEquipped: false,
          customName: undefined,
          notes: undefined,
          modifications: [],
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
            template:
              '<span class="q-badge" :aria-label="$attrs[\'aria-label\']" :tabindex="$attrs.tabindex" :role="$attrs.role" :aria-haspopup="$attrs[\'aria-haspopup\']"><slot /></span>',
            props: ['color'],
          },
          QBtn: {
            template:
              '<button class="q-btn-stub" :aria-label="$attrs[\'aria-label\']" :disabled="$attrs.disable" />',
          },
          QTooltip: {
            template: '<span class="q-tooltip-stub" />',
          },
          QPopupProxy: {
            template: '<div class="q-popup-proxy-stub"><slot /></div>',
            props: ['breakpoint', 'offset'],
          },
          QBanner: {
            template: '<div class="q-banner-stub"><slot /></div>',
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
  // Amount Controls (stackable items only)
  // ========================================
  describe('amount display', () => {
    it('shows amount controls for stackable items', () => {
      const wrapper = createWrapper({
        equipment: eqRef(5),
        equipType: { id: 4, code: 'gear', name: 'Gear' },
        amount: 3,
      });

      expect(wrapper.text()).toContain('3');
      expect(wrapper.find('button[aria-label="Increase amount"]').exists()).toBe(true);
      expect(wrapper.find('button[aria-label="Decrease amount"]').exists()).toBe(true);
    });

    it('hides amount controls for weapons', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        equipType: { id: 1, code: 'weapon', name: 'Weapon' },
      });

      expect(wrapper.find('button[aria-label="Increase amount"]').exists()).toBe(false);
      expect(wrapper.find('button[aria-label="Decrease amount"]').exists()).toBe(false);
    });

    it('hides amount controls for armor', () => {
      const wrapper = createWrapper({
        equipment: eqRef(3),
        equipType: { id: 2, code: 'armor', name: 'Armor' },
      });

      expect(wrapper.find('button[aria-label="Increase amount"]').exists()).toBe(false);
      expect(wrapper.find('button[aria-label="Decrease amount"]').exists()).toBe(false);
    });

    it('shows amount controls for consumables', () => {
      const wrapper = createWrapper({
        equipment: eqRef(4),
        equipType: { id: 3, code: 'consumable', name: 'Consumable' },
        amount: 5,
      });

      expect(wrapper.text()).toContain('5');
      expect(wrapper.find('button[aria-label="Increase amount"]').exists()).toBe(true);
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

    it('shows partial charges for consumables', () => {
      const wrapper = createWrapper({
        equipment: eqRef(4),
        charges: 1,
        maxCharges: 3,
      });

      expect(wrapper.text()).toContain('1/3 charges');
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
      const wrapper = createWrapper({
        equipment: eqRef(5),
        equipType: { id: 4, code: 'gear', name: 'Gear' },
        amount: 3,
      });
      const increaseBtn = wrapper.find('button[aria-label="Increase amount"]');
      await increaseBtn.trigger('click');

      expect(mockUpdateEquipment).toHaveBeenCalledWith(1, { amount: 4 });
    });

    it('calls updateEquipment with decreased amount on - click', async () => {
      const wrapper = createWrapper({
        equipment: eqRef(5),
        equipType: { id: 4, code: 'gear', name: 'Gear' },
        amount: 3,
      });
      const decreaseBtn = wrapper.find('button[aria-label="Decrease amount"]');
      await decreaseBtn.trigger('click');

      expect(mockUpdateEquipment).toHaveBeenCalledWith(1, { amount: 2 });
    });

    it('does not decrease amount below 1', async () => {
      const wrapper = createWrapper({
        equipment: eqRef(5),
        equipType: { id: 4, code: 'gear', name: 'Gear' },
        amount: 1,
      });
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
      const wrapper = createWrapper({
        equipment: eqRef(5),
        equipType: { id: 4, code: 'gear', name: 'Gear' },
        amount: 3,
      });

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
  // Charge Controls
  // ========================================
  describe('charge controls', () => {
    it('renders charge +/- buttons when item has maxCharges', () => {
      const wrapper = createWrapper({
        equipment: eqRef(4),
        equipType: { id: 3, code: 'consumable', name: 'Consumable' },
        charges: 2,
        maxCharges: 3,
      });

      expect(wrapper.find('button[aria-label="Increase charges"]').exists()).toBe(true);
      expect(wrapper.find('button[aria-label="Decrease charges"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('2/3 charges');
    });

    it('hides charge buttons when maxCharges is null', () => {
      const wrapper = createWrapper({ equipment: eqRef(1) });

      expect(wrapper.find('button[aria-label="Increase charges"]').exists()).toBe(false);
      expect(wrapper.find('button[aria-label="Decrease charges"]').exists()).toBe(false);
    });

    it('increments charges on + click', async () => {
      const wrapper = createWrapper({
        equipment: eqRef(4),
        equipType: { id: 3, code: 'consumable', name: 'Consumable' },
        charges: 1,
        maxCharges: 3,
      });
      await wrapper.find('button[aria-label="Increase charges"]').trigger('click');

      expect(mockUpdateEquipment).toHaveBeenCalledWith(1, { charges: 2 });
    });

    it('decrements charges on - click', async () => {
      const wrapper = createWrapper({
        equipment: eqRef(4),
        equipType: { id: 3, code: 'consumable', name: 'Consumable' },
        charges: 2,
        maxCharges: 3,
      });
      await wrapper.find('button[aria-label="Decrease charges"]').trigger('click');

      expect(mockUpdateEquipment).toHaveBeenCalledWith(1, { charges: 1 });
    });

    it('disables + at maxCharges', () => {
      const wrapper = createWrapper({
        equipment: eqRef(4),
        equipType: { id: 3, code: 'consumable', name: 'Consumable' },
        charges: 3,
        maxCharges: 3,
      });

      expect(
        wrapper.find('button[aria-label="Increase charges"]').attributes('disabled')
      ).toBeDefined();
    });

    it('disables - at 0', () => {
      const wrapper = createWrapper({
        equipment: eqRef(4),
        equipType: { id: 3, code: 'consumable', name: 'Consumable' },
        charges: 0,
        maxCharges: 3,
      });

      expect(
        wrapper.find('button[aria-label="Decrease charges"]').attributes('disabled')
      ).toBeDefined();
    });
  });

  // ========================================
  // Modifications Display & Edit
  // ========================================
  describe('modifications', () => {
    it('renders upgrade modifications with positive prefix', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        modifications: [
          {
            id: 1,
            modType: 'upgrade',
            modification: { id: 10, code: 'keen_edge', name: 'Keen Edge' },
            special: [],
            customText: null,
          },
        ],
      });

      expect(wrapper.text()).toContain('+ Keen Edge');
    });

    it('renders drawback modifications with negative prefix', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        modifications: [
          {
            id: 2,
            modType: 'drawback',
            modification: { id: 11, code: 'heavy', name: 'Heavy' },
            special: [],
            customText: null,
          },
        ],
      });

      expect(wrapper.text()).toContain('- Heavy');
    });

    it('renders multiple modifications', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        modifications: [
          {
            id: 1,
            modType: 'upgrade',
            modification: { id: 10, code: 'keen_edge', name: 'Keen Edge' },
            special: [],
            customText: null,
          },
          {
            id: 2,
            modType: 'drawback',
            modification: { id: 11, code: 'heavy', name: 'Heavy' },
            special: [],
            customText: null,
          },
        ],
      });

      expect(wrapper.text()).toContain('+ Keen Edge');
      expect(wrapper.text()).toContain('- Heavy');
    });

    it('renders nothing when modifications is empty', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        modifications: [],
      });

      expect(wrapper.text()).not.toContain('+ ');
      expect(wrapper.text()).not.toContain('- ');
    });

    it('does not show modification editing controls (moved to dialog)', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        modifications: [
          {
            id: 1,
            modType: 'upgrade',
            modification: { id: 10, code: 'keen_edge', name: 'Keen Edge' },
            special: [],
            customText: null,
          },
        ],
      });

      expect(wrapper.find('button[aria-label="Remove modification"]').exists()).toBe(false);
      expect(wrapper.find('button[aria-label="Add modification"]').exists()).toBe(false);
    });
  });

  // ========================================
  // Edit Button & Display Name
  // ========================================
  describe('edit button', () => {
    it('shows edit button next to equipment name', () => {
      const wrapper = createWrapper({ equipment: eqRef(1) });

      expect(wrapper.find('button[aria-label="Edit equipment"]').exists()).toBe(true);
    });

    it('emits edit event when edit button clicked', async () => {
      const wrapper = createWrapper({ equipment: eqRef(1) });

      await wrapper.find('button[aria-label="Edit equipment"]').trigger('click');

      expect(wrapper.emitted('edit')).toHaveLength(1);
    });

    it('displays customName when set', () => {
      const wrapper = createWrapper({
        equipment: eqRef(1),
        customName: 'Stormbreaker',
      });

      expect(wrapper.text()).toContain('Stormbreaker');
    });

    it('displays equipment name when customName is not set', () => {
      const wrapper = createWrapper({ equipment: eqRef(1) });

      expect(wrapper.text()).toContain('Longsword');
    });

    it('displays Custom Item when no equipment and no customName', () => {
      const wrapper = createWrapper({
        equipment: null,
        equipType: { id: 1, code: 'weapon', name: 'Weapon' },
      });

      expect(wrapper.text()).toContain('Custom Item');
    });
  });

  // ========================================
  // Trait Badges
  // ========================================
  describe('trait badges', () => {
    it('renders trait badges for equipment with attributes', () => {
      const wrapper = createWrapper({ equipment: eqRef(1) });

      expect(wrapper.text()).toContain('Two-Handed');
      expect(wrapper.text()).toContain('Deadly');
    });

    it('shows value in brackets for parameterized traits', () => {
      const wrapper = createWrapper({
        equipment: eqRef(3),
        equipType: { id: 2, code: 'armor', name: 'Armor' },
      });

      expect(wrapper.text()).toContain('Cumbersome [5]');
    });

    it('shows Expert indicator for isExpert traits', () => {
      const wrapper = createWrapper({
        equipment: eqRef(6),
        equipType: { id: 1, code: 'weapon', name: 'Weapon' },
      });

      expect(wrapper.text()).toContain('Specialist (Expert)');
    });

    it('does not render trait badges when attributes is empty', () => {
      const wrapper = createWrapper({ equipment: eqRef(2) });

      // Longbow has no attributes
      expect(wrapper.text()).not.toContain('Two-Handed');
      expect(wrapper.text()).not.toContain('Deadly');
      expect(wrapper.text()).not.toContain('Cumbersome');
    });

    it('does not render trait badges for custom items', () => {
      const wrapper = createWrapper({
        equipment: null,
        equipType: { id: 1, code: 'weapon', name: 'Weapon' },
      });

      expect(wrapper.text()).not.toContain('Two-Handed');
      expect(wrapper.text()).not.toContain('Deadly');
    });

    it('renders popup with breakpoint=0 and offset for traits with descriptions', () => {
      const wrapper = createWrapper({ equipment: eqRef(1) });

      const popups = wrapper.findAll('.q-popup-proxy-stub');
      expect(popups.length).toBeGreaterThan(0);

      // Verify popup contains description text
      expect(popups[0]!.text()).toContain('Requires both hands to wield');
    });

    it('renders popup description for traits with descriptions', () => {
      const wrapper = createWrapper({ equipment: eqRef(3) }); // chain-mail with cumbersome

      const popups = wrapper.findAll('.q-popup-proxy-stub');
      const banners = wrapper.findAll('.q-banner-stub');

      // Cumbersome has a description in equipmentAttributes store, so popup should render
      expect(popups).toHaveLength(1);
      expect(banners).toHaveLength(1);
      expect(banners[0]!.text()).toContain('Requires STR >= value or Slowed');
    });

    it('adds keyboard accessibility attributes to traits with descriptions', () => {
      const wrapper = createWrapper({ equipment: eqRef(1) });

      const badges = wrapper.findAll('.q-badge');
      const traitBadge = badges.find((b) => b.text().includes('Two-Handed'));
      expect(traitBadge).toBeDefined();
      expect(traitBadge!.attributes('tabindex')).toBe('0');
      expect(traitBadge!.attributes('role')).toBe('button');
      expect(traitBadge!.attributes('aria-haspopup')).toBe('dialog');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles unknown equipment ID gracefully', () => {
      const wrapper = createWrapper({ equipment: eqRef(999) });

      expect(wrapper.exists()).toBe(true);
      // Icon still renders via equipType (resolved independently of equipment)
      expect(wrapper.find('img').exists()).toBe(true);
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
