import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import NpcDetailPage from './NpcDetailPage.vue';

const mockGetNpc = vi.fn();
const mockPush = vi.fn();
const mockRouteName = { value: 'npc-detail' };

vi.mock('vue-router', () => ({
  useRoute: () => ({
    get name() {
      return mockRouteName.value;
    },
  }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('quasar', () => ({
  useQuasar: () => ({
    dialog: vi.fn(() => ({ onOk: vi.fn() })),
    notify: vi.fn(),
  }),
}));

vi.mock('src/composables/usePageTitle', () => ({
  usePageTitle: () => ({ setPageTitle: vi.fn() }),
}));

vi.mock('src/composables/useNpcEditState', async () => {
  const { ref, computed } = await import('vue');
  return {
    useNpcEditState: () => ({
      npc: ref(null),
      editableNpc: ref(null),
      editing: ref(false),
      isClone: ref(false),
      canEdit: computed(() => true),
      isFormValid: computed(() => true),
      buildEmptyNpc: vi.fn(() => ({
        id: 0,
        campaignId: 10,
        name: '',
        tier: { id: 1, code: 'common', name: 'Common' },
        type: 'minion',
        isCompanion: false,
        createdBy: 1,
        size: 'Medium',
        languages: null,
        description: null,
        tactics: null,
        immunities: null,
        attributes: [],
        defenses: [],
        skills: [],
        derivedStats: [],
        features: [],
        actions: [],
        opportunities: [],
      })),
      startEdit: vi.fn(),
      cloneAsNew: vi.fn(),
      cancelEdit: vi.fn(() => 'stay'),
      onFieldUpdate: vi.fn(),
      onStatUpdate: vi.fn(),
      buildPayload: vi.fn(() => ({})),
    }),
  };
});

vi.mock('src/composables/useNpcItemDialog', () => ({
  useNpcItemDialog: () => ({
    showItemDialog: { value: false },
    dialogItem: { value: null },
    dialogShowActivationType: { value: false },
    dialogItemLabel: { value: 'Item' },
    onItemAdd: vi.fn(),
    onItemEdit: vi.fn(),
    onItemRemove: vi.fn(),
    onItemSave: vi.fn(),
  }),
}));

vi.mock('src/composables/useNpcStatDialog', () => ({
  useNpcStatDialog: () => ({
    showStatDialog: { value: false },
    statDialogTitle: { value: 'Add Skill' },
    statDialogOptions: { value: [] },
    statDialogUsedCodes: { value: [] },
    statDialogEditIndex: { value: null },
    statDialogEditCode: { value: undefined },
    statDialogEditValue: { value: undefined },
    statDialogEditDisplayValue: { value: undefined },
    statDialogShowDisplayValue: { value: false },
    onStatAdd: vi.fn(),
    onStatEdit: vi.fn(),
    onStatRemove: vi.fn(),
    onStatDialogSave: vi.fn(),
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({ initialized: true, initialize: vi.fn() }),
}));

vi.mock('src/stores/combat', () => ({
  useCombatStore: () => ({
    loading: false,
    saving: false,
    error: null,
    currentNpc: null,
    createNpc: vi.fn(),
    updateNpc: vi.fn(),
    deleteNpc: vi.fn(),
  }),
}));

vi.mock('src/services/combatService', () => ({
  default: {
    getNpc: (...args: unknown[]) => mockGetNpc(...args),
    setNpcAvatar: vi.fn(),
    deleteNpcAvatar: vi.fn(),
  },
}));

vi.mock('src/services/filesApi', () => ({
  default: { upload: vi.fn() },
  FILE_TYPE_HERO_AVATAR: 'hero_avatar',
}));

vi.mock('src/composables/useErrorHandler', () => ({
  useErrorHandler: () => ({ handleError: vi.fn() }),
}));

const mockNpc = {
  id: 5,
  campaignId: 10,
  name: 'Goblin',
  tier: { id: 1, code: 'common', name: 'Common' },
  type: 'minion',
  isCompanion: false,
  createdBy: 1,
  size: 'Medium',
  languages: null,
  description: null,
  tactics: null,
  immunities: null,
  attributes: [],
  defenses: [],
  skills: [],
  derivedStats: [],
  features: [],
  actions: [],
  opportunities: [],
  deletedAt: null,
};

describe('NpcDetailPage', () => {
  const stubs = {
    QPage: { template: '<div class="q-page"><slot /></div>' },
    QBtn: {
      template: '<button class="q-btn" @click="$emit(\'click\')">{{ label }}</button>',
      props: ['label', 'color', 'flat', 'dense', 'loading', 'disable'],
      emits: ['click'],
    },
    QSpinnerDots: { template: '<div class="q-spinner-dots" />', props: ['size', 'color'] },
    QBanner: { template: '<div class="q-banner"><slot /></div>' },
    QSpace: { template: '<span />' },
    NpcStatBlock: {
      template: '<div class="npc-stat-block" />',
      props: ['npc', 'saving', 'readonly', 'editable', 'showCompanionToggle', 'avatarSaving'],
    },
    NpcItemEditDialog: { template: '<div />', props: ['modelValue', 'item'] },
    NpcStatPickerDialog: { template: '<div />', props: ['modelValue', 'title'] },
    ArrowLeft: { template: '<span />' },
    UserX: { template: '<span />' },
  };

  const createWrapper = (npcId = '5') =>
    shallowMount(NpcDetailPage, {
      props: { campaignId: '10', npcId },
      global: { stubs },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouteName.value = 'npc-detail';
  });

  describe('loading state', () => {
    it('shows spinner while loading', () => {
      mockGetNpc.mockReturnValue(new Promise(() => {}));
      const wrapper = createWrapper();
      expect(wrapper.find('.q-spinner-dots').exists()).toBe(true);
    });
  });

  describe('success state', () => {
    it('renders NPC stat block after load', async () => {
      mockGetNpc.mockResolvedValue({ data: mockNpc });
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.npc-stat-block').exists()).toBe(true);
    });
  });

  describe('error state', () => {
    it('shows error on load failure', async () => {
      mockGetNpc.mockRejectedValue(new Error('fail'));
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Failed to load NPC');
    });

    it('shows error for invalid campaign ID', async () => {
      const wrapper = shallowMount(NpcDetailPage, {
        props: { campaignId: 'abc', npcId: '5' },
        global: { stubs },
      });
      await flushPromises();

      expect(wrapper.text()).toContain('Invalid campaign ID');
    });

    it('shows error for invalid NPC ID', async () => {
      const wrapper = createWrapper('abc');
      await flushPromises();

      expect(wrapper.text()).toContain('Invalid NPC ID');
    });
  });

  describe('create mode', () => {
    it('does not fetch NPC in create mode', async () => {
      mockRouteName.value = 'npc-create';
      shallowMount(NpcDetailPage, {
        props: { campaignId: '10' },
        global: { stubs },
      });
      await flushPromises();

      expect(mockGetNpc).not.toHaveBeenCalled();
    });
  });
});
