import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import RegisterPage from './RegisterPage.vue';

const mockRegister = vi.fn();
const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('src/services/auth', () => ({
  default: {
    register: (...args: unknown[]) => mockRegister(...args),
  },
}));

vi.mock('axios', () => ({
  default: {
    isAxiosError: (err: unknown) =>
      typeof err === 'object' && err !== null && 'isAxiosError' in err,
  },
  isAxiosError: (err: unknown) => typeof err === 'object' && err !== null && 'isAxiosError' in err,
}));

describe('RegisterPage', () => {
  const createWrapper = () =>
    shallowMount(RegisterPage, {
      global: {
        stubs: {
          QPage: {
            template: '<div class="q-page"><slot /></div>',
          },
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section" :class="$attrs.class"><slot /></div>',
          },
          QForm: {
            template: '<form class="q-form" @submit.prevent="$emit(\'submit\')"><slot /></form>',
            emits: ['submit'],
          },
          QInput: {
            template: `<input
              class="q-input"
              :type="type || 'text'"
              :value="modelValue"
              @input="$emit('update:modelValue', $event.target.value)"
            />`,
            props: ['modelValue', 'label', 'type', 'outlined', 'autocomplete', 'rules'],
            emits: ['update:modelValue'],
          },
          QBtn: {
            template: `<button
              class="q-btn"
              :type="type"
              :class="{ 'q-btn--loading': loading }"
            >{{ label }}</button>`,
            props: ['type', 'label', 'color', 'loading'],
          },
          'router-link': {
            template: '<a class="router-link"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders page title', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Cosmere RPG');
    });

    it('renders create account subtitle', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Create Account');
    });

    it('renders four input fields', () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBe(4);
    });

    it('renders register button', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Register');
    });

    it('renders login link', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Already have an account?');
    });
  });

  // ========================================
  // Form Submission
  // ========================================
  describe('form submission', () => {
    it('calls register on form submit', async () => {
      mockRegister.mockResolvedValue({
        data: { user_id: 1, username: 'testuser', email: 'test@example.com' },
      });
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('test@example.com');
      await inputs[2]!.setValue('password123');
      await inputs[3]!.setValue('password123');

      await wrapper.find('.q-form').trigger('submit');

      expect(mockRegister).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('redirects to login with registered query on success', async () => {
      mockRegister.mockResolvedValue({
        data: { user_id: 1, username: 'testuser', email: 'test@example.com' },
      });
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('test@example.com');
      await inputs[2]!.setValue('password123');
      await inputs[3]!.setValue('password123');

      await wrapper.find('.q-form').trigger('submit');

      expect(mockPush).toHaveBeenCalledWith({ name: 'login', query: { registered: '1' } });
    });

    it('shows error on duplicate username/email', async () => {
      mockRegister.mockRejectedValue({
        isAxiosError: true,
        response: { status: 409, data: { error: 'username or email already in use' } },
      });
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('test@example.com');
      await inputs[2]!.setValue('password123');
      await inputs[3]!.setValue('password123');

      await wrapper.find('.q-form').trigger('submit');

      expect(wrapper.text()).toContain('Username or email is already taken.');
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('shows connection error on network failure', async () => {
      mockRegister.mockRejectedValue(new Error('Network Error'));
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('test@example.com');
      await inputs[2]!.setValue('password123');
      await inputs[3]!.setValue('password123');

      await wrapper.find('.q-form').trigger('submit');

      expect(wrapper.text()).toContain(
        'Unable to connect. Please check your connection and try again.'
      );
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('shows forbidden error on 403', async () => {
      mockRegister.mockRejectedValue({
        isAxiosError: true,
        response: { status: 403, data: { error: 'role not allowed' } },
      });
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('test@example.com');
      await inputs[2]!.setValue('password123');
      await inputs[3]!.setValue('password123');

      await wrapper.find('.q-form').trigger('submit');

      expect(wrapper.text()).toContain('Registration is not available at this time.');
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('shows loading state during submission', async () => {
      let resolveRegister!: (value: unknown) => void;
      mockRegister.mockReturnValue(
        new Promise((resolve) => {
          resolveRegister = resolve;
        })
      );
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('test@example.com');
      await inputs[2]!.setValue('password123');
      await inputs[3]!.setValue('password123');

      const submitPromise = wrapper.find('.q-form').trigger('submit');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.q-btn--loading').exists()).toBe(true);

      await wrapper.find('.q-form').trigger('submit');
      expect(mockRegister).toHaveBeenCalledTimes(1);

      resolveRegister({ data: { user_id: 1, username: 'testuser', email: 'test@example.com' } });
      await submitPromise;
    });

    it('shows server error message on 400', async () => {
      mockRegister.mockRejectedValue({
        isAxiosError: true,
        response: { status: 400, data: { error: 'password exceeds maximum length' } },
      });
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('test@example.com');
      await inputs[2]!.setValue('password123');
      await inputs[3]!.setValue('password123');

      await wrapper.find('.q-form').trigger('submit');

      expect(wrapper.text()).toContain('password exceeds maximum length');
    });
  });

  // ========================================
  // Card Style
  // ========================================
  describe('card style', () => {
    it('has card element', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-card').exists()).toBe(true);
    });

    it('has form element', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-form').exists()).toBe(true);
    });

    it('has page container', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-page').exists()).toBe(true);
    });
  });
});
