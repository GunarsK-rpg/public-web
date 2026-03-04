import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ErrorForbidden from './ErrorForbidden.vue';

describe('ErrorForbidden', () => {
  const createWrapper = () =>
    shallowMount(ErrorForbidden, {
      global: {
        stubs: {
          QPage: {
            template: '<div class="q-page"><slot /></div>',
          },
          QIcon: {
            template: '<span class="q-icon" />',
          },
          QBtn: {
            template: '<button class="q-btn"><slot /></button>',
            props: ['color', 'unelevated', 'to', 'noCaps'],
          },
        },
      },
    });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders 403 error code', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('403');
    });

    it('renders access forbidden title', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Access Forbidden');
    });

    it('renders permission message', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain("don't have permission");
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
  });
});
