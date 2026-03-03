import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import LoginPage from './LoginPage.vue';

const mockLogin = vi.fn();
const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useRoute: () => ({
    query: {},
  }),
}));

vi.mock('stores/auth', () => ({
  useAuthStore: () => ({
    login: mockLogin,
  }),
}));

describe('LoginPage', () => {
  const createWrapper = () =>
    shallowMount(LoginPage, {
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
          QCheckbox: {
            template: `<label class="q-checkbox">
              <input type="checkbox" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)" />
              {{ label }}
            </label>`,
            props: ['modelValue', 'label'],
            emits: ['update:modelValue'],
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

    it('renders subtitle', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Character Sheet Manager');
    });

    it('renders username input', () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });

    it('renders password input', () => {
      const wrapper = createWrapper();

      const passwordInput = wrapper.find('.q-input[type="password"]');
      expect(passwordInput.exists()).toBe(true);
    });

    it('renders login button', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Login');
    });
  });

  // ========================================
  // Form Submission
  // ========================================
  describe('form submission', () => {
    it('calls login on form submit', async () => {
      mockLogin.mockResolvedValue(true);
      const wrapper = createWrapper();

      // Set username and password
      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('password123');

      // Submit form
      await wrapper.find('.q-form').trigger('submit');

      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123', false);
    });

    it('redirects to home on successful login', async () => {
      mockLogin.mockResolvedValue(true);
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('password123');
      await wrapper.find('.q-form').trigger('submit');

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('does not redirect on failed login', async () => {
      mockLogin.mockResolvedValue(false);
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('wrongpassword');
      await wrapper.find('.q-form').trigger('submit');

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Login Card Style
  // ========================================
  describe('login card style', () => {
    it('has login card element', () => {
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

  // ========================================
  // Remember Me
  // ========================================
  describe('remember me', () => {
    it('renders remember me checkbox', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.q-checkbox').exists()).toBe(true);
      expect(wrapper.text()).toContain('Remember me');
    });

    it('defaults to unchecked', () => {
      const wrapper = createWrapper();
      const checkbox = wrapper.find('.q-checkbox input[type="checkbox"]');
      expect((checkbox.element as HTMLInputElement).checked).toBe(false);
    });

    it('passes rememberMe false by default on submit', async () => {
      mockLogin.mockResolvedValue(true);
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('password123');
      await wrapper.find('.q-form').trigger('submit');

      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123', false);
    });

    it('passes rememberMe true when checked', async () => {
      mockLogin.mockResolvedValue(true);
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('password123');

      const checkbox = wrapper.find('.q-checkbox input[type="checkbox"]');
      await checkbox.setValue(true);

      await wrapper.find('.q-form').trigger('submit');

      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123', true);
    });
  });
});
