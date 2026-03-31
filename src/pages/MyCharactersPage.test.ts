import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import MyCharactersPage from './MyCharactersPage.vue';

const mockGetAll = vi.fn();

vi.mock('src/services/heroService', () => ({
  default: {
    getAll: (...args: unknown[]) => mockGetAll(...args),
  },
}));

vi.mock('src/utils/logger', () => ({
  logger: { error: vi.fn() },
}));

vi.mock('src/utils/errorHandling', () => ({
  toError: (e: unknown) => (e instanceof Error ? e : new Error(String(e))),
}));

describe('MyCharactersPage', () => {
  const stubs = {
    QPage: { template: '<div class="q-page"><slot /></div>' },
    QBtn: {
      template: '<button class="q-btn"><slot />{{ label }}</button>',
      props: ['color', 'label', 'to'],
    },
    QSpinnerDots: { template: '<div class="q-spinner-dots" />', props: ['size', 'color'] },
    QBanner: { template: '<div class="q-banner"><slot /></div>' },
    QSpace: { template: '<span />' },
    UserPlus: { template: '<span />' },
    UserX: { template: '<span />' },
    HeroCard: {
      template: '<div class="hero-card">{{ hero.name }}</div>',
      props: ['hero', 'subtitle'],
    },
  };

  const createWrapper = () => shallowMount(MyCharactersPage, { global: { stubs } });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows spinner while loading', () => {
      mockGetAll.mockReturnValue(new Promise(() => {}));
      const wrapper = createWrapper();
      expect(wrapper.find('.q-spinner-dots').exists()).toBe(true);
    });
  });

  describe('success state', () => {
    it('renders hero cards', async () => {
      mockGetAll.mockResolvedValue({
        data: {
          data: [
            { id: 1, name: 'Kaladin', campaign: { name: 'Stormlight' } },
            { id: 2, name: 'Shallan', campaign: null },
          ],
        },
      });
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Kaladin');
      expect(wrapper.text()).toContain('Shallan');
    });

    it('renders page title', async () => {
      mockGetAll.mockResolvedValue({ data: { data: [] } });
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('My Characters');
    });
  });

  describe('empty state', () => {
    it('shows empty state when no heroes', async () => {
      mockGetAll.mockResolvedValue({ data: { data: [] } });
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('No characters yet');
    });
  });

  describe('error state', () => {
    it('shows error banner on fetch failure', async () => {
      mockGetAll.mockRejectedValue(new Error('Network error'));
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Failed to load characters');
    });
  });
});
