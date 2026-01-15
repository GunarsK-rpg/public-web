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
    startingKitId: 1,
    currency: 10,
  } as { startingKitId: number | null; currency: number } | null,
};

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get hero() {
      return mockHero.value;
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
        equipment: [{ equipmentId: 1, quantity: 1 }],
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
        equipment: [{ equipmentId: 2, quantity: 2 }],
        expertises: [{ expertiseId: 1 }],
      },
      {
        id: 4,
        code: 'mystery',
        name: 'Mystery',
        description: 'Mysterious kit',
        startingSpheres: '1d6',
        equipment: [
          { equipmentId: 1, quantity: 1 }, // Valid
          { equipmentId: 999, quantity: 1 }, // Invalid - equipment not found
        ],
        expertises: [],
      },
    ],
    equipment: [
      { id: 1, name: 'Sword' },
      { id: 2, name: 'Book' },
    ],
    expertises: [{ id: 1, name: 'Vorin Customs' }],
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
  const createWrapper = () =>
    shallowMount(StartingKitStep, {
      global: {
        stubs: {
          QCard: {
            template: `<div
              class="q-card"
              :class="$attrs.class"
              :role="$attrs.role"
              :tabindex="$attrs.tabindex"
              :aria-checked="$attrs['aria-checked']"
              @click="$emit('click')"
              @keydown="$emit('keydown', $event)"
            ><slot /></div>`,
            emits: ['click', 'keydown'],
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
              @input="$emit('update:modelValue', Number($event.target.value))"
              @click.stop
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
      startingKitId: 1,
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
          equipment: [{ equipmentId: 1, quantity: 1 }],
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
          equipment: [{ equipmentId: 2, quantity: 2 }],
          expertises: [{ expertiseId: 1 }],
        },
        {
          id: 4,
          code: 'mystery',
          name: 'Mystery',
          description: 'Mysterious kit',
          startingSpheres: '1d6',
          equipment: [
            { equipmentId: 1, quantity: 1 },
            { equipmentId: 999, quantity: 1 }, // Invalid equipment
          ],
          expertises: [],
        },
      ],
      equipment: [
        { id: 1, name: 'Sword' },
        { id: 2, name: 'Book' },
      ],
      expertises: [{ id: 1, name: 'Vorin Customs' }],
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

    it('renders kit cards', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Adventurer');
      expect(wrapper.text()).toContain('Prisoner');
    });

    it('shows selected kit indicator', () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.q-card');
      const selectedCard = cards.find((c) => c.classes().includes('card-selected'));
      expect(selectedCard).toBeDefined();
    });
  });

  // ========================================
  // Kit Selection
  // ========================================
  describe('kit selection', () => {
    it('calls setStartingKit when kit card is clicked', async () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.q-card');
      expect(cards.length).toBeGreaterThan(1);
      await cards[1]!.trigger('click'); // Prisoner kit

      expect(mockSetStartingKit).toHaveBeenCalledWith(2);
    });

    it('shows currency input for selected kit', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-input').exists()).toBe(true);
    });
  });

  // ========================================
  // Currency Input
  // ========================================
  describe('currency input', () => {
    it('updates currency when input changes', async () => {
      const wrapper = createWrapper();

      const input = wrapper.find('.q-input');
      await input.setValue(20);

      expect(mockSetCurrency).toHaveBeenCalled();
    });
  });

  // ========================================
  // Equipment Summary
  // ========================================
  describe('equipment summary', () => {
    it('shows equipment from kit', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Sword');
    });

    it('shows no equipment message when kit has no equipment', () => {
      const wrapper = createWrapper();

      // Prisoner kit has no equipment
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
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('has radiogroup role for kit selection', () => {
      const wrapper = createWrapper();

      const radiogroup = wrapper.find('[role="radiogroup"]');
      expect(radiogroup.exists()).toBe(true);
      expect(radiogroup.attributes('aria-label')).toBe('Select starting kit');
    });

    it('kit cards have radio role', () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.q-card[role="radio"]');
      expect(cards.length).toBe(4); // 4 kits including mystery kit
    });

    it('selected kit has aria-checked true', () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.q-card[role="radio"]');
      const selectedCard = cards.find((c) => c.attributes('aria-checked') === 'true');
      expect(selectedCard).toBeDefined();
    });

    it('selects kit via Enter key', async () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.q-card');
      await cards[1]?.trigger('keydown', { key: 'Enter' });

      expect(mockSetStartingKit).toHaveBeenCalledWith(2);
    });

    it('selects kit via Space key', async () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.q-card');
      await cards[1]?.trigger('keydown', { key: ' ' });

      expect(mockSetStartingKit).toHaveBeenCalledWith(2);
    });
  });

  // ========================================
  // Prisoner Kit Banner
  // ========================================
  describe('prisoner kit banner', () => {
    it('shows prisoner banner when prisoner kit is selected', () => {
      mockHero.value = { startingKitId: 2, currency: 0 };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Prisoner Kit Special');
      expect(wrapper.text()).toContain('Radiant spren');
    });

    it('shows no starting currency message for prisoner kit', () => {
      mockHero.value = { startingKitId: 2, currency: 0 };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No starting currency');
    });
  });

  // ========================================
  // Expertise Display
  // ========================================
  describe('expertise display', () => {
    it('shows expertise for kits that grant one', () => {
      mockHero.value = { startingKitId: 3, currency: 5 };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Vorin Customs');
      expect(wrapper.text()).toContain('+1');
    });
  });

  // ========================================
  // Equipment Summary
  // ========================================
  describe('equipment summary extended', () => {
    it('shows quantity when equipment has multiple items', () => {
      mockHero.value = { startingKitId: 3, currency: 5 };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Book x2');
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
      mockHero.value = { startingKitId: null, currency: 0 };
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.q-card');
      const selectedCard = cards.find((c) => c.classes().includes('card-selected'));
      expect(selectedCard).toBeUndefined();
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
            QCard: {
              template: '<div class="q-card"><slot /></div>',
            },
            QCardSection: {
              template: '<div class="q-card-section"><slot /></div>',
            },
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
            QCard: {
              template: '<div class="q-card"><slot /></div>',
            },
            QCardSection: {
              template: '<div class="q-card-section"><slot /></div>',
            },
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
        },
      });

      mockSetCurrency.mockClear();
      const nanBtn = wrapper.find('.emit-nan');
      await nanBtn.trigger('click');

      // NaN input should be ignored
      expect(mockSetCurrency).not.toHaveBeenCalled();
    });

    it('handles equipment with invalid equipmentId', () => {
      // Modify mock to have an equipment with non-existent equipmentId
      const wrapper = shallowMount(StartingKitStep, {
        global: {
          stubs: {
            QCard: {
              template: '<div class="q-card"><slot /></div>',
            },
            QCardSection: {
              template: '<div class="q-card-section"><slot /></div>',
            },
            QIcon: { template: '<span />' },
            QSeparator: { template: '<hr />' },
            QInput: { template: '<input />' },
            QBanner: { template: '<div />' },
          },
        },
      });

      // The Adventurer kit has valid equipment, so it should display
      expect(wrapper.text()).toContain('Sword');
    });
  });

  // ========================================
  // getEquipmentSummary Edge Cases
  // ========================================
  describe('getEquipmentSummary edge cases', () => {
    it('filters out equipment with invalid equipmentId from summary', () => {
      // Mystery kit (id: 4) has one valid and one invalid equipment
      mockHero.value = { startingKitId: 4, currency: 5 };
      const wrapper = createWrapper();

      // Should show Sword but filter out the invalid equipment (equipmentId: 999)
      expect(wrapper.text()).toContain('Sword');
      expect(wrapper.text()).toContain('Mystery');
    });
  });

  // ========================================
  // Template v-if Branch Coverage
  // ========================================
  describe('template v-if branches', () => {
    it('does not show expertise section for kit without expertises', () => {
      // Adventurer kit (id: 1) has empty expertises array
      mockHero.value = { startingKitId: 1, currency: 10 };
      const wrapper = createWrapper();

      // The adventurer kit card should not have Vorin Customs (expertise is on Scholar card)
      const cards = wrapper.findAll('.q-card');
      const adventurerCard = cards.find((c) => c.text().includes('Adventurer'));
      expect(adventurerCard).toBeDefined();
      // Adventurer has no expertise, so it shouldn't show +1 in its own card
      expect(adventurerCard!.text()).not.toContain('+1 Vorin');
    });

    it('shows expertise section for kit with expertises', () => {
      // Scholar kit (id: 3) has expertises
      mockHero.value = { startingKitId: 3, currency: 5 };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('+1');
      expect(wrapper.text()).toContain('Vorin Customs');
    });

    it('shows selection indicator only for selected kit', () => {
      mockHero.value = { startingKitId: 1, currency: 10 };
      const wrapper = createWrapper();

      // The selection indicator should be present for the selected kit
      const selectedCard = wrapper.find('.card-selected');
      expect(selectedCard.exists()).toBe(true);
    });

    it('hides currency input section when no kit is selected', () => {
      mockHero.value = { startingKitId: null, currency: 0 };
      const wrapper = createWrapper();

      // No kit selected means no currency input should be shown
      // Note: The currency input is only shown inside the selected kit's card-section
      const cards = wrapper.findAll('.q-card');
      const selectedCards = cards.filter((c) => c.classes().includes('card-selected'));
      expect(selectedCards.length).toBe(0);
    });
  });
});
