import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SelectableCard from './SelectableCard.vue';

describe('SelectableCard', () => {
  const createWrapper = (
    props: {
      title: string;
      subtitle?: string;
      selected: boolean;
      ariaLabel?: string;
      multiSelect?: boolean;
    },
    slots?: { default: string }
  ) =>
    mount(SelectableCard, {
      props,
      ...(slots && { slots }),
      global: {
        stubs: {
          QCard: {
            template: `<div
              class="q-card"
              :role="$attrs.role"
              :tabindex="$attrs.tabindex"
              :aria-checked="$attrs['aria-checked']"
              :aria-label="$attrs['aria-label']"
              :class="$attrs.class"
              @click="$emit('click')"
              @keydown.enter="$emit('click')"
              @keydown.space="$emit('click')"
            ><slot /></div>`,
            emits: ['click'],
          },
          QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
        },
      },
    });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders title', () => {
      const wrapper = createWrapper({ title: 'Test Card', selected: false });

      expect(wrapper.text()).toContain('Test Card');
    });

    it('renders subtitle when provided', () => {
      const wrapper = createWrapper({
        title: 'Test Card',
        subtitle: 'Card description',
        selected: false,
      });

      expect(wrapper.text()).toContain('Card description');
    });

    it('does not render subtitle element when not provided', () => {
      const wrapper = createWrapper({ title: 'Test Card', selected: false });

      expect(wrapper.find('.text-body2').exists()).toBe(false);
    });

    it('renders slot content', () => {
      const wrapper = createWrapper(
        { title: 'Test Card', selected: false },
        { default: '<span class="custom">Custom content</span>' }
      );

      expect(wrapper.find('.custom').exists()).toBe(true);
    });
  });

  // ========================================
  // Selection State
  // ========================================
  describe('selection state', () => {
    it('applies card-selected class when selected', () => {
      const wrapper = createWrapper({ title: 'Test', selected: true });

      expect(wrapper.find('.q-card').classes()).toContain('card-selected');
    });

    it('does not apply card-selected class when not selected', () => {
      const wrapper = createWrapper({ title: 'Test', selected: false });

      expect(wrapper.find('.q-card').classes()).not.toContain('card-selected');
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('has radio role by default', () => {
      const wrapper = createWrapper({ title: 'Test', selected: false });

      expect(wrapper.find('.q-card').attributes('role')).toBe('radio');
    });

    it('has checkbox role when multiSelect is true', () => {
      const wrapper = createWrapper({
        title: 'Test',
        selected: false,
        multiSelect: true,
      });

      expect(wrapper.find('.q-card').attributes('role')).toBe('checkbox');
    });

    it('has tabindex 0 for keyboard navigation', () => {
      const wrapper = createWrapper({ title: 'Test', selected: false });

      expect(wrapper.find('.q-card').attributes('tabindex')).toBe('0');
    });

    it('sets aria-checked based on selected state', () => {
      const wrapperSelected = createWrapper({ title: 'Test', selected: true });
      const wrapperUnselected = createWrapper({ title: 'Test', selected: false });

      expect(wrapperSelected.find('.q-card').attributes('aria-checked')).toBe('true');
      expect(wrapperUnselected.find('.q-card').attributes('aria-checked')).toBe('false');
    });

    it('sets aria-label when provided', () => {
      const wrapper = createWrapper({
        title: 'Test',
        selected: false,
        ariaLabel: 'Select this option',
      });

      expect(wrapper.find('.q-card').attributes('aria-label')).toBe('Select this option');
    });
  });

  // ========================================
  // Events
  // ========================================
  describe('events', () => {
    it('emits select on click', async () => {
      const wrapper = createWrapper({ title: 'Test', selected: false });

      await wrapper.find('.q-card').trigger('click');

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')).toHaveLength(1);
    });

    it('emits select on Enter key', async () => {
      const wrapper = createWrapper({ title: 'Test', selected: false });

      await wrapper.find('.q-card').trigger('keydown.enter');

      expect(wrapper.emitted('select')).toBeTruthy();
    });

    it('emits select on Space key', async () => {
      const wrapper = createWrapper({ title: 'Test', selected: false });

      await wrapper.find('.q-card').trigger('keydown.space');

      expect(wrapper.emitted('select')).toBeTruthy();
    });
  });

  // ========================================
  // Cursor Style
  // ========================================
  describe('cursor style', () => {
    it('has cursor-pointer class', () => {
      const wrapper = createWrapper({ title: 'Test', selected: false });

      expect(wrapper.find('.q-card').classes()).toContain('cursor-pointer');
    });
  });
});
