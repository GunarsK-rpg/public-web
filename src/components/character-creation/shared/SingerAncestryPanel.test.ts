import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import SingerAncestryPanel from './SingerAncestryPanel.vue';
import type { Talent } from 'src/types';

// Mock classifiers store
vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    ancestries: [
      { id: 1, code: 'human', name: 'Human' },
      { id: 2, code: 'singer', name: 'Singer' },
      { id: 3, code: 'elf', name: 'Elf' },
    ],
  }),
}));

// Mock talent prerequisites composable
const mockGetTalentsByAncestry = vi.fn();
const mockGetAncestryKeyTalent = vi.fn();
const mockMapTalentsWithStatus = vi.fn();
const mockIsTalentSelected = vi.fn();

vi.mock('src/composables/useTalentPrerequisites', () => ({
  useTalentPrerequisites: () => ({
    getTalentsByAncestry: mockGetTalentsByAncestry,
    getAncestryKeyTalent: mockGetAncestryKeyTalent,
    mapTalentsWithStatus: mockMapTalentsWithStatus,
    isTalentSelected: mockIsTalentSelected,
  }),
}));

// Mock arrayUtils - needs to work with the actual array passed
vi.mock('src/utils/arrayUtils', () => ({
  findByCode: <T extends { code: string }>(arr: T[], code: string) =>
    arr?.find((item) => item.code === code),
}));

describe('SingerAncestryPanel', () => {
  const createKeyTalent = (): Talent => ({
    id: 100,
    code: 'singer-key',
    name: 'Singer Heritage',
    description: 'Key talent for singer ancestry',
    isKey: true,
    path: null,
    specialties: [],
    ancestry: null,
    radiantOrder: null,
    surge: null,
    special: [],
  });

  const createWrapper = () =>
    shallowMount(SingerAncestryPanel, {
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
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
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

    mockGetTalentsByAncestry.mockReturnValue([]);
    mockGetAncestryKeyTalent.mockReturnValue(createKeyTalent());
    mockMapTalentsWithStatus.mockReturnValue([]);
    mockIsTalentSelected.mockReturnValue(false);
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders Singer Ancestry header', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Singer Ancestry');
    });

    it('renders key talent banner when key talent exists', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.key-talent-banner').exists()).toBe(true);
    });

    it('renders talent list panel', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.talent-list-panel').exists()).toBe(true);
    });

    it('renders talent list with correct label', () => {
      const wrapper = createWrapper();

      const panel = wrapper.find('.talent-list-panel');
      expect(panel.attributes('data-label')).toBe('Ancestry Talents');
    });
  });

  // ========================================
  // Singer Ancestry Detection
  // ========================================
  describe('singer ancestry detection', () => {
    it('calls getTalentsByAncestry with singer ancestry id', () => {
      createWrapper();

      // The component should look up singer ancestry via findByCode
      // and use that ID to fetch talents
      expect(mockGetTalentsByAncestry).toHaveBeenCalledWith(2); // singer has id: 2
    });

    it('calls getAncestryKeyTalent with singer ancestry id', () => {
      createWrapper();

      expect(mockGetAncestryKeyTalent).toHaveBeenCalledWith(2);
    });
  });

  // ========================================
  // Talent Count
  // ========================================
  describe('talent count', () => {
    it('shows selected talent count', () => {
      mockGetTalentsByAncestry.mockReturnValue([
        { id: 1, isKey: false },
        { id: 2, isKey: false },
      ]);
      mockIsTalentSelected.mockImplementation((id: number) => id === 1);

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('1 talents selected');
    });

    it('shows 0 when no talents selected', () => {
      mockGetTalentsByAncestry.mockReturnValue([{ id: 1, isKey: false }]);
      mockIsTalentSelected.mockReturnValue(false);

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('0 talents selected');
    });

    it('counts all selected ancestry talents', () => {
      mockGetTalentsByAncestry.mockReturnValue([
        { id: 1, isKey: false },
        { id: 2, isKey: false },
        { id: 3, isKey: false },
      ]);
      mockIsTalentSelected.mockReturnValue(true);

      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('3 talents selected');
    });
  });

  // ========================================
  // Key Talent Handling
  // ========================================
  describe('key talent handling', () => {
    it('displays key talent name when provided', () => {
      const wrapper = createWrapper();

      // The key talent banner receives the talent
      expect(wrapper.find('.key-talent-banner').text()).toContain('Singer Heritage');
    });

    it('handles null key talent gracefully', () => {
      mockGetAncestryKeyTalent.mockReturnValue(null);

      const wrapper = createWrapper();

      // Should still render without error
      expect(wrapper.exists()).toBe(true);
    });

    it('filters key talents from talent list', () => {
      mockGetTalentsByAncestry.mockReturnValue([
        { id: 1, isKey: true },
        { id: 2, isKey: false },
        { id: 3, isKey: false },
      ]);
      mockMapTalentsWithStatus.mockImplementation((talents: Talent[]) =>
        talents.map((t) => ({ talent: t, available: true, unmetPrereqs: [] }))
      );

      createWrapper();

      // mapTalentsWithStatus should receive non-key talents only
      expect(mockMapTalentsWithStatus).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 2, isKey: false }),
          expect.objectContaining({ id: 3, isKey: false }),
        ])
      );
    });
  });

  // ========================================
  // Events
  // ========================================
  describe('events', () => {
    it('emits toggleTalent from talent list', async () => {
      const wrapper = createWrapper();

      await wrapper.find('.toggle-btn').trigger('click');

      expect(wrapper.emitted('toggleTalent')).toBeTruthy();
      expect(wrapper.emitted('toggleTalent')?.[0]).toEqual([1, true]);
    });

    it('emits showDetails from talent list', async () => {
      const wrapper = createWrapper();

      await wrapper.find('.details-btn').trigger('click');

      expect(wrapper.emitted('showDetails')).toBeTruthy();
      expect(wrapper.emitted('showDetails')?.[0]).toEqual([{ id: 1, name: 'Test' }]);
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('has descriptive aria-label', () => {
      const wrapper = createWrapper();

      const expansionItem = wrapper.find('.q-expansion-item');
      expect(expansionItem.attributes('aria-label')).toBe('Singer ancestry talents');
    });
  });

  // ========================================
  // No Remove Button
  // ========================================
  describe('no remove button', () => {
    it('does not have remove button (unlike other panels)', () => {
      const wrapper = createWrapper();

      // Singer ancestry panel doesn't have a remove button
      // since it's tied to the ancestry selection
      const headerButtons = wrapper.findAll('.expansion-header .q-btn');
      expect(headerButtons.length).toBe(0);
    });
  });
});
