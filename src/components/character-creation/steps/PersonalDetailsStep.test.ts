import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PersonalDetailsStep from './PersonalDetailsStep.vue';
import EditableItemList from 'src/components/shared/EditableItemList.vue';

function findDialogByTestId(wrapper: VueWrapper, testId: string): VueWrapper {
  const dialogs = wrapper.findAllComponents({ name: 'AddOtherDialog' });
  const match = dialogs.find((d) => d.attributes('data-testid') === testId);
  if (!match) throw new Error(`AddOtherDialog with data-testid="${testId}" not found`);
  return match as VueWrapper;
}

// Reactive mock data
const mockHero = {
  value: null as {
    id: number;
    biography: string;
    appearance: string;
    notes: string;
    goals: Array<{
      id: number;
      name: string;
      description?: string;
      value: number;
      status: { id: number; code: string; name: string };
    }>;
    connections: Array<{
      id: number;
      heroId: number;
      connectionType: { id: number; code: string; name: string };
      description: string;
      notes?: string;
    }>;
    companions: Array<{
      id: number;
      heroId: number;
      companionType: { id: number; code: string; name: string };
      description: string;
      notes?: string;
    }>;
  } | null,
};

let tempIdCounter = -100;
const mockNextTempId = vi.fn(() => tempIdCounter--);
const mockTrackDeletion = vi.fn();

import { heroStore, classifierStore } from 'src/__tests__/mockStores';

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    ...heroStore({ nextTempId: mockNextTempId }),
    get hero() {
      return mockHero.value;
    },
    get goals() {
      return mockHero.value?.goals ?? [];
    },
    get connections() {
      return mockHero.value?.connections ?? [];
    },
    get companions() {
      return mockHero.value?.companions ?? [];
    },
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () =>
    classifierStore({
      goalStatuses: [
        { id: 1, code: 'active', name: 'Active' },
        { id: 2, code: 'completed', name: 'Completed' },
      ],
      connectionTypes: [
        { id: 1, code: 'ally', name: 'Ally' },
        { id: 2, code: 'rival', name: 'Rival' },
      ],
    }),
}));

const debounceCancelSpies: ReturnType<typeof vi.fn>[] = [];
vi.mock('src/utils/debounce', () => ({
  debounce: (fn: (...args: unknown[]) => void) => {
    const wrapped = (...args: unknown[]) => fn(...args);
    wrapped.cancel = vi.fn();
    debounceCancelSpies.push(wrapped.cancel);
    return wrapped;
  },
}));

vi.mock('src/utils/arrayUtils', () => ({
  findByCode: <T extends { code: string }>(arr: T[], code: string | null | undefined) =>
    arr?.find((item) => item.code === code),
  removeById: <T extends { id: number }>(arr: T[] | undefined | null, id: number) => {
    if (!arr) return false;
    const idx = arr.findIndex((item) => item.id === id);
    if (idx === -1) return false;
    arr.splice(idx, 1);
    return true;
  },
  toClassifierRef: (c: { id: number; code: string; name: string }) => ({
    id: c.id,
    code: c.code,
    name: c.name,
  }),
}));

vi.mock('src/utils/stringUtils', () => ({
  trimText: (val: string) => val.trim(),
  trimName: (val: string) => val.trim(),
}));

function createHero() {
  return {
    id: 1,
    biography: '',
    appearance: '',
    notes: '',
    goals: [
      {
        id: 1,
        name: 'Goal 1',
        description: 'Description',
        value: 0,
        status: { id: 1, code: 'active', name: 'Active' },
      },
    ],
    connections: [
      {
        id: 1,
        heroId: 1,
        connectionType: { id: 1, code: 'ally', name: 'Ally' },
        description: 'Connection 1',
        notes: 'Notes',
      },
    ],
    companions: [
      {
        id: 1,
        heroId: 1,
        companionType: { id: 1, code: 'pet', name: 'Pet' },
        description: 'Companion 1',
        notes: 'Loyal',
      },
    ],
  };
}

describe('PersonalDetailsStep', () => {
  const createWrapper = () =>
    shallowMount(PersonalDetailsStep, {
      global: {
        stubs: {
          EditableItemList,
          QInput: {
            template: `<input
              class="q-input"
              :value="modelValue"
              @input="$emit('update:modelValue', $event.target.value)"
            />`,
            props: ['modelValue', 'type', 'label', 'outlined', 'autogrow', 'maxlength', 'dense'],
            emits: ['update:modelValue'],
          },
          QList: {
            template: '<div class="q-list"><slot /></div>',
          },
          QItem: {
            template: '<div class="q-item"><slot /></div>',
          },
          QItemSection: {
            template: '<div class="q-item-section"><slot /></div>',
            props: ['side'],
          },
          QItemLabel: {
            template: '<span class="q-item-label"><slot /></span>',
            props: ['caption'],
          },
          QBtn: {
            template: `<button
              class="q-btn"
              :disabled="disable"
              :aria-label="ariaLabel"
              @click="$emit('click')"
            >{{ label }}<slot /></button>`,
            props: [
              'flat',
              'round',
              'color',
              'size',
              'ariaLabel',
              'disable',
              'dense',
              'label',
              'icon',
            ],
            emits: ['click'],
          },
          QBadge: {
            template: '<span class="q-badge"><slot /></span>',
            props: ['color'],
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
          AddOtherDialog: {
            name: 'AddOtherDialog',
            template: '<div />',
            inheritAttrs: true,
          },
        },
        provide: {
          deletionTracker: {
            trackDeletion: mockTrackDeletion,
            getDeletions: vi.fn(() => []),
            clearDeletions: vi.fn(),
            clearAll: vi.fn(),
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    debounceCancelSpies.length = 0;
    tempIdCounter = -100;
    mockHero.value = createHero();
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders step description', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Add personal details');
    });

    it('renders biography input', () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('renders goals section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Goals');
    });

    it('renders connections section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Connections');
    });
  });

  // ========================================
  // Goals
  // ========================================
  describe('goals', () => {
    it('displays existing goals', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Goal 1');
    });

    it('has add goal button', () => {
      const wrapper = createWrapper();

      const addBtns = wrapper.findAll('.q-btn').filter((b) => b.text().includes('Add Goal'));
      expect(addBtns.length).toBe(1);
    });

    it('has remove goal button', () => {
      const wrapper = createWrapper();

      const removeBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Remove goal'));
      expect(removeBtns.length).toBe(1);
    });
  });

  // ========================================
  // Connections
  // ========================================
  describe('connections', () => {
    it('displays existing connections', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Connection 1');
    });

    it('displays connection type badge', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Ally');
    });

    it('has remove connection button', () => {
      const wrapper = createWrapper();

      const removeBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Remove connection'));
      expect(removeBtns.length).toBe(1);
    });
  });

  // ========================================
  // Notes
  // ========================================
  describe('notes', () => {
    it('renders text inputs for biography, appearance, and notes', () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBe(3);
    });
  });

  // ========================================
  // Adding Goals via Dialog
  // ========================================
  describe('adding goals', () => {
    it('pushes goal to hero when dialog emits add', () => {
      const wrapper = createWrapper();

      const dialog = findDialogByTestId(wrapper, 'add-other-goal');
      dialog.vm.$emit('add', 'New Goal', 'Some description', null);

      expect(mockHero.value!.goals.length).toBe(2);
      const added = mockHero.value!.goals[1]!;
      expect(added.name).toBe('New Goal');
      expect(added.description).toBe('Some description');
      expect(added.value).toBe(0);
    });

    it('does not add description when dialog emits null', () => {
      const wrapper = createWrapper();

      const dialog = findDialogByTestId(wrapper, 'add-other-goal');
      dialog.vm.$emit('add', 'New Goal', null, null);

      const added = mockHero.value!.goals[1]!;
      expect(added.name).toBe('New Goal');
      expect(added.description).toBeUndefined();
    });
  });

  // ========================================
  // Adding Connections via Dialog
  // ========================================
  describe('adding connections', () => {
    it('pushes connection to hero when dialog emits add', () => {
      const wrapper = createWrapper();

      const connectionDialog = findDialogByTestId(wrapper, 'add-other-connection');
      connectionDialog.vm.$emit('add', 'New Connection', 'Some notes', 'ally');

      expect(mockHero.value!.connections.length).toBe(2);
      const added = mockHero.value!.connections[1]!;
      expect(added.description).toBe('New Connection');
      expect(added.notes).toBe('Some notes');
      expect(added.connectionType.code).toBe('ally');
    });

    it('does not add connection when typeCode is null', () => {
      const wrapper = createWrapper();

      const connectionDialog = findDialogByTestId(wrapper, 'add-other-connection');
      connectionDialog.vm.$emit('add', 'New Connection', null, null);

      expect(mockHero.value!.connections.length).toBe(1);
    });
  });

  // ========================================
  // Removing Goals
  // ========================================
  describe('removing goals', () => {
    it('removes goal from hero and tracks deletion', async () => {
      const wrapper = createWrapper();

      const removeBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Remove goal'));
      await removeBtns[0]!.trigger('click');

      expect(mockHero.value!.goals.length).toBe(0);
      expect(mockTrackDeletion).toHaveBeenCalledWith('goals', 1);
    });

    it('does not track deletion for temp-ID goal', async () => {
      mockHero.value!.goals = [
        { id: -1, name: 'Temp Goal', value: 0, status: { id: 1, code: 'active', name: 'Active' } },
      ];
      const wrapper = createWrapper();

      const removeBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Remove goal'));
      await removeBtns[0]!.trigger('click');

      expect(mockHero.value!.goals.length).toBe(0);
      expect(mockTrackDeletion).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Removing Connections
  // ========================================
  describe('removing connections', () => {
    it('removes connection from hero and tracks deletion', async () => {
      const wrapper = createWrapper();

      const removeBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Remove connection'));
      await removeBtns[0]!.trigger('click');

      expect(mockHero.value!.connections.length).toBe(0);
      expect(mockTrackDeletion).toHaveBeenCalledWith('connections', 1);
    });

    it('does not track deletion for temp-ID connection', async () => {
      mockHero.value!.connections = [
        {
          id: -1,
          heroId: 1,
          connectionType: { id: 1, code: 'ally', name: 'Ally' },
          description: 'Temp Connection',
        },
      ];
      const wrapper = createWrapper();

      const removeBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Remove connection'));
      await removeBtns[0]!.trigger('click');

      expect(mockHero.value!.connections.length).toBe(0);
      expect(mockTrackDeletion).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Text Input Handlers
  // ========================================
  describe('text input handlers', () => {
    it('sets biography on hero when input changes', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]?.setValue('My biography');

      expect(mockHero.value!.biography).toBe('My biography');
    });

    it('sets appearance on hero when input changes', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[1]?.setValue('Tall and dark');

      expect(mockHero.value!.appearance).toBe('Tall and dark');
    });

    it('sets notes on hero when input changes', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[inputs.length - 1]?.setValue('Some notes');

      expect(mockHero.value!.notes).toBe('Some notes');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles empty goals list', () => {
      mockHero.value!.goals = [];
      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).not.toContain('Goal 1');
    });

    it('handles empty connections list', () => {
      mockHero.value!.connections = [];
      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).not.toContain('Connection 1');
    });

    it('handles null hero', () => {
      mockHero.value = null;
      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
    });

    it('displays goal without description', () => {
      mockHero.value!.goals = [
        { id: 1, name: 'Simple Goal', value: 0, status: { id: 1, code: 'active', name: 'Active' } },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Simple Goal');
    });

    it('displays connection without notes', () => {
      mockHero.value!.connections = [
        {
          id: 1,
          heroId: 1,
          connectionType: { id: 1, code: 'ally', name: 'Ally' },
          description: 'Simple Connection',
        },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Simple Connection');
    });

    it('falls back to model type name for unrecognized classifier code', () => {
      mockHero.value!.connections = [
        {
          id: 1,
          heroId: 1,
          connectionType: { id: 999, code: 'invalid', name: 'Invalid' },
          description: 'Test',
        },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Invalid');
    });
  });

  // ========================================
  // Debounced Handler Edge Cases
  // ========================================
  describe('debounced handler edge cases', () => {
    it('ignores null value in biography handler', async () => {
      const wrapper = shallowMount(PersonalDetailsStep, {
        global: {
          stubs: {
            QInput: {
              template: `<div class="q-input">
                <button class="emit-null" @click="$emit('update:modelValue', null)" />
              </div>`,
              props: ['modelValue'],
              emits: ['update:modelValue'],
            },
            QList: { template: '<div class="q-list"><slot /></div>' },
            QItem: { template: '<div class="q-item"><slot /></div>' },
            QItemSection: { template: '<div class="q-item-section"><slot /></div>' },
            QItemLabel: { template: '<span class="q-item-label"><slot /></span>' },
            QBtn: { template: '<button class="q-btn" />' },
            QBadge: { template: '<span class="q-badge"><slot /></span>' },
            QSeparator: { template: '<hr />' },
            AddOtherDialog: { name: 'AddOtherDialog', template: '<div />', inheritAttrs: true },
          },
          provide: {
            deletionTracker: {
              trackDeletion: vi.fn(),
              getDeletions: vi.fn(() => []),
              clearDeletions: vi.fn(),
              clearAll: vi.fn(),
            },
          },
        },
      });

      const nullBtn = wrapper.find('.emit-null');
      await nullBtn.trigger('click');

      // Biography should remain unchanged (null values are ignored)
      expect(mockHero.value!.biography).toBe('');
    });

    it('cancels debounced calls on unmount', () => {
      const wrapper = createWrapper();
      const cancelsBefore = debounceCancelSpies.map((spy) => spy.mock.calls.length);

      wrapper.unmount();

      // Each debounced handler (biography, appearance, notes) should have cancel called
      expect(debounceCancelSpies.length).toBe(3);
      debounceCancelSpies.forEach((spy, i) => {
        expect(spy.mock.calls.length).toBeGreaterThan(cancelsBefore[i]!);
      });
    });
  });
});
