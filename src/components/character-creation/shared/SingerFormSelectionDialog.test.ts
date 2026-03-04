import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SingerFormSelectionDialog from './SingerFormSelectionDialog.vue';
import type { SingerForm } from 'src/types';

const mockForms: SingerForm[] = [
  {
    id: 1,
    code: 'dullform',
    name: 'Dullform',
    description: 'Base form with no specialization',
    sprenType: null,
    talent: null,
    special: [],
  },
  {
    id: 2,
    code: 'warform',
    name: 'Warform',
    description: 'Combat form',
    sprenType: 'Painspren',
    talent: { id: 100, code: 'forms_of_resolve', name: 'Forms of Resolve' },
    special: [],
  },
];

function createWrapper(props: {
  modelValue: boolean;
  selectedFormId: number | null;
  availableForms?: SingerForm[];
}) {
  return mount(SingerFormSelectionDialog, {
    props: {
      availableForms: mockForms,
      ...props,
    },
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

describe('SingerFormSelectionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render content when modelValue is false', () => {
    const wrapper = createWrapper({ modelValue: false, selectedFormId: null });
    expect(wrapper.find('.q-dialog').exists()).toBe(false);
  });

  it('renders dialog content when modelValue is true', () => {
    const wrapper = createWrapper({ modelValue: true, selectedFormId: null });
    expect(wrapper.find('.q-dialog').exists()).toBe(true);
  });

  it('shows all available singer forms', () => {
    const wrapper = createWrapper({ modelValue: true, selectedFormId: null });
    const items = wrapper.findAll('.q-item');
    expect(items).toHaveLength(2);
    expect(wrapper.text()).toContain('Dullform');
    expect(wrapper.text()).toContain('Warform');
  });

  it('displays sprenType as subtitle when present', () => {
    const wrapper = createWrapper({ modelValue: true, selectedFormId: null });
    expect(wrapper.text()).toContain('Painspren');
  });

  it('marks currently selected form with check icon', () => {
    const wrapper = createWrapper({ modelValue: true, selectedFormId: 1 });
    const items = wrapper.findAll('.q-item');
    const dullformItem = items[0]!;
    expect(dullformItem.find('.selected-indicator').exists()).toBe(true);
  });

  it('shows Select label for non-selected forms', () => {
    const wrapper = createWrapper({ modelValue: true, selectedFormId: 1 });
    const items = wrapper.findAll('.q-item');
    const warformItem = items[1]!;
    expect(warformItem.text()).toContain('Select');
  });

  it('emits select and closes when row clicked', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedFormId: null });
    const items = wrapper.findAll('.q-item');
    await items[1]!.trigger('click');
    expect(wrapper.emitted('select')).toEqual([[2]]);
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('does not emit when already-selected row clicked', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedFormId: 1 });
    const items = wrapper.findAll('.q-item');
    await items[0]!.trigger('click');
    expect(wrapper.emitted('select')).toBeUndefined();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('emits update:modelValue false when close button clicked', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedFormId: null });
    const closeBtn = wrapper.find('[aria-label="Close dialog"]');
    expect(closeBtn.exists()).toBe(true);
    await closeBtn.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });
});
