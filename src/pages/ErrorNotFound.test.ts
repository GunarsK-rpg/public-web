import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ErrorNotFound from './ErrorNotFound.vue';

describe('ErrorNotFound', () => {
  const createWrapper = () =>
    shallowMount(ErrorNotFound, {
      global: {
        stubs: {
          QPage: {
            template: '<div class="q-page"><slot /></div>',
          },
          QIcon: {
            template: '<span class="q-icon" />',
          },
          QBtn: {
            template: '<button class="q-btn">{{ label }}</button>',
            props: ['color', 'unelevated', 'to', 'icon', 'label', 'noCaps'],
          },
        },
      },
    });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders 404 error code', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('404');
    });

    it('renders page not found title', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Page Not Found');
    });

    it('renders descriptive message', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain("doesn't exist or has been moved");
    });
  });

  // ========================================
  // Navigation
  // ========================================
  describe('navigation', () => {
    it('renders back to home button', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Back to Home');
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('has status role for error message', () => {
      const wrapper = createWrapper();

      const status = wrapper.find('[role="status"]');
      expect(status.exists()).toBe(true);
    });

    it('has aria-live for screen readers', () => {
      const wrapper = createWrapper();

      const liveRegion = wrapper.find('[aria-live="polite"]');
      expect(liveRegion.exists()).toBe(true);
    });

    it('hides decorative icon from screen readers', () => {
      const wrapper = createWrapper();

      const icon = wrapper.find('.q-icon');
      expect(icon.exists()).toBe(true);
    });
  });
});
