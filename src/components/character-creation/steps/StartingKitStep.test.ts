import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import StartingKitStep from './StartingKitStep.vue';

// Mock stores
const mockSetStartingKit = vi.fn();
const mockSetCurrency = vi.fn();

// Reactive mock data
const mockHero = {
  value: {
    startingKit: { id: 1, code: 'adventurer', name: 'Adventurer' },
    currency: 10,
  } as {
    startingKit: { id: number; code: string; name: string } | null;
    currency: number;
  } | null,
};

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get hero() {
      if (!mockHero.value) return null;
      return {
        ...mockHero.value,
        equipment: [],
        expertises: [],
      };
    },
  }),
}));

vi.mock('src/stores/heroEquipment', () => ({
  useHeroEquipmentStore: () => ({
    setStartingKit: mockSetStartingKit,
    setCurrency: mockSetCurrency,
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
        equipment: [{ id: 1, code: 'sword', name: 'Sword', quantity: 1 }],
        expertises: [],
      },
      {
        id: 2,
        code: 'prisoner',
        name: 'Prisoner',
        description: 'For bondsmith',
        startingSpheres: '0',
        equipment: [],
        expertises: [],
      },
      {
        id: 3,
        code: 'scholar',
        name: 'Scholar',
        description: 'Academic start',
        startingSpheres: '1d6',
        equipment: [{ id: 2, code: 'book', name: 'Book', quantity: 2 }],
        expertises: [{ id: 1, code: 'vorin-customs', name: 'Vorin Customs' }],
      },
      {
        id: 4,
        code: 'mystery',
        name: 'Mystery',
        description: 'Mysterious kit',
        startingSpheres: '1d6',
        equipment: [
          { id: 1, code: 'sword', name: 'Sword', quantity: 1 },
          { id: 999, code: 'unknown', name: 'Unknown', quantity: 1 }, // Invalid equipment
        ],
        expertises: [],
      },
    ],
    equipment: [
      { id: 1, code: 'sword', name: 'Sword' },
      { id: 2, code: 'book', name: 'Book' },
    ],
    expertises: [{ id: 1, code: 'vorin-customs', name: 'Vorin Customs' }],
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
    get expertises() {
      return mockClassifierData.value.expertises;
    },
  }),
}));

vi.mock('src/utils/arrayUtils', () => ({
  findById: <T extends { id: number }>(arr: T[], id: number | null | undefined) =>
    arr?.find((item) => item.id === id),
  findByCode: <T extends { code: string }>(arr: T[], code: string) =>
    arr?.find((item) => item.code === code),
}));

vi.mock('src/constants/theme', () => ({
  RPG_COLORS: {
    bannerInfo: 'info',
    bannerInfoIcon: 'info',
  },
}));

describe('StartingKitStep', () => {
  const mockDeletionTracker = {
    trackDeletion: vi.fn(),
    getDeletions: vi.fn(() => []),
    clearDeletions: vi.fn(),
    clearAll: vi.fn(),
  };

  const createWrapper = () =>
    shallowMount(StartingKitStep, {
      global: {
        provide: {
          deletionTracker: mockDeletionTracker,
        },
        stubs: {
          StartingKitSelectionDialog: {
            template: `<div class="kit-selection-dialog" v-if="modelValue">
              <button class="emit-select-2" @click="$emit('select', 2)">Select2</button>
              <button class="emit-select-3" @click="$emit('select', 3)">Select3</button>
            </div>`,
            props: ['modelValue', 'selectedKitId'],
            emits: ['update:modelValue', 'select'],
          },
          QBtn: {
            template:
              '<button class="q-btn" @click="$emit(\'click\')"><slot />{{ label }}</button>',
            props: ['label', 'icon', 'outline', 'color'],
            emits: ['click'],
          },
          QCard: {
            template: '<div class="q-card" :class="$attrs.class"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QIcon: {
            template: '<span class="q-icon" />',
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
          QInput: {
            template: `<input
              class="q-input"
              type="number"
              :value="modelValue"
              @input="$emit('update:modelValue', $event.target.value)"
            />`,
            props: ['modelValue', 'type', 'label', 'hint', 'outlined', 'dense', 'min', 'max'],
            emits: ['update:modelValue'],
          },
          QBanner: {
            template: '<div class="q-banner"><slot name="avatar" /><slot /></div>',
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockHero.value = {
      startingKit: { id: 1, code: 'adventurer', name: 'Adventurer' },
      currency: 10,
    };
    mockClassifierData.value = {
      startingKits: [
        {
          id: 1,
          code: 'adventurer',
          name: 'Adventurer',
          description: 'Standard kit',
          startingSpheres: '2d6',
          equipment: [{ id: 1, code: 'sword', name: 'Sword', quantity: 1 }],
          expertises: [],
        },
        {
          id: 2,
          code: 'prisoner',
          name: 'Prisoner',
          description: 'For bondsmith',
          startingSpheres: '0',
          equipment: [],
          expertises: [],
        },
        {
          id: 3,
          code: 'scholar',
          name: 'Scholar',
          description: 'Academic start',
          startingSpheres: '1d6',
          equipment: [{ id: 2, code: 'book', name: 'Book', quantity: 2 }],
          expertises: [{ id: 1, code: 'vorin-customs', name: 'Vorin Customs' }],
        },
        {
          id: 4,
          code: 'mystery',
          name: 'Mystery',
          description: 'Mysterious kit',
          startingSpheres: '1d6',
          equipment: [
            { id: 1, code: 'sword', name: 'Sword', quantity: 1 },
            { id: 999, code: 'unknown', name: 'Unknown', quantity: 1 },
          ],
          expertises: [],
        },
      ],
      equipment: [
        { id: 1, code: 'sword', name: 'Sword' },
        { id: 2, code: 'book', name: 'Book' },
      ],
      expertises: [{ id: 1, code: 'vorin-customs', name: 'Vorin Customs' }],
    };
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders step title', () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Choose Starting Kit');
    });

    it('shows Change button when kit is selected', () => {
      const wrapper = createWrapper();
      const btn = wrapper.find('.q-btn');
      expect(btn.text()).toContain('Change Starting Kit');
    });

    it('shows Choose button when no kit is selected', () => {
      mockHero.value = { startingKit: null, currency: 0 };
      const wrapper = createWrapper();
      const btn = wrapper.find('.q-btn');
      expect(btn.text()).toContain('Choose Starting Kit');
    });

    it('shows detail panel when kit is selected', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.q-card').exists()).toBe(true);
      expect(wrapper.text()).toContain('Adventurer');
      expect(wrapper.text()).toContain('Standard kit');
    });

    it('does not show detail panel when no kit is selected', () => {
      mockHero.value = { startingKit: null, currency: 0 };
      const wrapper = createWrapper();
      expect(wrapper.find('.q-card').exists()).toBe(false);
    });
  });

  // ========================================
  // Kit Selection via Dialog
  // ========================================
  describe('kit selection', () => {
    it('opens dialog when button is clicked', async () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.kit-selection-dialog').exists()).toBe(false);

      await wrapper.find('.q-btn').trigger('click');
      expect(wrapper.find('.kit-selection-dialog').exists()).toBe(true);
    });

    it('calls setStartingKit when dialog emits select', async () => {
      const wrapper = createWrapper();
      await wrapper.find('.q-btn').trigger('click');
      await wrapper.find('.kit-selection-dialog .emit-select-2').trigger('click');

      expect(mockSetStartingKit).toHaveBeenCalledWith(2);
    });
  });

  // ========================================
  // Currency Input
  // ========================================
  describe('currency input', () => {
    it('shows currency input for selected kit', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.q-input').exists()).toBe(true);
    });

    it('updates currency when input changes', async () => {
      const wrapper = createWrapper();
      const input = wrapper.find('.q-input');
      await input.setValue(20);
      expect(mockSetCurrency).toHaveBeenCalledWith(20);
    });
  });

  // ========================================
  // Equipment Summary
  // ========================================
  describe('equipment summary', () => {
    it('shows equipment from selected kit', () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Sword');
    });

    it('shows no equipment message for kit without equipment', () => {
      mockHero.value = { startingKit: { id: 2, code: 'prisoner', name: 'Prisoner' }, currency: 0 };
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('No equipment');
    });
  });

  // ========================================
  // Prisoner Kit Banner
  // ========================================
  describe('prisoner kit banner', () => {
    it('does not show prisoner banner when adventurer kit selected', () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).not.toContain('Prisoner Kit Special');
    });

    it('shows prisoner banner when prisoner kit is selected', () => {
      mockHero.value = { startingKit: { id: 2, code: 'prisoner', name: 'Prisoner' }, currency: 0 };
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Prisoner Kit Special');
      expect(wrapper.text()).toContain('Radiant spren');
    });

    it('shows no starting currency message for prisoner kit', () => {
      mockHero.value = { startingKit: { id: 2, code: 'prisoner', name: 'Prisoner' }, currency: 0 };
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('No starting currency');
    });
  });

  // ========================================
  // Expertise Display
  // ========================================
  describe('expertise display', () => {
    it('shows expertise for kits that grant one', () => {
      mockHero.value = { startingKit: { id: 3, code: 'scholar', name: 'Scholar' }, currency: 5 };
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Vorin Customs');
      expect(wrapper.text()).toContain('+1');
    });

    it('does not show expertise section for kit without expertises', () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).not.toContain('Vorin Customs');
    });
  });

  // ========================================
  // Equipment Summary Extended
  // ========================================
  describe('equipment summary extended', () => {
    it('shows quantity when equipment has multiple items', () => {
      mockHero.value = { startingKit: { id: 3, code: 'scholar', name: 'Scholar' }, currency: 5 };
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Book x2');
    });

    it('filters out equipment with invalid equipmentId from summary', () => {
      mockHero.value = { startingKit: { id: 4, code: 'mystery', name: 'Mystery' }, currency: 5 };
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Sword');
      // Equipment id 999 doesn't exist in classifiers -- should be filtered out
      expect(wrapper.text()).not.toContain('Unknown');
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

    it('handles no kit selected', () => {
      mockHero.value = { startingKit: null, currency: 0 };
      const wrapper = createWrapper();
      expect(wrapper.find('.q-card').exists()).toBe(false);
      expect(wrapper.find('.q-input').exists()).toBe(false);
    });

    it('handles empty string currency input', async () => {
      const wrapper = createWrapper();
      const input = wrapper.find('.q-input');
      await input.setValue('');
      expect(mockSetCurrency).toHaveBeenCalledWith(0);
    });

    it('clamps currency to max value', async () => {
      const wrapper = createWrapper();
      const input = wrapper.find('.q-input');
      await input.setValue(1000001);
      expect(mockSetCurrency).toHaveBeenCalledWith(999999);
    });

    it('clamps currency to min value', async () => {
      const wrapper = createWrapper();
      const input = wrapper.find('.q-input');
      await input.setValue(-10);
      expect(mockSetCurrency).toHaveBeenCalledWith(0);
    });

    it('handles null currency input', async () => {
      const wrapper = shallowMount(StartingKitStep, {
        global: {
          stubs: {
            StartingKitSelectionDialog: { template: '<div />' },
            QBtn: { template: '<button />' },
            QCard: { template: '<div class="q-card"><slot /></div>' },
            QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
            QIcon: { template: '<span />' },
            QSeparator: { template: '<hr />' },
            QInput: {
              template: `<div class="q-input">
                <button class="emit-null" @click="$emit('update:modelValue', null)" />
              </div>`,
              props: ['modelValue'],
              emits: ['update:modelValue'],
            },
            QBanner: { template: '<div />' },
          },
          provide: {
            deletionTracker: mockDeletionTracker,
          },
        },
      });

      const nullBtn = wrapper.find('.emit-null');
      await nullBtn.trigger('click');
      expect(mockSetCurrency).toHaveBeenCalledWith(0);
    });

    it('handles NaN currency input', async () => {
      const wrapper = shallowMount(StartingKitStep, {
        global: {
          stubs: {
            StartingKitSelectionDialog: { template: '<div />' },
            QBtn: { template: '<button />' },
            QCard: { template: '<div class="q-card"><slot /></div>' },
            QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
            QIcon: { template: '<span />' },
            QSeparator: { template: '<hr />' },
            QInput: {
              template: `<div class="q-input">
                <button class="emit-nan" @click="$emit('update:modelValue', 'not-a-number')" />
              </div>`,
              props: ['modelValue'],
              emits: ['update:modelValue'],
            },
            QBanner: { template: '<div />' },
          },
          provide: {
            deletionTracker: mockDeletionTracker,
          },
        },
      });

      mockSetCurrency.mockClear();
      const nanBtn = wrapper.find('.emit-nan');
      await nanBtn.trigger('click');
      expect(mockSetCurrency).not.toHaveBeenCalled();
    });
  });
});
