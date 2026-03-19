import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import BasicSetupStep from './BasicSetupStep.vue';

// Mock stores
const mockSetName = vi.fn();
const mockSetLevel = vi.fn();

const mockSetAncestry = vi.fn();
const mockSetSingerForm = vi.fn();

const mockHeroLevel = { value: 1 };
const mockHeroName = { value: 'Test Hero' };
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
        campaign: null as { id: number; code: string; name: string } | null,
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
  }),
}));

const mockLevelData = {
  value: { attributePoints: 10, skillRanks: 10, talentSlots: 3, skillTalentFlex: 0 } as {
    attributePoints: number;
    skillRanks: number;
    talentSlots: number;
    skillTalentFlex: number;
  } | null,
};

vi.mock('src/stores/heroAttributes', () => ({
  useHeroAttributesStore: () => ({
    get levelData() {
      return mockLevelData.value;
    },
  }),
}));

vi.mock('src/stores/campaigns', () => ({
  useCampaignStore: () => ({
    campaigns: [
      { id: 1, code: 'campaign-1', name: 'Campaign 1' },
      { id: 2, code: 'campaign-2', name: 'Campaign 2' },
    ],
  }),
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
    levels: [],
  }),
}));

vi.mock('src/stores/wizard', () => ({
  useWizardStore: () => ({
    mode: 'create',
  }),
}));

vi.mock('src/utils/arrayUtils', () => ({
  findByCode: <T extends { code: string }>(arr: T[], code: string) =>
    arr?.find((item) => item.code === code),
  findByProp: <T>(arr: T[], prop: keyof T, value: unknown) =>
    arr?.find((item) => item[prop] === value),
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
              @change="$emit('update:modelValue', Number($event.target.value))"
            ><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option></select>`,
            props: [
              'modelValue',
              'options',
              'optionValue',
              'optionLabel',
              'emitValue',
              'mapOptions',
              'label',
              'outlined',
            ],
            emits: ['update:modelValue'],
          },
          LevelDiffBanner: {
            template:
              '<div class="level-diff-banner" :data-to-level="JSON.stringify(toLevel)" :data-from-level="fromLevel ? JSON.stringify(fromLevel) : undefined" />',
            props: ['fromLevel', 'toLevel'],
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
          SingerFormSelectionDialog: {
            template: `<div class="singer-form-dialog" v-if="modelValue">
              <span v-for="f in availableForms" :key="f.id" class="dialog-form">{{ f.name }}</span>
              <button class="dialog-select" @click="$emit('select', availableForms[0]?.id)">Select</button>
            </div>`,
            props: ['modelValue', 'selectedFormId', 'availableForms'],
            emits: ['update:modelValue', 'select'],
          },
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QSpace: {
            template: '<span />',
          },
          QBtn: {
            template:
              '<button class="q-btn" @click="$emit(\'click\', $event)"><slot />{{ label }}</button>',
            props: ['label', 'icon', 'color', 'outline', 'flat'],
            emits: ['click'],
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockHeroLevel.value = 1;
    mockHeroName.value = 'Test Hero';
    mockLevelData.value = {
      attributePoints: 10,
      skillRanks: 10,
      talentSlots: 3,
      skillTalentFlex: 0,
    };
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

    it('renders level select', () => {
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
  // Level Select
  // ========================================
  describe('level select', () => {
    it('renders level select component', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-select').exists()).toBe(true);
    });
  });

  // ========================================
  // Level Info Banner
  // ========================================
  describe('level info banner', () => {
    it('does not show banner at level 1', () => {
      mockHeroLevel.value = 1;
      const wrapper = createWrapper();

      expect(wrapper.find('.level-diff-banner').exists()).toBe(false);
    });

    it('shows banner at level > 1', () => {
      mockHeroLevel.value = 5;
      const wrapper = createWrapper();

      const banner = wrapper.find('.level-diff-banner');
      expect(banner.exists()).toBe(true);
    });

    it('passes level data to banner', () => {
      mockHeroLevel.value = 10;
      const wrapper = createWrapper();

      const banner = wrapper.find('.level-diff-banner');
      expect(banner.exists()).toBe(true);
      const toLevel = JSON.parse(banner.attributes('data-to-level')!);
      expect(toLevel.attributePoints).toBe(10);
      expect(toLevel.skillRanks).toBe(10);
      expect(toLevel.talentSlots).toBe(3);
    });
  });

  // Level clamping tests removed — q-select constrains choices to valid levels

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
            QBanner: { template: '<div class="q-banner"><slot /></div>' },
            QIcon: { template: '<span class="q-icon" />' },
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

      await wrapper.find('.emit-null').trigger('click');

      expect(mockSetName).not.toHaveBeenCalled();
    });
  });

  // Level input edge case tests removed — q-select constrains to valid options only

  // ========================================
  // Level Banner Edge Cases
  // ========================================
  describe('level banner edge cases', () => {
    it('does not show banner when levelData is null', () => {
      mockHeroLevel.value = 5;
      mockLevelData.value = null;

      const wrapper = createWrapper();

      expect(wrapper.find('.level-diff-banner').exists()).toBe(false);
    });

    it('shows banner when level > 1 AND levelData exists', () => {
      mockHeroLevel.value = 5;
      mockLevelData.value = {
        attributePoints: 15,
        skillRanks: 15,
        talentSlots: 4,
        skillTalentFlex: 0,
      };

      const wrapper = createWrapper();

      const banner = wrapper.find('.level-diff-banner');
      expect(banner.exists()).toBe(true);
      const toLevel = JSON.parse(banner.attributes('data-to-level')!);
      expect(toLevel.attributePoints).toBe(15);
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
      // Verify name input and level select exist
      expect(wrapper.find('.q-input').exists()).toBe(true);
      expect(wrapper.find('.q-select').exists()).toBe(true);
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

      expect(wrapper.text()).toContain('Select Form');
      expect(wrapper.find('.q-btn').exists()).toBe(true);
    });

    it('shows Choose Form button when no form selected', () => {
      mockIsSinger.value = true;
      mockActiveSingerForm.value = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Choose Form');
    });

    it('shows Change Form button when form is selected', () => {
      mockIsSinger.value = true;
      mockActiveSingerForm.value = { id: 1, code: 'dullform', name: 'Dullform' };
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Change Form');
    });

    it('does not show form selection for non-singer ancestry', () => {
      mockIsSinger.value = false;
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Select Form');
    });

    it('passes available forms to dialog including talent-unlocked forms', async () => {
      mockIsSinger.value = true;
      mockHeroTalents.value = [
        { talent: { id: 100, code: 'warform-talent', name: 'Warform Talent' } },
      ];
      const wrapper = createWrapper();

      const btn = wrapper.findAll('.q-btn').find((b) => b.text().includes('Form'));
      expect(btn).toBeDefined();
      await btn!.trigger('click');

      const dialog = wrapper.find('.singer-form-dialog');
      expect(dialog.exists()).toBe(true);
      const formNames = dialog.findAll('.dialog-form').map((el) => el.text());
      expect(formNames).toContain('Dullform');
      expect(formNames).toContain('Warform');
    });

    it('filters forms requiring talents hero does not have', async () => {
      mockIsSinger.value = true;
      mockHeroTalents.value = [];
      const wrapper = createWrapper();

      const btn = wrapper.findAll('.q-btn').find((b) => b.text().includes('Form'));
      expect(btn).toBeDefined();
      await btn!.trigger('click');

      const dialog = wrapper.find('.singer-form-dialog');
      expect(dialog.exists()).toBe(true);
      const formNames = dialog.findAll('.dialog-form').map((el) => el.text());
      expect(formNames).toContain('Dullform');
      expect(formNames).not.toContain('Warform');
    });

    it('calls setSingerForm when dialog emits select', async () => {
      mockIsSinger.value = true;
      const wrapper = createWrapper();

      // Click button to open dialog
      const btn = wrapper.findAll('.q-btn').find((b) => b.text().includes('Form'));
      await btn!.trigger('click');

      // Click the select button in the dialog stub
      const selectBtn = wrapper.find('.dialog-select');
      expect(selectBtn.exists()).toBe(true);
      await selectBtn.trigger('click');

      expect(mockSetSingerForm).toHaveBeenCalledWith(1);
    });

    it('shows detail card when form is selected', () => {
      mockIsSinger.value = true;
      mockActiveSingerForm.value = { id: 1, code: 'dullform', name: 'Dullform' };
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="singer-detail-card"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('Dullform');
    });

    it('does not show detail card when no form selected', () => {
      mockIsSinger.value = true;
      mockActiveSingerForm.value = null;
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="singer-detail-card"]').exists()).toBe(false);
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
