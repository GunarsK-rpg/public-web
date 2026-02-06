import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AncestryStep from './AncestryStep.vue';

// Mock stores
const mockSetAncestry = vi.fn();
const mockSetSingerForm = vi.fn();

const mockClassifierData = {
  value: {
    ancestries: [
      { id: 1, code: 'human', name: 'Human', description: 'A human ancestry' },
      { id: 2, code: 'singer', name: 'Singer', description: 'A singer ancestry' },
      { id: 3, code: 'undescribed', name: 'Undescribed', description: null }, // No description
    ] as Array<{ id: number; code: string; name: string; description: string | null }>,
    singerForms: [
      { id: 1, code: 'dullform', name: 'Dullform', description: 'Default form', talent: null },
      {
        id: 2,
        code: 'warform',
        name: 'Warform',
        description: 'Combat form',
        talent: { id: 100, code: 'warform-talent', name: 'Warform Talent' },
      },
      { id: 3, code: 'nodesc', name: 'NoDesc', description: null, talent: null }, // No description
    ] as Array<{
      id: number;
      code: string;
      name: string;
      description: string | null;
      talent: { id: number; code: string; name: string } | null;
    }>,
  },
};

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    get ancestries() {
      return mockClassifierData.value.ancestries;
    },
    get singerForms() {
      return mockClassifierData.value.singerForms;
    },
  }),
}));

vi.mock('src/utils/arrayUtils', () => ({
  findByCode: <T extends { code: string }>(arr: T[], code: string) =>
    arr?.find((item) => item.code === code),
}));

// Reactive mocks
const mockIsSinger = { value: false };
const mockHeroAncestry = {
  value: { id: 1, code: 'human', name: 'Human' } as { id: number; code: string; name: string },
};
const mockActiveSingerForm = { value: null as { id: number; code: string; name: string } | null };
const mockHeroTalents = { value: [] as { talent: { id: number; code: string; name: string } }[] };

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    hero: {
      get ancestry() {
        return mockHeroAncestry.value;
      },
      get activeSingerForm() {
        return mockActiveSingerForm.value;
      },
    },
    get talents() {
      return mockHeroTalents.value;
    },
  }),
}));

vi.mock('src/stores/heroTalents', () => ({
  useHeroTalentsStore: () => ({
    get isSinger() {
      return mockIsSinger.value;
    },
    setAncestry: mockSetAncestry,
    setSingerForm: mockSetSingerForm,
  }),
}));

describe('AncestryStep', () => {
  const createWrapper = () =>
    shallowMount(AncestryStep, {
      global: {
        stubs: {
          SelectableCard: {
            template: `<div
              class="selectable-card"
              :class="{ selected: selected }"
              :data-title="title"
              @click="$emit('select')"
            >{{ title }}</div>`,
            props: ['title', 'subtitle', 'selected', 'ariaLabel'],
            emits: ['select'],
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
    mockIsSinger.value = false;
    mockHeroAncestry.value = { id: 1, code: 'human', name: 'Human' };
    mockActiveSingerForm.value = null;
    mockHeroTalents.value = [];
    mockClassifierData.value = {
      ancestries: [
        { id: 1, code: 'human', name: 'Human', description: 'A human ancestry' },
        { id: 2, code: 'singer', name: 'Singer', description: 'A singer ancestry' },
        { id: 3, code: 'undescribed', name: 'Undescribed', description: null },
      ],
      singerForms: [
        { id: 1, code: 'dullform', name: 'Dullform', description: 'Default form', talent: null },
        {
          id: 2,
          code: 'warform',
          name: 'Warform',
          description: 'Combat form',
          talent: { id: 100, code: 'warform-talent', name: 'Warform Talent' },
        },
        { id: 3, code: 'nodesc', name: 'NoDesc', description: null, talent: null },
      ],
    };
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders step description', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain("Choose your character's ancestry");
    });

    it('renders all ancestry options', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Human');
      expect(wrapper.text()).toContain('Singer');
    });

    it('marks selected ancestry', () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.selectable-card');
      const humanCard = cards.find((c) => c.text() === 'Human');
      expect(humanCard?.classes()).toContain('selected');
    });
  });

  // ========================================
  // Ancestry Selection
  // ========================================
  describe('ancestry selection', () => {
    it('calls setAncestry when card is clicked', async () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.selectable-card');
      expect(cards.length).toBeGreaterThan(1);
      await cards[1]!.trigger('click');

      expect(mockSetAncestry).toHaveBeenCalledWith(2);
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('has radiogroup role for ancestry selection', () => {
      const wrapper = createWrapper();

      const radiogroup = wrapper.find('[role="radiogroup"]');
      expect(radiogroup.exists()).toBe(true);
      expect(radiogroup.attributes('aria-label')).toBe('Select ancestry');
    });
  });

  // ========================================
  // Singer Form Selection
  // ========================================
  describe('singer form selection', () => {
    it('shows form selection when singer ancestry is selected', () => {
      mockIsSinger.value = true;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Select Initial Form');
      expect(wrapper.text()).toContain('Dullform');
    });

    it('does not show form selection for non-singer ancestry', () => {
      mockIsSinger.value = false;
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Select Initial Form');
    });

    it('renders form description text', () => {
      mockIsSinger.value = true;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Singers begin in dullform by default');
    });

    it('shows available forms based on talents', () => {
      mockIsSinger.value = true;
      mockHeroTalents.value = [
        { talent: { id: 100, code: 'warform-talent', name: 'Warform Talent' } },
      ]; // Has warform talent
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Dullform');
      expect(wrapper.text()).toContain('Warform');
    });

    it('filters forms requiring talents hero does not have', () => {
      mockIsSinger.value = true;
      mockHeroTalents.value = []; // No talents
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Dullform');
      expect(wrapper.text()).not.toContain('Warform');
    });

    it('marks selected form', () => {
      mockIsSinger.value = true;
      mockActiveSingerForm.value = { id: 1, code: 'dullform', name: 'Dullform' };
      const wrapper = createWrapper();

      const formCards = wrapper.findAll('.selectable-card').filter((c) => c.text() === 'Dullform');
      expect(formCards[0]?.classes()).toContain('selected');
    });

    it('calls setSingerForm when form card is clicked', async () => {
      mockIsSinger.value = true;
      const wrapper = createWrapper();

      // Find the dullform card (first form card after ancestry cards)
      const cards = wrapper.findAll('.selectable-card');
      const dullformCard = cards.find((c) => c.text() === 'Dullform');
      await dullformCard!.trigger('click');

      expect(mockSetSingerForm).toHaveBeenCalledWith(1);
    });

    it('has radiogroup for form selection', () => {
      mockIsSinger.value = true;
      const wrapper = createWrapper();

      const radiogroups = wrapper.findAll('[role="radiogroup"]');
      const formRadiogroup = radiogroups.find(
        (r) => r.attributes('aria-label') === 'Select singer form'
      );
      expect(formRadiogroup?.exists()).toBe(true);
    });
  });

  // ========================================
  // Auto-select Dullform
  // ========================================
  describe('auto-select dullform', () => {
    it('auto-selects dullform when selecting singer ancestry without existing form', async () => {
      mockIsSinger.value = false;
      mockActiveSingerForm.value = null;

      // Simulate isSinger becoming true after setAncestry is called
      mockSetAncestry.mockImplementation(() => {
        mockIsSinger.value = true;
      });

      const wrapper = createWrapper();
      const cards = wrapper.findAll('.selectable-card');
      const singerCard = cards.find((c) => c.text() === 'Singer');
      await singerCard!.trigger('click');

      expect(mockSetAncestry).toHaveBeenCalledWith(2);
      expect(mockSetSingerForm).toHaveBeenCalledWith(1); // Dullform id
    });

    it('does not auto-select dullform if form already selected', async () => {
      mockActiveSingerForm.value = { id: 2, code: 'warform', name: 'Warform' }; // Already has form selected

      mockSetAncestry.mockImplementation(() => {
        mockIsSinger.value = true;
      });

      const wrapper = createWrapper();
      const cards = wrapper.findAll('.selectable-card');
      const singerCard = cards.find((c) => c.text() === 'Singer');
      await singerCard!.trigger('click');

      expect(mockSetAncestry).toHaveBeenCalledWith(2);
      expect(mockSetSingerForm).not.toHaveBeenCalled();
    });

    it('does not auto-select form when selecting non-singer ancestry', async () => {
      mockIsSinger.value = true;
      mockSetAncestry.mockImplementation(() => {
        mockIsSinger.value = false;
      });

      const wrapper = createWrapper();
      const cards = wrapper.findAll('.selectable-card');
      const humanCard = cards.find((c) => c.text() === 'Human');
      await humanCard!.trigger('click');

      expect(mockSetAncestry).toHaveBeenCalledWith(1);
      expect(mockSetSingerForm).not.toHaveBeenCalled();
    });

    it('handles dullform not found in classifiers', async () => {
      // Remove dullform from singerForms
      mockClassifierData.value.singerForms = [
        {
          id: 2,
          code: 'warform',
          name: 'Warform',
          description: 'Combat form',
          talent: { id: 100, code: 'warform-talent', name: 'Warform Talent' },
        },
      ];

      mockIsSinger.value = false;
      mockActiveSingerForm.value = null;
      mockSetAncestry.mockImplementation(() => {
        mockIsSinger.value = true;
      });

      const wrapper = createWrapper();
      const cards = wrapper.findAll('.selectable-card');
      const singerCard = cards.find((c) => c.text() === 'Singer');
      await singerCard!.trigger('click');

      expect(mockSetAncestry).toHaveBeenCalledWith(2);
      // setSingerForm should not be called since dullform not found
      expect(mockSetSingerForm).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles ancestry without description', () => {
      const wrapper = createWrapper();

      // Should render without crashing - Undescribed has null description
      expect(wrapper.text()).toContain('Undescribed');
    });

    it('handles singer form without description', () => {
      mockIsSinger.value = true;
      const wrapper = createWrapper();

      // Should render NoDesc form without crashing
      expect(wrapper.text()).toContain('NoDesc');
    });

    it('handles null ancestryId with fallback to 0', () => {
      mockHeroAncestry.value = { id: 0, code: '', name: '' };
      const wrapper = createWrapper();

      // Should render without crashing, nothing selected
      expect(wrapper.exists()).toBe(true);
    });
  });
});
