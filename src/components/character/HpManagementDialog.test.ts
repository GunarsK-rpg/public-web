import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import HpManagementDialog from './HpManagementDialog.vue';

const stubs = {
  QDialog: {
    template: '<div v-if="modelValue" class="q-dialog"><slot /></div>',
    props: ['modelValue'],
  },
  QCard: { template: '<div class="q-card"><slot /></div>' },
  QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
  QSeparator: { template: '<hr class="q-separator" />' },
  QSpace: { template: '<span />' },
  QBtn: {
    template:
      '<button class="q-btn" :class="color ? `text-${color}` : \'\'" :disabled="disable" @click="$emit(\'click\', $event)"><slot />{{ label }}</button>',
    props: ['label', 'disable', 'color', 'flat', 'dense', 'round', 'size', 'outline'],
    emits: ['click'],
  },
  QInput: {
    template:
      '<input :class="$attrs.class" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
    props: ['modelValue', 'outlined', 'dense', 'type', 'label', 'min', 'max', 'disable'],
    emits: ['update:modelValue'],
  },
  QLinearProgress: {
    template:
      '<div class="q-linear-progress" :aria-valuenow="$attrs[\'aria-valuenow\']" :aria-valuemax="$attrs[\'aria-valuemax\']" />',
  },
};

function createWrapper(props: {
  modelValue: boolean;
  currentHp: number;
  maxHp: number;
  saving?: boolean;
}) {
  return mount(HpManagementDialog, {
    props: { saving: false, ...props },
    global: { stubs },
  });
}

describe('HpManagementDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('does not render when modelValue is false', () => {
      const wrapper = createWrapper({ modelValue: false, currentHp: 20, maxHp: 30 });
      expect(wrapper.find('.q-dialog').exists()).toBe(false);
    });

    it('renders current HP / max HP display and progress bar', () => {
      const wrapper = createWrapper({ modelValue: true, currentHp: 20, maxHp: 30 });
      expect(wrapper.text()).toContain('20');
      expect(wrapper.text()).toContain('30');
      expect(wrapper.find('.q-linear-progress').exists()).toBe(true);
    });
  });

  describe('heal and damage', () => {
    it('heal button adds input value to current HP clamped to max', async () => {
      const wrapper = createWrapper({ modelValue: true, currentHp: 25, maxHp: 30 });
      const input = wrapper.find('.hp-input');
      await input.setValue(10);
      const healBtn = wrapper.find('.heal-btn');
      await healBtn.trigger('click');
      expect(wrapper.emitted('update')).toEqual([[30]]);
    });

    it('damage button subtracts input value from current HP clamped to 0', async () => {
      const wrapper = createWrapper({ modelValue: true, currentHp: 5, maxHp: 30 });
      const input = wrapper.find('.hp-input');
      await input.setValue(10);
      const damageBtn = wrapper.find('.damage-btn');
      await damageBtn.trigger('click');
      expect(wrapper.emitted('update')).toEqual([[0]]);
    });
  });

  describe('override', () => {
    it('set button emits exact override value', async () => {
      const wrapper = createWrapper({ modelValue: true, currentHp: 20, maxHp: 30 });
      const overrideInput = wrapper.find('.override-input');
      await overrideInput.setValue(15);
      const setBtn = wrapper.find('.set-btn');
      await setBtn.trigger('click');
      expect(wrapper.emitted('update')).toEqual([[15]]);
    });
  });

  describe('button disabled states', () => {
    it('heal and damage buttons disabled when input is zero', () => {
      const wrapper = createWrapper({ modelValue: true, currentHp: 20, maxHp: 30 });
      expect(wrapper.find('.heal-btn').attributes('disabled')).toBeDefined();
      expect(wrapper.find('.damage-btn').attributes('disabled')).toBeDefined();
    });

    it('all buttons disabled while saving', async () => {
      const wrapper = createWrapper({
        modelValue: true,
        currentHp: 20,
        maxHp: 30,
        saving: true,
      });
      const input = wrapper.find('.hp-input');
      await input.setValue(5);
      expect(wrapper.find('.heal-btn').attributes('disabled')).toBeDefined();
      expect(wrapper.find('.damage-btn').attributes('disabled')).toBeDefined();
      expect(wrapper.find('.set-btn').attributes('disabled')).toBeDefined();
    });

    it('heal button disabled when at max HP', async () => {
      const wrapper = createWrapper({ modelValue: true, currentHp: 30, maxHp: 30 });
      const input = wrapper.find('.hp-input');
      await input.setValue(5);
      expect(wrapper.find('.heal-btn').attributes('disabled')).toBeDefined();
    });

    it('damage button disabled when at 0 HP', async () => {
      const wrapper = createWrapper({ modelValue: true, currentHp: 0, maxHp: 30 });
      const input = wrapper.find('.hp-input');
      await input.setValue(5);
      expect(wrapper.find('.damage-btn').attributes('disabled')).toBeDefined();
    });
  });

  describe('dialog lifecycle', () => {
    it('emits update:modelValue false after applying heal', async () => {
      const wrapper = createWrapper({ modelValue: true, currentHp: 20, maxHp: 30 });
      const input = wrapper.find('.hp-input');
      await input.setValue(5);
      await wrapper.find('.heal-btn').trigger('click');
      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });

    it('emits update:modelValue false after applying damage', async () => {
      const wrapper = createWrapper({ modelValue: true, currentHp: 20, maxHp: 30 });
      const input = wrapper.find('.hp-input');
      await input.setValue(5);
      await wrapper.find('.damage-btn').trigger('click');
      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });
  });
});
