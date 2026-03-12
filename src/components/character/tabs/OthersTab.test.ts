import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import OthersTab from './OthersTab.vue';
import type { HeroCulture, HeroGoal, HeroConnection, HeroCompanion, HeroInjury } from 'src/types';

const mockHero = ref<{
  ancestry: { id: number; code: string; name: string } | null;
  activeSingerForm: { id: number; code: string; name: string } | null;
  appearance: string | null;
  biography: string | null;
  notes: string | null;
} | null>(null);

const mockCultures = ref<HeroCulture[]>([]);
const mockGoals = ref<HeroGoal[]>([]);
const mockConnections = ref<HeroConnection[]>([]);
const mockCompanions = ref<HeroCompanion[]>([]);
const mockInjuries = ref<HeroInjury[]>([]);
const mockIsSinger = ref(false);

const mockConditions = ref<
  { id: number; condition: { code: string; name: string }; notes?: string }[]
>([]);
const mockUpsertInjury = vi.fn();
const mockRemoveInjury = vi.fn();
const mockUpdateGoalValue = vi.fn();

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
    get injuries() {
      return mockInjuries.value;
    },
    get conditions() {
      return mockConditions.value;
    },
    upsertInjury: mockUpsertInjury,
    removeInjury: mockRemoveInjury,
    updateGoalValue: mockUpdateGoalValue,
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
      { id: 1, code: 'human', name: 'Human', description: 'Humans are adaptable' },
      { id: 2, code: 'singer', name: 'Singer', description: 'Singers can change forms' },
    ],
    singerForms: [
      { id: 1, code: 'workform', name: 'Workform', description: 'For labor' },
      { id: 2, code: 'warform', name: 'Warform', description: 'For battle' },
    ],
    cultures: [
      { id: 1, code: 'alethi', name: 'Alethi' },
      { id: 2, code: 'thaylen', name: 'Thaylen' },
    ],
    goalStatuses: [
      { id: 1, code: 'active', name: 'Active' },
      { id: 2, code: 'completed', name: 'Completed' },
    ],
    connectionTypes: [
      { id: 1, code: 'ally', name: 'Ally' },
      { id: 2, code: 'enemy', name: 'Enemy' },
    ],
    companionTypes: [
      { id: 1, code: 'pet', name: 'Pet' },
      { id: 2, code: 'spren', name: 'Spren' },
    ],
    injuries: [
      { id: 1, code: 'broken-arm', name: 'Broken Arm' },
      { id: 2, code: 'concussion', name: 'Concussion' },
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
          SectionPanel: {
            template: `<div class="section-panel" :aria-label="label + ' section'">
              <slot name="icon" />
              <slot name="header-side" />
              <slot />
            </div>`,
            props: ['label', 'defaultOpened'],
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
          QCheckbox: {
            template: '<input type="checkbox" class="q-checkbox" />',
            props: ['modelValue', 'disable', 'size', 'dense'],
          },
          QSelect: {
            template: '<select class="q-select"></select>',
            props: ['modelValue', 'options', 'label'],
          },
          QInput: {
            template: '<input class="q-input" />',
            props: ['modelValue', 'label'],
          },
          QBtn: {
            template: '<button class="q-btn"><slot /></button>',
            props: ['flat', 'dense', 'round', 'size', 'icon', 'color', 'label', 'disable'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockHero.value = {
      ancestry: { id: 1, code: 'human', name: 'Human' },
      activeSingerForm: null,
      appearance: 'Tall with dark hair',
      biography: 'A hero from Alethkar',
      notes: 'Some player notes',
    };
    mockCultures.value = [];
    mockGoals.value = [];
    mockConnections.value = [];
    mockCompanions.value = [];
    mockInjuries.value = [];
    mockConditions.value = [];
    mockIsSinger.value = false;
  });

  // ========================================
  // Section Titles
  // ========================================
  describe('section titles', () => {
    it('renders Ancestry & Culture section', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[aria-label="Ancestry & Culture section"]').exists()).toBe(true);
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

    it('renders Injuries section', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[aria-label="Injuries section"]').exists()).toBe(true);
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
      mockHero.value!.ancestry = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Unknown');
    });

    it('renders culture names', () => {
      mockCultures.value = [
        { id: 1, heroId: 1, culture: { id: 1, code: 'c1', name: 'Culture1' } },
        { id: 2, heroId: 1, culture: { id: 2, code: 'c2', name: 'Culture2' } },
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
      mockHero.value!.activeSingerForm = { id: 2, code: 'warform', name: 'Warform' };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Current Form');
      expect(wrapper.text()).toContain('Warform');
    });

    it('shows singer form description', () => {
      mockIsSinger.value = true;
      mockHero.value!.activeSingerForm = { id: 2, code: 'warform', name: 'Warform' };
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
      mockHero.value!.activeSingerForm = null;
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
          status: { id: 1, code: 's1', name: 'Status1' },
          value: 3,
        },
      ] as HeroGoal[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Protect the king');
    });

    it('renders goal description', () => {
      mockGoals.value = [
        {
          id: 1,
          heroId: 1,
          name: 'Goal',
          description: 'Important task',
          status: { id: 1, code: 's1', name: 'Status1' },
          value: 3,
        },
      ] as HeroGoal[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Important task');
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
        {
          id: 1,
          heroId: 1,
          description: 'King Elhokar',
          connectionType: { id: 1, code: 'ct1', name: 'ConnType1' },
        },
      ] as HeroConnection[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('King Elhokar');
    });

    it('renders connection notes', () => {
      mockConnections.value = [
        {
          id: 1,
          heroId: 1,
          description: 'Friend',
          notes: 'Met in war',
          connectionType: { id: 1, code: 'ct1', name: 'ConnType1' },
        },
      ] as HeroConnection[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Met in war');
    });

    it('renders connection type badge', () => {
      mockConnections.value = [
        {
          id: 1,
          heroId: 1,
          description: 'Friend',
          connectionType: { id: 1, code: 'ct1', name: 'ConnType1' },
        },
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
        {
          id: 1,
          heroId: 1,
          description: null,
          connectionType: { id: 1, code: 'ct1', name: 'ConnType1' },
        },
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
        {
          id: 1,
          heroId: 1,
          description: 'Syl',
          companionType: { id: 2, code: 'cpt2', name: 'CompType2' },
        },
      ] as HeroCompanion[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Syl');
    });

    it('renders companion type badge', () => {
      mockCompanions.value = [
        {
          id: 1,
          heroId: 1,
          description: 'Syl',
          companionType: { id: 2, code: 'cpt2', name: 'CompType2' },
        },
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
        {
          id: 1,
          heroId: 1,
          description: null,
          companionType: { id: 1, code: 'cpt1', name: 'CompType1' },
        },
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
  // Injuries
  // ========================================
  describe('injuries', () => {
    it('renders injuries', () => {
      mockInjuries.value = [
        { id: 1, heroId: 1, injury: { id: 1, code: 'inj1', name: 'Injury1' } },
      ] as HeroInjury[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Broken Arm');
    });

    it('renders injury notes', () => {
      mockInjuries.value = [
        {
          id: 1,
          heroId: 1,
          injury: { id: 1, code: 'inj1', name: 'Injury1' },
          notes: 'From battle',
        },
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
        {
          id: 1,
          heroId: 1,
          name: 'Goal 1',
          status: { id: 1, code: 's1', name: 'Status1' },
          value: 3,
        },
        {
          id: 2,
          heroId: 1,
          name: 'Goal 2',
          status: { id: 2, code: 's2', name: 'Status2' },
          value: 4,
        },
      ] as HeroGoal[];
      mockConnections.value = [
        {
          id: 1,
          heroId: 1,
          description: 'Person 1',
          connectionType: { id: 1, code: 'ct1', name: 'ConnType1' },
        },
        {
          id: 2,
          heroId: 1,
          description: 'Person 2',
          connectionType: { id: 2, code: 'ct2', name: 'ConnType2' },
        },
      ] as HeroConnection[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Goal 1');
      expect(wrapper.text()).toContain('Goal 2');
      expect(wrapper.text()).toContain('Person 1');
      expect(wrapper.text()).toContain('Person 2');
    });
  });
});
