import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import OrderSelectionDialog from './OrderSelectionDialog.vue';
import type { RadiantOrder, Surge } from 'src/types';

const mockSurges: Surge[] = [
  {
    id: 1,
    code: 'gravitation',
    name: 'Gravitation',
    attr: { id: 1, code: 'str', name: 'Strength' },
  },
  { id: 2, code: 'adhesion', name: 'Adhesion', attr: { id: 2, code: 'wil', name: 'Willpower' } },
  {
    id: 3,
    code: 'illumination',
    name: 'Illumination',
    attr: { id: 3, code: 'int', name: 'Intellect' },
  },
];

const mockOrders: RadiantOrder[] = [
  {
    id: 10,
    code: 'windrunner',
    name: 'Windrunner',
    surge1: { id: 1, code: 'gravitation', name: 'Gravitation' },
    surge2: { id: 2, code: 'adhesion', name: 'Adhesion' },
  },
  {
    id: 20,
    code: 'lightweaver',
    name: 'Lightweaver',
    surge1: { id: 3, code: 'illumination', name: 'Illumination' },
    surge2: { id: 2, code: 'adhesion', name: 'Adhesion' },
  },
];

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    radiantOrders: mockOrders,
    surges: mockSurges,
  }),
}));

vi.mock('src/utils/arrayUtils', () => ({
  findById: (arr: { id: number; name: string }[], id: number) => arr.find((item) => item.id === id),
}));

function createWrapper(props: { modelValue: boolean; selectedOrderId: number | null }) {
  return mount(OrderSelectionDialog, {
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

describe('OrderSelectionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render content when modelValue is false', () => {
    const wrapper = createWrapper({ modelValue: false, selectedOrderId: null });
    expect(wrapper.find('.q-dialog').exists()).toBe(false);
  });

  it('renders dialog content when modelValue is true', () => {
    const wrapper = createWrapper({ modelValue: true, selectedOrderId: null });
    expect(wrapper.find('.q-dialog').exists()).toBe(true);
  });

  it('shows all radiant orders from classifiers', () => {
    const wrapper = createWrapper({ modelValue: true, selectedOrderId: null });
    const items = wrapper.findAll('.q-item');
    expect(items).toHaveLength(2);
    expect(wrapper.text()).toContain('Windrunner');
    expect(wrapper.text()).toContain('Lightweaver');
  });

  it('displays surge names as subtitle', () => {
    const wrapper = createWrapper({ modelValue: true, selectedOrderId: null });
    expect(wrapper.text()).toContain('Gravitation');
    expect(wrapper.text()).toContain('Adhesion');
    expect(wrapper.text()).toContain('Illumination');
  });

  it('marks currently selected order with check icon', () => {
    const wrapper = createWrapper({ modelValue: true, selectedOrderId: 10 });
    const items = wrapper.findAll('.q-item');
    const windrunnerItem = items[0]!;
    expect(windrunnerItem.find('svg').exists()).toBe(true);
    expect(windrunnerItem.text()).not.toContain('Select');
  });

  it('shows Select label for non-selected orders', () => {
    const wrapper = createWrapper({ modelValue: true, selectedOrderId: 10 });
    const items = wrapper.findAll('.q-item');
    const lightweaverItem = items[1]!;
    expect(lightweaverItem.text()).toContain('Select');
  });

  it('emits select and closes when row clicked', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedOrderId: null });
    const items = wrapper.findAll('.q-item');
    await items[0]!.trigger('click');
    expect(wrapper.emitted('select')).toEqual([[10]]);
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('does not emit when already-selected row clicked', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedOrderId: 10 });
    const items = wrapper.findAll('.q-item');
    await items[0]!.trigger('click');
    expect(wrapper.emitted('select')).toBeUndefined();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('emits update:modelValue false when close button clicked', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedOrderId: null });
    const closeBtn = wrapper.find('[aria-label="Close dialog"]');
    expect(closeBtn.exists()).toBe(true);
    await closeBtn.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });
});
