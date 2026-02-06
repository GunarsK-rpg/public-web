import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ReviewStep from './ReviewStep.vue';

// Reactive mock data
const mockHeroData = {
  value: {
    hero: {
      name: 'Test Hero',
      level: 3,
      ancestry: { id: 1, code: 'human', name: 'Human' },
      cultures: [{ culture: { id: 1, code: 'vorin', name: 'Vorin' } }],
      startingKit: { id: 1, code: 'adventurer', name: 'Adventurer' },
      radiantOrder: null as { id: number; code: string; name: string } | null,
      currency: 50,
    } as {
      name: string | null;
      level: number;
      ancestry: { id: number; code: string; name: string };
      cultures: Array<{ culture: { id: number; code: string; name: string } }> | undefined;
      startingKit: { id: number; code: string; name: string } | null;
      radiantOrder: { id: number; code: string; name: string } | null;
      currency: number;
    } | null,
    skills: [
      { skill: { id: 1, code: 'athletics', name: 'Athletics' }, rank: 2, modifier: 1 },
    ] as Array<{
      skill: { id: number; code: string; name: string };
      rank: number;
      modifier: number;
    }>,
    expertises: [{ expertise: { id: 1, code: 'lockpicking', name: 'Lockpicking' } }] as Array<{
      expertise: { id: number; code: string; name: string };
    }>,
    talents: [{ talent: { id: 1, code: 'power-attack', name: 'Power Attack' } }] as Array<{
      talent: { id: number; code: string; name: string };
    }>,
    equipment: [{ id: 1, equipment: { id: 1, code: 'sword', name: 'Sword' }, amount: 1 }] as Array<{
      id: number;
      equipment: { id: number; code: string; name: string };
      amount: number;
    }>,
  },
};

const mockTalentStoreData = {
  value: {
    isRadiant: false,
  },
};

const mockValidationData = {
  value: {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
  },
};

const mockDerivedStats = {
  value: [{ id: 1, name: 'Health', baseDisplay: '15', modifier: 0, totalDisplay: '15' }] as Array<{
    id: number;
    name: string;
    baseDisplay: string;
    modifier: number;
    totalDisplay: string;
  }>,
};

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get hero() {
      return mockHeroData.value.hero;
    },
    get skills() {
      return mockHeroData.value.skills;
    },
    get expertises() {
      return mockHeroData.value.expertises;
    },
    get talents() {
      return mockHeroData.value.talents;
    },
    get equipment() {
      return mockHeroData.value.equipment;
    },
  }),
}));

vi.mock('src/stores/heroAttributes', () => ({
  useHeroAttributesStore: () => ({
    getAttributeValue: vi.fn().mockReturnValue(3),
    getDerivedStatModifier: vi.fn().mockReturnValue(0),
    levelData: { level: 3 },
    tierData: { tier: 1 },
  }),
}));

vi.mock('src/stores/heroTalents', () => ({
  useHeroTalentsStore: () => ({
    get isRadiant() {
      return mockTalentStoreData.value.isRadiant;
    },
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    ancestries: [{ id: 1, code: 'human', name: 'Human' }],
    cultures: [{ id: 1, code: 'vorin', name: 'Vorin' }],
    startingKits: [{ id: 1, code: 'adventurer', name: 'Adventurer' }],
    radiantOrders: [{ id: 1, code: 'windrunner', name: 'Windrunner' }],
    attributes: [
      { id: 1, code: 'str', name: 'Strength' },
      { id: 2, code: 'dex', name: 'Dexterity' },
    ],
    derivedStats: [],
    derivedStatValues: [],
    skills: [{ id: 1, code: 'athletics', name: 'Athletics' }],
    expertises: [{ id: 1, code: 'lockpicking', name: 'Lockpicking' }],
    talents: [{ id: 1, code: 'power-attack', name: 'Power Attack' }],
    equipment: [
      {
        id: 1,
        code: 'sword',
        name: 'Sword',
        equipType: { id: 1, code: 'weapons', name: 'Weapons' },
      },
      { id: 2, code: 'rope', name: 'Rope', equipType: { id: 2, code: 'gear', name: 'Gear' } },
    ],
    equipmentTypes: [
      { id: 1, code: 'weapons', name: 'Weapons' },
      { id: 2, code: 'gear', name: 'Gear' },
    ],
  }),
}));

vi.mock('src/composables/useStepValidation', () => ({
  useStepValidation: () => ({
    get allStepsValidation() {
      return { value: mockValidationData.value };
    },
  }),
}));

vi.mock('src/utils/derivedStats', () => ({
  buildDerivedStatsList: () => mockDerivedStats.value,
}));

vi.mock('src/utils/arrayUtils', () => ({
  findById: <T extends { id: number }>(arr: T[], id: number | null | undefined) =>
    arr?.find((item) => item.id === id),
}));

describe('ReviewStep', () => {
  const createWrapper = () =>
    shallowMount(ReviewStep, {
      global: {
        stubs: {
          QBanner: {
            template:
              '<div class="q-banner" :class="$attrs.class" :role="$attrs.role"><slot name="avatar" /><slot /></div>',
          },
          QIcon: {
            template: '<span class="q-icon" />',
          },
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
          QChip: {
            template: '<span class="q-chip"><slot /></span>',
            props: ['color', 'textColor', 'outline'],
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    // Reset mock data to defaults
    mockHeroData.value = {
      hero: {
        name: 'Test Hero',
        level: 3,
        ancestry: { id: 1, code: 'human', name: 'Human' },
        cultures: [{ culture: { id: 1, code: 'vorin', name: 'Vorin' } }],
        startingKit: { id: 1, code: 'adventurer', name: 'Adventurer' },
        radiantOrder: null,
        currency: 50,
      },
      skills: [{ skill: { id: 1, code: 'athletics', name: 'Athletics' }, rank: 2, modifier: 1 }],
      expertises: [{ expertise: { id: 1, code: 'lockpicking', name: 'Lockpicking' } }],
      talents: [{ talent: { id: 1, code: 'power-attack', name: 'Power Attack' } }],
      equipment: [{ id: 1, equipment: { id: 1, code: 'sword', name: 'Sword' }, amount: 1 }],
    };
    mockTalentStoreData.value = { isRadiant: false };
    mockValidationData.value = { isValid: true, errors: [], warnings: [] };
    mockDerivedStats.value = [
      { id: 1, name: 'Health', baseDisplay: '15', modifier: 0, totalDisplay: '15' },
    ];
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders step description', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Review your character');
    });

    it('renders character name', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Test Hero');
    });

    it('renders character level', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Level 3');
    });
  });

  // ========================================
  // Validation Banner
  // ========================================
  describe('validation banner', () => {
    it('shows success banner when valid', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('ready to create');
      expect(wrapper.find('.banner-success').exists()).toBe(true);
    });

    it('shows error banner when not valid', () => {
      mockValidationData.value = {
        isValid: false,
        errors: ['Name is required', 'Level must be at least 1'],
        warnings: [],
      };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Validation Errors');
      expect(wrapper.text()).toContain('Name is required');
      expect(wrapper.text()).toContain('Level must be at least 1');
      expect(wrapper.find('.banner-error').exists()).toBe(true);
    });

    it('has correct accessibility attributes on error banner', () => {
      mockValidationData.value = { isValid: false, errors: ['Error'], warnings: [] };
      const wrapper = createWrapper();

      const banner = wrapper.find('.banner-error');
      expect(banner.attributes('role')).toBe('alert');
    });
  });

  // ========================================
  // Basic Info
  // ========================================
  describe('basic info', () => {
    it('displays ancestry', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Human');
    });

    it('displays culture', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Vorin');
    });

    it('displays starting kit', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Adventurer');
    });

    it('shows radiant order when isRadiant is true', () => {
      mockTalentStoreData.value.isRadiant = true;
      mockHeroData.value.hero!.radiantOrder = { id: 1, code: 'windrunner', name: 'Windrunner' };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Radiant Order');
      expect(wrapper.text()).toContain('Windrunner');
    });

    it('does not show radiant order when isRadiant is false', () => {
      mockTalentStoreData.value.isRadiant = false;
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Radiant Order');
    });

    it('shows "Unnamed Character" when hero name is null', () => {
      mockHeroData.value.hero!.name = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Unnamed Character');
    });

    it('shows "Unknown" when ancestry is not found', () => {
      mockHeroData.value.hero!.ancestry = { id: 999, code: 'unknown', name: 'Unknown' };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Unknown');
    });

    it('shows "None" when culture is not found', () => {
      mockHeroData.value.hero!.cultures = [
        { culture: { id: 999, code: 'unknown', name: 'Unknown' } },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('None');
    });

    it('shows "None" when no cultures', () => {
      mockHeroData.value.hero!.cultures = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('None');
    });

    it('shows "None" when starting kit is not found', () => {
      mockHeroData.value.hero!.startingKit = { id: 999, code: 'unknown', name: 'Unknown' };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('None');
    });
  });

  // ========================================
  // Attributes
  // ========================================
  describe('attributes', () => {
    it('renders attributes section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Attributes');
    });

    it('shows attribute abbreviations', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('STR');
      expect(wrapper.text()).toContain('DEX');
    });
  });

  // ========================================
  // Derived Stats
  // ========================================
  describe('derived stats', () => {
    it('renders derived stats section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Derived Stats');
    });

    it('displays derived stat values', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Health');
    });

    it('shows modifier when modifier is positive', () => {
      mockDerivedStats.value = [
        { id: 1, name: 'Health', baseDisplay: '15', modifier: 5, totalDisplay: '20' },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('+5');
      expect(wrapper.text()).toContain('= 20');
    });

    it('shows modifier when modifier is negative', () => {
      mockDerivedStats.value = [
        { id: 1, name: 'Health', baseDisplay: '15', modifier: -3, totalDisplay: '12' },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('-3');
      expect(wrapper.text()).toContain('= 12');
    });

    it('does not show modifier when modifier is 0', () => {
      mockDerivedStats.value = [
        { id: 1, name: 'Health', baseDisplay: '15', modifier: 0, totalDisplay: '15' },
      ];
      const wrapper = createWrapper();

      // Should show base but not modifier notation
      expect(wrapper.text()).toContain('15');
      expect(wrapper.text()).not.toContain('+0');
    });
  });

  // ========================================
  // Skills
  // ========================================
  describe('skills', () => {
    it('renders skills section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Skills');
    });

    it('displays skills with ranks', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Athletics');
    });

    it('shows skill modifier when positive', () => {
      mockHeroData.value.skills = [
        { skill: { id: 1, code: 'athletics', name: 'Athletics' }, rank: 2, modifier: 3 },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('+3');
    });

    it('shows skill modifier when negative', () => {
      mockHeroData.value.skills = [
        { skill: { id: 1, code: 'athletics', name: 'Athletics' }, rank: 2, modifier: -2 },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('-2');
    });

    it('does not show skill modifier when modifier is 0', () => {
      mockHeroData.value.skills = [
        { skill: { id: 1, code: 'athletics', name: 'Athletics' }, rank: 2, modifier: 0 },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Athletics');
      expect(wrapper.text()).not.toContain('+0');
      expect(wrapper.text()).not.toContain('(0)');
    });

    it('shows "No skills allocated" when no skills', () => {
      mockHeroData.value.skills = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No skills allocated');
    });

    it('filters out skills with rank 0', () => {
      mockHeroData.value.skills = [
        { skill: { id: 1, code: 'athletics', name: 'Athletics' }, rank: 0, modifier: 0 },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Athletics:');
      expect(wrapper.text()).toContain('No skills allocated');
    });

    it('shows "Unknown" for skill with invalid skillId', () => {
      mockHeroData.value.skills = [
        { skill: { id: 999, code: 'unknown', name: 'Unknown' }, rank: 2, modifier: 0 },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Unknown');
    });
  });

  // ========================================
  // Expertises
  // ========================================
  describe('expertises', () => {
    it('renders expertises section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Expertises');
    });

    it('displays expertise chips', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Lockpicking');
    });

    it('shows "No expertises selected" when no expertises', () => {
      mockHeroData.value.expertises = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No expertises selected');
    });

    it('shows "Unknown" for expertise with invalid expertiseId', () => {
      mockHeroData.value.expertises = [
        { expertise: { id: 999, code: 'unknown', name: 'Unknown' } },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Unknown');
    });
  });

  // ========================================
  // Talents
  // ========================================
  describe('talents', () => {
    it('renders talents section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Talents');
    });

    it('displays talent chips', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Power Attack');
    });

    it('shows "No talents selected" when no talents', () => {
      mockHeroData.value.talents = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No talents selected');
    });

    it('shows "Unknown" for talent with invalid talentId', () => {
      mockHeroData.value.talents = [{ talent: { id: 999, code: 'unknown', name: 'Unknown' } }];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Unknown');
    });
  });

  // ========================================
  // Equipment
  // ========================================
  describe('equipment', () => {
    it('renders equipment section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Equipment');
    });

    it('displays currency', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('50');
      expect(wrapper.text()).toContain('diamond marks');
    });

    it('displays equipment items', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Sword');
    });

    it('shows "No equipment" when no equipment', () => {
      mockHeroData.value.equipment = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No equipment');
    });

    it('displays equipment amount', () => {
      mockHeroData.value.equipment = [
        { id: 1, equipment: { id: 1, code: 'sword', name: 'Sword' }, amount: 3 },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('x3');
    });

    it('does not display equipment with invalid equipmentId (no type)', () => {
      // Equipment with invalid ID has no type, so it won't appear in any type section
      mockHeroData.value.equipment = [
        { id: 1, equipment: { id: 999, code: 'unknown', name: 'Unknown' }, amount: 1 },
      ];
      const wrapper = createWrapper();

      // Should not appear in weapons or gear sections
      expect(wrapper.text()).not.toContain('Unknown x1');
    });

    it('groups equipment by type', () => {
      mockHeroData.value.equipment = [
        { id: 1, equipment: { id: 1, code: 'sword', name: 'Sword' }, amount: 1 },
        { id: 2, equipment: { id: 2, code: 'rope', name: 'Rope' }, amount: 1 },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Weapons');
      expect(wrapper.text()).toContain('Gear');
      expect(wrapper.text()).toContain('Sword');
      expect(wrapper.text()).toContain('Rope');
    });

    it('shows 0 currency when hero currency is 0', () => {
      mockHeroData.value.hero!.currency = 0;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('0 diamond marks');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles null hero', () => {
      mockHeroData.value.hero = null;
      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toContain('Unnamed Character');
    });

    it('handles undefined hero cultures', () => {
      mockHeroData.value.hero = {
        name: 'Test',
        level: 1,
        ancestry: { id: 1, code: 'human', name: 'Human' },
        cultures: undefined as unknown as Array<{
          culture: { id: number; code: string; name: string };
        }>,
        startingKit: { id: 1, code: 'adventurer', name: 'Adventurer' },
        radiantOrder: null,
        currency: 0,
      };
      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
    });
  });
});
