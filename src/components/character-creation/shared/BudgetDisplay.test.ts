import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BudgetDisplay from './BudgetDisplay.vue';

describe('BudgetDisplay', () => {
  const createWrapper = (props: {
    label: string;
    remaining: number;
    total?: number;
    showTotal?: boolean;
    suffix?: string;
  }) => mount(BudgetDisplay, { props });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders label and remaining value', () => {
      const wrapper = createWrapper({ label: 'Points remaining', remaining: 5 });

      expect(wrapper.text()).toContain('Points remaining');
      expect(wrapper.text()).toContain('5');
    });

    it('shows total when provided and showTotal is true', () => {
      const wrapper = createWrapper({
        label: 'Points',
        remaining: 3,
        total: 10,
        showTotal: true,
      });

      expect(wrapper.text()).toContain('3');
      expect(wrapper.text()).toContain('/ 10');
    });

    it('hides total when showTotal is false', () => {
      const wrapper = createWrapper({
        label: 'Points',
        remaining: 3,
        total: 10,
        showTotal: false,
      });

      expect(wrapper.text()).not.toContain('/ 10');
    });

    it('shows suffix when provided', () => {
      const wrapper = createWrapper({
        label: 'Max rank',
        remaining: 4,
        suffix: 'from Intellect',
      });

      expect(wrapper.text()).toContain('(from Intellect)');
    });
  });

  // ========================================
  // Color Classes
  // ========================================
  describe('color classes', () => {
    it('applies text-positive class when remaining >= 0', () => {
      const wrapper = createWrapper({ label: 'Points', remaining: 5 });
      const strong = wrapper.find('strong');

      expect(strong.classes()).toContain('text-positive');
    });

    it('applies text-positive class when remaining is 0', () => {
      const wrapper = createWrapper({ label: 'Points', remaining: 0 });
      const strong = wrapper.find('strong');

      expect(strong.classes()).toContain('text-positive');
    });

    it('applies text-negative class when remaining < 0', () => {
      const wrapper = createWrapper({ label: 'Points', remaining: -2 });
      const strong = wrapper.find('strong');

      expect(strong.classes()).toContain('text-negative');
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('has aria-live polite for screen reader announcements', () => {
      const wrapper = createWrapper({ label: 'Points', remaining: 5 });

      expect(wrapper.attributes('aria-live')).toBe('polite');
    });

    it('has aria-atomic true for complete announcements', () => {
      const wrapper = createWrapper({ label: 'Points', remaining: 5 });

      expect(wrapper.attributes('aria-atomic')).toBe('true');
    });
  });
});
