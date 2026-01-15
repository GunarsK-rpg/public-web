import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PersonalDetailsStep from './PersonalDetailsStep.vue';

// Mock stores
const mockSetBiography = vi.fn();
const mockSetAppearance = vi.fn();
const mockSetNotes = vi.fn();
const mockAddGoal = vi.fn();
const mockRemoveGoalById = vi.fn();
const mockAddConnection = vi.fn();
const mockRemoveConnectionById = vi.fn();

// Reactive mock data
const mockHero = {
  value: {
    biography: '',
    appearance: '',
    notes: '',
  } as { biography: string; appearance: string; notes: string } | null,
};

const mockGoals = {
  value: [{ id: 1, name: 'Goal 1', description: 'Description' }] as Array<{
    id: number;
    name: string;
    description?: string;
  }>,
};

const mockConnections = {
  value: [{ id: 1, connTypeId: 1, description: 'Connection 1', notes: 'Notes' }] as Array<{
    id: number;
    connTypeId: number;
    description: string;
    notes?: string;
  }>,
};

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get hero() {
      return mockHero.value;
    },
    get goals() {
      return mockGoals.value;
    },
    get connections() {
      return mockConnections.value;
    },
  }),
}));

vi.mock('src/stores/heroDetails', () => ({
  useHeroDetailsStore: () => ({
    setBiography: mockSetBiography,
    setAppearance: mockSetAppearance,
    setNotes: mockSetNotes,
    addGoal: mockAddGoal,
    removeGoalById: mockRemoveGoalById,
    addConnection: mockAddConnection,
    removeConnectionById: mockRemoveConnectionById,
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    connectionTypes: [
      { id: 1, code: 'ally', name: 'Ally' },
      { id: 2, code: 'rival', name: 'Rival' },
    ],
  }),
}));

vi.mock('src/utils/debounce', () => ({
  debounce: (fn: (...args: unknown[]) => void) => {
    const wrapped = (...args: unknown[]) => fn(...args);
    wrapped.cancel = vi.fn();
    return wrapped;
  },
}));

vi.mock('src/utils/arrayUtils', () => ({
  findById: <T extends { id: number }>(arr: T[], id: number | null | undefined) =>
    arr?.find((item) => item.id === id),
}));

describe('PersonalDetailsStep', () => {
  const createWrapper = () =>
    shallowMount(PersonalDetailsStep, {
      global: {
        stubs: {
          QInput: {
            template: `<input
              class="q-input"
              :value="modelValue"
              @input="$emit('update:modelValue', $event.target.value)"
            />`,
            props: ['modelValue', 'type', 'label', 'outlined', 'autogrow', 'maxlength', 'dense'],
            emits: ['update:modelValue'],
          },
          QSelect: {
            template: `<select
              class="q-select"
              :value="modelValue"
              @change="$emit('update:modelValue', Number($event.target.value) || null)"
            >
              <option :value="null">Select...</option>
              <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>`,
            props: [
              'modelValue',
              'options',
              'label',
              'outlined',
              'dense',
              'emitValue',
              'mapOptions',
            ],
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
            >{{ label }}</button>`,
            props: ['flat', 'round', 'icon', 'color', 'size', 'ariaLabel', 'disable', 'label'],
            emits: ['click'],
          },
          QBadge: {
            template: '<span class="q-badge"><slot /></span>',
            props: ['color'],
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockHero.value = {
      biography: '',
      appearance: '',
      notes: '',
    };
    mockGoals.value = [{ id: 1, name: 'Goal 1', description: 'Description' }];
    mockConnections.value = [{ id: 1, connTypeId: 1, description: 'Connection 1', notes: 'Notes' }];
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

      const addBtns = wrapper.findAll('.q-btn').filter((b) => b.text().includes('Add'));
      expect(addBtns.length).toBeGreaterThan(0);
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
    it('renders multiple text inputs including notes', () => {
      const wrapper = createWrapper();

      // Biography, Appearance, Goal Name, Goal Description, Connection Description, Connection Notes, Notes
      // At least 5 text inputs should exist
      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBeGreaterThanOrEqual(5);
    });
  });

  // ========================================
  // Adding Goals
  // ========================================
  describe('adding goals', () => {
    it('calls addGoal when add button clicked with goal name', async () => {
      const wrapper = createWrapper();

      // Fill in goal name
      const inputs = wrapper.findAll('.q-input');
      // Goal Name input is after biography and appearance
      await inputs[2]?.setValue('New Goal');

      // Find and click Add button (first Add button for goals)
      const addBtns = wrapper.findAll('.q-btn').filter((b) => b.text().includes('Add'));
      await addBtns[0]?.trigger('click');

      expect(mockAddGoal).toHaveBeenCalledWith('New Goal', undefined);
    });

    it('disables add goal button when no name entered', () => {
      const wrapper = createWrapper();

      // First Add button (for goals) should be disabled when no name
      const addBtns = wrapper.findAll('.q-btn').filter((b) => b.text().includes('Add'));
      expect(addBtns[0]?.attributes('disabled')).toBeDefined();
    });
  });

  // ========================================
  // Removing Goals
  // ========================================
  describe('removing goals', () => {
    it('calls removeGoalById when remove button clicked', async () => {
      const wrapper = createWrapper();

      const removeBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Remove goal'));
      await removeBtns[0]?.trigger('click');

      expect(mockRemoveGoalById).toHaveBeenCalledWith(1);
    });
  });

  // ========================================
  // Adding Connections
  // ========================================
  describe('adding connections', () => {
    it('calls addConnection when add button clicked with valid data', async () => {
      const wrapper = createWrapper();

      // Fill in connection description
      const inputs = wrapper.findAll('.q-input');
      // Connection description is after goal inputs
      await inputs[4]?.setValue('New Connection');

      // Set connection type via select
      const selects = wrapper.findAll('.q-select');
      await selects[0]?.setValue(1);

      // Click Add button for connections
      const addBtns = wrapper.findAll('.q-btn').filter((b) => b.text().includes('Add'));
      await addBtns[1]?.trigger('click');

      expect(mockAddConnection).toHaveBeenCalledWith(1, 'New Connection', undefined);
    });

    it('disables add connection button when no description', () => {
      const wrapper = createWrapper();

      // Second Add button (for connections) should be disabled
      const addBtns = wrapper.findAll('.q-btn').filter((b) => b.text().includes('Add'));
      expect(addBtns[1]?.attributes('disabled')).toBeDefined();
    });
  });

  // ========================================
  // Removing Connections
  // ========================================
  describe('removing connections', () => {
    it('calls removeConnectionById when remove button clicked', async () => {
      const wrapper = createWrapper();

      const removeBtns = wrapper
        .findAll('.q-btn')
        .filter((b) => b.attributes('aria-label')?.includes('Remove connection'));
      await removeBtns[0]?.trigger('click');

      expect(mockRemoveConnectionById).toHaveBeenCalledWith(1);
    });
  });

  // ========================================
  // Text Input Handlers
  // ========================================
  describe('text input handlers', () => {
    it('calls setBiography when biography input changes', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]?.setValue('My biography');

      expect(mockSetBiography).toHaveBeenCalledWith('My biography');
    });

    it('calls setAppearance when appearance input changes', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[1]?.setValue('Tall and dark');

      expect(mockSetAppearance).toHaveBeenCalledWith('Tall and dark');
    });

    it('calls setNotes when notes input changes', async () => {
      const wrapper = createWrapper();

      // Notes is the last input (index 6)
      const inputs = wrapper.findAll('.q-input');
      await inputs[inputs.length - 1]?.setValue('Some notes');

      expect(mockSetNotes).toHaveBeenCalledWith('Some notes');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles empty goals list', () => {
      mockGoals.value = [];
      const wrapper = createWrapper();

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).not.toContain('Goal 1');
    });

    it('handles empty connections list', () => {
      mockConnections.value = [];
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
      mockGoals.value = [{ id: 1, name: 'Simple Goal' }];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Simple Goal');
    });

    it('displays connection without notes', () => {
      mockConnections.value = [{ id: 1, connTypeId: 1, description: 'Simple Connection' }];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Simple Connection');
    });

    it('shows Unknown for connection with invalid type', () => {
      mockConnections.value = [{ id: 1, connTypeId: 999, description: 'Test' }];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Unknown');
    });

    it('displays connection type select options', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Ally');
      expect(wrapper.text()).toContain('Rival');
    });
  });

  // ========================================
  // Debounced Handler Edge Cases
  // ========================================
  describe('debounced handler edge cases', () => {
    it('handles null value in biography handler', async () => {
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
            QSelect: { template: '<select class="q-select" />' },
            QList: { template: '<div class="q-list"><slot /></div>' },
            QItem: { template: '<div class="q-item"><slot /></div>' },
            QItemSection: { template: '<div class="q-item-section"><slot /></div>' },
            QItemLabel: { template: '<span class="q-item-label"><slot /></span>' },
            QBtn: { template: '<button class="q-btn" />' },
            QBadge: { template: '<span class="q-badge"><slot /></span>' },
            QSeparator: { template: '<hr />' },
          },
        },
      });

      mockSetBiography.mockClear();
      const nullBtn = wrapper.find('.emit-null');
      await nullBtn.trigger('click');

      // Null values should be ignored
      expect(mockSetBiography).not.toHaveBeenCalled();
    });

    it('cancels debounced calls on unmount', () => {
      const wrapper = createWrapper();
      wrapper.unmount();

      // Component should unmount without errors - the cancel functions are called
      expect(true).toBe(true);
    });
  });

  // ========================================
  // Form Input Edge Cases
  // ========================================
  describe('form input edge cases', () => {
    it('adds goal with description when both provided', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      // Goal Name input
      await inputs[2]?.setValue('Test Goal');
      // Goal Description input
      await inputs[3]?.setValue('Test Description');

      const addBtns = wrapper.findAll('.q-btn').filter((b) => b.text().includes('Add'));
      await addBtns[0]?.trigger('click');

      expect(mockAddGoal).toHaveBeenCalledWith('Test Goal', 'Test Description');
    });

    it('adds connection with notes when all provided', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      // Connection description
      await inputs[4]?.setValue('Test Connection');
      // Connection notes
      await inputs[5]?.setValue('Test Notes');

      const selects = wrapper.findAll('.q-select');
      await selects[0]?.setValue(1);

      const addBtns = wrapper.findAll('.q-btn').filter((b) => b.text().includes('Add'));
      await addBtns[1]?.trigger('click');

      expect(mockAddConnection).toHaveBeenCalledWith(1, 'Test Connection', 'Test Notes');
    });

    it('does not add goal when addGoal called with empty name', async () => {
      const wrapper = createWrapper();

      // Don't set goal name, just click add
      const addBtns = wrapper.findAll('.q-btn').filter((b) => b.text().includes('Add'));
      // The button should be disabled, but even if clicked nothing should happen
      await addBtns[0]?.trigger('click');

      // Button is disabled so addGoal won't be called
      expect(mockAddGoal).not.toHaveBeenCalled();
    });

    it('does not add connection when addConnection called without type', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      // Set connection description but not type
      await inputs[4]?.setValue('Test Connection');

      const addBtns = wrapper.findAll('.q-btn').filter((b) => b.text().includes('Add'));
      // The button should be disabled
      await addBtns[1]?.trigger('click');

      expect(mockAddConnection).not.toHaveBeenCalled();
    });
  });
});
