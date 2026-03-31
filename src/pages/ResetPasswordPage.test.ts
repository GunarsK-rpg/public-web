import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import ResetPasswordPage from './ResetPasswordPage.vue';

const mockReplace = vi.fn();
const mockQuery: Record<string, string> = { token: 'reset-token' };
const mockResetPassword = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: mockQuery }),
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock('src/services/auth', () => ({
  default: {
    resetPassword: (...args: unknown[]) => mockResetPassword(...args),
  },
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

describe('ResetPasswordPage', () => {
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
        '<input class="q-input" :type="type" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'label', 'type'],
      emits: ['update:modelValue'],
    },
    QBtn: {
      template: '<button class="q-btn" :type="type">{{ label }}</button>',
      props: ['type', 'label', 'loading', 'color', 'to'],
    },
    QIcon: { template: '<span class="q-icon" />' },
  };

  const createWrapper = () => shallowMount(ResetPasswordPage, { global: { stubs } });

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.token = 'reset-token';
  });

  describe('basic rendering', () => {
    it('renders page title', () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Set New Password');
    });

    it('renders password form when token present', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.q-form').exists()).toBe(true);
    });

    it('renders two password inputs', () => {
      const wrapper = createWrapper();
      const inputs = wrapper.findAll('.q-input[type="password"]');
      expect(inputs.length).toBe(2);
    });
  });

  describe('missing token', () => {
    it('shows invalid link message when no token', async () => {
      mockQuery.token = '';
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Invalid link');
      expect(wrapper.text()).toContain('No reset token provided');
    });

    it('shows request new link button', async () => {
      mockQuery.token = '';
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Request New Link');
    });
  });

  describe('form submission', () => {
    it('shows success message on valid reset', async () => {
      mockResetPassword.mockResolvedValue({});
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]!.setValue('newpass123');
      await inputs[1]!.setValue('newpass123');
      await wrapper.find('.q-form').trigger('submit');
      await flushPromises();

      expect(wrapper.text()).toContain('Password reset');
      expect(wrapper.text()).toContain('Go to Login');
    });

    it('shows error on failed reset', async () => {
      mockResetPassword.mockRejectedValue(new Error('expired'));
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]!.setValue('newpass123');
      await inputs[1]!.setValue('newpass123');
      await wrapper.find('.q-form').trigger('submit');
      await flushPromises();

      expect(wrapper.text()).toContain('Password reset failed');
    });
  });
});
