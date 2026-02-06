import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TalentListPanel from './TalentListPanel.vue';
import type { TalentWithStatus } from 'src/composables/useTalentPrerequisites';
import type { TalentPrerequisite } from 'src/types';

// Mock the composable
const mockIsTalentSelected = vi.fn();
const mockFormatPrereq = vi.fn();

vi.mock('src/composables/useTalentPrerequisites', () => ({
  useTalentPrerequisites: () => ({
    isTalentSelected: mockIsTalentSelected,
    formatPrereq: mockFormatPrereq,
  }),
}));

describe('TalentListPanel', () => {
  const createTalentWithStatus = (overrides: Partial<TalentWithStatus> = {}): TalentWithStatus => ({
    talent: {
      id: 1,
      code: 'test-talent',
      name: 'Test Talent',
      description: 'Full description',
      descriptionShort: 'Short desc',
      isKey: false,
      path: null,
      specialties: [],
      ancestry: null,
      radiantOrder: null,
      surge: null,
    },
    available: true,
    unmetPrereqs: [],
    ...overrides,
  });

  const createWrapper = (props: {
    label: string;
    talents: TalentWithStatus[];
    emptyMessage?: string;
  }) =>
    mount(TalentListPanel, {
      props,
      global: {
        stubs: {
          QList: {
            template: '<div class="q-list"><slot /></div>',
          },
          QItem: {
            template: '<div class="q-item"><slot /></div>',
          },
          QItemSection: {
            template: '<div class="q-item-section"><slot /></div>',
          },
          TalentListItem: {
            template: `<div
              class="talent-list-item"
              :data-talent-id="talent.id"
              :data-selected="selected"
              :data-available="available"
              @click="$emit('toggle')"
            >
              <button class="details-btn" @click.stop="$emit('showDetails', talent)">Details</button>
            </div>`,
            props: ['talent', 'selected', 'available', 'unmetPrereqs', 'formatPrereq'],
            emits: ['toggle', 'showDetails'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTalentSelected.mockReturnValue(false);
    mockFormatPrereq.mockImplementation((prereq: TalentPrerequisite) => `Prereq: ${prereq.type}`);
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders label text', () => {
      const wrapper = createWrapper({
        label: 'Available Talents',
        talents: [],
      });

      expect(wrapper.text()).toContain('Available Talents');
    });

    it('renders talent items for each talent', () => {
      const talents = [
        createTalentWithStatus({
          talent: {
            id: 1,
            code: 't1',
            name: 'Talent 1',
            description: '',
            isKey: false,
            path: null,
            specialties: [],
            ancestry: null,
            radiantOrder: null,
            surge: null,
          },
        }),
        createTalentWithStatus({
          talent: {
            id: 2,
            code: 't2',
            name: 'Talent 2',
            description: '',
            isKey: false,
            path: null,
            specialties: [],
            ancestry: null,
            radiantOrder: null,
            surge: null,
          },
        }),
        createTalentWithStatus({
          talent: {
            id: 3,
            code: 't3',
            name: 'Talent 3',
            description: '',
            isKey: false,
            path: null,
            specialties: [],
            ancestry: null,
            radiantOrder: null,
            surge: null,
          },
        }),
      ];

      const wrapper = createWrapper({
        label: 'Talents',
        talents,
      });

      const items = wrapper.findAll('.talent-list-item');
      expect(items).toHaveLength(3);
    });

    it('passes talent data to TalentListItem', () => {
      const talent = createTalentWithStatus({
        talent: {
          id: 42,
          code: 'special',
          name: 'Special Talent',
          description: '',
          isKey: false,
          path: null,
          specialties: [],
          ancestry: null,
          radiantOrder: null,
          surge: null,
        },
        available: false,
      });

      const wrapper = createWrapper({
        label: 'Talents',
        talents: [talent],
      });

      const item = wrapper.find('.talent-list-item');
      expect(item.attributes('data-talent-id')).toBe('42');
      expect(item.attributes('data-available')).toBe('false');
    });
  });

  // ========================================
  // Empty State
  // ========================================
  describe('empty state', () => {
    it('shows empty message when no talents and message provided', () => {
      const wrapper = createWrapper({
        label: 'Talents',
        talents: [],
        emptyMessage: 'No talents available',
      });

      expect(wrapper.text()).toContain('No talents available');
    });

    it('does not show empty message when talents exist', () => {
      const wrapper = createWrapper({
        label: 'Talents',
        talents: [createTalentWithStatus()],
        emptyMessage: 'No talents available',
      });

      expect(wrapper.text()).not.toContain('No talents available');
    });

    it('does not show empty section when no emptyMessage provided', () => {
      const wrapper = createWrapper({
        label: 'Talents',
        talents: [],
      });

      // Should only have label, no empty message item
      const items = wrapper.findAll('.q-item');
      expect(items).toHaveLength(0);
    });
  });

  // ========================================
  // Selection State
  // ========================================
  describe('selection state', () => {
    it('checks selection via composable', () => {
      mockIsTalentSelected.mockReturnValue(true);

      const talent = createTalentWithStatus({
        talent: {
          id: 99,
          code: 't99',
          name: 'Talent 99',
          description: '',
          isKey: false,
          path: null,
          specialties: [],
          ancestry: null,
          radiantOrder: null,
          surge: null,
        },
      });

      const wrapper = createWrapper({
        label: 'Talents',
        talents: [talent],
      });

      const item = wrapper.find('.talent-list-item');
      expect(item.attributes('data-selected')).toBe('true');
      expect(mockIsTalentSelected).toHaveBeenCalledWith(99);
    });

    it('passes unselected state when not selected', () => {
      mockIsTalentSelected.mockReturnValue(false);

      const wrapper = createWrapper({
        label: 'Talents',
        talents: [createTalentWithStatus()],
      });

      const item = wrapper.find('.talent-list-item');
      expect(item.attributes('data-selected')).toBe('false');
    });
  });

  // ========================================
  // Events
  // ========================================
  describe('events', () => {
    it('emits toggleTalent when talent item is toggled', async () => {
      const talent = createTalentWithStatus({
        talent: {
          id: 5,
          code: 't5',
          name: 'Talent 5',
          description: '',
          isKey: false,
          path: null,
          specialties: [],
          ancestry: null,
          radiantOrder: null,
          surge: null,
        },
        available: true,
      });

      const wrapper = createWrapper({
        label: 'Talents',
        talents: [talent],
      });

      await wrapper.find('.talent-list-item').trigger('click');

      expect(wrapper.emitted('toggleTalent')).toBeTruthy();
      expect(wrapper.emitted('toggleTalent')?.[0]).toEqual([5, true]);
    });

    it('emits toggleTalent with availability status', async () => {
      const talent = createTalentWithStatus({
        talent: {
          id: 10,
          code: 't10',
          name: 'Talent 10',
          description: '',
          isKey: false,
          path: null,
          specialties: [],
          ancestry: null,
          radiantOrder: null,
          surge: null,
        },
        available: false,
      });

      const wrapper = createWrapper({
        label: 'Talents',
        talents: [talent],
      });

      await wrapper.find('.talent-list-item').trigger('click');

      expect(wrapper.emitted('toggleTalent')?.[0]).toEqual([10, false]);
    });

    it('emits showDetails when details button clicked', async () => {
      const talentData = {
        id: 7,
        code: 't7',
        name: 'Talent 7',
        description: 'Full desc',
        isKey: false,
        path: null,
        specialties: [],
        ancestry: null,
        radiantOrder: null,
        surge: null,
      };
      const talent = createTalentWithStatus({ talent: talentData });

      const wrapper = createWrapper({
        label: 'Talents',
        talents: [talent],
      });

      await wrapper.find('.details-btn').trigger('click');

      expect(wrapper.emitted('showDetails')).toBeTruthy();
      expect(wrapper.emitted('showDetails')?.[0]).toEqual([talentData]);
    });
  });
});
