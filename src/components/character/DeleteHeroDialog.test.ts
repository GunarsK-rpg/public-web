import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import DeleteHeroDialog from './DeleteHeroDialog.vue';

describe('DeleteHeroDialog', () => {
  const stubs = {
    QDialog: {
      template: '<div class="q-dialog-stub" v-if="modelValue"><slot /></div>',
      props: ['modelValue'],
    },
    QCard: { template: '<div class="q-card-stub"><slot /></div>' },
    QCardSection: { template: '<div class="q-card-section-stub"><slot /></div>' },
    QCardActions: { template: '<div class="q-card-actions-stub"><slot /></div>' },
    QInput: {
      template:
        '<input class="q-input-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue'],
    },
    QBtn: {
      template:
        '<button class="q-btn-stub" :disabled="disable" :data-label="label" @click="$emit(\'click\')"><slot /></button>',
      props: ['disable', 'label', 'loading', 'color', 'flat'],
    },
    QSeparator: { template: '<hr />' },
  };

  const createWrapper = (props = {}) =>
    shallowMount(DeleteHeroDialog, {
      props: {
        modelValue: true,
        heroName: 'Kaladin',
        deleting: false,
        ...props,
      },
      global: { stubs },
    });

  it('displays hero name in confirmation text', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('Kaladin');
  });

  it('has delete button disabled by default', () => {
    const wrapper = createWrapper();
    const deleteBtn = wrapper.find('[data-label="Delete"]');
    expect(deleteBtn.attributes('disabled')).toBeDefined();
  });

  it('enables delete button when user types "delete"', async () => {
    const wrapper = createWrapper();
    const input = wrapper.find('.q-input-stub');
    await input.setValue('delete');
    const deleteBtn = wrapper.find('[data-label="Delete"]');
    expect(deleteBtn.attributes('disabled')).toBeUndefined();
  });

  it('enables delete button case-insensitively', async () => {
    const wrapper = createWrapper();
    const input = wrapper.find('.q-input-stub');
    await input.setValue('DELETE');
    const deleteBtn = wrapper.find('[data-label="Delete"]');
    expect(deleteBtn.attributes('disabled')).toBeUndefined();
  });

  it('emits confirm when delete button is clicked', async () => {
    const wrapper = createWrapper();
    const input = wrapper.find('.q-input-stub');
    await input.setValue('delete');
    const deleteBtn = wrapper.find('[data-label="Delete"]');
    await deleteBtn.trigger('click');
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });

  it('emits update:modelValue false when cancel is clicked', async () => {
    const wrapper = createWrapper();
    const cancelBtn = wrapper.find('[data-label="Cancel"]');
    await cancelBtn.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('disables delete button when deleting is true', () => {
    const wrapper = createWrapper({ deleting: true });
    const deleteBtn = wrapper.find('[data-label="Delete"]');
    expect(deleteBtn.attributes('disabled')).toBeDefined();
  });

  it('clears input when dialog reopens', async () => {
    // Start open, type something
    const wrapper = createWrapper({ modelValue: true });
    const input = wrapper.find('.q-input-stub');
    await input.setValue('delete');
    // Close then reopen
    await wrapper.setProps({ modelValue: false });
    await wrapper.setProps({ modelValue: true });
    // Input should be cleared by watcher
    expect((wrapper.find('.q-input-stub').element as HTMLInputElement).value).toBe('');
  });
});
