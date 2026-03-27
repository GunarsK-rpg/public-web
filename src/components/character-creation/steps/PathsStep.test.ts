import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PathsStep from './PathsStep.vue';

// Mock stores
const mockAddKeyTalentForPath = vi.fn();
const mockRemoveTalent = vi.fn((talentId: number) => {
  mockHero.talents = mockHero.talents.filter((t) => t.talent.id !== talentId);
});
const mockSetRadiantOrder = vi.fn();
const mockSetRadiantIdeal = vi.fn();

const mockIsSinger = { value: false };
const mockIsRadiant = { value: false };
const mockRadiantOrderId = { value: null as number | null };
const mockRadiantIdeal = { value: 1 };

const mockHero: {
  talents: { id: number; heroId: number; talent: { id: number; code: string; name: string } }[];
} = { talents: [] };

import { heroStore, heroTalentsStore, classifierStore } from 'src/__tests__/mockStores';

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    ...heroStore(),
    get hero() {
      return mockHero;
    },
    get talents() {
      return mockHero.talents;
    },
  }),
}));

vi.mock('src/stores/heroTalents', () => ({
  useHeroTalentsStore: () => ({
    ...heroTalentsStore({
      addKeyTalentForPath: mockAddKeyTalentForPath,
      removeTalent: mockRemoveTalent,
      setRadiantOrder: mockSetRadiantOrder,
      setRadiantIdeal: mockSetRadiantIdeal,
    }),
    get isSinger() {
      return mockIsSinger.value;
    },
    get isRadiant() {
      return mockIsRadiant.value;
    },
    get radiantOrderId() {
      return mockRadiantOrderId.value;
    },
    get radiantIdeal() {
      return mockRadiantIdeal.value;
    },
  }),
}));

const mockClassifiersData = {
  value: {
    paths: [
      { id: 1, code: 'warrior', name: 'Warrior', description: 'Combat path' },
      { id: 2, code: 'scholar', name: 'Scholar', description: 'Knowledge path' },
      { id: 3, code: 'pathless', name: 'Pathless', description: null },
    ],
    radiantOrders: [
      {
        id: 1,
        code: 'windrunner',
        name: 'Windrunner',
        surge1: { id: 1, code: 'gravitation', name: 'Gravitation' },
        surge2: { id: 2, code: 'adhesion', name: 'Adhesion' },
      },
      {
        id: 2,
        code: 'skybreaker',
        name: 'Skybreaker',
        surge1: { id: 2, code: 'adhesion', name: 'Adhesion' },
        surge2: { id: 3, code: 'division', name: 'Division' },
      },
    ],
    surges: [
      { id: 1, code: 'gravitation', name: 'Gravitation' },
      { id: 2, code: 'adhesion', name: 'Adhesion' },
      { id: 3, code: 'division', name: 'Division' },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    talents: [] as any[],
    specialties: [] as Array<{ id: number; path: { id: number } }>,
  },
};

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    ...classifierStore(),
    get paths() {
      return mockClassifiersData.value.paths;
    },
    get radiantOrders() {
      return mockClassifiersData.value.radiantOrders;
    },
    get surges() {
      return mockClassifiersData.value.surges;
    },
    get talents() {
      return mockClassifiersData.value.talents;
    },
    get specialties() {
      return mockClassifiersData.value.specialties;
    },
  }),
}));

const mockToggleTalent = vi.fn();
const mockGetPathKeyTalent = vi.fn().mockReturnValue(null);
const mockGetSpecialtiesByPath = vi.fn().mockReturnValue([]);

vi.mock('src/composables/useTalentPrerequisites', () => ({
  useTalentPrerequisites: () => ({
    getPathKeyTalent: mockGetPathKeyTalent,
    getSpecialtiesByPath: mockGetSpecialtiesByPath,
    toggleTalent: mockToggleTalent,
  }),
}));

vi.mock('src/composables/useStepValidation', () => ({
  useStepValidation: () => ({
    budget: () => ({ budget: 0, spent: 0, remaining: 0 }),
    flexBudget: {
      value: {
        skills: { budget: 0, spent: 0, remaining: 0 },
        talents: { budget: 0, spent: 0, remaining: 0 },
        flex: { budget: 0, spent: 0, remaining: 0 },
        isOverBudget: false,
      },
    },
  }),
}));

vi.mock('src/utils/arrayUtils', () => ({
  findById: <T extends { id: number }>(arr: T[], id: number | null | undefined) =>
    arr?.find((item) => item.id === id),
}));

const mockDeletionTracker = {
  trackDeletion: vi.fn(),
  getDeletions: vi.fn(() => []),
  clearDeletions: vi.fn(),
  clearAll: vi.fn(),
};

function findBtnByText(wrapper: ReturnType<typeof shallowMount>, text: string) {
  return wrapper.findAll('.q-btn').find((b) => b.text().replace(/\s+/g, ' ').trim() === text);
}

describe('PathsStep', () => {
  const createWrapper = () =>
    shallowMount(PathsStep, {
      global: {
        stubs: {
          PathSelectionDialog: {
            template: `<div class="path-selection-dialog" v-if="modelValue">
              <button class="emit-select-1" @click="$emit('select', 1)">Select1</button>
              <button class="emit-select-2" @click="$emit('select', 2)">Select2</button>
            </div>`,
            props: ['modelValue', 'selectedPathIds'],
            emits: ['update:modelValue', 'select'],
          },
          OrderSelectionDialog: {
            template: `<div class="order-selection-dialog" v-if="modelValue">
              <button class="emit-select-1" @click="$emit('select', 1)">Select1</button>
              <button class="emit-select-2" @click="$emit('select', 2)">Select2</button>
            </div>`,
            props: ['modelValue', 'selectedOrderId'],
            emits: ['update:modelValue', 'select'],
          },
          HeroicPathPanel: {
            template: `<div class="heroic-path-panel" :data-specialty-id="specialtyId">
              <button class="emit-remove" @click="$emit('remove')">Remove</button>
              <button class="emit-specialty" @click="$emit('update:specialtyId', 20)">Specialty</button>
              <button class="emit-toggle-talent" @click="$emit('toggleTalent', 50, true)">Toggle</button>
              <button class="emit-show-details" @click="$emit('showDetails', { id: 1, name: 'Test' })">Details</button>
            </div>`,
            props: ['pathId', 'specialtyId', 'defaultOpened'],
            emits: ['remove', 'update:specialtyId', 'toggleTalent', 'showDetails'],
          },
          SingerAncestryPanel: {
            template: `<div class="singer-ancestry-panel">
              <button class="emit-toggle-talent" @click="$emit('toggleTalent', 70, true)">Toggle</button>
              <button class="emit-show-details" @click="$emit('showDetails', { id: 3, name: 'Singer Talent' })">Details</button>
            </div>`,
            emits: ['toggleTalent', 'showDetails'],
          },
          RadiantPathPanel: {
            template: `<div class="radiant-path-panel">
              <button class="emit-remove" @click="$emit('remove')">Remove</button>
              <button class="emit-ideal" @click="$emit('update:idealLevel', 3)">Ideal</button>
              <button class="emit-ideal-null" @click="$emit('update:idealLevel', null)">IdealNull</button>
              <button class="emit-toggle-talent" @click="$emit('toggleTalent', 60, false)">Toggle</button>
              <button class="emit-show-details" @click="$emit('showDetails', { id: 2, name: 'Radiant' })">Details</button>
            </div>`,
            props: ['orderId', 'idealLevel'],
            emits: ['remove', 'update:idealLevel', 'toggleTalent', 'showDetails'],
          },
          TalentDetailDialog: {
            template: '<div class="talent-detail-dialog" v-if="modelValue" />',
            props: ['modelValue', 'talent'],
          },
          QTabs: {
            template: `<div class="q-tabs">
              <slot />
              <button class="switch-heroic" @click="$emit('update:modelValue', 'heroic')">Heroic</button>
              <button class="switch-radiant" @click="$emit('update:modelValue', 'radiant')">Radiant</button>
              <button class="switch-singer" @click="$emit('update:modelValue', 'singer')">Singer</button>
            </div>`,
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
          QTab: {
            template: '<div class="q-tab" :data-name="name">{{ label }}</div>',
            props: ['name', 'label'],
          },
          QBtn: {
            template: '<button class="q-btn" @click="$emit(\'click\')"><slot /></button>',
            props: ['color', 'outline', 'flat', 'dense', 'size'],
            emits: ['click'],
          },
          QList: {
            template: '<div class="q-list"><slot /></div>',
          },
          QToggle: {
            template: `<label class="q-toggle">
              <input type="checkbox" :checked="modelValue" @change="$emit('update:modelValue', !modelValue)" />
              {{ label }}
            </label>`,
            props: ['modelValue', 'label'],
            emits: ['update:modelValue'],
          },
          QSpace: {
            template: '<span class="q-space" />',
          },
        },
        provide: {
          deletionTracker: mockDeletionTracker,
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockHero.talents = [];
    mockIsSinger.value = false;
    mockIsRadiant.value = false;
    mockRadiantOrderId.value = null;
    mockRadiantIdeal.value = 1;
    mockGetPathKeyTalent.mockReturnValue(null);
    mockGetSpecialtiesByPath.mockReturnValue([]);
    mockClassifiersData.value.talents = [];
    mockClassifiersData.value.specialties = [];
  });

  // ========================================
  // Tab Rendering
  // ========================================
  describe('tab rendering', () => {
    it('renders step description', () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Choose your heroic paths');
    });

    it('renders heroic and radiant tabs always', () => {
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      const names = tabs.map((t) => t.attributes('data-name'));
      expect(names).toContain('heroic');
      expect(names).toContain('radiant');
    });

    it('renders singer tab when isSinger is true', () => {
      mockIsSinger.value = true;
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      const names = tabs.map((t) => t.attributes('data-name'));
      expect(names).toContain('singer');
    });

    it('hides singer tab when isSinger is false', () => {
      mockIsSinger.value = false;
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      const names = tabs.map((t) => t.attributes('data-name'));
      expect(names).not.toContain('singer');
    });
  });

  // ========================================
  // Tab Switching
  // ========================================
  describe('tab switching', () => {
    it('shows heroic tab content by default', () => {
      const wrapper = createWrapper();
      expect(findBtnByText(wrapper, 'Add Path') !== undefined).toBe(true);
    });

    it('switches to radiant tab', async () => {
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      expect(wrapper.find('.q-toggle').exists()).toBe(true);
      expect(findBtnByText(wrapper, 'Add Path') !== undefined).toBe(false);
    });

    it('switches to singer tab', async () => {
      mockIsSinger.value = true;
      const wrapper = createWrapper();
      await wrapper.find('.switch-singer').trigger('click');
      expect(wrapper.find('.singer-ancestry-panel').exists()).toBe(true);
    });

    it('singer tab not accessible when isSinger is false', () => {
      mockIsSinger.value = false;
      const wrapper = createWrapper();
      // Singer tab is not rendered
      const tabs = wrapper.findAll('.q-tab');
      const names = tabs.map((t) => t.attributes('data-name'));
      expect(names).not.toContain('singer');
    });
  });

  // ========================================
  // Heroic Paths Tab
  // ========================================
  describe('heroic paths tab', () => {
    it('has Add Path button', () => {
      const wrapper = createWrapper();
      expect(findBtnByText(wrapper, 'Add Path') !== undefined).toBe(true);
    });

    it('opens path selection dialog when Add Path clicked', async () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.path-selection-dialog').exists()).toBe(false);

      await findBtnByText(wrapper, 'Add Path')!.trigger('click');
      expect(wrapper.find('.path-selection-dialog').exists()).toBe(true);
    });

    it('calls addKeyTalentForPath when path selected from dialog', async () => {
      const wrapper = createWrapper();

      // Open dialog and select path 1
      await findBtnByText(wrapper, 'Add Path')!.trigger('click');
      await wrapper.find('.path-selection-dialog .emit-select-1').trigger('click');

      expect(mockAddKeyTalentForPath).toHaveBeenCalledWith(1);
    });

    it('sets first specialty when path is added', async () => {
      mockGetSpecialtiesByPath.mockReturnValue([
        { id: 10, name: 'Swordsmanship' },
        { id: 11, name: 'Archery' },
      ]);
      const wrapper = createWrapper();

      await findBtnByText(wrapper, 'Add Path')!.trigger('click');
      await wrapper.find('.path-selection-dialog .emit-select-1').trigger('click');

      // HeroicPathPanel should receive the first specialty id
      const panel = wrapper.find('.heroic-path-panel');
      expect(panel.exists()).toBe(true);
      expect(panel.attributes('data-specialty-id')).toBe('10');
    });

    it('shows HeroicPathPanel after path selection', async () => {
      const wrapper = createWrapper();

      await findBtnByText(wrapper, 'Add Path')!.trigger('click');
      await wrapper.find('.path-selection-dialog .emit-select-1').trigger('click');

      expect(wrapper.find('.heroic-path-panel').exists()).toBe(true);
    });

    it('hides heroic path list when no paths selected', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.q-list .heroic-path-panel').exists()).toBe(false);
    });
  });

  // ========================================
  // Heroic Path Panel Events
  // ========================================
  describe('heroic path panel events', () => {
    async function addPath(wrapper: ReturnType<typeof createWrapper>) {
      await findBtnByText(wrapper, 'Add Path')!.trigger('click');
      await wrapper.find('.path-selection-dialog .emit-select-1').trigger('click');
    }

    it('handles update:specialty-id event', async () => {
      const wrapper = createWrapper();
      await addPath(wrapper);
      await wrapper.find('.heroic-path-panel .emit-specialty').trigger('click');
      // Specialty should be updated to 20 (emitted from stub)
      expect(wrapper.find('.heroic-path-panel').attributes('data-specialty-id')).toBe('20');
    });

    it('handles toggle-talent event', async () => {
      const wrapper = createWrapper();
      await addPath(wrapper);
      await wrapper.find('.heroic-path-panel .emit-toggle-talent').trigger('click');
      expect(mockToggleTalent).toHaveBeenCalledWith(50, true);
    });

    it('handles show-details event', async () => {
      const wrapper = createWrapper();
      await addPath(wrapper);
      await wrapper.find('.heroic-path-panel .emit-show-details').trigger('click');
      expect(wrapper.find('.talent-detail-dialog').exists()).toBe(true);
    });

    it('handles remove event and clears path talents', async () => {
      const wrapper = createWrapper();
      await addPath(wrapper);

      // Set up classifier talent belonging to path 1
      mockClassifiersData.value.talents = [{ id: 100, path: { id: 1 } }];
      mockHero.talents = [
        { id: 1, heroId: 1, talent: { id: 100, code: 'combat-training', name: 'Combat Training' } },
      ];
      await wrapper.vm.$nextTick();

      await wrapper.find('.heroic-path-panel .emit-remove').trigger('click');
      expect(mockHero.talents).toEqual([]);
      expect(mockDeletionTracker.trackDeletion).toHaveBeenCalledWith('talents', 1);
    });
  });

  // ========================================
  // Radiant Tab
  // ========================================
  describe('radiant tab', () => {
    it('shows radiant toggle', async () => {
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      expect(wrapper.find('.q-toggle').exists()).toBe(true);
      expect(wrapper.text()).toContain('Become a Radiant');
    });

    it('opens order dialog when toggled on', async () => {
      mockIsRadiant.value = false;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      await wrapper.find('.q-toggle input').trigger('change');
      expect(mockSetRadiantOrder).not.toHaveBeenCalled();
      expect(wrapper.find('.order-selection-dialog').exists()).toBe(true);
    });

    it('clears radiant order when toggled off', async () => {
      mockIsRadiant.value = true;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      await wrapper.find('.q-toggle input').trigger('change');
      expect(mockSetRadiantOrder).toHaveBeenCalledWith(null);
    });

    it('shows Select Order button when radiant enabled but no order', async () => {
      mockIsRadiant.value = true;
      mockRadiantOrderId.value = null;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      expect(findBtnByText(wrapper, 'Select Order') !== undefined).toBe(true);
    });

    it('shows Change Order button when order already selected', async () => {
      mockIsRadiant.value = true;
      mockRadiantOrderId.value = 1;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      expect(findBtnByText(wrapper, 'Change Order') !== undefined).toBe(true);
    });

    it('opens order dialog when Select Order clicked', async () => {
      mockIsRadiant.value = true;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      expect(wrapper.find('.order-selection-dialog').exists()).toBe(false);

      await findBtnByText(wrapper, 'Select Order')!.trigger('click');
      expect(wrapper.find('.order-selection-dialog').exists()).toBe(true);
    });

    it('calls setRadiantOrder when order selected from dialog', async () => {
      mockIsRadiant.value = true;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      await findBtnByText(wrapper, 'Select Order')!.trigger('click');
      await wrapper.find('.order-selection-dialog .emit-select-2').trigger('click');
      expect(mockSetRadiantOrder).toHaveBeenCalledWith(2);
    });

    it('shows radiant path panel when order selected', async () => {
      mockIsRadiant.value = true;
      mockRadiantOrderId.value = 1;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      expect(wrapper.find('.radiant-path-panel').exists()).toBe(true);
    });

    it('hides radiant path panel when no order selected', async () => {
      mockIsRadiant.value = true;
      mockRadiantOrderId.value = null;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      expect(wrapper.find('.radiant-path-panel').exists()).toBe(false);
    });

    it('handles enabling radiant when no orders exist', async () => {
      const originalOrders = mockClassifiersData.value.radiantOrders;
      mockClassifiersData.value.radiantOrders = [];
      mockIsRadiant.value = false;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      await wrapper.find('.q-toggle input').trigger('change');
      expect(mockSetRadiantOrder).not.toHaveBeenCalledWith(expect.any(Number));
      mockClassifiersData.value.radiantOrders = originalOrders;
    });
  });

  // ========================================
  // RadiantPathPanel Events
  // ========================================
  describe('radiant path panel events', () => {
    it('handles remove event', async () => {
      mockIsRadiant.value = true;
      mockRadiantOrderId.value = 1;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      await wrapper.find('.radiant-path-panel .emit-remove').trigger('click');
      expect(mockSetRadiantOrder).toHaveBeenCalledWith(null);
    });

    it('handles update:ideal-level with value', async () => {
      mockIsRadiant.value = true;
      mockRadiantOrderId.value = 1;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      await wrapper.find('.radiant-path-panel .emit-ideal').trigger('click');
      expect(mockSetRadiantIdeal).toHaveBeenCalledWith(3);
    });

    it('handles update:ideal-level with null', async () => {
      mockIsRadiant.value = true;
      mockRadiantOrderId.value = 1;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      await wrapper.find('.radiant-path-panel .emit-ideal-null').trigger('click');
      expect(mockSetRadiantIdeal).not.toHaveBeenCalled();
    });

    it('handles toggle-talent event', async () => {
      mockIsRadiant.value = true;
      mockRadiantOrderId.value = 1;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      await wrapper.find('.radiant-path-panel .emit-toggle-talent').trigger('click');
      expect(mockToggleTalent).toHaveBeenCalledWith(60, false);
    });

    it('handles show-details event', async () => {
      mockIsRadiant.value = true;
      mockRadiantOrderId.value = 1;
      const wrapper = createWrapper();
      await wrapper.find('.switch-radiant').trigger('click');
      await wrapper.find('.radiant-path-panel .emit-show-details').trigger('click');
      expect(wrapper.find('.talent-detail-dialog').exists()).toBe(true);
    });
  });

  // ========================================
  // Singer Tab
  // ========================================
  describe('singer tab', () => {
    it('shows singer ancestry panel on singer tab', async () => {
      mockIsSinger.value = true;
      const wrapper = createWrapper();
      await wrapper.find('.switch-singer').trigger('click');
      expect(wrapper.find('.singer-ancestry-panel').exists()).toBe(true);
    });

    it('handles toggle-talent event from SingerAncestryPanel', async () => {
      mockIsSinger.value = true;
      const wrapper = createWrapper();
      await wrapper.find('.switch-singer').trigger('click');
      await wrapper.find('.singer-ancestry-panel .emit-toggle-talent').trigger('click');
      expect(mockToggleTalent).toHaveBeenCalledWith(70, true);
    });

    it('handles show-details event from SingerAncestryPanel', async () => {
      mockIsSinger.value = true;
      const wrapper = createWrapper();
      await wrapper.find('.switch-singer').trigger('click');
      await wrapper.find('.singer-ancestry-panel .emit-show-details').trigger('click');
      expect(wrapper.find('.talent-detail-dialog').exists()).toBe(true);
    });
  });

  // ========================================
  // State Sync From Hero
  // ========================================
  describe('sync local state from hero', () => {
    it('syncs path selections from existing hero talents', async () => {
      mockClassifiersData.value.talents = [
        { id: 100, path: { id: 1 }, isKey: true },
        { id: 101, path: { id: 2 }, isKey: true },
      ];
      mockHero.talents = [
        { id: 1, heroId: 1, talent: { id: 100, code: 'warrior-combat', name: 'Combat Training' } },
        { id: 2, heroId: 1, talent: { id: 101, code: 'scholar-lore', name: 'Lore Mastery' } },
      ];

      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();

      // Both paths should be synced -- panels should render
      expect(wrapper.findAll('.heroic-path-panel')).toHaveLength(2);
    });

    it('syncs specialties from existing hero talents', async () => {
      mockClassifiersData.value.talents = [{ id: 100, path: { id: 1 }, isKey: true }];
      mockHero.talents = [
        { id: 1, heroId: 1, talent: { id: 100, code: 'warrior-combat', name: 'Combat Training' } },
      ];

      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.heroic-path-panel').exists()).toBe(true);
    });

    it('handles talent without pathId', () => {
      mockClassifiersData.value.talents = [{ id: 100 }];
      mockHero.talents = [
        { id: 1, heroId: 1, talent: { id: 100, code: 'generic-talent', name: 'Generic Talent' } },
      ];

      const wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    it('handles talent with unknown talentId', () => {
      mockHero.talents = [
        { id: 1, heroId: 1, talent: { id: 999, code: 'unknown-talent', name: 'Unknown Talent' } },
      ];

      const wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });
  });

  // ========================================
  // Path Removal with Deletion Tracking
  // ========================================
  describe('path removal with deletion tracking', () => {
    it('removes all path talents and tracks deletions', async () => {
      mockClassifiersData.value.talents = [{ id: 100, path: { id: 1 }, isKey: true }];
      mockHero.talents = [
        { id: 1, heroId: 1, talent: { id: 100, code: 'combat-training', name: 'Combat Training' } },
      ];
      const wrapper = createWrapper();

      // Sync adds path 1 automatically
      // Wait for sync
      await wrapper.vm.$nextTick();

      // Remove via panel
      await wrapper.find('.heroic-path-panel .emit-remove').trigger('click');

      expect(mockHero.talents).toEqual([]);
      expect(mockDeletionTracker.trackDeletion).toHaveBeenCalledWith('talents', 1);
    });
  });

  // ========================================
  // Talent Detail Dialog
  // ========================================
  describe('talent detail dialog', () => {
    it('dialog hidden by default', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.talent-detail-dialog').exists()).toBe(false);
    });
  });
});
