import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ResourceBox from './ResourceBox.vue';

const stubs = {
  QBtn: {
    template: '<button class="q-btn" :disabled="$attrs.disable"><slot /></button>',
  },
  QLinearProgress: {
    template:
      '<div class="q-linear-progress" :aria-valuenow="$attrs[\'aria-valuenow\']" :aria-valuemax="$attrs[\'aria-valuemax\']" :aria-label="$attrs[\'aria-label\']" />',
  },
};

const createWrapper = (props: {
  label: string;
  current: number;
  max?: number;
  color?: string;
  suffix?: string;
  saving?: boolean;
}) =>
  shallowMount(ResourceBox, {
    props: { saving: false, ...props },
    global: { stubs },
  });

describe('ResourceBox', () => {
  describe('rendering', () => {
    it('renders label', () => {
      const wrapper = createWrapper({ label: 'HP', current: 25, max: 30 });
      expect(wrapper.text()).toContain('HP');
    });

    it('renders current / max for resources with max', () => {
      const wrapper = createWrapper({ label: 'HP', current: 25, max: 30 });
      expect(wrapper.text()).toContain('25 / 30');
    });

    it('renders current with suffix for resources without max', () => {
      const wrapper = createWrapper({ label: 'Spheres', current: 100, suffix: 'mk' });
      expect(wrapper.text()).toContain('100 mk');
    });

    it('renders progress bar when max is provided', () => {
      const wrapper = createWrapper({ label: 'HP', current: 25, max: 30, color: 'negative' });
      const bar = wrapper.find('.q-linear-progress');
      expect(bar.exists()).toBe(true);
      expect(bar.attributes('aria-valuenow')).toBe('25');
      expect(bar.attributes('aria-valuemax')).toBe('30');
      expect(bar.attributes('aria-label')).toBe('HP');
    });

    it('does not render progress bar when max is not provided', () => {
      const wrapper = createWrapper({ label: 'Spheres', current: 100, suffix: 'mk' });
      expect(wrapper.find('.q-linear-progress').exists()).toBe(false);
    });
  });

  describe('button interactions', () => {
    it('emits update with current - 1 on minus click', async () => {
      const wrapper = createWrapper({ label: 'HP', current: 25, max: 30 });
      const buttons = wrapper.findAll('.q-btn');
      await buttons[0]!.trigger('click');
      expect(wrapper.emitted('update')).toEqual([[24]]);
    });

    it('emits update with current + 1 on plus click', async () => {
      const wrapper = createWrapper({ label: 'HP', current: 25, max: 30 });
      const buttons = wrapper.findAll('.q-btn');
      await buttons[1]!.trigger('click');
      expect(wrapper.emitted('update')).toEqual([[26]]);
    });

    it('disables minus button when current is 0', () => {
      const wrapper = createWrapper({ label: 'HP', current: 0, max: 30 });
      const minusBtn = wrapper.findAll('.q-btn')[0]!;
      expect(minusBtn.attributes('disabled')).toBeDefined();
    });

    it('disables both buttons when saving', () => {
      const wrapper = createWrapper({ label: 'HP', current: 25, max: 30, saving: true });
      const buttons = wrapper.findAll('.q-btn');
      expect(buttons[0]!.attributes('disabled')).toBeDefined();
      expect(buttons[1]!.attributes('disabled')).toBeDefined();
    });
  });

  describe('click-to-edit', () => {
    it('enters edit mode on value click', async () => {
      const wrapper = createWrapper({ label: 'HP', current: 25, max: 30 });
      await wrapper.find('.resource-value').trigger('click');
      expect(wrapper.find('.resource-input').exists()).toBe(true);
    });

    it('emits update on enter keyup', async () => {
      const wrapper = createWrapper({ label: 'HP', current: 25, max: 30 });
      await wrapper.find('.resource-value').trigger('click');
      const input = wrapper.find('.resource-input');
      await input.setValue(20);
      await input.trigger('keyup.enter');
      expect(wrapper.emitted('update')).toEqual([[20]]);
    });

    it('does not emit when input is cleared (falls back to current)', async () => {
      const wrapper = createWrapper({ label: 'HP', current: 25, max: 30 });
      await wrapper.find('.resource-value').trigger('click');
      const input = wrapper.find('.resource-input');
      await input.setValue('');
      await input.trigger('keyup.enter');
      expect(wrapper.emitted('update')).toBeUndefined();
    });

    it('cancels edit on escape', async () => {
      const wrapper = createWrapper({ label: 'HP', current: 25, max: 30 });
      await wrapper.find('.resource-value').trigger('click');
      await wrapper.find('.resource-input').trigger('keyup.escape');
      expect(wrapper.find('.resource-value').exists()).toBe(true);
      expect(wrapper.emitted('update')).toBeUndefined();
    });

    it('shows max in edit mode when max is provided', async () => {
      const wrapper = createWrapper({ label: 'HP', current: 25, max: 30 });
      await wrapper.find('.resource-value').trigger('click');
      expect(wrapper.find('.resource-max').text()).toContain('/ 30');
    });

    it('shows suffix in edit mode when suffix is provided', async () => {
      const wrapper = createWrapper({ label: 'Spheres', current: 100, suffix: 'mk' });
      await wrapper.find('.resource-value').trigger('click');
      expect(wrapper.find('.resource-max').text()).toContain('mk');
    });
  });

  describe('progress clamping', () => {
    it('handles zero max', () => {
      const wrapper = createWrapper({ label: 'HP', current: 25, max: 0 });
      expect(wrapper.find('.q-linear-progress').exists()).toBe(true);
    });

    it('handles current exceeding max', () => {
      const wrapper = createWrapper({ label: 'HP', current: 50, max: 30 });
      expect(wrapper.text()).toContain('50 / 30');
    });

    it('handles negative current', () => {
      const wrapper = createWrapper({ label: 'HP', current: -5, max: 30 });
      expect(wrapper.text()).toContain('-5 / 30');
      const bar = wrapper.find('.q-linear-progress');
      expect(Number(bar.attributes('aria-valuenow'))).toBeLessThanOrEqual(0);
    });
  });
});
