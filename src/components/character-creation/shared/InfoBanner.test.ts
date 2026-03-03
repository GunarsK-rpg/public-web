import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, type Component } from 'vue';
import InfoBanner from './InfoBanner.vue';

const StubIcon = defineComponent({ render: () => h('span', { class: 'stub-icon' }) });

describe('InfoBanner', () => {
  const createWrapper = (
    props: {
      icon: Component;
      title?: string;
      content: string;
      caption?: string;
    },
    slots?: { default: string }
  ) =>
    mount(InfoBanner, {
      props,
      ...(slots && { slots }),
      global: {
        stubs: {
          QBanner: {
            template: '<div class="q-banner"><slot name="avatar" /><slot /></div>',
          },
        },
      },
    });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders content text', () => {
      const wrapper = createWrapper({
        icon: StubIcon,
        content: 'This is banner content',
      });

      expect(wrapper.text()).toContain('This is banner content');
    });

    it('renders title when provided', () => {
      const wrapper = createWrapper({
        icon: StubIcon,
        title: 'Important',
        content: 'Banner content',
      });

      expect(wrapper.text()).toContain('Important:');
    });

    it('does not render title when not provided', () => {
      const wrapper = createWrapper({
        icon: StubIcon,
        content: 'Banner content',
      });

      expect(wrapper.find('strong').exists()).toBe(false);
    });

    it('renders caption when provided', () => {
      const wrapper = createWrapper({
        icon: StubIcon,
        content: 'Banner content',
        caption: 'Additional info',
      });

      expect(wrapper.text()).toContain('Additional info');
    });

    it('does not render caption element when not provided', () => {
      const wrapper = createWrapper({
        icon: StubIcon,
        content: 'Banner content',
      });

      expect(wrapper.find('.text-caption').exists()).toBe(false);
    });
  });

  // ========================================
  // Slots
  // ========================================
  describe('slots', () => {
    it('renders default slot content', () => {
      const wrapper = createWrapper(
        { icon: StubIcon, content: 'Main content' },
        { default: '<span class="slot-content">Extra content</span>' }
      );

      expect(wrapper.find('.slot-content').exists()).toBe(true);
      expect(wrapper.text()).toContain('Extra content');
    });
  });

  // ========================================
  // Icon
  // ========================================
  describe('icon', () => {
    it('renders icon element', () => {
      const wrapper = createWrapper({
        icon: StubIcon,
        content: 'Content',
      });

      expect(wrapper.find('.stub-icon').exists()).toBe(true);
    });
  });
});
