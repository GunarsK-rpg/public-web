import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import OthersTab from './OthersTab.vue';
import EditableItemList from 'src/components/shared/EditableItemList.vue';
import type {
  HeroCulture,
  HeroGoal,
  HeroConnection,
  HeroCompanion,
  HeroInjury,
  HeroNote,
} from 'src/types';

const mockHero = ref<{
  id: number;
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
const mockHeroNotes = ref<HeroNote[]>([]);
const mockInjuries = ref<HeroInjury[]>([]);
const mockIsSinger = ref(false);

const mockConditions = ref<
  { id: number; condition: { code: string; name: string }; notes?: string }[]
>([]);
const mockUpsertNote = vi.fn();
const mockRemoveNote = vi.fn();
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
    get heroNotes() {
      return mockHeroNotes.value;
    },
    get injuries() {
      return mockInjuries.value;
    },
    get conditions() {
      return mockConditions.value;
    },
    upsertNote: mockUpsertNote,
    removeNote: mockRemoveNote,
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
          EditableItemList,
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
            template:
              '<input type="checkbox" class="q-checkbox" @change="$emit(\'update:modelValue\', !modelValue)" />',
            props: ['modelValue', 'disable', 'size', 'dense'],
            emits: ['update:modelValue'],
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
      id: 1,
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
    mockHeroNotes.value = [];
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

    it('renders Notes section', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[aria-label="Notes section"]').exists()).toBe(true);
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
          connectionType: { id: 1, code: 'ally', name: 'Ally' },
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
          companionType: { id: 2, code: 'spren', name: 'Spren' },
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
  // Notes
  // ========================================
  describe('notes', () => {
    it('renders notes with content', () => {
      mockHeroNotes.value = [{ id: 1, heroId: 1, content: 'Buy rations' }];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Buy rations');
    });

    it('shows empty message when no notes', () => {
      mockHeroNotes.value = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No notes');
    });

    it('renders multiple notes', () => {
      mockHeroNotes.value = [
        { id: 1, heroId: 1, content: 'First note' },
        { id: 2, heroId: 1, content: 'Second note' },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('First note');
      expect(wrapper.text()).toContain('Second note');
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
  // Interactions
  // ========================================
  describe('interactions', () => {
    it('calls updateGoalValue when goal checkbox is toggled', async () => {
      mockGoals.value = [
        {
          id: 10,
          heroId: 1,
          name: 'Test Goal',
          status: { id: 1, code: 'active', name: 'Active' },
          value: 1,
        },
      ] as HeroGoal[];
      const wrapper = createWrapper();

      const checkboxes = wrapper.findAll('.q-checkbox');
      expect(checkboxes.length).toBeGreaterThan(1);
      await checkboxes[1]!.trigger('change');

      expect(mockUpdateGoalValue).toHaveBeenCalledWith(10, 2);
    });

    it('calls removeInjury when remove button is clicked', async () => {
      mockInjuries.value = [
        { id: 5, heroId: 1, injury: { id: 1, code: 'broken-arm', name: 'Broken Arm' } },
      ] as HeroInjury[];
      const wrapper = createWrapper();

      const removeBtn = wrapper.find('button[aria-label="Remove injury: Broken Arm"]');
      await removeBtn.trigger('click');

      expect(mockRemoveInjury).toHaveBeenCalledWith(5);
    });

    it('calls removeNote when remove button is clicked', async () => {
      mockHeroNotes.value = [{ id: 5, heroId: 1, content: 'Test note' }];
      const wrapper = createWrapper();

      const removeBtn = wrapper.find('button[aria-label="Remove note: Test note"]');
      await removeBtn.trigger('click');

      expect(mockRemoveNote).toHaveBeenCalledWith(5);
    });

    it('calls upsertNote when note is added via dialog', async () => {
      const wrapper = createWrapper();
      const dialogs = wrapper.findAllComponents({ name: 'AddOtherDialog' });
      const noteDialog = dialogs.find((d) => d.props('title') === 'Add Note');
      await noteDialog!.vm.$emit('add', 'New note content', null, null);

      expect(mockUpsertNote).toHaveBeenCalledWith({
        heroId: 1,
        content: 'New note content',
      });
    });

    it('calls upsertInjury when injury is added via dialog', async () => {
      const wrapper = createWrapper();
      const dialog = wrapper.findComponent({ name: 'AddInjuryDialog' });
      await dialog.vm.$emit('add', 'broken-arm', 'Fell down');

      expect(mockUpsertInjury).toHaveBeenCalledWith(
        { heroId: 1, injury: { code: 'broken-arm' }, notes: 'Fell down' },
        expect.objectContaining({ code: 'broken-arm' })
      );
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
