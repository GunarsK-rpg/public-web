import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ErrorServer from './ErrorServer.vue';

const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

describe('ErrorServer', () => {
  const createWrapper = () =>
    shallowMount(ErrorServer, {
      global: {
        stubs: {
          QPage: {
            template: '<div class="q-page"><slot /></div>',
          },
          QIcon: {
            template: '<span class="q-icon" />',
          },
          QBtn: {
            template: '<button class="q-btn" @click="$emit(\'click\')">{{ label }}</button>',
            props: ['color', 'unelevated', 'outline', 'to', 'icon', 'label', 'noCaps'],
            emits: ['click'],
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
    it('renders 500 error code', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('500');
    });

    it('renders server error title', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Server Error');
    });

    it('renders error message', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Something went wrong');
    });
  });

  // ========================================
  // Navigation
  // ========================================
  describe('navigation', () => {
    it('renders try again button', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Try Again');
    });

    it('renders back to home button', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Back to Home');
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('has alert role for error message', () => {
      const wrapper = createWrapper();

      const alert = wrapper.find('[role="alert"]');
      expect(alert.exists()).toBe(true);
    });

    it('has aria-live assertive for immediate announcement', () => {
      const wrapper = createWrapper();

      const liveRegion = wrapper.find('[aria-live="assertive"]');
      expect(liveRegion.exists()).toBe(true);
    });
  });
});
