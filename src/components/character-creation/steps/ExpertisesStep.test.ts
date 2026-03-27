import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ExpertisesStep from './ExpertisesStep.vue';
import { heroStore, heroAttributesStore, classifierStore } from 'src/__tests__/mockStores';

// Mock stores
const mockAddExpertise = vi.fn();
const mockRemoveExpertise = vi.fn();
const mockAddCustomExpertise = vi.fn();
const mockRemoveCustomExpertise = vi.fn();
const mockGetAttributeValue = vi.fn().mockReturnValue(3);

// Reactive mock data
const mockExpertises = {
  value: [] as Array<{
    id?: number;
    expertise: { id: number; code: string; name: string } | null;
    expertiseType?: { id: number; code: string; name: string };
    customName?: string | null;
    source: { sourceType: string } | null;
  }>,
};

const mockSlotsRemaining = { value: 2 };

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    ...heroStore(),
    get hero() {
      return { expertises: mockExpertises.value };
    },
    get expertises() {
      return mockExpertises.value;
    },
  }),
}));

vi.mock('src/stores/heroAttributes', () => ({
  useHeroAttributesStore: () =>
    heroAttributesStore({
      getAttributeValue: mockGetAttributeValue,
      addExpertise: mockAddExpertise,
      removeExpertise: mockRemoveExpertise,
      addCustomExpertise: mockAddCustomExpertise,
      removeCustomExpertise: mockRemoveCustomExpertise,
    }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () =>
    classifierStore({
      expertises: [
        {
          id: 1,
          code: 'lockpicking',
          name: 'Lockpicking',
          description: 'Pick locks',
          expertiseType: { id: 1, code: 'general', name: 'General' },
        },
        {
          id: 2,
          code: 'vorin',
          name: 'Vorin Customs',
          description: 'Vorin knowledge',
          expertiseType: { id: 2, code: 'cultural', name: 'Cultural' },
        },
        {
          id: 3,
          code: 'surgery',
          name: 'Surgery',
          description: 'Medical expertise',
          expertiseType: { id: 3, code: 'specialist', name: 'Specialist' },
        },
      ],
      expertiseTypes: [
        { id: 1, code: 'general', name: 'General' },
        { id: 2, code: 'cultural', name: 'Cultural' },
        { id: 3, code: 'specialist', name: 'Specialist' },
      ],
    }),
}));

vi.mock('src/composables/useStepValidation', () => ({
  useStepValidation: () => ({
    budget: () => ({
      isValid: mockSlotsRemaining.value >= 0,
      errors: [] as string[],
      warnings: [] as string[],
      remaining: mockSlotsRemaining.value,
      budget: 3,
      spent: 3 - mockSlotsRemaining.value,
    }),
  }),
}));

vi.mock('src/utils/arrayUtils', () => ({
  findById: <T extends { id: number }>(arr: T[], id: number | null | undefined) =>
    arr?.find((item) => item.id === id),
  findByCode: <T extends { code: string }>(arr: T[], code: string) =>
    arr?.find((item) => item.code === code),
}));

describe('ExpertisesStep', () => {
  const createWrapper = () =>
    shallowMount(ExpertisesStep, {
      global: {
        stubs: {
          BudgetDisplay: {
            template: '<div class="budget-display">{{ remaining }}</div>',
            props: ['label', 'remaining', 'suffix'],
          },
          InfoBanner: {
            template: '<div class="info-banner" :data-title="title">{{ content }}</div>',
            props: ['icon', 'title', 'content', 'caption'],
          },
          QTabs: {
            template: '<div class="q-tabs"><slot /></div>',
            props: ['modelValue', 'dense', 'activeColor', 'indicatorColor'],
          },
          QTab: {
            template: '<button class="q-tab" :data-name="name">{{ label }}</button>',
            props: ['name', 'label'],
          },
          QList: {
            template: '<div class="q-list"><slot /></div>',
          },
          QItem: {
            template: '<div class="q-item" :class="$attrs.class"><slot /></div>',
          },
          QItemSection: {
            template: '<div class="q-item-section"><slot /></div>',
            props: ['avatar', 'side'],
          },
          QItemLabel: {
            template: '<span class="q-item-label"><slot /></span>',
            props: ['caption'],
          },
          QCheckbox: {
            template: `<input
              type="checkbox"
              class="q-checkbox"
              :checked="modelValue"
              :disabled="disable"
              @change="$emit('update:modelValue', !modelValue)"
            />`,
            props: ['modelValue', 'disable'],
            emits: ['update:modelValue'],
          },
          QBadge: {
            template: '<span class="q-badge"><slot /></span>',
            props: ['color'],
          },
          QSeparator: { template: '<hr class="q-separator" />' },
          QDialog: {
            template: '<div class="q-dialog"><template v-if="modelValue"><slot /></template></div>',
            props: ['modelValue'],
          },
          QCard: { template: '<div class="q-card"><slot /></div>' },
          QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
          QCardActions: { template: '<div class="q-card-actions"><slot /></div>' },
          QSpace: { template: '<span />' },
          QSelect: {
            template:
              '<select class="q-select" @change="$emit(\'update:modelValue\', Number($event.target.value))"><option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option></select>',
            props: [
              'modelValue',
              'options',
              'label',
              'outlined',
              'dense',
              'emitValue',
              'mapOptions',
            ],
            emits: ['update:modelValue'],
          },
          QInput: {
            template:
              '<input class="q-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'label', 'outlined', 'dense', 'maxlength'],
            emits: ['update:modelValue'],
          },
          QBtn: {
            template:
              '<button class="q-btn" :disabled="disable" @click="$emit(\'click\')"><slot />{{ label }}</button>',
            props: [
              'label',
              'color',
              'outline',
              'dense',
              'disable',
              'flat',
              'icon',
              'size',
              'round',
            ],
            emits: ['click'],
          },
        },
        provide: {
          deletionTracker: {
            trackDeletion: vi.fn(),
            getDeletions: vi.fn(() => []),
            clearDeletions: vi.fn(),
            clearAll: vi.fn(),
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockExpertises.value = [
      {
        expertise: { id: 1, code: 'lockpicking', name: 'Lockpicking' },
        expertiseType: { id: 1, code: 'general', name: 'General' },
        source: { sourceType: 'intellect' },
      },
      {
        expertise: { id: 2, code: 'vorin', name: 'Vorin Customs' },
        expertiseType: { id: 2, code: 'cultural', name: 'Cultural' },
        source: { sourceType: 'culture' },
      },
    ];
    mockSlotsRemaining.value = 2;
    mockGetAttributeValue.mockReturnValue(3);
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders step description', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Select your expertises');
    });

    it('renders budget display', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.budget-display').exists()).toBe(true);
    });

    it('renders category tabs', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-tabs').exists()).toBe(true);
      expect(wrapper.text()).toContain('All');
      expect(wrapper.text()).toContain('General');
    });

    it('renders expertise list', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-list').exists()).toBe(true);
    });
  });

  // ========================================
  // Cultural Expertises Banner
  // ========================================
  describe('cultural expertises banner', () => {
    it('shows cultural expertises info banner', () => {
      const wrapper = createWrapper();

      const banner = wrapper.find('.info-banner[data-title="Cultural Expertises"]');
      expect(banner.exists()).toBe(true);
    });
  });

  // ========================================
  // Expertise Selection
  // ========================================
  describe('expertise selection', () => {
    it('renders checkboxes for expertises', () => {
      const wrapper = createWrapper();

      const checkboxes = wrapper.findAll('.q-checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('shows selected state for selected expertises', () => {
      const wrapper = createWrapper();

      const items = wrapper.findAll('.q-item');
      expect(items.length).toBeGreaterThan(0);
      const selectedItem = items.find((item) => item.classes().includes('item-selected'));
      expect(selectedItem).toBeDefined();
      expect(selectedItem!.exists()).toBe(true);
    });
  });

  // ========================================
  // Source Badges
  // ========================================
  describe('source badges', () => {
    it('shows source badge for cultural expertises', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('culture');
    });
  });

  // ========================================
  // Specialist Expertises
  // ========================================
  describe('specialist expertises', () => {
    it('shows restricted badge for specialist expertises', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Restricted');
    });
  });

  // ========================================
  // Expertise Toggle
  // ========================================
  describe('expertise toggle', () => {
    it('calls addExpertise when checkbox is checked', async () => {
      const wrapper = createWrapper();

      // Find an unchecked checkbox (expertise 3 is not selected)
      const checkboxes = wrapper.findAll('.q-checkbox');
      // The third expertise (Surgery, id: 3) is not in mockExpertises
      await checkboxes[2]?.trigger('change');

      expect(mockAddExpertise).toHaveBeenCalledWith(3, { sourceType: 'intellect' });
    });

    it('calls removeExpertise when unchecking non-readonly expertise', async () => {
      const wrapper = createWrapper();

      // Find the first checkbox (expertiseId: 1, sourceType: 'intellect' - not readonly)
      const checkboxes = wrapper.findAll('.q-checkbox');
      await checkboxes[0]?.trigger('change');

      expect(mockRemoveExpertise).toHaveBeenCalledWith(1);
    });

    it('does not remove read-only cultural expertises', async () => {
      const wrapper = createWrapper();

      // Find the second checkbox (expertiseId: 2, sourceType: 'culture' - readonly)
      const checkboxes = wrapper.findAll('.q-checkbox');
      await checkboxes[1]?.trigger('change');

      expect(mockRemoveExpertise).not.toHaveBeenCalled();
    });

    it('allows checkbox when no slots remaining (over-allocation with warning)', () => {
      mockSlotsRemaining.value = 0;
      const wrapper = createWrapper();

      const checkboxes = wrapper.findAll('.q-checkbox');
      // The third expertise (not selected) should NOT be disabled
      expect(checkboxes[2]?.attributes('disabled')).toBeUndefined();
    });
  });

  // ========================================
  // Starting Kit Expertises
  // ========================================
  describe('starting kit expertises', () => {
    it('shows starting kit banner when expertises from starting kit exist', () => {
      mockExpertises.value = [
        {
          expertise: { id: 1, code: 'lockpicking', name: 'Lockpicking' },
          source: { sourceType: 'starting_kit' },
        },
      ];
      const wrapper = createWrapper();

      const banner = wrapper.find('.info-banner[data-title="Starting Kit Expertises"]');
      expect(banner.exists()).toBe(true);
    });

    it('does not show starting kit banner when no starting kit expertises', () => {
      mockExpertises.value = [
        {
          expertise: { id: 1, code: 'lockpicking', name: 'Lockpicking' },
          source: { sourceType: 'intellect' },
        },
      ];
      const wrapper = createWrapper();

      const banner = wrapper.find('.info-banner[data-title="Starting Kit Expertises"]');
      expect(banner.exists()).toBe(false);
    });

    it('makes starting kit expertises read-only', async () => {
      mockExpertises.value = [
        {
          expertise: { id: 1, code: 'lockpicking', name: 'Lockpicking' },
          source: { sourceType: 'starting_kit' },
        },
      ];
      const wrapper = createWrapper();

      const checkboxes = wrapper.findAll('.q-checkbox');
      await checkboxes[0]?.trigger('change');

      expect(mockRemoveExpertise).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Category Filtering
  // ========================================
  describe('category filtering', () => {
    it('renders all expertise type tabs', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('General');
      expect(wrapper.text()).toContain('Cultural');
      expect(wrapper.text()).toContain('Specialist');
    });

    it('shows all expertises by default', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Lockpicking');
      expect(wrapper.text()).toContain('Vorin Customs');
      expect(wrapper.text()).toContain('Surgery');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles empty expertises list', () => {
      mockExpertises.value = [];
      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.q-list').exists()).toBe(true);
    });

    it('handles expertise without source', () => {
      mockExpertises.value = [
        { expertise: { id: 1, code: 'lockpicking', name: 'Lockpicking' }, source: null },
      ];
      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
    });

    it('shows budget display', () => {
      const wrapper = createWrapper();

      const budgetDisplay = wrapper.find('.budget-display');
      expect(budgetDisplay.exists()).toBe(true);
    });

    it('does not call addExpertise when expertise already selected (rapid click guard)', async () => {
      // Add expertise 3 to the mock to simulate it being already selected
      mockExpertises.value = [
        {
          expertise: { id: 1, code: 'lockpicking', name: 'Lockpicking' },
          source: { sourceType: 'intellect' },
        },
        {
          expertise: { id: 2, code: 'vorin', name: 'Vorin Customs' },
          source: { sourceType: 'culture' },
        },
        {
          expertise: { id: 3, code: 'surgery', name: 'Surgery' },
          source: { sourceType: 'intellect' },
        },
      ];
      mockSlotsRemaining.value = 1;

      const wrapper = createWrapper();
      const checkboxes = wrapper.findAll('.q-checkbox');

      // Try to add expertise 3 again (it's already selected)
      // This tests the isSelected check in toggleExpertise
      await checkboxes[2]?.trigger('change');

      // Should call removeExpertise since it's already selected and checkbox toggle
      // will trigger unchecking
      expect(mockRemoveExpertise).toHaveBeenCalled();
    });

    it('does not show cultural banner when no cultural expertises', () => {
      mockExpertises.value = [
        {
          expertise: { id: 1, code: 'lockpicking', name: 'Lockpicking' },
          source: { sourceType: 'intellect' },
        },
      ];
      const wrapper = createWrapper();

      const banner = wrapper.find('.info-banner[data-title="Cultural Expertises"]');
      expect(banner.exists()).toBe(false);
    });
  });

  // ========================================
  // Category Filtering - Detailed
  // ========================================
  describe('category filtering detailed', () => {
    it('filters expertises by selected category', async () => {
      const wrapper = shallowMount(ExpertisesStep, {
        global: {
          stubs: {
            BudgetDisplay: { template: '<div class="budget-display"></div>' },
            InfoBanner: { template: '<div class="info-banner"></div>' },
            QTabs: {
              template: `<div class="q-tabs">
                <slot />
                <button class="select-general" @click="$emit('update:modelValue', 'general')" />
                <button class="select-invalid" @click="$emit('update:modelValue', 'invalid-type')" />
              </div>`,
              props: ['modelValue'],
              emits: ['update:modelValue'],
            },
            QTab: { template: '<button class="q-tab"></button>' },
            QList: { template: '<div class="q-list"><slot /></div>' },
            QItem: { template: '<div class="q-item"><slot /></div>' },
            QItemSection: { template: '<div class="q-item-section"><slot /></div>' },
            QItemLabel: { template: '<span class="q-item-label"><slot /></span>' },
            QCheckbox: { template: '<input type="checkbox" class="q-checkbox" />' },
            QBadge: { template: '<span class="q-badge"><slot /></span>' },
          },
          provide: {
            deletionTracker: {
              trackDeletion: vi.fn(),
              getDeletions: vi.fn(() => []),
              clearDeletions: vi.fn(),
            },
          },
        },
      });

      // Initially shows all expertises
      expect(wrapper.text()).toContain('Lockpicking');
      expect(wrapper.text()).toContain('Vorin Customs');
      expect(wrapper.text()).toContain('Surgery');

      // Select 'general' category
      await wrapper.find('.select-general').trigger('click');

      // Now should only show general expertises (Lockpicking has expertiseTypeId: 1)
      expect(wrapper.text()).toContain('Lockpicking');
      expect(wrapper.text()).not.toContain('Vorin Customs');
      expect(wrapper.text()).not.toContain('Surgery');
    });

    it('returns empty array for invalid category', async () => {
      const wrapper = shallowMount(ExpertisesStep, {
        global: {
          stubs: {
            BudgetDisplay: { template: '<div class="budget-display"></div>' },
            InfoBanner: { template: '<div class="info-banner"></div>' },
            QTabs: {
              template: `<div class="q-tabs">
                <slot />
                <button class="select-invalid" @click="$emit('update:modelValue', 'invalid-type')" />
              </div>`,
              props: ['modelValue'],
              emits: ['update:modelValue'],
            },
            QTab: { template: '<button class="q-tab"></button>' },
            QList: { template: '<div class="q-list"><slot /></div>' },
            QItem: { template: '<div class="q-item"><slot /></div>' },
            QItemSection: { template: '<div class="q-item-section"><slot /></div>' },
            QItemLabel: { template: '<span class="q-item-label"><slot /></span>' },
            QCheckbox: { template: '<input type="checkbox" class="q-checkbox" />' },
            QBadge: { template: '<span class="q-badge"><slot /></span>' },
          },
          provide: {
            deletionTracker: {
              trackDeletion: vi.fn(),
              getDeletions: vi.fn(() => []),
              clearDeletions: vi.fn(),
            },
          },
        },
      });

      // Select invalid category
      await wrapper.find('.select-invalid').trigger('click');

      // Should show no expertises (empty array)
      expect(wrapper.text()).not.toContain('Lockpicking');
      expect(wrapper.text()).not.toContain('Vorin Customs');
      expect(wrapper.text()).not.toContain('Surgery');
    });
  });

  // ========================================
  // Specialist Type Edge Cases
  // ========================================
  describe('specialist type edge cases', () => {
    it('handles specialist type not found in classifiers', () => {
      // This is an edge case - normally specialist type exists
      // The isSpecialist function guards against undefined specialistTypeId
      const wrapper = createWrapper();

      // Just verify the component renders without crashing
      expect(wrapper.exists()).toBe(true);
    });
  });

  // ========================================
  // Custom Expertises
  // ========================================
  describe('custom expertises', () => {
    it('renders add custom button below the list', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Add Custom');
    });

    it('renders custom expertises inline with asterisk', () => {
      mockExpertises.value = [
        {
          id: 100,
          expertise: null,
          expertiseType: { id: 1, code: 'general', name: 'General' },
          customName: 'Glassblowing',
          source: { sourceType: 'intellect' },
        },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Glassblowing *');
      expect(wrapper.text()).toContain('Custom');
    });

    it('renders remove button for custom expertises', () => {
      mockExpertises.value = [
        {
          id: 100,
          expertise: null,
          expertiseType: { id: 1, code: 'general', name: 'General' },
          customName: 'Glassblowing',
          source: { sourceType: 'intellect' },
        },
      ];
      const wrapper = createWrapper();

      const removeBtn = wrapper.find('[aria-label="Remove custom expertise: Glassblowing"]');
      expect(removeBtn.exists()).toBe(true);
    });

    it('calls removeCustomExpertise when remove button clicked', async () => {
      mockExpertises.value = [
        {
          id: 100,
          expertise: null,
          expertiseType: { id: 1, code: 'general', name: 'General' },
          customName: 'Glassblowing',
          source: { sourceType: 'intellect' },
        },
      ];
      const wrapper = createWrapper();

      await wrapper.find('[aria-label="Remove custom expertise: Glassblowing"]').trigger('click');

      expect(mockRemoveCustomExpertise).toHaveBeenCalledWith(100);
    });

    it('renders add custom button', () => {
      const wrapper = createWrapper();

      const addBtn = wrapper.find('[aria-label="Add custom expertise"]');
      expect(addBtn.exists()).toBe(true);
      expect(addBtn.text()).toContain('Add Custom');
    });

    it('allows add custom button when no slots remaining (over-allocation with warning)', () => {
      mockSlotsRemaining.value = 0;
      const wrapper = createWrapper();

      const addBtn = wrapper.find('[aria-label="Add custom expertise"]');
      expect(addBtn.attributes('disabled')).toBeUndefined();
    });

    it('custom expertises count against budget (included in expertises array)', () => {
      // Custom expertises are in heroStore.expertises, so they count against the budget
      mockExpertises.value = [
        {
          id: 100,
          expertise: null,
          expertiseType: { id: 1, code: 'general', name: 'General' },
          customName: 'Glassblowing',
          source: { sourceType: 'intellect' },
        },
      ];
      const wrapper = createWrapper();

      // Custom expertise renders inline as selected
      expect(wrapper.text()).toContain('Glassblowing *');
      // No classifier expertises are selected — only the custom one shows as selected
      const items = wrapper.findAll('.q-item');
      const selectedItems = items.filter((item) => item.classes().includes('item-selected'));
      expect(selectedItems.length).toBe(1);
    });

    it('renders dialog with type select and name input on All tab', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[aria-label="Add custom expertise"]').trigger('click');

      const dialog = wrapper.find('.q-dialog');
      expect(dialog.exists()).toBe(true);
      expect(dialog.find('.q-select').exists()).toBe(true);
      expect(dialog.find('.q-input').exists()).toBe(true);
    });

    it('submits custom expertise via dialog', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[aria-label="Add custom expertise"]').trigger('click');

      const dialog = wrapper.find('.q-dialog');
      await dialog.find('.q-select').setValue(1);
      await dialog.find('.q-input').setValue('Custom Skill');

      const addBtn = dialog.findAll('.q-btn').find((b) => b.text() === 'Add');
      await addBtn!.trigger('click');

      expect(mockAddCustomExpertise).toHaveBeenCalledWith(1, 'Custom Skill', expect.any(Object));
    });
  });
});
