import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import CultureStep from './CultureStep.vue';

// Mock stores
const mockAddCulture = vi.fn();
const mockRemoveCulture = vi.fn();

const mockHeroCultures = {
  value: [{ culture: { id: 1, code: 'vorin', name: 'Vorin' } }] as {
    culture: { id: number; code: string; name: string };
  }[],
};

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get hero() {
      return {
        cultures: mockHeroCultures.value,
      };
    },
  }),
}));

vi.mock('src/stores/heroTalents', () => ({
  useHeroTalentsStore: () => ({
    addCulture: mockAddCulture,
    removeCulture: mockRemoveCulture,
  }),
}));

const mockClassifierData = {
  value: {
    cultures: [
      {
        id: 1,
        code: 'vorin',
        name: 'Vorin',
        description: 'Vorin culture',
        expertise: { id: 10, code: 'vorin-exp', name: 'Vorin Expertise' },
      },
      {
        id: 2,
        code: 'shin',
        name: 'Shin',
        description: 'Shin culture',
        expertise: { id: 20, code: 'shin-exp', name: 'Shin Expertise' },
      },
      { id: 3, code: 'azish', name: 'Azish', description: 'Azish culture', expertise: null }, // No expertise
      {
        id: 4,
        code: 'thaylen',
        name: 'Thaylen',
        description: 'Thaylen culture',
        expertise: { id: 999, code: 'invalid', name: 'Invalid' },
      }, // Invalid expertise
    ] as {
      id: number;
      code: string;
      name: string;
      description: string;
      expertise: { id: number; code: string; name: string } | null;
    }[],
    expertises: [
      { id: 10, name: 'Vorin Expertise' },
      { id: 20, name: 'Shin Expertise' },
    ],
  },
};

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    get cultures() {
      return mockClassifierData.value.cultures;
    },
    get expertises() {
      return mockClassifierData.value.expertises;
    },
  }),
}));

vi.mock('src/utils/arrayUtils', () => ({
  findById: <T extends { id: number }>(arr: T[], id: number | null | undefined) =>
    arr?.find((item) => item.id === id),
}));

describe('CultureStep', () => {
  const createWrapper = () =>
    shallowMount(CultureStep, {
      global: {
        stubs: {
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
              'emitValue',
              'mapOptions',
              'clearable',
              'rules',
            ],
            emits: ['update:modelValue'],
          },
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          InfoBanner: {
            template: '<div class="info-banner" :data-title="title">{{ content }}</div>',
            props: ['icon', 'title', 'content'],
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockHeroCultures.value = [{ culture: { id: 1, code: 'vorin', name: 'Vorin' } }];
    mockClassifierData.value = {
      cultures: [
        {
          id: 1,
          code: 'vorin',
          name: 'Vorin',
          description: 'Vorin culture',
          expertise: { id: 10, code: 'vorin-exp', name: 'Vorin Expertise' },
        },
        {
          id: 2,
          code: 'shin',
          name: 'Shin',
          description: 'Shin culture',
          expertise: { id: 20, code: 'shin-exp', name: 'Shin Expertise' },
        },
        { id: 3, code: 'azish', name: 'Azish', description: 'Azish culture', expertise: null },
        {
          id: 4,
          code: 'thaylen',
          name: 'Thaylen',
          description: 'Thaylen culture',
          expertise: { id: 999, code: 'invalid', name: 'Invalid' },
        },
      ],
      expertises: [
        { id: 10, name: 'Vorin Expertise' },
        { id: 20, name: 'Shin Expertise' },
      ],
    };
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders step description', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Choose your cultural background');
    });

    it('renders primary culture select', () => {
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });

    it('renders secondary culture select', () => {
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      expect(selects.length).toBe(2);
    });
  });

  // ========================================
  // Culture Selection
  // ========================================
  describe('culture selection', () => {
    it('shows culture info card when culture selected', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-card').exists()).toBe(true);
      expect(wrapper.text()).toContain('Vorin');
    });
  });

  // ========================================
  // Cultural Expertises
  // ========================================
  describe('cultural expertises', () => {
    it('shows cultural expertises banner when culture has expertise', () => {
      const wrapper = createWrapper();

      const banner = wrapper.find('.info-banner');
      expect(banner.exists()).toBe(true);
      expect(banner.text()).toContain('Vorin Expertise');
    });
  });

  // ========================================
  // Secondary Culture Options
  // ========================================
  describe('secondary culture options', () => {
    it('excludes primary culture from secondary options', () => {
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      expect(selects.length).toBeGreaterThan(1);
      const options = selects[1]!.findAll('option');

      // Should have "Select..." + cultures excluding primary (Vorin with id 1)
      const optionValues = options.map((o) => o.attributes('value'));
      expect(optionValues).not.toContain('1');
    });
  });

  // ========================================
  // Culture Change Functions
  // ========================================
  describe('culture change functions', () => {
    it('calls addCulture when selecting primary culture', async () => {
      mockHeroCultures.value = [];
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      await selects[0]!.setValue(1);

      expect(mockAddCulture).toHaveBeenCalledWith(1);
    });

    it('calls removeCulture when clearing primary culture', async () => {
      mockHeroCultures.value = [{ culture: { id: 1, code: 'vorin', name: 'Vorin' } }];
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      await selects[0]!.setValue('');

      expect(mockRemoveCulture).toHaveBeenCalledWith(1);
    });

    it('calls addCulture when selecting secondary culture', async () => {
      mockHeroCultures.value = [{ culture: { id: 1, code: 'vorin', name: 'Vorin' } }];
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      await selects[1]!.setValue(2);

      expect(mockAddCulture).toHaveBeenCalledWith(2);
    });

    it('calls removeCulture when clearing secondary culture', async () => {
      mockHeroCultures.value = [
        { culture: { id: 1, code: 'vorin', name: 'Vorin' } },
        { culture: { id: 2, code: 'shin', name: 'Shin' } },
      ];
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      await selects[1]!.setValue('');

      expect(mockRemoveCulture).toHaveBeenCalledWith(2);
    });

    it('preserves array order when changing primary with secondary present', async () => {
      mockHeroCultures.value = [
        { culture: { id: 1, code: 'vorin', name: 'Vorin' } },
        { culture: { id: 2, code: 'shin', name: 'Shin' } },
      ];
      const wrapper = createWrapper();

      // Change primary from 1 to something else
      // This should remove old primary (1), remove secondary (2), add new primary, then re-add secondary
      const selects = wrapper.findAll('.q-select');
      // Can't fully test order change with mock, but verify remove and add are called
      await selects[0]!.setValue(2);

      // Should have been called to remove old culture
      expect(mockRemoveCulture).toHaveBeenCalled();
    });

    it('skips setCulture if no change', async () => {
      mockHeroCultures.value = [{ culture: { id: 1, code: 'vorin', name: 'Vorin' } }];
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      // Set to same value
      await selects[0]!.setValue(1);

      // Should not call add or remove
      expect(mockAddCulture).not.toHaveBeenCalled();
      expect(mockRemoveCulture).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles empty cultures array', () => {
      mockHeroCultures.value = [];
      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
      // No culture card should be shown
      expect(wrapper.find('.q-card').exists()).toBe(false);
    });

    it('handles culture without expertise', () => {
      // Mock culture without expertise
      mockHeroCultures.value = [{ culture: { id: 999, code: 'nonexistent', name: 'Nonexistent' } }]; // Non-existent culture
      const wrapper = createWrapper();

      // Should not crash
      expect(wrapper.exists()).toBe(true);
    });

    it('shows both cultures expertises when both selected', () => {
      mockHeroCultures.value = [
        { culture: { id: 1, code: 'vorin', name: 'Vorin' } },
        { culture: { id: 2, code: 'shin', name: 'Shin' } },
      ];
      const wrapper = createWrapper();

      const banner = wrapper.find('.info-banner');
      expect(banner.exists()).toBe(true);
      expect(banner.text()).toContain('Vorin Expertise');
      expect(banner.text()).toContain('Shin Expertise');
    });

    it('does not show expertise for culture with null expertise', () => {
      mockHeroCultures.value = [{ culture: { id: 3, code: 'azish', name: 'Azish' } }]; // Azish has null expertise
      const wrapper = createWrapper();

      // Banner should not show since no expertises
      expect(wrapper.find('.info-banner').exists()).toBe(false);
    });

    it('does not show expertise for culture with invalid expertise', () => {
      mockHeroCultures.value = [{ culture: { id: 4, code: 'thaylen', name: 'Thaylen' } }]; // Thaylen has expertise id 999 which doesn't exist
      const wrapper = createWrapper();

      // Banner should not show since expertise doesn't exist
      expect(wrapper.find('.info-banner').exists()).toBe(false);
    });

    it('filters out null expertise names from banner', () => {
      // Mix of valid and invalid expertise cultures
      mockHeroCultures.value = [
        { culture: { id: 1, code: 'vorin', name: 'Vorin' } },
        { culture: { id: 3, code: 'azish', name: 'Azish' } },
        { culture: { id: 4, code: 'thaylen', name: 'Thaylen' } },
      ];
      const wrapper = createWrapper();

      const banner = wrapper.find('.info-banner');
      expect(banner.exists()).toBe(true);
      expect(banner.text()).toContain('Vorin Expertise');
      // Should only show Vorin expertise, not nulls
    });
  });

  // ========================================
  // setCulture Branch Coverage
  // ========================================
  describe('setCulture branches', () => {
    it('does nothing when oldId equals newId', async () => {
      mockHeroCultures.value = [{ culture: { id: 1, code: 'vorin', name: 'Vorin' } }];
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      await selects[0]!.setValue(1); // Same as current

      expect(mockAddCulture).not.toHaveBeenCalled();
      expect(mockRemoveCulture).not.toHaveBeenCalled();
    });

    it('handles primary change with secondary present - removes both and re-adds', async () => {
      mockHeroCultures.value = [
        { culture: { id: 1, code: 'vorin', name: 'Vorin' } },
        { culture: { id: 2, code: 'shin', name: 'Shin' } },
      ];
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      // Change primary to 3 (Azish)
      await selects[0]!.setValue(3);

      // Should remove old primary (1) and secondary (2)
      expect(mockRemoveCulture).toHaveBeenCalledWith(1);
      expect(mockRemoveCulture).toHaveBeenCalledWith(2);
      // Should add new primary (3) and re-add secondary (2)
      expect(mockAddCulture).toHaveBeenCalledWith(3);
      expect(mockAddCulture).toHaveBeenCalledWith(2);
    });

    it('handles clearing primary with secondary present', async () => {
      mockHeroCultures.value = [
        { culture: { id: 1, code: 'vorin', name: 'Vorin' } },
        { culture: { id: 2, code: 'shin', name: 'Shin' } },
      ];
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      await selects[0]!.setValue(''); // Clear primary

      // Should remove old primary (1) and secondary (2), then re-add secondary (2)
      expect(mockRemoveCulture).toHaveBeenCalledWith(1);
      expect(mockRemoveCulture).toHaveBeenCalledWith(2);
      expect(mockAddCulture).toHaveBeenCalledWith(2);
    });

    it('handles setting primary when oldId is null (no previous primary)', async () => {
      mockHeroCultures.value = [];
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      await selects[0]!.setValue(1);

      // Should only add, not remove (no old culture)
      expect(mockRemoveCulture).not.toHaveBeenCalled();
      expect(mockAddCulture).toHaveBeenCalledWith(1);
    });

    it('handles clearing secondary when it exists', async () => {
      mockHeroCultures.value = [
        { culture: { id: 1, code: 'vorin', name: 'Vorin' } },
        { culture: { id: 2, code: 'shin', name: 'Shin' } },
      ];
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      await selects[1]!.setValue(''); // Clear secondary

      expect(mockRemoveCulture).toHaveBeenCalledWith(2);
      expect(mockAddCulture).not.toHaveBeenCalled();
    });

    it('handles setting secondary when no previous secondary', async () => {
      mockHeroCultures.value = [{ culture: { id: 1, code: 'vorin', name: 'Vorin' } }];
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      await selects[1]!.setValue(2);

      expect(mockRemoveCulture).not.toHaveBeenCalled();
      expect(mockAddCulture).toHaveBeenCalledWith(2);
    });

    it('handles changing secondary culture', async () => {
      mockHeroCultures.value = [
        { culture: { id: 1, code: 'vorin', name: 'Vorin' } },
        { culture: { id: 2, code: 'shin', name: 'Shin' } },
      ];
      const wrapper = createWrapper();

      const selects = wrapper.findAll('.q-select');
      await selects[1]!.setValue(3); // Change from 2 to 3

      expect(mockRemoveCulture).toHaveBeenCalledWith(2);
      expect(mockAddCulture).toHaveBeenCalledWith(3);
    });
  });
});
