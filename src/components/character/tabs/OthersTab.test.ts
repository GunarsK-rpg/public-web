import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import OthersTab from './OthersTab.vue';
import type {
  HeroCulture,
  HeroGoal,
  HeroConnection,
  HeroCompanion,
  HeroCondition,
  HeroInjury,
} from 'src/types';

const mockHero = ref<{
  ancestryId: number | null;
  activeSingerFormId: number | null;
  appearance: string | null;
  biography: string | null;
  notes: string | null;
} | null>(null);

const mockCultures = ref<HeroCulture[]>([]);
const mockGoals = ref<HeroGoal[]>([]);
const mockConnections = ref<HeroConnection[]>([]);
const mockCompanions = ref<HeroCompanion[]>([]);
const mockConditions = ref<HeroCondition[]>([]);
const mockInjuries = ref<HeroInjury[]>([]);
const mockIsSinger = ref(false);

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get hero() {
      return mockHero.value;
    },
    get cultures() {
      return mockCultures.value;
    },
    get goals() {
      return mockGoals.value;
    },
    get connections() {
      return mockConnections.value;
    },
    get companions() {
      return mockCompanions.value;
    },
    get conditions() {
      return mockConditions.value;
    },
    get injuries() {
      return mockInjuries.value;
    },
  }),
}));

vi.mock('src/stores/heroTalents', () => ({
  useHeroTalentsStore: () => ({
    get isSinger() {
      return mockIsSinger.value;
    },
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    ancestries: [
      { id: 1, name: 'Human', description: 'Humans are adaptable' },
      { id: 2, name: 'Singer', description: 'Singers can change forms' },
    ],
    singerForms: [
      { id: 1, name: 'Workform', description: 'For labor' },
      { id: 2, name: 'Warform', description: 'For battle' },
    ],
    cultures: [
      { id: 1, name: 'Alethi' },
      { id: 2, name: 'Thaylen' },
    ],
    goalStatuses: [
      { id: 1, name: 'Active' },
      { id: 2, name: 'Completed' },
    ],
    connectionTypes: [
      { id: 1, name: 'Ally' },
      { id: 2, name: 'Enemy' },
    ],
    companionTypes: [
      { id: 1, name: 'Pet' },
      { id: 2, name: 'Spren' },
    ],
    conditions: [
      { id: 1, name: 'Exhausted' },
      { id: 2, name: 'Frightened' },
    ],
    injuries: [
      { id: 1, name: 'Broken Arm' },
      { id: 2, name: 'Concussion' },
    ],
  }),
}));

vi.mock('src/constants/theme', () => ({
  RPG_COLORS: {
    badgeMuted: 'grey',
  },
}));

describe('OthersTab', () => {
  const createWrapper = () =>
    shallowMount(OthersTab, {
      global: {
        stubs: {
          QExpansionItem: {
            template: `<div class="q-expansion-item" :aria-label="$attrs['aria-label']">
              <slot />
            </div>`,
            props: ['icon', 'label', 'defaultOpened'],
          },
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QList: {
            template: '<div class="q-list"><slot /></div>',
            props: ['separator', 'dense'],
          },
          QItem: {
            template: '<div class="q-item"><slot /></div>',
            props: ['dense'],
          },
          QItemSection: {
            template: '<div class="q-item-section"><slot /></div>',
          },
          QItemLabel: {
            template: '<div class="q-item-label"><slot /></div>',
          },
          QChip: {
            template: '<span class="q-chip"><slot /></span>',
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
    mockHero.value = {
      ancestryId: 1,
      activeSingerFormId: null,
      appearance: 'Tall with dark hair',
      biography: 'A hero from Alethkar',
      notes: 'Some player notes',
    };
    mockCultures.value = [];
    mockGoals.value = [];
    mockConnections.value = [];
    mockCompanions.value = [];
    mockConditions.value = [];
    mockInjuries.value = [];
    mockIsSinger.value = false;
  });

  // ========================================
  // Section Titles
  // ========================================
  describe('section titles', () => {
    it('renders Ancestry & Culture section', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[aria-label="Ancestry and Culture section"]').exists()).toBe(true);
    });

    it('renders Goals section', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[aria-label="Goals section"]').exists()).toBe(true);
    });

    it('renders Connections section', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[aria-label="Connections section"]').exists()).toBe(true);
    });

    it('renders Companions section', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[aria-label="Companions section"]').exists()).toBe(true);
    });

    it('renders Biography section', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[aria-label="Biography section"]').exists()).toBe(true);
    });

    it('renders Conditions & Injuries section', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[aria-label="Conditions and Injuries section"]').exists()).toBe(true);
    });
  });

  // ========================================
  // Ancestry & Culture
  // ========================================
  describe('ancestry & culture', () => {
    it('renders ancestry name', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Human');
    });

    it('renders ancestry description', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Humans are adaptable');
    });

    it('shows Unknown when no ancestry', () => {
      mockHero.value!.ancestryId = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Unknown');
    });

    it('renders culture names', () => {
      mockCultures.value = [
        { id: 1, heroId: 1, cultureId: 1 },
        { id: 2, heroId: 1, cultureId: 2 },
      ] as HeroCulture[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Alethi');
      expect(wrapper.text()).toContain('Thaylen');
    });

    it('shows empty message when no cultures', () => {
      mockCultures.value = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No cultures selected');
    });
  });

  // ========================================
  // Singer Form
  // ========================================
  describe('singer form', () => {
    it('shows singer form when singer and form is active', () => {
      mockIsSinger.value = true;
      mockHero.value!.activeSingerFormId = 2;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Current Form');
      expect(wrapper.text()).toContain('Warform');
    });

    it('shows singer form description', () => {
      mockIsSinger.value = true;
      mockHero.value!.activeSingerFormId = 2;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('For battle');
    });

    it('does not show singer form section for non-singers', () => {
      mockIsSinger.value = false;
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Current Form');
    });

    it('does not show singer form when no active form', () => {
      mockIsSinger.value = true;
      mockHero.value!.activeSingerFormId = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Current Form');
    });
  });

  // ========================================
  // Goals
  // ========================================
  describe('goals', () => {
    it('renders goals with name', () => {
      mockGoals.value = [
        {
          id: 1,
          heroId: 1,
          name: 'Protect the king',
          description: 'Guard duty',
          statusId: 1,
          value: 3,
        },
      ] as HeroGoal[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Protect the king');
    });

    it('renders goal description', () => {
      mockGoals.value = [
        { id: 1, heroId: 1, name: 'Goal', description: 'Important task', statusId: 1, value: 3 },
      ] as HeroGoal[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Important task');
    });

    it('renders goal status badge', () => {
      mockGoals.value = [{ id: 1, heroId: 1, name: 'Goal', statusId: 1, value: 3 }] as HeroGoal[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Active');
    });

    it('shows empty message when no goals', () => {
      mockGoals.value = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No goals set');
    });
  });

  // ========================================
  // Connections
  // ========================================
  describe('connections', () => {
    it('renders connections with description', () => {
      mockConnections.value = [
        { id: 1, heroId: 1, description: 'King Elhokar', connTypeId: 1 },
      ] as HeroConnection[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('King Elhokar');
    });

    it('renders connection notes', () => {
      mockConnections.value = [
        { id: 1, heroId: 1, description: 'Friend', notes: 'Met in war', connTypeId: 1 },
      ] as HeroConnection[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Met in war');
    });

    it('renders connection type badge', () => {
      mockConnections.value = [
        { id: 1, heroId: 1, description: 'Friend', connTypeId: 1 },
      ] as HeroConnection[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Ally');
    });

    it('shows empty message when no connections', () => {
      mockConnections.value = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No connections');
    });

    it('shows fallback for connection without description', () => {
      mockConnections.value = [
        { id: 1, heroId: 1, description: null, connTypeId: 1 },
      ] as HeroConnection[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Connection');
    });
  });

  // ========================================
  // Companions
  // ========================================
  describe('companions', () => {
    it('renders companions with description', () => {
      mockCompanions.value = [
        { id: 1, heroId: 1, description: 'Syl', compTypeId: 2 },
      ] as HeroCompanion[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Syl');
    });

    it('renders companion type badge', () => {
      mockCompanions.value = [
        { id: 1, heroId: 1, description: 'Syl', compTypeId: 2 },
      ] as HeroCompanion[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Spren');
    });

    it('shows empty message when no companions', () => {
      mockCompanions.value = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No companions');
    });

    it('shows fallback for companion without description', () => {
      mockCompanions.value = [
        { id: 1, heroId: 1, description: null, compTypeId: 1 },
      ] as HeroCompanion[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Companion');
    });
  });

  // ========================================
  // Biography
  // ========================================
  describe('biography', () => {
    it('renders appearance', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Tall with dark hair');
    });

    it('renders biography text', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('A hero from Alethkar');
    });

    it('renders notes', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Some player notes');
    });

    it('shows fallback for missing appearance', () => {
      mockHero.value!.appearance = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No appearance description');
    });

    it('shows fallback for missing biography', () => {
      mockHero.value!.biography = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No biography');
    });

    it('shows fallback for missing notes', () => {
      mockHero.value!.notes = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No notes');
    });
  });

  // ========================================
  // Conditions & Injuries
  // ========================================
  describe('conditions & injuries', () => {
    it('renders active conditions', () => {
      mockConditions.value = [{ id: 1, heroId: 1, conditionId: 1 }] as HeroCondition[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Exhausted');
    });

    it('shows empty message when no conditions', () => {
      mockConditions.value = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No active conditions');
    });

    it('renders injuries', () => {
      mockInjuries.value = [{ id: 1, heroId: 1, injuryId: 1 }] as HeroInjury[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Broken Arm');
    });

    it('renders injury notes', () => {
      mockInjuries.value = [
        { id: 1, heroId: 1, injuryId: 1, notes: 'From battle' },
      ] as HeroInjury[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('From battle');
    });

    it('shows empty message when no injuries', () => {
      mockInjuries.value = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No injuries');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles null hero gracefully', () => {
      mockHero.value = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Unknown');
      expect(wrapper.text()).toContain('No appearance description');
    });

    it('handles multiple items in each section', () => {
      mockGoals.value = [
        { id: 1, heroId: 1, name: 'Goal 1', statusId: 1, value: 3 },
        { id: 2, heroId: 1, name: 'Goal 2', statusId: 2, value: 4 },
      ] as HeroGoal[];
      mockConnections.value = [
        { id: 1, heroId: 1, description: 'Person 1', connTypeId: 1 },
        { id: 2, heroId: 1, description: 'Person 2', connTypeId: 2 },
      ] as HeroConnection[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Goal 1');
      expect(wrapper.text()).toContain('Goal 2');
      expect(wrapper.text()).toContain('Person 1');
      expect(wrapper.text()).toContain('Person 2');
    });
  });
});
