import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import ExpertisesTab from './ExpertisesTab.vue';
import type { HeroExpertise } from 'src/types';

const mockExpertises = ref<HeroExpertise[]>([]);

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get expertises() {
      return mockExpertises.value;
    },
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    expertiseTypes: [
      { id: 1, code: 'weapon', name: 'Weapon' },
      { id: 2, code: 'armor', name: 'Armor' },
      { id: 3, code: 'tool', name: 'Tool' },
      { id: 4, code: 'culture', name: 'Culture' },
    ],
    expertises: [
      {
        id: 1,
        code: 'swords',
        name: 'Swords',
        expertiseType: { id: 1, code: 'weapon', name: 'Weapon' },
      },
      {
        id: 2,
        code: 'bows',
        name: 'Bows',
        expertiseType: { id: 1, code: 'weapon', name: 'Weapon' },
      },
      {
        id: 3,
        code: 'light_armor',
        name: 'Light Armor',
        expertiseType: { id: 2, code: 'armor', name: 'Armor' },
      },
      {
        id: 4,
        code: 'heavy_armor',
        name: 'Heavy Armor',
        expertiseType: { id: 2, code: 'armor', name: 'Armor' },
      },
      {
        id: 5,
        code: 'smithing',
        name: 'Smithing',
        expertiseType: { id: 3, code: 'tool', name: 'Tool' },
      },
      {
        id: 6,
        code: 'alethi_culture',
        name: 'Alethi Culture',
        expertiseType: { id: 4, code: 'culture', name: 'Culture' },
      },
    ],
  }),
}));

vi.mock('src/constants/theme', () => ({
  RPG_COLORS: {
    badgeMuted: 'grey',
  },
}));

function createHeroExpertise(overrides: Partial<HeroExpertise> = {}): HeroExpertise {
  return {
    id: 1,
    heroId: 1,
    expertise: { id: 1, code: 'swords', name: 'Swords' },
    expertiseType: { id: 1, code: 'weapon', name: 'Weapon' },
    source: null,
    ...overrides,
  };
}

describe('ExpertisesTab', () => {
  const createWrapper = () =>
    shallowMount(ExpertisesTab, {
      global: {
        stubs: {
          QChip: {
            template: '<span class="q-chip" :aria-label="$attrs[\'aria-label\']"><slot /></span>',
          },
          QBadge: {
            template: '<span class="q-badge"><slot /></span>',
            props: ['color'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockExpertises.value = [
      createHeroExpertise({
        id: 1,
        expertise: { id: 1, code: 'swords', name: 'Swords' },
        source: { sourceType: 'culture', sourceId: 1 },
      }),
      createHeroExpertise({ id: 2, expertise: { id: 2, code: 'bows', name: 'Bows' } }),
      createHeroExpertise({
        id: 3,
        expertise: { id: 3, code: 'light_armor', name: 'Light Armor' },
        expertiseType: { id: 2, code: 'armor', name: 'Armor' },
        source: { sourceType: 'talent', sourceId: 5 },
      }),
      createHeroExpertise({
        id: 4,
        expertise: { id: 6, code: 'alethi_culture', name: 'Alethi Culture' },
        expertiseType: { id: 4, code: 'culture', name: 'Culture' },
        source: { sourceType: 'culture', sourceId: 1 },
      }),
    ];
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders description text', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Expertises grant advantage');
    });

    it('renders all expertise type sections', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Weapon');
      expect(wrapper.text()).toContain('Armor');
      expect(wrapper.text()).toContain('Tool');
      expect(wrapper.text()).toContain('Culture');
    });

    it('has accessibility region role', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[role="region"]').exists()).toBe(true);
    });

    it('has aria-label for region', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[aria-label="Character expertises"]').exists()).toBe(true);
    });
  });

  // ========================================
  // Expertise Display
  // ========================================
  describe('expertise display', () => {
    it('renders expertise names in chips', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Swords');
      expect(wrapper.text()).toContain('Bows');
      expect(wrapper.text()).toContain('Light Armor');
      expect(wrapper.text()).toContain('Alethi Culture');
    });

    it('does not render source badges', () => {
      const wrapper = createWrapper();

      const badges = wrapper.findAll('.q-badge');
      expect(badges.length).toBe(0);
    });
  });

  // ========================================
  // Empty States
  // ========================================
  describe('empty states', () => {
    it('shows empty message for expertise type with no expertises', () => {
      mockExpertises.value = []; // No expertises at all
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No weapon expertises');
      expect(wrapper.text()).toContain('No armor expertises');
      expect(wrapper.text()).toContain('No tool expertises');
      expect(wrapper.text()).toContain('No culture expertises');
    });

    it('shows empty message for specific type without expertises', () => {
      // Only weapon expertises
      mockExpertises.value = [
        createHeroExpertise({ expertise: { id: 1, code: 'swords', name: 'Swords' } }),
      ];
      const wrapper = createWrapper();

      // Should show Swords but empty for other types
      expect(wrapper.text()).toContain('Swords');
      expect(wrapper.text()).toContain('No armor expertises');
      expect(wrapper.text()).toContain('No tool expertises');
      expect(wrapper.text()).toContain('No culture expertises');
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('chips have aria-label with expertise name', () => {
      const wrapper = createWrapper();

      const chips = wrapper.findAll('.q-chip');
      const swordsChip = chips.find((c) => c.attributes('aria-label') === 'Swords expertise');
      expect(swordsChip).toBeDefined();
    });

    it('chips have aria-label for multi-word expertise names', () => {
      const wrapper = createWrapper();

      const chips = wrapper.findAll('.q-chip');
      const lightArmorChip = chips.find(
        (c) => c.attributes('aria-label') === 'Light Armor expertise'
      );
      expect(lightArmorChip).toBeDefined();
    });
  });

  // ========================================
  // Grouping
  // ========================================
  describe('expertise grouping', () => {
    it('groups weapon expertises together', () => {
      mockExpertises.value = [
        createHeroExpertise({ id: 1, expertise: { id: 1, code: 'swords', name: 'Swords' } }), // Swords (weapon)
        createHeroExpertise({ id: 2, expertise: { id: 2, code: 'bows', name: 'Bows' } }), // Bows (weapon)
      ];
      const wrapper = createWrapper();

      // Both should be in Weapon section
      expect(wrapper.text()).toContain('Swords');
      expect(wrapper.text()).toContain('Bows');
      // No armor expertises
      expect(wrapper.text()).toContain('No armor expertises');
    });

    it('groups armor expertises together', () => {
      mockExpertises.value = [
        createHeroExpertise({
          id: 1,
          expertise: { id: 3, code: 'light_armor', name: 'Light Armor' },
          expertiseType: { id: 2, code: 'armor', name: 'Armor' },
        }),
        createHeroExpertise({
          id: 2,
          expertise: { id: 4, code: 'heavy_armor', name: 'Heavy Armor' },
          expertiseType: { id: 2, code: 'armor', name: 'Armor' },
        }),
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Light Armor');
      expect(wrapper.text()).toContain('Heavy Armor');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles unknown expertise ID gracefully', () => {
      mockExpertises.value = [
        createHeroExpertise({ expertise: { id: 999, code: 'unknown', name: 'Unknown' } }),
      ];
      const wrapper = createWrapper();

      // Grouped by expertiseType (weapon), displays fallback name from classifier lookup
      expect(wrapper.findAll('.q-chip').length).toBe(1);
      expect(wrapper.text()).toContain('Unknown');
    });

    it('handles empty expertises array', () => {
      mockExpertises.value = [];
      const wrapper = createWrapper();

      // Should render all sections with empty messages
      expect(wrapper.findAll('.q-chip').length).toBe(0);
    });

    it('renders multiple expertises of same type correctly', () => {
      mockExpertises.value = [
        createHeroExpertise({ id: 1, expertise: { id: 1, code: 'swords', name: 'Swords' } }),
        createHeroExpertise({ id: 2, expertise: { id: 2, code: 'bows', name: 'Bows' } }),
        createHeroExpertise({
          id: 3,
          expertise: { id: 3, code: 'light_armor', name: 'Light Armor' },
          expertiseType: { id: 2, code: 'armor', name: 'Armor' },
        }),
        createHeroExpertise({
          id: 4,
          expertise: { id: 4, code: 'heavy_armor', name: 'Heavy Armor' },
          expertiseType: { id: 2, code: 'armor', name: 'Armor' },
        }),
        createHeroExpertise({
          id: 5,
          expertise: { id: 5, code: 'smithing', name: 'Smithing' },
          expertiseType: { id: 3, code: 'tool', name: 'Tool' },
        }),
        createHeroExpertise({
          id: 6,
          expertise: { id: 6, code: 'alethi_culture', name: 'Alethi Culture' },
          expertiseType: { id: 4, code: 'culture', name: 'Culture' },
        }),
      ];
      const wrapper = createWrapper();

      // All expertises should render
      const chips = wrapper.findAll('.q-chip');
      expect(chips.length).toBe(6);
    });
  });

  // ========================================
  // Custom Expertises
  // ========================================
  describe('custom expertises', () => {
    it('renders custom expertise with custom name', () => {
      mockExpertises.value = [
        createHeroExpertise({
          id: 10,
          expertise: null,
          expertiseType: { id: 3, code: 'tool', name: 'Tool' },
          customName: 'Glassblowing',
        }),
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Glassblowing');
      expect(wrapper.findAll('.q-chip').length).toBe(1);
    });

    it('groups custom expertise under correct type', () => {
      mockExpertises.value = [
        createHeroExpertise({
          id: 1,
          expertise: { id: 5, code: 'smithing', name: 'Smithing' },
          expertiseType: { id: 3, code: 'tool', name: 'Tool' },
        }),
        createHeroExpertise({
          id: 10,
          expertise: null,
          expertiseType: { id: 3, code: 'tool', name: 'Tool' },
          customName: 'Glassblowing',
        }),
      ];
      const wrapper = createWrapper();

      // Both should appear, tool section has 2 chips
      expect(wrapper.text()).toContain('Smithing');
      expect(wrapper.text()).toContain('Glassblowing');
      expect(wrapper.text()).toContain('No weapon expertises');
    });

    it('shows fallback name when custom expertise has no customName', () => {
      mockExpertises.value = [
        createHeroExpertise({
          id: 10,
          expertise: null,
          expertiseType: { id: 1, code: 'weapon', name: 'Weapon' },
          customName: null,
        }),
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Custom');
    });
  });
});
