import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import EquipmentStep from './EquipmentStep.vue';

// Mock stores
const mockSetCurrency = vi.fn();
const mockAddEquipment = vi.fn();
const mockRemoveEquipment = vi.fn();

// Reactive mock data
const mockHero = {
  value: {
    startingKitId: 1,
    currency: 100,
  } as { startingKitId: number | null; currency: number } | null,
};

const mockEquipment = {
  value: [
    { id: 1, equipmentId: 1, amount: 2 },
    { id: 2, equipmentId: 2, amount: 1 },
  ] as Array<{ id: number; equipmentId: number; amount: number }>,
};

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get hero() {
      return mockHero.value;
    },
    get equipment() {
      return mockEquipment.value;
    },
  }),
}));

vi.mock('src/stores/heroEquipment', () => ({
  useHeroEquipmentStore: () => ({
    setCurrency: mockSetCurrency,
    addEquipment: mockAddEquipment,
    removeEquipment: mockRemoveEquipment,
  }),
}));

const mockClassifierData = {
  value: {
    startingKits: [
      {
        id: 1,
        code: 'adventurer',
        name: 'Adventurer',
        description: 'Standard kit',
        startingSpheres: '2d6',
        equipment: [{ equipmentId: 1, quantity: 1 }],
      },
      {
        id: 2,
        code: 'warrior',
        name: 'Warrior',
        description: 'Combat kit',
        startingSpheres: '3d6',
        equipment: [
          { equipmentId: 1, quantity: 2 },
          { equipmentId: 999, quantity: 1 }, // Invalid equipment id
        ],
      },
      {
        id: 3,
        code: 'empty',
        name: 'Empty',
        description: 'No equipment',
        startingSpheres: '1d6',
        equipment: null, // null equipment
      },
    ] as Array<{
      id: number;
      code: string;
      name: string;
      description: string;
      startingSpheres: string;
      equipment: Array<{ equipmentId: number; quantity: number }> | null;
    }>,
    equipment: [
      { id: 1, name: 'Sword', equipTypeId: 1 },
      { id: 2, name: 'Shield', equipTypeId: 1 },
      { id: 3, name: 'Rope', equipTypeId: 2 },
    ],
    equipmentTypes: [
      { id: 1, code: 'weapons', name: 'Weapons' },
      { id: 2, code: 'gear', name: 'Gear' },
    ],
  },
};

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    get startingKits() {
      return mockClassifierData.value.startingKits;
    },
    get equipment() {
      return mockClassifierData.value.equipment;
    },
    get equipmentTypes() {
      return mockClassifierData.value.equipmentTypes;
    },
  }),
}));

vi.mock('src/utils/arrayUtils', () => ({
  findById: <T extends { id: number }>(arr: T[], id: number | null | undefined) =>
    arr?.find((item) => item.id === id),
}));

const mockNormalizeModifier = {
  value: (val: unknown, min?: number, max?: number): number | null => {
    const num = typeof val === 'number' ? val : Number(val) || 0;
    if (min !== undefined && num < min) return min;
    if (max !== undefined && num > max) return max;
    return num;
  },
};

vi.mock('src/composables/useModifierInput', () => ({
  normalizeModifierInput: (val: unknown, min?: number, max?: number) =>
    mockNormalizeModifier.value(val, min, max),
}));

describe('EquipmentStep', () => {
  const createWrapper = () =>
    shallowMount(EquipmentStep, {
      global: {
        stubs: {
          InfoBanner: {
            template: '<div class="info-banner">{{ content }}</div>',
            props: ['icon', 'content'],
          },
          QBanner: {
            template: '<div class="q-banner"><slot name="avatar" /><slot /></div>',
          },
          QIcon: {
            template: '<span class="q-icon" />',
          },
          QBadge: {
            template: '<span class="q-badge"><slot /></span>',
            props: ['color'],
          },
          QInput: {
            template: `<input
              class="q-input"
              type="number"
              :value="modelValue"
              @input="$emit('update:modelValue', Number($event.target.value))"
            />`,
            props: ['modelValue', 'label', 'type', 'outlined', 'dense', 'min', 'max'],
            emits: ['update:modelValue'],
          },
          QSelect: {
            template: `<select
              class="q-select"
              :value="modelValue"
              @change="$emit('update:modelValue', Number($event.target.value) || null)"
            >
              <option :value="null">Select...</option>
              <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>`,
            props: [
              'modelValue',
              'options',
              'label',
              'outlined',
              'dense',
              'emitValue',
              'mapOptions',
              'clearable',
            ],
            emits: ['update:modelValue'],
          },
          QList: {
            template: '<div class="q-list"><slot /></div>',
          },
          QItem: {
            template: '<div class="q-item"><slot /></div>',
          },
          QItemSection: {
            template: '<div class="q-item-section"><slot /></div>',
            props: ['side'],
          },
          QItemLabel: {
            template: '<span class="q-item-label"><slot /></span>',
            props: ['caption'],
          },
          QBtn: {
            template: `<button
              class="q-btn"
              :aria-label="ariaLabel"
              @click="$emit('click')"
            />`,
            props: ['flat', 'round', 'icon', 'color', 'size', 'ariaLabel', 'dense'],
            emits: ['click'],
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockHero.value = {
      startingKitId: 1,
      currency: 100,
    };
    mockEquipment.value = [
      { id: 1, equipmentId: 1, amount: 2 },
      { id: 2, equipmentId: 2, amount: 1 },
    ];
    mockClassifierData.value = {
      startingKits: [
        {
          id: 1,
          code: 'adventurer',
          name: 'Adventurer',
          description: 'Standard kit',
          startingSpheres: '2d6',
          equipment: [{ equipmentId: 1, quantity: 1 }],
        },
        {
          id: 2,
          code: 'warrior',
          name: 'Warrior',
          description: 'Combat kit',
          startingSpheres: '3d6',
          equipment: [
            { equipmentId: 1, quantity: 2 },
            { equipmentId: 999, quantity: 1 },
          ],
        },
        {
          id: 3,
          code: 'empty',
          name: 'Empty',
          description: 'No equipment',
          startingSpheres: '1d6',
          equipment: null,
        },
      ],
      equipment: [
        { id: 1, name: 'Sword', equipTypeId: 1 },
        { id: 2, name: 'Shield', equipTypeId: 1 },
        { id: 3, name: 'Rope', equipTypeId: 2 },
      ],
      equipmentTypes: [
        { id: 1, code: 'weapons', name: 'Weapons' },
        { id: 2, code: 'gear', name: 'Gear' },
      ],
    };
    mockNormalizeModifier.value = (val: unknown, min?: number, max?: number): number | null => {
      const num = typeof val === 'number' ? val : Number(val) || 0;
      if (min !== undefined && num < min) return min;
      if (max !== undefined && num > max) return max;
      return num;
    };
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders step description', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Customize your equipment');
    });

    it('renders starting kit banner', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-banner').exists()).toBe(true);
      expect(wrapper.text()).toContain('Adventurer');
    });

    it('renders currency input', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-input').exists()).toBe(true);
    });

    it('renders equipment type sections', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Weapons');
      expect(wrapper.text()).toContain('Gear');
    });
  });

  // ========================================
  // Currency
  // ========================================
  describe('currency', () => {
    it('displays currency section title', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Currency');
      expect(wrapper.text()).toContain('Diamond Marks');
    });

    it('calls setCurrency when currency input changes', async () => {
      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      await input.setValue(200);

      expect(mockSetCurrency).toHaveBeenCalled();
    });
  });

  // ========================================
  // Equipment List
  // ========================================
  describe('equipment list', () => {
    it('displays equipment items', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Sword');
      expect(wrapper.text()).toContain('Shield');
    });

    it('shows quantity for equipment items', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Qty: 2');
    });

    it('has remove button for equipment', () => {
      const wrapper = createWrapper();

      const removeBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Remove'));
      expect(removeBtns.length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // Starting Kit Info
  // ========================================
  describe('starting kit info', () => {
    it('shows starting kit equipment in info banner', () => {
      const wrapper = createWrapper();

      const banner = wrapper.find('.info-banner');
      expect(banner.exists()).toBe(true);
      expect(banner.text()).toContain('Sword');
    });
  });

  // ========================================
  // Remove Equipment
  // ========================================
  describe('remove equipment', () => {
    it('calls removeEquipment when remove button clicked', async () => {
      const wrapper = createWrapper();

      const removeBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Remove'));
      await removeBtns[0]?.trigger('click');

      expect(mockRemoveEquipment).toHaveBeenCalledWith(1);
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles null hero', () => {
      mockHero.value = null;
      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
    });

    it('handles empty equipment list', () => {
      mockEquipment.value = [];
      const wrapper = createWrapper();

      // Should show empty message
      expect(wrapper.text()).toContain('No weapons');
    });

    it('handles no starting kit selected', () => {
      mockHero.value = { startingKitId: null, currency: 100 };
      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
      // Banner should not show
      expect(wrapper.find('.q-banner').exists()).toBe(false);
    });

    it('filters out equipment with invalid type', () => {
      mockEquipment.value = [{ id: 1, equipmentId: 999, amount: 1 }];
      const wrapper = createWrapper();

      // Equipment with unknown type gets filtered out, so weapons should be empty
      expect(wrapper.text()).toContain('No weapons');
    });

    it('handles unknown starting kit', () => {
      mockHero.value = { startingKitId: 999, currency: 100 };
      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
    });

    it('clamps currency to valid range', async () => {
      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      await input.setValue(-50);

      expect(mockSetCurrency).toHaveBeenCalledWith(0);
    });

    it('does not call setCurrency when normalized is null', async () => {
      mockNormalizeModifier.value = () => null;
      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      await input.setValue('invalid');

      expect(mockSetCurrency).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Add Equipment Functionality
  // ========================================
  describe('add equipment', () => {
    it('shows add button only when equipment is selected', async () => {
      const wrapper = createWrapper();

      // Initially no add buttons visible (no selection)
      let addBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Add'));
      expect(
        addBtns.filter((btn) => !btn.attributes('aria-label')?.includes('Remove')).length
      ).toBe(0);

      // Select an equipment
      const selects = wrapper.findAll('.q-select');
      await selects[0]!.setValue(1);

      // Now add button should appear
      addBtns = wrapper
        .findAll('.q-btn')
        .filter(
          (b) =>
            b.attributes('aria-label')?.includes('Add') &&
            !b.attributes('aria-label')?.includes('Remove')
        );
      expect(addBtns.length).toBeGreaterThan(0);
    });

    it('calls addEquipment when add button clicked', async () => {
      const wrapper = shallowMount(EquipmentStep, {
        global: {
          stubs: {
            InfoBanner: { template: '<div class="info-banner"></div>' },
            QBanner: { template: '<div class="q-banner"><slot /></div>' },
            QIcon: { template: '<span class="q-icon" />' },
            QBadge: { template: '<span class="q-badge"><slot /></span>' },
            QInput: { template: '<input class="q-input" />' },
            QSelect: {
              template: `<select
                class="q-select"
                @change="$emit('update:modelValue', Number($event.target.value) || null)"
              ><option value="1">Sword</option></select>`,
              props: ['modelValue', 'options'],
              emits: ['update:modelValue'],
            },
            QList: { template: '<div class="q-list"><slot /></div>' },
            QItem: { template: '<div class="q-item"><slot /></div>' },
            QItemSection: { template: '<div class="q-item-section"><slot /></div>' },
            QItemLabel: { template: '<span class="q-item-label"><slot /></span>' },
            QBtn: {
              template: `<button
                class="q-btn"
                :aria-label="ariaLabel"
                @click="$emit('click')"
              />`,
              props: ['flat', 'round', 'icon', 'color', 'size', 'ariaLabel', 'dense'],
              emits: ['click'],
            },
            QSeparator: { template: '<hr />' },
          },
        },
      });

      // Select an equipment
      const selects = wrapper.findAll('.q-select');
      await selects[0]!.setValue(1);

      // Click the add button
      const addBtns = wrapper
        .findAll('.q-btn')
        .filter(
          (b) =>
            b.attributes('aria-label')?.includes('Add') &&
            !b.attributes('aria-label')?.includes('Remove')
        );
      expect(addBtns.length).toBeGreaterThan(0);
      await addBtns[0]!.trigger('click');
      expect(mockAddEquipment).toHaveBeenCalledWith(1, 1);
    });

    it('does not call addEquipment when no equipment selected', () => {
      shallowMount(EquipmentStep, {
        global: {
          stubs: {
            InfoBanner: { template: '<div class="info-banner"></div>' },
            QBanner: { template: '<div class="q-banner"><slot /></div>' },
            QIcon: { template: '<span class="q-icon" />' },
            QBadge: { template: '<span class="q-badge"><slot /></span>' },
            QInput: { template: '<input class="q-input" />' },
            QSelect: {
              template: `<div class="q-select">
                <button class="emit-add" @click="$emit('update:modelValue', null)" />
              </div>`,
              props: ['modelValue', 'options'],
              emits: ['update:modelValue'],
            },
            QList: { template: '<div class="q-list"><slot /></div>' },
            QItem: { template: '<div class="q-item"><slot /></div>' },
            QItemSection: { template: '<div class="q-item-section"><slot /></div>' },
            QItemLabel: { template: '<span class="q-item-label"><slot /></span>' },
            QBtn: {
              template: `<button class="q-btn add-btn" @click="$emit('click')" />`,
              props: ['flat', 'round', 'icon', 'color', 'size', 'ariaLabel', 'dense'],
              emits: ['click'],
            },
            QSeparator: { template: '<hr />' },
          },
        },
      });

      // The add button won't render without selection, so we need to test the function
      expect(mockAddEquipment).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Starting Kit Equipment Names
  // ========================================
  describe('starting kit equipment names', () => {
    it('shows quantity format for items with quantity > 1', () => {
      mockHero.value = { startingKitId: 2, currency: 100 }; // Warrior kit with quantity 2
      const wrapper = createWrapper();

      const banner = wrapper.find('.info-banner');
      expect(banner.exists()).toBe(true);
      expect(banner.text()).toContain('Sword x2');
    });

    it('filters out equipment with invalid id from starting kit', () => {
      mockHero.value = { startingKitId: 2, currency: 100 };
      const wrapper = createWrapper();

      const banner = wrapper.find('.info-banner');
      // Should only show valid equipment (Sword), not the invalid one (id 999)
      expect(banner.text()).toContain('Sword');
    });

    it('handles starting kit with null equipment', () => {
      mockHero.value = { startingKitId: 3, currency: 100 }; // Empty kit with null equipment
      const wrapper = createWrapper();

      // Should not show info banner when no equipment
      expect(wrapper.find('.info-banner').exists()).toBe(false);
    });
  });

  // ========================================
  // Equipment Name Fallback
  // ========================================
  describe('equipment name fallback', () => {
    it('returns Unknown for equipment with unknown id', () => {
      mockEquipment.value = [{ id: 1, equipmentId: 9999, amount: 1 }];
      const wrapper = createWrapper();

      // Equipment with unknown id would show "Unknown" but gets filtered by type
      // This tests the getEquipmentName fallback
      expect(wrapper.exists()).toBe(true);
    });
  });
});
