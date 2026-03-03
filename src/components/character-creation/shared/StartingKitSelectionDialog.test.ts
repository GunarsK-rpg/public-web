import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import StartingKitSelectionDialog from './StartingKitSelectionDialog.vue';
import type { StartingKit, Expertise } from 'src/types';

const mockExpertises: Expertise[] = [
  {
    id: 1,
    code: 'literature',
    name: 'Literature',
    expertiseType: { id: 1, code: 'cultural', name: 'Cultural' },
  },
];

const mockKits: StartingKit[] = [
  {
    id: 1,
    code: 'artisan',
    name: 'Artisan',
    startingSpheres: '4d8',
    equipment: [{ id: 10, code: 'hammer', name: 'Hammer', quantity: 1 }],
  },
  {
    id: 2,
    code: 'scholar',
    name: 'Scholar',
    startingSpheres: '3d12',
    expertises: [{ id: 1, code: 'literature', name: 'Literature' }],
  },
  {
    id: 3,
    code: 'prisoner',
    name: 'Prisoner',
    startingSpheres: '0',
  },
];

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    startingKits: mockKits,
    expertises: mockExpertises,
  }),
}));

vi.mock('src/utils/arrayUtils', () => ({
  findById: (arr: { id: number; name: string }[], id: number) => arr.find((item) => item.id === id),
}));

function createWrapper(props: { modelValue: boolean; selectedKitId: number | null }) {
  return mount(StartingKitSelectionDialog, {
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

describe('StartingKitSelectionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render content when modelValue is false', () => {
    const wrapper = createWrapper({ modelValue: false, selectedKitId: null });
    expect(wrapper.find('.q-dialog').exists()).toBe(false);
  });

  it('renders dialog content when modelValue is true', () => {
    const wrapper = createWrapper({ modelValue: true, selectedKitId: null });
    expect(wrapper.find('.q-dialog').exists()).toBe(true);
  });

  it('shows all starting kits from classifiers', () => {
    const wrapper = createWrapper({ modelValue: true, selectedKitId: null });
    const items = wrapper.findAll('.q-item');
    expect(items).toHaveLength(3);
    expect(wrapper.text()).toContain('Artisan');
    expect(wrapper.text()).toContain('Scholar');
    expect(wrapper.text()).toContain('Prisoner');
  });

  it('displays subtitle with currency and expertise info', () => {
    const wrapper = createWrapper({ modelValue: true, selectedKitId: null });
    expect(wrapper.text()).toContain('4d8 marks');
    expect(wrapper.text()).toContain('3d12 marks');
    expect(wrapper.text()).toContain('Literature');
    expect(wrapper.text()).toContain('No starting currency');
  });

  it('marks currently selected kit with check icon', () => {
    const wrapper = createWrapper({ modelValue: true, selectedKitId: 1 });
    const items = wrapper.findAll('.q-item');
    const artisanItem = items[0]!;
    expect(artisanItem.find('svg').exists()).toBe(true);
    expect(artisanItem.text()).not.toContain('Select');
  });

  it('shows Select button for non-selected kits', () => {
    const wrapper = createWrapper({ modelValue: true, selectedKitId: 1 });
    const items = wrapper.findAll('.q-item');
    const scholarItem = items[1]!;
    expect(scholarItem.text()).toContain('Select');
  });

  it('emits select with kitId on click', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedKitId: null });
    const items = wrapper.findAll('.q-item');
    const selectBtn = items[0]!.findAll('button').find((b) => b.text().includes('Select'));
    await selectBtn!.trigger('click');
    expect(wrapper.emitted('select')).toEqual([[1]]);
  });

  it('auto-closes after selection', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedKitId: null });
    const items = wrapper.findAll('.q-item');
    const selectBtn = items[0]!.findAll('button').find((b) => b.text().includes('Select'));
    await selectBtn!.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('emits select when row clicked', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedKitId: null });
    const items = wrapper.findAll('.q-item');
    await items[0]!.trigger('click');
    expect(wrapper.emitted('select')).toEqual([[1]]);
  });

  it('does not emit when already-selected row clicked', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedKitId: 1 });
    const items = wrapper.findAll('.q-item');
    await items[0]!.trigger('click');
    expect(wrapper.emitted('select')).toBeUndefined();
  });

  it('emits update:modelValue false when close button clicked', async () => {
    const wrapper = createWrapper({ modelValue: true, selectedKitId: null });
    const closeBtn = wrapper.find('[aria-label="Close dialog"]');
    await closeBtn.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });
});
