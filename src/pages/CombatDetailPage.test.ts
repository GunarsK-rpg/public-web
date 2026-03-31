import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import CombatDetailPage from './CombatDetailPage.vue';

const mockSelectCombat = vi.fn();
const mockFetchNpcOptions = vi.fn();
const mockUpdateCombat = vi.fn();
const mockEndRound = vi.fn();
const mockAddNpcInstance = vi.fn();
const mockRemoveNpcInstance = vi.fn();
const mockUpdateNpcInstance = vi.fn();
const mockPatchHp = vi.fn();
const mockPatchFocus = vi.fn();
const mockPatchInvestiture = vi.fn();
const mockToggleTurnDone = vi.fn();
const mockClearBossTurnDone = vi.fn();

const mockCombat = ref<{
  id: number;
  name: string;
  description: string | null;
  notes: string | null;
  round: number;
  isActive: boolean;
  turnPhase: 'fast' | 'slow' | null;
} | null>(null);
const mockLoading = ref(false);
const mockSaving = ref(false);
const mockError = ref<string | null>(null);
const mockAllies = ref<unknown[]>([]);
const mockEnemies = ref<unknown[]>([]);

vi.mock('src/stores/combat', () => ({
  useCombatStore: () => ({
    get currentCombat() {
      return mockCombat.value;
    },
    set currentCombat(v: unknown) {
      mockCombat.value = v as typeof mockCombat.value;
    },
    get loading() {
      return mockLoading.value;
    },
    get saving() {
      return mockSaving.value;
    },
    get error() {
      return mockError.value;
    },
    get allies() {
      return mockAllies.value;
    },
    get enemies() {
      return mockEnemies.value;
    },
    npcOptions: [],
    turnDoneIds: new Set(),
    setError: (msg: string) => {
      mockError.value = msg;
    },
    selectCombat: mockSelectCombat,
    fetchNpcOptions: mockFetchNpcOptions,
    updateCombat: mockUpdateCombat,
    endRound: mockEndRound,
    addNpcInstance: mockAddNpcInstance,
    removeNpcInstance: mockRemoveNpcInstance,
    updateNpcInstance: mockUpdateNpcInstance,
    patchHp: mockPatchHp,
    patchFocus: mockPatchFocus,
    patchInvestiture: mockPatchInvestiture,
    toggleTurnDone: mockToggleTurnDone,
    clearBossTurnDone: mockClearBossTurnDone,
  }),
}));

vi.mock('src/constants/combat', () => ({
  TURN_PHASES: [
    { label: 'Fast', value: 'fast' },
    { label: 'Slow', value: 'slow' },
  ],
}));

const combat = {
  id: 1,
  name: 'Battle of the Plains',
  description: 'An epic fight',
  notes: null,
  round: 1,
  isActive: true,
  turnPhase: null as 'fast' | 'slow' | null,
};

describe('CombatDetailPage', () => {
  const stubs = {
    QPage: { template: '<div class="q-page"><slot /></div>' },
    QBtn: {
      template: '<button class="q-btn" @click="$emit(\'click\')">{{ label }}<slot /></button>',
      props: ['label', 'color', 'flat', 'dense', 'to', 'disable'],
      emits: ['click'],
    },
    QBtnToggle: {
      template: '<div class="q-btn-toggle" />',
      props: ['modelValue', 'options', 'disable'],
    },
    QSpinnerDots: { template: '<div class="q-spinner-dots" />', props: ['size', 'color'] },
    QBanner: { template: '<div class="q-banner"><slot /></div>' },
    QInput: {
      template:
        '<input class="q-input" :value="modelValue" @blur="$emit(\'blur\')" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'label', 'dense', 'type', 'disable'],
      emits: ['update:modelValue', 'blur'],
    },
    QSpace: { template: '<span />' },
    QToggle: {
      template: '<input class="q-toggle" type="checkbox" />',
      props: ['modelValue', 'label', 'disable'],
    },
    Swords: { template: '<span />' },
    ArrowLeft: { template: '<span />' },
    ResourceBox: {
      template: '<div class="resource-box" />',
      props: ['label', 'current', 'saving', 'readonly'],
    },
    CombatNpcSection: {
      template: '<div class="combat-npc-section">{{ title }}</div>',
      props: [
        'title',
        'addLabel',
        'npcs',
        'campaignId',
        'saving',
        'readonly',
        'turnPhase',
        'turnDoneIds',
      ],
    },
    AddNpcDialog: {
      template: '<div class="add-npc-dialog" />',
      props: ['modelValue', 'npcOptions', 'saving'],
    },
  };

  const createWrapper = (campaignId = '10', combatId = '1') =>
    shallowMount(CombatDetailPage, {
      props: { campaignId, combatId },
      global: { stubs },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCombat.value = null;
    mockLoading.value = false;
    mockSaving.value = false;
    mockError.value = null;
    mockAllies.value = [];
    mockEnemies.value = [];
  });

  describe('loading state', () => {
    it('shows spinner while loading', () => {
      mockSelectCombat.mockReturnValue(new Promise(() => {}));
      const wrapper = createWrapper();
      expect(wrapper.find('.q-spinner-dots').exists()).toBe(true);
    });
  });

  describe('combat loaded', () => {
    it('renders combat name and sections', async () => {
      mockSelectCombat.mockImplementation(() => {
        mockCombat.value = { ...combat };
        return Promise.resolve();
      });
      mockFetchNpcOptions.mockResolvedValue(undefined);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Enemies');
      expect(wrapper.text()).toContain('Allies');
    });

    it('renders resource box for round counter', async () => {
      mockSelectCombat.mockImplementation(() => {
        mockCombat.value = { ...combat };
        return Promise.resolve();
      });
      mockFetchNpcOptions.mockResolvedValue(undefined);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.resource-box').exists()).toBe(true);
    });

    it('renders Create NPC button', async () => {
      mockSelectCombat.mockImplementation(() => {
        mockCombat.value = { ...combat };
        return Promise.resolve();
      });
      mockFetchNpcOptions.mockResolvedValue(undefined);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Create NPC');
    });
  });

  describe('not found', () => {
    it('shows not found when combat is null', async () => {
      mockSelectCombat.mockResolvedValue(undefined);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Combat not found');
    });
  });

  describe('error state', () => {
    it('shows error banner', async () => {
      mockSelectCombat.mockResolvedValue(undefined);
      mockError.value = 'Something went wrong';
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Something went wrong');
    });

    it('shows error for invalid IDs', async () => {
      createWrapper('abc', '1');
      await flushPromises();

      expect(mockError.value).toBe('Invalid combat ID');
    });
  });

  describe('fetches data on mount', () => {
    it('calls selectCombat with correct IDs', async () => {
      mockSelectCombat.mockResolvedValue(undefined);
      createWrapper('10', '5');
      await flushPromises();

      expect(mockSelectCombat).toHaveBeenCalledWith(10, 5);
    });

    it('fetches NPC options for the campaign', async () => {
      mockSelectCombat.mockResolvedValue(undefined);
      createWrapper('10', '5');
      await flushPromises();

      expect(mockFetchNpcOptions).toHaveBeenCalledWith(10);
    });
  });
});
