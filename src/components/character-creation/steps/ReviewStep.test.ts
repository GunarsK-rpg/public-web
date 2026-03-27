import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ReviewStep from './ReviewStep.vue';

// Reactive mock data
const mockDeleteHero = vi.fn();
const mockSetCampaign = vi.fn();
const mockWizardMode = { value: 'create' as 'create' | 'edit' };
const mockRouterPush = vi.fn();

const mockHeroData = {
  value: {
    hero: {
      id: 42,
      name: 'Test Hero',
      level: 3,
      ancestry: { id: 1, code: 'human', name: 'Human' },
      cultures: [{ culture: { id: 1, code: 'vorin', name: 'Vorin' } }],
      startingKit: { id: 1, code: 'adventurer', name: 'Adventurer' },
      radiantOrder: null as { id: number; code: string; name: string } | null,
      campaign: { id: 1, code: 'test-campaign', name: 'Test Campaign' } as {
        id: number;
        code: string;
        name: string;
      } | null,
      currency: 50,
    } as {
      id: number;
      name: string | null;
      level: number;
      ancestry: { id: number; code: string; name: string };
      cultures: Array<{ culture: { id: number; code: string; name: string } }> | undefined;
      startingKit: { id: number; code: string; name: string } | null;
      radiantOrder: { id: number; code: string; name: string } | null;
      campaign: { id: number; code: string; name: string } | null;
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
  value: [
    {
      id: 1,
      code: 'max_health',
      name: 'Health',
      baseValue: 15,
      baseDisplay: '15',
      modifier: 0,
      bonus: 0,
      totalValue: 15,
      totalDisplay: '15',
      hasModifier: true,
      displayValue: null,
    },
  ],
};

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock('src/services/heroService', () => ({
  default: { update: vi.fn() },
}));

vi.mock('src/services/heroPayloads', () => ({
  buildHeroCorePayload: vi.fn(() => ({})),
}));

import {
  heroStore,
  heroAttributesStore,
  heroTalentsStore,
  classifierStore,
  wizardStore,
} from 'src/__tests__/mockStores';

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    ...heroStore({
      deleteHero: mockDeleteHero,
      setCampaign: mockSetCampaign,
      updateFromResponse: vi.fn(),
    }),
    get hero() {
      return mockHeroData.value.hero;
    },
    get isNew() {
      return mockHeroData.value.hero?.id === 0;
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
  useHeroAttributesStore: () =>
    heroAttributesStore({
      getAttributeValue: vi.fn().mockReturnValue(3),
      getDerivedStatModifier: vi.fn().mockReturnValue(0),
      getDefenseValue: vi.fn().mockReturnValue(13),
      getStatBonus: vi.fn().mockReturnValue(0),
      baseAttributeValues: { str: 3, dex: 3 },
      levelData: { level: 3 },
      tierData: { tier: 1 },
    }),
}));

vi.mock('src/stores/heroTalents', () => ({
  useHeroTalentsStore: () => ({
    ...heroTalentsStore(),
    get isRadiant() {
      return mockTalentStoreData.value.isRadiant;
    },
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () =>
    classifierStore({
      ancestries: [{ id: 1, code: 'human', name: 'Human' }],
      cultures: [{ id: 1, code: 'vorin', name: 'Vorin' }],
      startingKits: [{ id: 1, code: 'adventurer', name: 'Adventurer' }],
      radiantOrders: [{ id: 1, code: 'windrunner', name: 'Windrunner' }],
      attributeTypes: [
        { id: 1, code: 'physical', name: 'Physical' },
        { id: 2, code: 'cognitive', name: 'Cognitive' },
        { id: 3, code: 'spiritual', name: 'Spiritual' },
      ],
      attributes: [
        { id: 1, code: 'str', name: 'Strength' },
        { id: 2, code: 'dex', name: 'Dexterity' },
      ],
      skills: [{ id: 1, code: 'athletics', name: 'Athletics' }],
      expertises: [{ id: 1, code: 'lockpicking', name: 'Lockpicking' }],
      talents: [
        {
          id: 1,
          code: 'power-attack',
          name: 'Power Attack',
          path: { id: 1, code: 'warrior', name: 'Warrior' },
          specialties: [],
          radiantOrder: null,
          surge: null,
          ancestry: null,
          isKey: false,
          special: [],
        },
      ],
      equipment: [
        {
          id: 1,
          code: 'sword',
          name: 'Sword',
          equipType: { id: 1, code: 'weapons', name: 'Weapons' },
        },
        { id: 2, code: 'rope', name: 'Rope', equipType: { id: 2, code: 'gear', name: 'Gear' } },
      ],
      paths: [{ id: 1, code: 'warrior', name: 'Warrior' }],
      equipmentTypes: [
        { id: 1, code: 'weapons', name: 'Weapons' },
        { id: 2, code: 'gear', name: 'Gear' },
      ],
    }),
}));

vi.mock('src/stores/wizard', () => ({
  useWizardStore: () => ({
    ...wizardStore(),
    get mode() {
      return mockWizardMode.value;
    },
  }),
}));

vi.mock('src/composables/useStepValidation', () => ({
  useStepValidation: () => ({
    get allStepsValidation() {
      return { value: mockValidationData.value };
    },
    budget: () => ({ budget: 0, spent: 0, remaining: 0 }),
    flexBudget: {
      value: {
        skills: { budget: 0, spent: 0, remaining: 0 },
        talents: { budget: 0, spent: 0, remaining: 0 },
        flex: { budget: 0, spent: 0, remaining: 0 },
        isOverBudget: false,
      },
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
          QBtn: {
            template:
              '<button class="q-btn" :data-testid="$attrs[\'data-testid\']" @click="$emit(\'click\')"><slot />{{ label }}</button>',
            props: ['label', 'color', 'flat'],
            emits: ['click'],
          },
          DefensesSection: {
            template: '<div class="defenses-section-stub" />',
            name: 'DefensesSection',
            props: ['defenses', 'deflect'],
          },
          AttributesSection: {
            template: '<div class="attributes-section-stub" />',
            name: 'AttributesSection',
            props: ['attributes'],
          },
          DerivedStatsSection: {
            template: '<div class="derived-stats-section-stub" />',
            name: 'DerivedStatsSection',
            props: ['title', 'stats'],
          },
          DeleteHeroDialog: {
            template: '<div class="delete-hero-dialog-stub" />',
            name: 'DeleteHeroDialog',
            props: ['modelValue'],
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    // Reset mock data to defaults
    mockWizardMode.value = 'create';
    mockHeroData.value = {
      hero: {
        id: 42,
        name: 'Test Hero',
        level: 3,
        ancestry: { id: 1, code: 'human', name: 'Human' },
        cultures: [{ culture: { id: 1, code: 'vorin', name: 'Vorin' } }],
        startingKit: { id: 1, code: 'adventurer', name: 'Adventurer' },
        radiantOrder: null,
        campaign: { id: 1, code: 'test-campaign', name: 'Test Campaign' },
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
      {
        id: 1,
        code: 'max_health',
        name: 'Health',
        baseValue: 15,
        baseDisplay: '15',
        modifier: 0,
        bonus: 0,
        totalValue: 15,
        totalDisplay: '15',
        hasModifier: true,
        displayValue: null,
      },
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
  // Attributes & Stats (shared components)
  // ========================================
  describe('attributes and stats sections', () => {
    it('renders DefensesSection component', () => {
      const wrapper = createWrapper();

      expect(wrapper.findComponent({ name: 'DefensesSection' }).exists()).toBe(true);
    });

    it('renders AttributesSection component', () => {
      const wrapper = createWrapper();

      expect(wrapper.findComponent({ name: 'AttributesSection' }).exists()).toBe(true);
    });

    it('renders DerivedStatsSection component', () => {
      const wrapper = createWrapper();

      expect(wrapper.findComponent({ name: 'DerivedStatsSection' }).exists()).toBe(true);
    });

    it('passes defense values to DefensesSection', () => {
      const wrapper = createWrapper();
      const defenses = wrapper.findComponent({ name: 'DefensesSection' });

      expect(defenses.props('defenses')).toEqual([
        { type: { id: 1, code: 'physical', name: 'Physical' }, value: 13 },
        { type: { id: 2, code: 'cognitive', name: 'Cognitive' }, value: 13 },
        { type: { id: 3, code: 'spiritual', name: 'Spiritual' }, value: 13 },
      ]);
    });

    it('passes attribute values to AttributesSection', () => {
      const wrapper = createWrapper();
      const attrs = wrapper.findComponent({ name: 'AttributesSection' });

      expect(attrs.props('attributes')).toEqual([
        { type: { id: 1, code: 'str', name: 'Strength' }, value: 3 },
        { type: { id: 2, code: 'dex', name: 'Dexterity' }, value: 3 },
      ]);
    });
  });

  // ========================================
  // Skills
  // ========================================
  describe('skills', () => {
    function getSkillsSection(wrapper: ReturnType<typeof createWrapper>) {
      // Second DerivedStatsSection is the skills section (first is derived stats)
      const sections = wrapper.findAllComponents({ name: 'DerivedStatsSection' });
      return sections.length > 1 ? sections[1] : undefined;
    }

    it('renders skills DerivedStatsSection when skills exist', () => {
      const wrapper = createWrapper();
      const section = getSkillsSection(wrapper);

      expect(section?.exists()).toBe(true);
    });

    it('passes skill data to DerivedStatsSection', () => {
      const wrapper = createWrapper();
      const section = getSkillsSection(wrapper);

      expect(section?.exists()).toBe(true);
      const stats = section!.props('stats');
      expect(stats).toEqual([
        { type: { id: 1, code: 'athletics', name: 'Athletics' }, value: 2, displayValue: '2 (+1)' },
      ]);
    });

    it('formats positive modifier in display value', () => {
      mockHeroData.value.skills = [
        { skill: { id: 1, code: 'athletics', name: 'Athletics' }, rank: 2, modifier: 3 },
      ];
      const wrapper = createWrapper();
      const section = getSkillsSection(wrapper);
      const stats = section!.props('stats');

      expect(stats[0].displayValue).toBe('2 (+3)');
    });

    it('formats negative modifier in display value', () => {
      mockHeroData.value.skills = [
        { skill: { id: 1, code: 'athletics', name: 'Athletics' }, rank: 2, modifier: -2 },
      ];
      const wrapper = createWrapper();
      const section = getSkillsSection(wrapper);
      const stats = section!.props('stats');

      expect(stats[0].displayValue).toBe('2 (-2)');
    });

    it('omits modifier from display when zero', () => {
      mockHeroData.value.skills = [
        { skill: { id: 1, code: 'athletics', name: 'Athletics' }, rank: 2, modifier: 0 },
      ];
      const wrapper = createWrapper();
      const section = getSkillsSection(wrapper);
      const stats = section!.props('stats');

      expect(stats[0].displayValue).toBe('2');
    });

    it('shows "No skills allocated" when no skills', () => {
      mockHeroData.value.skills = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No skills allocated');
      expect(getSkillsSection(wrapper)).toBeUndefined();
    });

    it('filters out skills with rank 0', () => {
      mockHeroData.value.skills = [
        { skill: { id: 1, code: 'athletics', name: 'Athletics' }, rank: 0, modifier: 0 },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No skills allocated');
      expect(getSkillsSection(wrapper)).toBeUndefined();
    });

    it('shows "Unknown" for skill with invalid skillId', () => {
      mockHeroData.value.skills = [
        { skill: { id: 999, code: 'unknown', name: 'Unknown' }, rank: 2, modifier: 0 },
      ];
      const wrapper = createWrapper();
      const section = getSkillsSection(wrapper);
      const stats = section!.props('stats');

      expect(stats[0].type.name).toBe('Unknown');
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
        id: 1,
        name: 'Test',
        level: 1,
        ancestry: { id: 1, code: 'human', name: 'Human' },
        cultures: undefined as unknown as Array<{
          culture: { id: number; code: string; name: string };
        }>,
        startingKit: { id: 1, code: 'adventurer', name: 'Adventurer' },
        radiantOrder: null,
        campaign: null,
        currency: 0,
      };
      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
    });
  });

  // ========================================
  // Danger Zone
  // ========================================
  describe('danger zone', () => {
    it('is hidden in create mode', () => {
      mockWizardMode.value = 'create';
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="delete-hero-btn"]').exists()).toBe(false);
    });

    it('is hidden for unpersisted hero in edit mode', () => {
      mockWizardMode.value = 'edit';
      mockHeroData.value.hero!.id = 0;
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="delete-hero-btn"]').exists()).toBe(false);
    });

    it('is visible in edit mode for persisted hero', () => {
      mockWizardMode.value = 'edit';
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="delete-hero-btn"]').exists()).toBe(true);
    });

    it('shows leave campaign button when hero has campaign', () => {
      mockWizardMode.value = 'edit';
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="leave-campaign-btn"]').exists()).toBe(true);
    });

    it('hides leave campaign button when hero has no campaign', () => {
      mockWizardMode.value = 'edit';
      mockHeroData.value.hero!.campaign = null;
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="leave-campaign-btn"]').exists()).toBe(false);
    });

    it('shows delete character button', () => {
      mockWizardMode.value = 'edit';
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="delete-hero-btn"]').exists()).toBe(true);
    });

    it('opens delete dialog when delete button is clicked', async () => {
      mockWizardMode.value = 'edit';
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="delete-hero-btn"]').trigger('click');

      expect(wrapper.findComponent({ name: 'DeleteHeroDialog' }).props('modelValue')).toBe(true);
    });

    it('calls deleteHero on dialog confirm and navigates on success', async () => {
      mockWizardMode.value = 'edit';
      mockDeleteHero.mockResolvedValueOnce(true);
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="delete-hero-btn"]').trigger('click');
      const dialog = wrapper.findComponent({ name: 'DeleteHeroDialog' });
      dialog.vm.$emit('confirm');
      await wrapper.vm.$nextTick();

      expect(mockDeleteHero).toHaveBeenCalled();
      await vi.waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith({ name: 'my-characters' });
      });
    });

    it('does not navigate on failed deletion', async () => {
      mockWizardMode.value = 'edit';
      mockDeleteHero.mockResolvedValueOnce(false);
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="delete-hero-btn"]').trigger('click');
      const dialog = wrapper.findComponent({ name: 'DeleteHeroDialog' });
      dialog.vm.$emit('confirm');
      await wrapper.vm.$nextTick();

      await vi.waitFor(() => {
        expect(mockDeleteHero).toHaveBeenCalled();
      });
      expect(mockRouterPush).not.toHaveBeenCalledWith({ name: 'my-characters' });
    });
  });
});
