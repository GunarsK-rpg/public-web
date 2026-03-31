import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import NpcInstancePage from './NpcInstancePage.vue';

const mockNpcInstanceGet = vi.fn();
const mockNpcGet = vi.fn();
const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock('src/services/npcInstanceService', () => ({
  default: {
    get: (...args: unknown[]) => mockNpcInstanceGet(...args),
    patchResource: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('src/services/npcService', () => ({
  default: {
    get: (...args: unknown[]) => mockNpcGet(...args),
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}));

vi.mock('src/composables/usePageTitle', () => ({
  usePageTitle: () => ({ setPageTitle: vi.fn() }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({ initialized: true, initialize: vi.fn() }),
}));

vi.mock('src/stores/auth', () => ({
  useAuthStore: () => ({ userId: 1 }),
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
};

const mockInstance = {
  id: 42,
  npcId: 5,
  combatId: 1,
  heroId: null,
  userId: 1,
  displayName: 'Goblin Scout',
  currentHp: 10,
  currentFocus: 5,
  currentInvestiture: 0,
  notes: null,
};

describe('NpcInstancePage', () => {
  const stubs = {
    QPage: { template: '<div class="q-page"><slot /></div>' },
    QBtn: {
      template: '<button class="q-btn" @click="$emit(\'click\')">{{ label }}</button>',
      props: ['label', 'color'],
      emits: ['click'],
    },
    QSpinnerDots: { template: '<div class="q-spinner-dots" />', props: ['size', 'color'] },
    QBanner: { template: '<div class="q-banner"><slot /></div>' },
    NpcStatBlock: {
      template: '<div class="npc-stat-block">{{ npc.name }}</div>',
      props: ['npc', 'displayName', 'currentResources', 'notes', 'saving', 'readonly', 'editable'],
    },
    ArrowLeft: { template: '<span />' },
    UserX: { template: '<span />' },
  };

  const createWrapper = (instanceId = '42') =>
    shallowMount(NpcInstancePage, {
      props: { instanceId },
      global: { stubs },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows spinner while loading', () => {
      mockNpcInstanceGet.mockReturnValue(new Promise(() => {}));
      const wrapper = createWrapper();
      expect(wrapper.find('.q-spinner-dots').exists()).toBe(true);
    });
  });

  describe('success state', () => {
    it('renders NPC stat block', async () => {
      mockNpcInstanceGet.mockResolvedValue({ data: mockInstance });
      mockNpcGet.mockResolvedValue({ data: mockNpc });
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.npc-stat-block').exists()).toBe(true);
      expect(wrapper.text()).toContain('Goblin');
    });
  });

  describe('error state', () => {
    it('shows error on load failure', async () => {
      mockNpcInstanceGet.mockRejectedValue(new Error('fail'));
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Failed to load NPC');
    });

    it('shows error for invalid ID', async () => {
      const wrapper = createWrapper('abc');
      await flushPromises();

      expect(wrapper.text()).toContain('Invalid instance ID');
    });

    it('shows error for zero ID', async () => {
      const wrapper = createWrapper('0');
      await flushPromises();

      expect(wrapper.text()).toContain('Invalid instance ID');
    });
  });

  describe('not found state', () => {
    it('shows not found when NPC is null after load', async () => {
      mockNpcInstanceGet.mockResolvedValue({ data: mockInstance });
      mockNpcGet.mockResolvedValue({ data: null });
      const wrapper = createWrapper();
      await flushPromises();

      // NPC loaded as null triggers the not-found branch
      expect(wrapper.find('.npc-stat-block').exists()).toBe(false);
    });
  });
});
