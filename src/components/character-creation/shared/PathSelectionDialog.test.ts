import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import PathSelectionDialog from './PathSelectionDialog.vue';
import type { Path } from 'src/types';

const mockPaths: Path[] = [
  { id: 1, code: 'warrior', name: 'Warrior', description: 'A skilled fighter' },
  { id: 2, code: 'scholar', name: 'Scholar', description: 'A learned sage' },
  { id: 3, code: 'rogue', name: 'Rogue', description: 'A stealthy operative' },
];

import { classifierStore } from 'src/__tests__/mockStores';

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => classifierStore({ paths: mockPaths }),
}));

function createWrapper(props: { modelValue: boolean; selectedPathIds: number[] }) {
  return mount(PathSelectionDialog, {
    props,
    global: {
      stubs: {
        QDialog: {
          template: '<div v-if="modelValue" class="q-dialog"><slot /></div>',
          props: ['modelValue'],
        },
        QCard: { template: '<div class="q-card"><slot /></div>' },
        QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
        QSeparator: { template: '<hr />' },
        QSpace: { template: '<span />' },
        QBtn: {
          template:
            '<button :disabled="disable" :aria-label="ariaLabel" @click="$emit(\'click\', $event)"><slot />{{ label }}</button>',
          props: [
            'label',
            'disable',
            'icon',
            'flat',
            'round',
            'dense',
            'color',
            'size',
            'ariaLabel',
          ],
          emits: ['click'],
        },
        QList: { template: '<div class="q-list"><slot /></div>' },
        QItem: {
          template: '<div class="q-item" :class="{ \'q-item--active\': active }"><slot /></div>',
          props: ['active'],
        },
        QItemSection: { template: '<div class="q-item-section"><slot /></div>' },
        QItemLabel: { template: '<div class="q-item-label"><slot /></div>' },
        QIcon: { template: '<i class="q-icon">{{ name }}</i>', props: ['name', 'color', 'size'] },
      },
    },
  });
}

describe('PathSelectionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render content when modelValue is false', () => {
    const wrapper = createWrapper({ modelValue: false, selectedPathIds: [] });
    expect(wrapper.find('.q-dialog').exists()).toBe(false);
  });

  it('renders dialog content when modelValue is true', () => {
    const wrapper = createWrapper({ modelValue: true, selectedPathIds: [] });
    expect(wrapper.find('.q-dialog').exists()).toBe(true);
  });

  it('shows all heroic paths from classifiers', () => {
    const wrapper = createWrapper({ modelValue: true, selectedPathIds: [] });
    const items = wrapper.findAll('.q-item');
    expect(items).toHaveLength(3);
    expect(wrapper.text()).toContain('Warrior');
    expect(wrapper.text()).toContain('Scholar');
    expect(wrapper.text()).toContain('Rogue');
  });

  it('shows descriptions for each path', () => {
    const wrapper = createWrapper({ modelValue: true, selectedPathIds: [] });
    expect(wrapper.text()).toContain('A skilled fighter');
    expect(wrapper.text()).toContain('A learned sage');
    expect(wrapper.text()).toContain('A stealthy operative');
  });

  it('shows Select label for unselected paths', () => {
    const wrapper = createWrapper({ modelValue: true, selectedPathIds: [1] });
    const items = wrapper.findAll('.q-item');
    const scholarItem = items[1]!;
    expect(scholarItem.text()).toContain('Select');
  });

  it('shows check icon instead of Select label for already-selected paths', () => {
    const wrapper = createWrapper({ modelValue: true, selectedPathIds: [1] });
    const items = wrapper.findAll('.q-item');
    const warriorItem = items[0]!;
    expect(warriorItem.find('.selected-indicator').exists()).toBe(true);
  });

  it('emits select and closes when row clicked', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedPathIds: [] });
    const items = wrapper.findAll('.q-item');
    await items[1]!.trigger('click');
    expect(wrapper.emitted('select')).toEqual([[2]]);
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('does not emit when already-selected row clicked', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedPathIds: [1] });
    const items = wrapper.findAll('.q-item');
    await items[0]!.trigger('click');
    expect(wrapper.emitted('select')).toBeUndefined();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('emits update:modelValue false when close button clicked', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedPathIds: [] });
    const closeBtn = wrapper.find('[aria-label="Close dialog"]');
    expect(closeBtn.exists()).toBe(true);
    await closeBtn.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });
});
