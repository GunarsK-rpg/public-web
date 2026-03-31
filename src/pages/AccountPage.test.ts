import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import AccountPage from './AccountPage.vue';

const mockGetAuthMethods = vi.fn();
const mockSendVerification = vi.fn();
const mockUpdateProfile = vi.fn();
const mockChangePassword = vi.fn();
const mockSetPassword = vi.fn();

vi.mock('stores/auth', () => ({
  useAuthStore: () => ({
    email: 'test@example.com',
    emailVerified: false,
    username: 'testuser',
    displayName: 'Test User',
  }),
}));

vi.mock('src/services/auth', () => ({
  default: {
    getAuthMethods: (...args: unknown[]) => mockGetAuthMethods(...args),
    sendVerification: (...args: unknown[]) => mockSendVerification(...args),
    updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
    changePassword: (...args: unknown[]) => mockChangePassword(...args),
    setPassword: (...args: unknown[]) => mockSetPassword(...args),
  },
}));

vi.mock('src/services/tokenRefresh', () => ({
  refreshToken: vi.fn().mockResolvedValue(false),
}));

vi.mock('src/utils/apiError', () => ({
  extractApiError: (_err: unknown, fallback: string) => fallback,
}));

describe('AccountPage', () => {
  const stubs = {
    QPage: { template: '<div class="q-page"><slot /></div>' },
    QCard: { template: '<div class="q-card"><slot /></div>' },
    QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
    QForm: {
      template: '<form class="q-form" @submit.prevent="$emit(\'submit\')"><slot /></form>',
      emits: ['submit'],
    },
    QInput: {
      template:
        '<input class="q-input" :type="type || \'text\'" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'label', 'type', 'outlined'],
      emits: ['update:modelValue'],
    },
    QBtn: {
      template: '<button class="q-btn" @click="$emit(\'click\')">{{ label }}</button>',
      props: ['label', 'loading', 'disable', 'color', 'type', 'outline'],
      emits: ['click'],
    },
    QBadge: {
      template: '<span class="q-badge">{{ label }}</span>',
      props: ['color', 'label'],
    },
    PasswordForm: {
      template: '<div class="password-form">{{ title }}</div>',
      props: ['title', 'subtitle', 'submitLabel', 'requireCurrentPassword'],
    },
  };

  const createWrapper = () => shallowMount(AccountPage, { global: { stubs } });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthMethods.mockResolvedValue({
      data: { has_password: true, providers: ['google'] },
    });
  });

  describe('basic rendering', () => {
    it('renders page title', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.text()).toContain('Account Settings');
    });

    it('renders email', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.text()).toContain('test@example.com');
    });

    it('renders unverified badge', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.text()).toContain('Unverified');
    });

    it('renders verification button when unverified', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.text()).toContain('Send Verification Email');
    });
  });

  describe('profile section', () => {
    it('renders edit profile form', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.text()).toContain('Edit Profile');
    });

    it('renders username input', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.findAll('.q-input').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('linked accounts', () => {
    it('shows Google linked status', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.text()).toContain('Google');
      expect(wrapper.text()).toContain('Linked');
    });

    it('shows not linked when no Google', async () => {
      mockGetAuthMethods.mockResolvedValue({
        data: { has_password: true, providers: [] },
      });
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.text()).toContain('Not linked');
    });
  });

  describe('password section', () => {
    it('renders change password form when has password', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.text()).toContain('Change Password');
    });

    it('renders set password form when no password', async () => {
      mockGetAuthMethods.mockResolvedValue({
        data: { has_password: false, providers: ['google'] },
      });
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.text()).toContain('Set Password');
    });
  });

  describe('verification', () => {
    it('shows success message on send verification', async () => {
      mockSendVerification.mockResolvedValue({});
      const wrapper = createWrapper();
      await flushPromises();

      const verifyBtn = wrapper
        .findAll('.q-btn')
        .find((b) => b.text() === 'Send Verification Email');
      await verifyBtn!.trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Verification email sent');
    });

    it('shows error on verification failure', async () => {
      mockSendVerification.mockRejectedValue(new Error('fail'));
      const wrapper = createWrapper();
      await flushPromises();

      const verifyBtn = wrapper
        .findAll('.q-btn')
        .find((b) => b.text() === 'Send Verification Email');
      await verifyBtn!.trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Failed to send verification email');
    });
  });

  describe('auth methods error', () => {
    it('still renders change password on auth methods error', async () => {
      mockGetAuthMethods.mockRejectedValue(new Error('fail'));
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Change Password');
    });
  });
});
