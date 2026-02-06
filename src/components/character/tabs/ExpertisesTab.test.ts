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
      {
        id: 1,
        heroId: 1,
        expertise: { id: 1, code: 'exp1', name: 'Expertise1' },
        source: { sourceType: 'culture', sourceId: 1 },
      },
      { id: 2, heroId: 1, expertise: { id: 2, code: 'exp2', name: 'Expertise2' }, source: null },
      {
        id: 3,
        heroId: 1,
        expertise: { id: 3, code: 'exp3', name: 'Expertise3' },
        source: { sourceType: 'talent', sourceId: 5 },
      },
      {
        id: 4,
        heroId: 1,
        expertise: { id: 6, code: 'exp6', name: 'Expertise6' },
        source: { sourceType: 'culture', sourceId: 1 },
      },
    ] as HeroExpertise[];
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

    it('shows source badge when source is present', () => {
      const wrapper = createWrapper();

      const badges = wrapper.findAll('.q-badge');
      // Swords has culture source, Light Armor has talent source, Alethi Culture has culture source
      expect(badges.length).toBe(3);
    });

    it('displays source type in badge', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('culture');
      expect(wrapper.text()).toContain('talent');
    });

    it('does not show badge when source is null', () => {
      // Bows has no source
      const wrapper = createWrapper();

      // Bows chip should exist but without badge inside
      const chips = wrapper.findAll('.q-chip');
      const bowsChip = chips.find((c) => c.text().includes('Bows'));
      expect(bowsChip).toBeDefined();
      // The text should be just "Bows" without a source type
      expect(bowsChip?.text()).not.toContain('culture');
      expect(bowsChip?.text()).not.toContain('talent');
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
        { id: 1, expertise: { id: 1, code: 'exp1', name: 'Expertise1' }, source: null },
      ] as HeroExpertise[];
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
  });

  // ========================================
  // Grouping
  // ========================================
  describe('expertise grouping', () => {
    it('groups weapon expertises together', () => {
      mockExpertises.value = [
        { id: 1, expertise: { id: 1, code: 'exp1', name: 'Expertise1' }, source: null }, // Swords (weapon)
        { id: 2, expertise: { id: 2, code: 'exp2', name: 'Expertise2' }, source: null }, // Bows (weapon)
      ] as HeroExpertise[];
      const wrapper = createWrapper();

      // Both should be in Weapon section
      expect(wrapper.text()).toContain('Swords');
      expect(wrapper.text()).toContain('Bows');
      // No armor expertises
      expect(wrapper.text()).toContain('No armor expertises');
    });

    it('groups armor expertises together', () => {
      mockExpertises.value = [
        { id: 1, expertise: { id: 3, code: 'exp3', name: 'Expertise3' }, source: null }, // Light Armor
        { id: 2, expertise: { id: 4, code: 'exp4', name: 'Expertise4' }, source: null }, // Heavy Armor
      ] as HeroExpertise[];
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
        { id: 1, expertise: { id: 999, code: 'exp999', name: 'Expertise999' }, source: null }, // Non-existent expertise
      ] as HeroExpertise[];
      const wrapper = createWrapper();

      // Should not crash, expertise won't be grouped into any type
      expect(wrapper.exists()).toBe(true);
    });

    it('handles empty expertises array', () => {
      mockExpertises.value = [];
      const wrapper = createWrapper();

      // Should render all sections with empty messages
      expect(wrapper.findAll('.q-chip').length).toBe(0);
    });

    it('renders multiple expertises of same type correctly', () => {
      mockExpertises.value = [
        { id: 1, expertise: { id: 1, code: 'exp1', name: 'Expertise1' }, source: null }, // Swords
        { id: 2, expertise: { id: 2, code: 'exp2', name: 'Expertise2' }, source: null }, // Bows
        { id: 3, expertise: { id: 3, code: 'exp3', name: 'Expertise3' }, source: null }, // Light Armor
        { id: 4, expertise: { id: 4, code: 'exp4', name: 'Expertise4' }, source: null }, // Heavy Armor
        { id: 5, expertise: { id: 5, code: 'exp5', name: 'Expertise5' }, source: null }, // Smithing
        { id: 6, expertise: { id: 6, code: 'exp6', name: 'Expertise6' }, source: null }, // Alethi Culture
      ] as HeroExpertise[];
      const wrapper = createWrapper();

      // All expertises should render
      const chips = wrapper.findAll('.q-chip');
      expect(chips.length).toBe(6);
    });
  });
});
