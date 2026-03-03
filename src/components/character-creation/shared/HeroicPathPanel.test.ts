import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import HeroicPathPanel from './HeroicPathPanel.vue';
import type { Talent } from 'src/types';

// Mock classifiers store
const mockPaths = [
  { id: 1, code: 'warrior', name: 'Warrior' },
  { id: 2, code: 'mage', name: 'Mage' },
];

const mockSpecialties = [
  {
    id: 10,
    code: 'berserker',
    name: 'Berserker',
    path: { id: 1, code: 'warrior', name: 'Warrior' },
  },
  { id: 11, code: 'guardian', name: 'Guardian', path: { id: 1, code: 'warrior', name: 'Warrior' } },
  {
    id: 20,
    code: 'elementalist',
    name: 'Elementalist',
    path: { id: 2, code: 'mage', name: 'Mage' },
  },
];

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    paths: mockPaths,
    specialties: mockSpecialties,
  }),
}));

// Mock talent prerequisites composable
const mockGetTalentsByPath = vi.fn();
const mockGetTalentsBySpecialty = vi.fn();
const mockGetPathKeyTalent = vi.fn();
const mockGetSpecialtiesByPath = vi.fn();
const mockMapTalentsWithStatus = vi.fn();
const mockIsTalentSelected = vi.fn();

vi.mock('src/composables/useTalentPrerequisites', () => ({
  useTalentPrerequisites: () => ({
    getTalentsByPath: mockGetTalentsByPath,
    getTalentsBySpecialty: mockGetTalentsBySpecialty,
    getPathKeyTalent: mockGetPathKeyTalent,
    getSpecialtiesByPath: mockGetSpecialtiesByPath,
    mapTalentsWithStatus: mockMapTalentsWithStatus,
    isTalentSelected: mockIsTalentSelected,
  }),
}));

// Mock arrayUtils
vi.mock('src/utils/arrayUtils', () => ({
  findById: (arr: { id: number; name: string }[], id: number | null | undefined) =>
    arr.find((item) => item.id === id),
}));

describe('HeroicPathPanel', () => {
  const createKeyTalent = (): Talent => ({
    id: 100,
    code: 'warrior-key',
    name: 'Warrior Mastery',
    description: 'Key talent for warriors',
    isKey: true,
    path: { id: 1, code: 'warrior', name: 'Warrior' },
    specialties: [],
    ancestry: null,
    radiantOrder: null,
    surge: null,
    special: [],
  });

  const createWrapper = (props: {
    pathId: number;
    specialtyId: number | undefined;
    defaultOpened?: boolean;
  }) =>
    mount(HeroicPathPanel, {
      props,
      global: {
        stubs: {
          QExpansionItem: {
            template: `<div class="q-expansion-item" :aria-label="$attrs['aria-label']">
              <div class="expansion-header"><slot name="header" /></div>
              <div class="expansion-content"><slot /></div>
            </div>`,
          },
          QItemSection: {
            template: '<div class="q-item-section"><slot /></div>',
          },
          QItemLabel: {
            template: '<div class="q-item-label"><slot /></div>',
          },
          QIcon: {
            template: '<span class="q-icon" />',
          },
          QBtn: {
            template: '<button class="q-btn" @click="$emit(\'click\', $event)"><slot /></button>',
            emits: ['click'],
          },
          QTooltip: {
            template: '<span class="q-tooltip"><slot /></span>',
          },
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QBtnToggle: {
            template: `<div class="q-btn-toggle">
              <button
                v-for="opt in options"
                :key="opt.value"
                :class="{ active: modelValue === opt.value }"
                @click="$emit('update:modelValue', opt.value)"
              >{{ opt.label }}</button>
            </div>`,
            props: ['modelValue', 'options'],
            emits: ['update:modelValue'],
          },
          KeyTalentBanner: {
            template: '<div class="key-talent-banner">{{ talent?.name }}</div>',
            props: ['talent'],
          },
          TalentListPanel: {
            template: `<div class="talent-list-panel" :data-label="label">
              <button class="toggle-btn" @click="$emit('toggleTalent', 1, true)">Toggle</button>
              <button class="details-btn" @click="$emit('showDetails', { id: 1, name: 'Test' })">Details</button>
            </div>`,
            props: ['label', 'talents'],
            emits: ['toggleTalent', 'showDetails'],
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockGetTalentsByPath.mockReturnValue([]);
    mockGetTalentsBySpecialty.mockReturnValue([]);
    mockGetPathKeyTalent.mockReturnValue(createKeyTalent());
    mockGetSpecialtiesByPath.mockReturnValue([
      { id: 10, name: 'Berserker' },
      { id: 11, name: 'Guardian' },
    ]);
    mockMapTalentsWithStatus.mockReturnValue([]);
    mockIsTalentSelected.mockReturnValue(false);
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders path name in header', () => {
      const wrapper = createWrapper({ pathId: 1, specialtyId: undefined });

      expect(wrapper.text()).toContain('Warrior Path');
    });

    it('shows Unknown for invalid path', () => {
      const wrapper = createWrapper({ pathId: 999, specialtyId: undefined });

      expect(wrapper.text()).toContain('Unknown Path');
    });

    it('renders specialty name in header', () => {
      const wrapper = createWrapper({ pathId: 1, specialtyId: 10 });

      expect(wrapper.text()).toContain('Berserker');
    });

    it('shows only talent count when no specialty talents selected', () => {
      const wrapper = createWrapper({ pathId: 1, specialtyId: undefined });

      expect(wrapper.text()).toContain('0 talents selected');
    });

    it('renders key talent banner', () => {
      const wrapper = createWrapper({ pathId: 1, specialtyId: undefined });

      expect(wrapper.find('.key-talent-banner').exists()).toBe(true);
      expect(wrapper.text()).toContain('Warrior Mastery');
    });

    it('renders talent list panel', () => {
      const wrapper = createWrapper({ pathId: 1, specialtyId: undefined });

      expect(wrapper.find('.talent-list-panel').exists()).toBe(true);
    });
  });

  // ========================================
  // Specialty Selection
  // ========================================
  describe('specialty selection', () => {
    it('renders specialty toggle options', () => {
      const wrapper = createWrapper({ pathId: 1, specialtyId: undefined });

      const toggle = wrapper.find('.q-btn-toggle');
      expect(toggle.text()).toContain('Berserker');
      expect(toggle.text()).toContain('Guardian');
    });

    it('emits update:specialtyId when specialty selected', async () => {
      const wrapper = createWrapper({ pathId: 1, specialtyId: undefined });

      const buttons = wrapper.findAll('.q-btn-toggle button');
      expect(buttons.length).toBeGreaterThan(0);
      await buttons[0]!.trigger('click');

      expect(wrapper.emitted('update:specialtyId')).toBeTruthy();
      expect(wrapper.emitted('update:specialtyId')?.[0]).toEqual([10]);
    });
  });

  // ========================================
  // Talent Count
  // ========================================
  describe('talent count', () => {
    it('shows selected talent count', () => {
      mockGetTalentsByPath.mockReturnValue([
        { id: 1, isKey: false },
        { id: 2, isKey: false },
      ]);
      mockIsTalentSelected.mockImplementation((id: number) => id === 1);

      const wrapper = createWrapper({ pathId: 1, specialtyId: undefined });

      expect(wrapper.text()).toContain('1 talents selected');
    });

    it('shows 0 when no talents selected', () => {
      mockGetTalentsByPath.mockReturnValue([{ id: 1, isKey: false }]);
      mockIsTalentSelected.mockReturnValue(false);

      const wrapper = createWrapper({ pathId: 1, specialtyId: undefined });

      expect(wrapper.text()).toContain('0 talents selected');
    });

    it('includes specialty talents in count', () => {
      mockGetTalentsByPath.mockReturnValue([{ id: 1, isKey: false }]);
      mockGetTalentsBySpecialty.mockReturnValue([{ id: 2, isKey: false }]);
      mockIsTalentSelected.mockReturnValue(true);

      const wrapper = createWrapper({ pathId: 1, specialtyId: 10 });

      expect(wrapper.text()).toContain('2 talents selected');
    });
  });

  // ========================================
  // Events
  // ========================================
  describe('events', () => {
    it('has remove button in header', () => {
      const wrapper = createWrapper({ pathId: 1, specialtyId: undefined });

      // The remove button exists in the header
      const removeBtn = wrapper.find('.expansion-header .q-btn');
      expect(removeBtn.exists()).toBe(true);
    });

    it('emits toggleTalent from talent list', async () => {
      const wrapper = createWrapper({ pathId: 1, specialtyId: undefined });

      await wrapper.find('.toggle-btn').trigger('click');

      expect(wrapper.emitted('toggleTalent')).toBeTruthy();
    });

    it('emits showDetails from talent list', async () => {
      const wrapper = createWrapper({ pathId: 1, specialtyId: undefined });

      await wrapper.find('.details-btn').trigger('click');

      expect(wrapper.emitted('showDetails')).toBeTruthy();
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('has descriptive aria-label', () => {
      const wrapper = createWrapper({ pathId: 1, specialtyId: undefined });

      const expansionItem = wrapper.find('.q-expansion-item');
      expect(expansionItem.attributes('aria-label')).toContain('Warrior path talents');
    });

    it('has aria-label on remove button', () => {
      const wrapper = createWrapper({ pathId: 1, specialtyId: undefined });

      // Check that remove button has accessible label via tooltip
      const tooltip = wrapper.find('.q-tooltip');
      expect(tooltip.exists()).toBe(true);
      expect(tooltip.text()).toContain('Remove path');
    });
  });

  // ========================================
  // Talent Filtering
  // ========================================
  describe('talent filtering', () => {
    it('filters out key talents from list', () => {
      mockGetTalentsByPath.mockReturnValue([
        { id: 1, isKey: true },
        { id: 2, isKey: false },
      ]);
      mockMapTalentsWithStatus.mockImplementation((talents: Talent[]) =>
        talents.map((t) => ({ talent: t, available: true, unmetPrereqs: [] }))
      );

      createWrapper({ pathId: 1, specialtyId: undefined });

      // mapTalentsWithStatus should be called with non-key talents only
      expect(mockMapTalentsWithStatus).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 2, isKey: false })])
      );
      // Verify key talent was excluded
      expect(mockMapTalentsWithStatus).not.toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 1, isKey: true })])
      );
    });
  });
});
