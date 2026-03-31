import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import VerifyEmailPage from './VerifyEmailPage.vue';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockQuery: Record<string, string> = { token: 'verify-token' };
const mockVerifyEmail = vi.fn();
const mockRefreshToken = vi.fn();
const mockCheckAuthStatus = vi.fn();
const mockIsAuthenticated = { value: false };

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: mockQuery }),
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

vi.mock('src/services/auth', () => ({
  default: {
    verifyEmail: (...args: unknown[]) => mockVerifyEmail(...args),
  },
}));

vi.mock('src/services/tokenRefresh', () => ({
  refreshToken: (...args: unknown[]) => mockRefreshToken(...args),
}));

vi.mock('stores/auth', () => ({
  useAuthStore: () => ({
    get isAuthenticated() {
      return mockIsAuthenticated.value;
    },
    checkAuthStatus: mockCheckAuthStatus,
  }),
}));

vi.mock('src/utils/routeUtils', () => ({
  extractQueryParam: (query: Record<string, string>, key: string) => query[key] ?? null,
  removeQueryParam: (query: Record<string, string>, key: string) => {
    const copy = { ...query };
    delete copy[key];
    return copy;
  },
}));

vi.mock('src/utils/apiError', () => ({
  extractApiError: (_err: unknown, fallback: string) => fallback,
}));

describe('VerifyEmailPage', () => {
  const stubs = {
    QPage: { template: '<div class="q-page"><slot /></div>' },
    QCard: { template: '<div class="q-card"><slot /></div>' },
    QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
    QSpinnerDots: { template: '<div class="q-spinner-dots" />', props: ['size', 'color'] },
    QIcon: { template: '<span class="q-icon" />' },
    QBtn: {
      template: '<button class="q-btn">{{ label }}</button>',
      props: ['label', 'to', 'color'],
    },
  };

  const createWrapper = () => shallowMount(VerifyEmailPage, { global: { stubs } });

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.token = 'verify-token';
    mockQuery.next = '/account';
    mockIsAuthenticated.value = false;
  });

  describe('loading state', () => {
    it('shows spinner while verifying', () => {
      mockVerifyEmail.mockReturnValue(new Promise(() => {}));
      const wrapper = createWrapper();
      expect(wrapper.find('.q-spinner-dots').exists()).toBe(true);
    });
  });

  describe('success', () => {
    it('shows success message on valid token', async () => {
      mockVerifyEmail.mockResolvedValue({});
      mockRefreshToken.mockResolvedValue(true);
      mockCheckAuthStatus.mockResolvedValue(true);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Email verified');
      expect(mockVerifyEmail).toHaveBeenCalledWith('verify-token');
      expect(mockRefreshToken).toHaveBeenCalled();
      expect(mockCheckAuthStatus).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith({ query: { next: '/account' } });
    });

    it('shows Continue button on success', async () => {
      mockVerifyEmail.mockResolvedValue({});
      mockRefreshToken.mockResolvedValue(true);
      mockCheckAuthStatus.mockResolvedValue(true);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Continue');
    });
  });

  describe('failure', () => {
    it('shows error on invalid token', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('invalid'));
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Verification failed');
      expect(mockRefreshToken).not.toHaveBeenCalled();
      expect(mockCheckAuthStatus).not.toHaveBeenCalled();
    });

    it('shows error when no token provided', async () => {
      mockQuery.token = '';
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('No verification token provided');
      expect(mockVerifyEmail).not.toHaveBeenCalled();
      expect(mockRefreshToken).not.toHaveBeenCalled();
      expect(mockCheckAuthStatus).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('shows Go to Login for unauthenticated users on failure', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('invalid'));
      mockIsAuthenticated.value = false;
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Go to Login');
    });

    it('shows Go to Account for authenticated users on failure', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('invalid'));
      mockIsAuthenticated.value = true;
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Go to Account');
    });
  });
});
