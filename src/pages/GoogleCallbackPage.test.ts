import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import GoogleCallbackPage from './GoogleCallbackPage.vue';

const mockPush = vi.fn();
const mockQuery = { code: 'auth-code', state: 'state-token' };
const mockGoogleCallback = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ query: mockQuery }),
}));

vi.mock('stores/auth', () => ({
  useAuthStore: () => ({
    googleCallback: mockGoogleCallback,
  }),
}));

vi.mock('src/utils/routeUtils', () => ({
  extractQueryParam: (query: Record<string, string>, key: string) => query[key] ?? null,
  isValidRedirect: (path: string) => path.startsWith('/') && !path.startsWith('//'),
}));

vi.mock('src/services/auth', () => ({
  OAUTH_REMEMBER_ME_KEY: 'oauth_remember_me',
  OAUTH_REDIRECT_KEY: 'oauth_redirect',
}));

describe('GoogleCallbackPage', () => {
  const stubs = {
    QPage: { template: '<div class="q-page"><slot /></div>' },
    QCard: { template: '<div class="q-card"><slot /></div>' },
    QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
    QSpinnerDots: { template: '<div class="q-spinner-dots" />', props: ['size', 'color'] },
    QIcon: { template: '<span class="q-icon" />' },
    QBtn: { template: '<button class="q-btn">{{ label }}</button>', props: ['label', 'to'] },
  };

  const createWrapper = () => shallowMount(GoogleCallbackPage, { global: { stubs } });

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.code = 'auth-code';
    mockQuery.state = 'state-token';
    sessionStorage.clear();
  });

  describe('loading state', () => {
    it('shows spinner while processing', () => {
      mockGoogleCallback.mockReturnValue(new Promise(() => {}));
      const wrapper = createWrapper();
      expect(wrapper.find('.q-spinner-dots').exists()).toBe(true);
    });
  });

  describe('success', () => {
    it('redirects to home on successful callback', async () => {
      mockGoogleCallback.mockResolvedValue(true);
      createWrapper();
      await flushPromises();

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('redirects to saved path when available', async () => {
      sessionStorage.setItem('oauth_redirect', '/campaigns');
      mockGoogleCallback.mockResolvedValue(true);
      createWrapper();
      await flushPromises();

      expect(mockPush).toHaveBeenCalledWith('/campaigns');
    });

    it('rejects protocol-relative redirect and falls back to /', async () => {
      sessionStorage.setItem('oauth_redirect', '//evil.com');
      mockGoogleCallback.mockResolvedValue(true);
      createWrapper();
      await flushPromises();

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('passes remember me from session storage', async () => {
      sessionStorage.setItem('oauth_remember_me', 'true');
      mockGoogleCallback.mockResolvedValue(true);
      createWrapper();
      await flushPromises();

      expect(mockGoogleCallback).toHaveBeenCalledWith('auth-code', 'state-token', true);
    });
  });

  describe('failure', () => {
    it('shows error on failed callback', async () => {
      mockGoogleCallback.mockResolvedValue(false);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Sign in failed');
      expect(wrapper.text()).toContain('Unable to sign in with Google');
    });

    it('shows error when code is missing', async () => {
      mockQuery.code = '';
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Missing authorization parameters');
    });

    it('shows back to login button on error', async () => {
      mockGoogleCallback.mockResolvedValue(false);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Back to Login');
    });
  });
});
