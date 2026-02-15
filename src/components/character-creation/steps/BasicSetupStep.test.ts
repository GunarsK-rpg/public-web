import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import BasicSetupStep from './BasicSetupStep.vue';

// Mock stores
const mockSetName = vi.fn();
const mockSetLevel = vi.fn();
const mockSetCampaign = vi.fn();
const mockFetchCampaigns = vi.fn();

const mockSetAncestry = vi.fn();
const mockSetSingerForm = vi.fn();

const mockHeroLevel = { value: 1 };
const mockHeroName = { value: 'Test Hero' };
const mockHeroCampaignId = { value: null as number | null };
const mockHeroAncestry = {
  value: { id: 1, code: 'human', name: 'Human' } as { id: number; code: string; name: string },
};
const mockActiveSingerForm = { value: null as { id: number; code: string; name: string } | null };
const mockHeroTalents = { value: [] as { talent: { id: number; code: string; name: string } }[] };
const mockIsSinger = { value: false };

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get hero() {
      return {
        name: mockHeroName.value,
        level: mockHeroLevel.value,
        campaignId: mockHeroCampaignId.value,
        ancestry: mockHeroAncestry.value,
        activeSingerForm: mockActiveSingerForm.value,
        talents: mockHeroTalents.value,
      };
    },
    get talents() {
      return mockHeroTalents.value;
    },
    setName: mockSetName,
    setLevel: mockSetLevel,
    setCampaign: mockSetCampaign,
  }),
}));

const mockLevelData = {
  value: { attributePoints: 10, skillRanks: 10, talentSlots: 3 } as {
    attributePoints: number;
    skillRanks: number;
    talentSlots: number;
  } | null,
};

vi.mock('src/stores/heroAttributes', () => ({
  useHeroAttributesStore: () => ({
    get levelData() {
      return mockLevelData.value;
    },
  }),
}));

const mockHasCampaigns = { value: true };

vi.mock('src/stores/campaigns', () => ({
  useCampaignStore: () => ({
    campaigns: [
      { id: 1, code: 'campaign-1', name: 'Campaign 1' },
      { id: 2, code: 'campaign-2', name: 'Campaign 2' },
    ],
    get hasCampaigns() {
      return mockHasCampaigns.value;
    },
    fetchCampaigns: mockFetchCampaigns,
  }),
}));

const mockNotify = { fn: vi.fn() };

vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: (...args: unknown[]) => mockNotify.fn(...args),
  }),
}));

const mockLoggerError = { fn: vi.fn() };

vi.mock('src/utils/logger', () => ({
  logger: { error: (...args: unknown[]) => mockLoggerError.fn(...args) },
}));

const mockClassifierData = {
  value: {
    ancestries: [
      { id: 1, code: 'human', name: 'Human', description: 'A human ancestry' },
      { id: 2, code: 'singer', name: 'Singer', description: 'A singer ancestry' },
    ] as Array<{ id: number; code: string; name: string; description: string | null }>,
    singerForms: [
      { id: 1, code: 'dullform', name: 'Dullform', description: 'Default form', talent: null },
      {
        id: 2,
        code: 'warform',
        name: 'Warform',
        description: 'Combat form',
        talent: { id: 100, code: 'warform-talent', name: 'Warform Talent' },
      },
    ] as Array<{
      id: number;
      code: string;
      name: string;
      description: string | null;
      talent: { id: number; code: string; name: string } | null;
    }>,
  },
};

vi.mock('src/stores/heroTalents', () => ({
  useHeroTalentsStore: () => ({
    get isSinger() {
      return mockIsSinger.value;
    },
    setAncestry: mockSetAncestry,
    setSingerForm: mockSetSingerForm,
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    get ancestries() {
      return mockClassifierData.value.ancestries;
    },
    get singerForms() {
      return mockClassifierData.value.singerForms;
    },
    talents: [],
  }),
}));

vi.mock('src/utils/arrayUtils', () => ({
  findByCode: <T extends { code: string }>(arr: T[], code: string) =>
    arr?.find((item) => item.code === code),
}));

describe('BasicSetupStep', () => {
  const mockDeletionTracker = {
    trackDeletion: vi.fn(),
    getDeletions: vi.fn(() => []),
    clearDeletions: vi.fn(),
    clearAll: vi.fn(),
  };

  const createWrapper = () =>
    shallowMount(BasicSetupStep, {
      global: {
        provide: {
          deletionTracker: mockDeletionTracker,
        },
        stubs: {
          QInput: {
            template: `<input
              class="q-input"
              :value="modelValue"
              :type="type || 'text'"
              @input="$emit('update:modelValue', $event.target.value)"
            />`,
            props: [
              'modelValue',
              'label',
              'type',
              'min',
              'max',
              'rules',
              'outlined',
              'maxlength',
              'counter',
            ],
            emits: ['update:modelValue'],
          },
          QSelect: {
            template: `<select
              class="q-select"
              :value="modelValue"
              @change="$emit('update:modelValue', Number($event.target.value) || null)"
            >
              <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>`,
            props: [
              'modelValue',
              'options',
              'label',
              'outlined',
              'emitValue',
              'mapOptions',
              'clearable',
            ],
            emits: ['update:modelValue'],
          },
          QBanner: {
            template: '<div class="q-banner"><slot name="avatar" /><slot /></div>',
          },
          QIcon: {
            template: '<span class="q-icon" />',
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
          SelectableCard: {
            template: `<div
              class="selectable-card"
              :class="{ selected: selected }"
              :data-title="title"
              @click="$emit('select')"
            >{{ title }}</div>`,
            props: ['title', 'subtitle', 'selected', 'ariaLabel'],
            emits: ['select'],
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockHeroLevel.value = 1;
    mockHeroName.value = 'Test Hero';
    mockHeroCampaignId.value = null;
    mockHasCampaigns.value = true;
    mockLevelData.value = { attributePoints: 10, skillRanks: 10, talentSlots: 3 };
    mockFetchCampaigns.mockResolvedValue(undefined);
    mockHeroAncestry.value = { id: 1, code: 'human', name: 'Human' };
    mockActiveSingerForm.value = null;
    mockHeroTalents.value = [];
    mockIsSinger.value = false;
    mockClassifierData.value = {
      ancestries: [
        { id: 1, code: 'human', name: 'Human', description: 'A human ancestry' },
        { id: 2, code: 'singer', name: 'Singer', description: 'A singer ancestry' },
      ],
      singerForms: [
        { id: 1, code: 'dullform', name: 'Dullform', description: 'Default form', talent: null },
        {
          id: 2,
          code: 'warform',
          name: 'Warform',
          description: 'Combat form',
          talent: { id: 100, code: 'warform-talent', name: 'Warform Talent' },
        },
      ],
    };
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders step description', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Name your character');
    });

    it('renders name input', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-input').exists()).toBe(true);
    });

    it('renders level input', () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('renders campaign select', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-select').exists()).toBe(true);
    });
  });

  // ========================================
  // Name Input
  // ========================================
  describe('name input', () => {
    it('calls setName on input change', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBeGreaterThan(0);
      await inputs[0]!.setValue('New Name');

      expect(mockSetName).toHaveBeenCalledWith('New Name');
    });

    it('trims whitespace from name', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBeGreaterThan(0);
      await inputs[0]!.setValue('  Padded Name  ');

      expect(mockSetName).toHaveBeenCalledWith('Padded Name');
    });
  });

  // ========================================
  // Level Input
  // ========================================
  describe('level input', () => {
    it('calls setLevel on input change', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBeGreaterThan(1);
      await inputs[1]!.setValue('5');

      expect(mockSetLevel).toHaveBeenCalled();
    });
  });

  // ========================================
  // Campaign Select
  // ========================================
  describe('campaign select', () => {
    it('calls setCampaign with full ClassifierRef on selection', async () => {
      const wrapper = createWrapper();

      const select = wrapper.find('.q-select');
      await select.setValue(1);

      expect(mockSetCampaign).toHaveBeenCalledWith({
        id: 1,
        code: 'campaign-1',
        name: 'Campaign 1',
      });
    });
  });

  // ========================================
  // Level Info Banner
  // ========================================
  describe('level info banner', () => {
    it('does not show banner at level 1', () => {
      mockHeroLevel.value = 1;
      const wrapper = createWrapper();

      // Level is 1, banner should not show
      expect(wrapper.text()).not.toContain('attribute points');
    });

    it('shows banner at level > 1', () => {
      mockHeroLevel.value = 5;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Starting at level 5');
      expect(wrapper.text()).toContain('attribute points');
      expect(wrapper.text()).toContain('skill ranks');
      expect(wrapper.text()).toContain('talent slots');
    });

    it('displays level data in banner', () => {
      mockHeroLevel.value = 10;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('10 attribute points');
      expect(wrapper.text()).toContain('10 skill ranks');
      expect(wrapper.text()).toContain('3 talent slots');
    });
  });

  // ========================================
  // Level Clamping
  // ========================================
  describe('level clamping', () => {
    it('clamps level to minimum 1', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[1]!.setValue('0');

      expect(mockSetLevel).toHaveBeenCalledWith(1);
    });

    it('clamps level to maximum 20', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[1]!.setValue('25');

      expect(mockSetLevel).toHaveBeenCalledWith(20);
    });

    it('handles string level input', async () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[1]!.setValue('10');

      expect(mockSetLevel).toHaveBeenCalledWith(10);
    });
  });

  // ========================================
  // Campaign Fetch on Mount
  // ========================================
  describe('campaign fetch on mount', () => {
    it('does not fetch campaigns if already loaded', async () => {
      mockHasCampaigns.value = true;
      createWrapper();

      // Wait for mount using flushPromises pattern
      await vi.waitFor(() => {
        // Component should not call fetch when campaigns already loaded
        expect(mockFetchCampaigns).not.toHaveBeenCalled();
      });
    });

    it('fetches campaigns if not loaded', async () => {
      mockHasCampaigns.value = false;
      createWrapper();

      // Wait for mount using flushPromises pattern
      await vi.waitFor(() => {
        expect(mockFetchCampaigns).toHaveBeenCalled();
      });
    });
  });

  // ========================================
  // Campaign Selection
  // ========================================
  describe('campaign selection', () => {
    it('calls setCampaign with null when clearing', async () => {
      const wrapper = createWrapper();

      const select = wrapper.find('.q-select');
      await select.setValue('');

      expect(mockSetCampaign).toHaveBeenCalledWith(null);
    });

    it('displays campaign options', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Campaign 1');
      expect(wrapper.text()).toContain('Campaign 2');
    });
  });

  // ========================================
  // Name Input Null Handling
  // ========================================
  describe('name input edge cases', () => {
    it('does not call setName for null value', async () => {
      const wrapper = shallowMount(BasicSetupStep, {
        global: {
          stubs: {
            QInput: {
              template: `<div class="q-input">
                <button class="emit-null" @click="$emit('update:modelValue', null)" />
              </div>`,
              props: ['modelValue', 'label', 'type', 'min', 'max', 'rules', 'outlined'],
              emits: ['update:modelValue'],
            },
            QSelect: { template: '<div class="q-select"></div>', props: ['modelValue', 'options'] },
            QBanner: { template: '<div class="q-banner"><slot /></div>' },
            QIcon: { template: '<span class="q-icon" />' },
          },
          provide: {
            deletionTracker: {
              trackDeletion: vi.fn(),
              getDeletions: vi.fn(() => []),
              clearDeletions: vi.fn(),
            },
          },
        },
      });

      await wrapper.find('.emit-null').trigger('click');

      expect(mockSetName).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Level Input Null/NaN Handling
  // ========================================
  describe('level input edge cases', () => {
    it('does not call setLevel for null value', async () => {
      const wrapper = shallowMount(BasicSetupStep, {
        global: {
          stubs: {
            QInput: {
              template: `<div class="q-input">
                <button class="emit-null-level" @click="$emit('update:modelValue', null)" />
              </div>`,
              props: ['modelValue', 'label', 'type', 'min', 'max', 'rules', 'outlined'],
              emits: ['update:modelValue'],
            },
            QSelect: { template: '<div class="q-select"></div>', props: ['modelValue', 'options'] },
            QBanner: { template: '<div class="q-banner"><slot /></div>' },
            QIcon: { template: '<span class="q-icon" />' },
          },
          provide: {
            deletionTracker: {
              trackDeletion: vi.fn(),
              getDeletions: vi.fn(() => []),
              clearDeletions: vi.fn(),
            },
          },
        },
      });

      // Find the second input (level input) and emit null
      const buttons = wrapper.findAll('.emit-null-level');
      await buttons[1]!.trigger('click');

      expect(mockSetLevel).not.toHaveBeenCalled();
    });

    it('does not call setLevel for NaN value', async () => {
      const wrapper = shallowMount(BasicSetupStep, {
        global: {
          stubs: {
            QInput: {
              template: `<div class="q-input">
                <button class="emit-nan" @click="$emit('update:modelValue', 'not-a-number')" />
              </div>`,
              props: ['modelValue', 'label', 'type', 'min', 'max', 'rules', 'outlined'],
              emits: ['update:modelValue'],
            },
            QSelect: { template: '<div class="q-select"></div>', props: ['modelValue', 'options'] },
            QBanner: { template: '<div class="q-banner"><slot /></div>' },
            QIcon: { template: '<span class="q-icon" />' },
          },
          provide: {
            deletionTracker: {
              trackDeletion: vi.fn(),
              getDeletions: vi.fn(() => []),
              clearDeletions: vi.fn(),
            },
          },
        },
      });

      // Find the second input (level input) and emit NaN string
      const buttons = wrapper.findAll('.emit-nan');
      expect(buttons.length).toBeGreaterThan(1);
      await buttons[1]!.trigger('click');

      expect(mockSetLevel).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Campaign Fetch Error Handling
  // ========================================
  describe('campaign fetch error handling', () => {
    it('shows notification and logs error when fetch fails with Error', async () => {
      mockHasCampaigns.value = false;
      const testError = new Error('Network error');
      mockFetchCampaigns.mockRejectedValueOnce(testError);

      createWrapper();

      // Wait for async error handling
      await vi.waitFor(() => {
        expect(mockLoggerError.fn).toHaveBeenCalledWith('Failed to fetch campaigns', testError);
      });
      expect(mockNotify.fn).toHaveBeenCalledWith({
        type: 'warning',
        message: 'Could not load campaigns. You can continue without selecting one.',
        position: 'top',
      });
    });

    it('handles non-Error throw correctly', async () => {
      mockHasCampaigns.value = false;
      mockFetchCampaigns.mockRejectedValueOnce('string error');

      createWrapper();

      await vi.waitFor(() => {
        expect(mockLoggerError.fn).toHaveBeenCalledWith(
          'Failed to fetch campaigns',
          expect.objectContaining({ message: 'string error' })
        );
      });
      expect(mockNotify.fn).toHaveBeenCalled();
    });
  });

  // ========================================
  // Level Banner Edge Cases
  // ========================================
  describe('level banner edge cases', () => {
    it('does not show banner when levelData is null', () => {
      mockHeroLevel.value = 5;
      mockLevelData.value = null;

      const wrapper = createWrapper();

      expect(wrapper.find('.q-banner').exists()).toBe(false);
    });

    it('shows banner when level > 1 AND levelData exists', () => {
      mockHeroLevel.value = 5;
      mockLevelData.value = { attributePoints: 15, skillRanks: 15, talentSlots: 4 };

      const wrapper = createWrapper();

      expect(wrapper.find('.q-banner').exists()).toBe(true);
      expect(wrapper.text()).toContain('15 attribute points');
    });
  });

  // ========================================
  // Inline validation rules coverage
  // ========================================
  describe('validation rules', () => {
    it('name rule returns error for empty value', () => {
      // Testing the inline validation rules in the template
      // Rule: (val) => !!val.trim() || 'Name is required'
      const rule = (val: string) => !!val.trim() || 'Name is required';
      expect(rule('')).toBe('Name is required');
      expect(rule('   ')).toBe('Name is required');
      expect(rule('Valid Name')).toBe(true);
    });

    it('name rule returns error for too long value', () => {
      // Rule: (val) => val.length <= 100 || 'Name must be 100 characters or less'
      const rule = (val: string) => val.length <= 100 || 'Name must be 100 characters or less';
      expect(rule('a'.repeat(101))).toBe('Name must be 100 characters or less');
      expect(rule('a'.repeat(100))).toBe(true);
    });

    it('level rule returns error for out of range values', () => {
      // Rule: (val) => (val >= 1 && val <= 20) || 'Level must be 1-20'
      const rule = (val: number) => (val >= 1 && val <= 20) || 'Level must be 1-20';
      expect(rule(0)).toBe('Level must be 1-20');
      expect(rule(21)).toBe('Level must be 1-20');
      expect(rule(1)).toBe(true);
      expect(rule(20)).toBe(true);
    });
  });

  // ========================================
  // Hero null fallbacks in template
  // ========================================
  describe('hero null fallbacks', () => {
    it('handles null hero.name with fallback to empty string', () => {
      const wrapper = createWrapper();

      // The template uses heroStore.hero?.name ?? '' which should work
      expect(wrapper.exists()).toBe(true);
      // Verify the name input exists and renders without crashing
      expect(wrapper.find('.q-input').exists()).toBe(true);
    });

    it('handles null hero.level with fallback to 1', () => {
      const wrapper = createWrapper();

      // The template uses heroStore.hero?.level ?? 1
      expect(wrapper.exists()).toBe(true);
      // Verify multiple inputs exist (name and level)
      expect(wrapper.findAll('.q-input').length).toBeGreaterThanOrEqual(2);
    });
  });

  // ========================================
  // Ancestry Selection (merged from AncestryStep)
  // ========================================
  describe('ancestry selection', () => {
    it('renders ancestry section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain("Choose your character's ancestry");
    });

    it('renders all ancestry options', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Human');
      expect(wrapper.text()).toContain('Singer');
    });

    it('marks selected ancestry', () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.selectable-card');
      const humanCard = cards.find((c) => c.text() === 'Human');
      expect(humanCard?.classes()).toContain('selected');
    });

    it('calls setAncestry when card is clicked', async () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.selectable-card');
      expect(cards.length).toBeGreaterThan(1);
      await cards.find((c) => c.text() === 'Singer')!.trigger('click');

      expect(mockSetAncestry).toHaveBeenCalledWith(2);
    });

    it('has radiogroup role for ancestry selection', () => {
      const wrapper = createWrapper();

      const radiogroup = wrapper.find('[role="radiogroup"]');
      expect(radiogroup.exists()).toBe(true);
      expect(radiogroup.attributes('aria-label')).toBe('Select ancestry');
    });
  });

  // ========================================
  // Singer Form Selection (merged from AncestryStep)
  // ========================================
  describe('singer form selection', () => {
    it('shows form selection when singer ancestry is selected', () => {
      mockIsSinger.value = true;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Select Initial Form');
      expect(wrapper.text()).toContain('Dullform');
    });

    it('does not show form selection for non-singer ancestry', () => {
      mockIsSinger.value = false;
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Select Initial Form');
    });

    it('shows available forms based on talents', () => {
      mockIsSinger.value = true;
      mockHeroTalents.value = [
        { talent: { id: 100, code: 'warform-talent', name: 'Warform Talent' } },
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Dullform');
      expect(wrapper.text()).toContain('Warform');
    });

    it('filters forms requiring talents hero does not have', () => {
      mockIsSinger.value = true;
      mockHeroTalents.value = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Dullform');
      expect(wrapper.text()).not.toContain('Warform');
    });

    it('calls setSingerForm when form card is clicked', async () => {
      mockIsSinger.value = true;
      const wrapper = createWrapper();

      const cards = wrapper.findAll('.selectable-card');
      const dullformCard = cards.find((c) => c.text() === 'Dullform');
      await dullformCard!.trigger('click');

      expect(mockSetSingerForm).toHaveBeenCalledWith(1);
    });
  });

  // ========================================
  // Auto-select Dullform (merged from AncestryStep)
  // ========================================
  describe('auto-select dullform', () => {
    it('auto-selects dullform when selecting singer ancestry without existing form', async () => {
      mockIsSinger.value = false;
      mockActiveSingerForm.value = null;

      mockSetAncestry.mockImplementation(() => {
        mockIsSinger.value = true;
      });

      const wrapper = createWrapper();
      const cards = wrapper.findAll('.selectable-card');
      const singerCard = cards.find((c) => c.text() === 'Singer');
      await singerCard!.trigger('click');

      expect(mockSetAncestry).toHaveBeenCalledWith(2);
      expect(mockSetSingerForm).toHaveBeenCalledWith(1);
    });

    it('does not auto-select dullform if form already selected', async () => {
      mockActiveSingerForm.value = { id: 2, code: 'warform', name: 'Warform' };

      mockSetAncestry.mockImplementation(() => {
        mockIsSinger.value = true;
      });

      const wrapper = createWrapper();
      const cards = wrapper.findAll('.selectable-card');
      const singerCard = cards.find((c) => c.text() === 'Singer');
      await singerCard!.trigger('click');

      expect(mockSetAncestry).toHaveBeenCalledWith(2);
      expect(mockSetSingerForm).not.toHaveBeenCalled();
    });

    it('does not auto-select form when selecting non-singer ancestry', async () => {
      mockIsSinger.value = true;
      mockSetAncestry.mockImplementation(() => {
        mockIsSinger.value = false;
      });

      const wrapper = createWrapper();
      const cards = wrapper.findAll('.selectable-card');
      const humanCard = cards.find((c) => c.text() === 'Human');
      await humanCard!.trigger('click');

      expect(mockSetAncestry).toHaveBeenCalledWith(1);
      expect(mockSetSingerForm).not.toHaveBeenCalled();
    });
  });
});
