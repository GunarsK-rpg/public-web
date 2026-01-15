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
      expect(inputs.length).toBeGreaterThan(1);
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('password123');

      // Submit form
      await wrapper.find('.q-form').trigger('submit');

      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });

    it('redirects on successful login', async () => {
      mockLogin.mockResolvedValue(true);
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBeGreaterThan(1);
      await inputs[0]!.setValue('testuser');
      await inputs[1]!.setValue('password123');
      await wrapper.find('.q-form').trigger('submit');

      expect(mockPush).toHaveBeenCalled();
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
  });
});
