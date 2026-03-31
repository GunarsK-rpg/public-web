import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import JoinCampaignPage from './JoinCampaignPage.vue';

const mockGetByCode = vi.fn();
const mockGetAll = vi.fn();
const mockPush = vi.fn();

vi.mock('src/services/campaignService', () => ({
  default: {
    getByCode: (...args: unknown[]) => mockGetByCode(...args),
  },
}));

vi.mock('src/services/heroService', () => ({
  default: {
    getAll: (...args: unknown[]) => mockGetAll(...args),
    update: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('src/services/heroPayloads', () => ({
  buildHeroCorePayload: (hero: unknown) => hero,
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('quasar', () => ({
  useQuasar: () => ({ dialog: vi.fn(() => ({ onOk: vi.fn() })) }),
}));

vi.mock('src/utils/routeUtils', () => ({
  clearHeroTab: vi.fn(),
}));

vi.mock('src/utils/logger', () => ({
  logger: { error: vi.fn() },
}));

vi.mock('src/utils/errorHandling', () => ({
  toError: (e: unknown) => (e instanceof Error ? e : new Error(String(e))),
}));

const mockCampaign = { id: 1, name: 'Stormlight', code: 'ABC123', description: 'A campaign' };

describe('JoinCampaignPage', () => {
  const stubs = {
    QPage: { template: '<div class="q-page"><slot /></div>' },
    QBtn: {
      template: '<button class="q-btn" @click="$emit(\'click\')">{{ label }}<slot /></button>',
      props: ['color', 'label', 'to', 'flat'],
      emits: ['click'],
    },
    QSpinnerDots: { template: '<div class="q-spinner-dots" />', props: ['size', 'color'] },
    QBanner: { template: '<div class="q-banner"><slot /></div>' },
    QCard: {
      template:
        '<div class="q-card" @click="$emit(\'click\')" @keydown.enter="$emit(\'click\')"><slot /></div>',
      emits: ['click'],
    },
    QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
    QCardActions: { template: '<div class="q-card-actions"><slot /></div>' },
    FolderX: { template: '<span />' },
    Plus: { template: '<span />' },
  };

  const createWrapper = () =>
    shallowMount(JoinCampaignPage, {
      props: { code: 'ABC123' },
      global: { stubs },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows spinner while loading', () => {
      mockGetByCode.mockReturnValue(new Promise(() => {}));
      const wrapper = createWrapper();
      expect(wrapper.find('.q-spinner-dots').exists()).toBe(true);
    });
  });

  describe('campaign found', () => {
    it('renders campaign details', async () => {
      mockGetByCode.mockResolvedValue({ data: mockCampaign });
      mockGetAll.mockResolvedValue({ data: { data: [] } });
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Join Campaign');
      expect(wrapper.text()).toContain('Stormlight');
      expect(wrapper.text()).toContain('A campaign');
    });

    it('shows unassigned heroes', async () => {
      mockGetByCode.mockResolvedValue({ data: mockCampaign });
      mockGetAll.mockResolvedValue({
        data: {
          data: [
            { id: 1, name: 'Kaladin', level: 5, ancestry: { name: 'Human' }, campaign: null },
            {
              id: 2,
              name: 'Shallan',
              level: 3,
              ancestry: { name: 'Human' },
              campaign: { name: 'Other' },
            },
          ],
        },
      });
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Kaladin');
      expect(wrapper.text()).not.toContain('Shallan');
    });

    it('renders create character button', async () => {
      mockGetByCode.mockResolvedValue({ data: mockCampaign });
      mockGetAll.mockResolvedValue({ data: { data: [] } });
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Create Character');
    });
  });

  describe('campaign not found', () => {
    it('shows not found state on 404', async () => {
      const err = Object.assign(new Error('not found'), {
        isAxiosError: true,
        response: { status: 404 },
      });
      mockGetByCode.mockRejectedValue(err);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Campaign not found');
    });
  });

  describe('error state', () => {
    it('shows error on non-404 failure', async () => {
      mockGetByCode.mockRejectedValue(new Error('server error'));
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Failed to load campaign details');
    });
  });
});
