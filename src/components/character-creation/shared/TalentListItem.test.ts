import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import TalentListItem from './TalentListItem.vue';
import type { Talent, TalentPrerequisite } from 'src/types';

// Mock the theme constants
vi.mock('src/constants/theme', () => ({
  COLORS: {
    muted: 'grey',
    error: 'negative',
  },
}));

describe('TalentListItem', () => {
  const createTalent = (overrides: Partial<Talent> = {}): Talent => ({
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
    ...overrides,
  });

  const createWrapper = (props: {
    talent: Talent;
    selected: boolean;
    available: boolean;
    unmetPrereqs: TalentPrerequisite[];
  }) =>
    shallowMount(TalentListItem, {
      props,
      global: {
        stubs: {
          QItem: {
            template: '<div class="q-item" :class="$attrs.class"><slot /></div>',
          },
          QItemSection: {
            template:
              '<div class="q-item-section" :class="{ avatar: $attrs.avatar }"><slot /></div>',
          },
          QItemLabel: {
            template:
              '<div class="q-item-label" :class="[$attrs.class, { caption: $attrs.caption }]"><slot /></div>',
          },
          QCheckbox: {
            template: `<input
              type="checkbox"
              class="q-checkbox"
              :checked="modelValue"
              :disabled="disable"
              @change="$emit('update:modelValue', !modelValue)"
            />`,
            props: ['modelValue', 'disable'],
            emits: ['update:modelValue'],
          },
          QIcon: { template: '<span class="q-icon" />' },
          QBtn: {
            template: '<button class="q-btn" @click="$emit(\'click\')"><slot /></button>',
            emits: ['click'],
          },
          QTooltip: { template: '<span class="q-tooltip"><slot /></span>' },
        },
      },
    });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders talent name', () => {
      const wrapper = createWrapper({
        talent: createTalent({ name: 'Power Strike' }),
        selected: false,
        available: true,
        unmetPrereqs: [],
      });

      expect(wrapper.text()).toContain('Power Strike');
    });

    it('renders short description', () => {
      const wrapper = createWrapper({
        talent: createTalent({ descriptionShort: 'Quick attack' }),
        selected: false,
        available: true,
        unmetPrereqs: [],
      });

      expect(wrapper.text()).toContain('Quick attack');
    });

    it('falls back to full description when short is not available', () => {
      const wrapper = createWrapper({
        talent: createTalent({
          description: 'Full attack description',
          descriptionShort: null,
        }),
        selected: false,
        available: true,
        unmetPrereqs: [],
      });

      expect(wrapper.text()).toContain('Full attack description');
    });
  });

  // ========================================
  // Selection State
  // ========================================
  describe('selection state', () => {
    it('checkbox is checked when selected', () => {
      const wrapper = createWrapper({
        talent: createTalent(),
        selected: true,
        available: true,
        unmetPrereqs: [],
      });

      const checkbox = wrapper.find('.q-checkbox');
      expect((checkbox.element as HTMLInputElement).checked).toBe(true);
    });

    it('checkbox is unchecked when not selected', () => {
      const wrapper = createWrapper({
        talent: createTalent(),
        selected: false,
        available: true,
        unmetPrereqs: [],
      });

      const checkbox = wrapper.find('.q-checkbox');
      expect((checkbox.element as HTMLInputElement).checked).toBe(false);
    });
  });

  // ========================================
  // Availability
  // ========================================
  describe('availability', () => {
    it('applies disabled class when not available', () => {
      const wrapper = createWrapper({
        talent: createTalent(),
        selected: false,
        available: false,
        unmetPrereqs: [],
      });

      expect(wrapper.find('.q-item').classes()).toContain('item-disabled');
    });

    it('does not apply disabled class when available', () => {
      const wrapper = createWrapper({
        talent: createTalent(),
        selected: false,
        available: true,
        unmetPrereqs: [],
      });

      expect(wrapper.find('.q-item').classes()).not.toContain('item-disabled');
    });

    it('checkbox is disabled when not available and not selected', () => {
      const wrapper = createWrapper({
        talent: createTalent(),
        selected: false,
        available: false,
        unmetPrereqs: [],
      });

      const checkbox = wrapper.find('.q-checkbox');
      expect((checkbox.element as HTMLInputElement).disabled).toBe(true);
    });

    it('checkbox is enabled when not available but already selected', () => {
      const wrapper = createWrapper({
        talent: createTalent(),
        selected: true,
        available: false,
        unmetPrereqs: [],
      });

      const checkbox = wrapper.find('.q-checkbox');
      expect((checkbox.element as HTMLInputElement).disabled).toBe(false);
    });

    it('shows lock icon when not available', () => {
      const wrapper = createWrapper({
        talent: createTalent(),
        selected: false,
        available: false,
        unmetPrereqs: [],
      });

      expect(wrapper.find('.q-icon').exists()).toBe(true);
    });
  });

  // ========================================
  // Prerequisites
  // ========================================
  describe('prerequisites', () => {
    it('shows unmet prerequisites when present', () => {
      const prereqs: TalentPrerequisite[] = [
        {
          type: 'skill',
          codes: [{ id: 1, code: 'athletics', name: 'Athletics' }],
          value: 3,
        },
      ];

      const wrapper = createWrapper({
        talent: createTalent(),
        selected: false,
        available: false,
        unmetPrereqs: prereqs,
      });

      expect(wrapper.text()).toContain('Requires:');
      expect(wrapper.text()).toContain('Athletics 3+');
    });

    it('formats multiple prerequisites with comma separator', () => {
      const prereqs: TalentPrerequisite[] = [
        {
          type: 'skill',
          codes: [{ id: 1, code: 'athletics', name: 'Athletics' }],
          value: 3,
        },
        {
          type: 'talent',
          codes: [{ id: 10, code: 'power-strike', name: 'Power Strike' }],
        },
      ];

      const wrapper = createWrapper({
        talent: createTalent(),
        selected: false,
        available: false,
        unmetPrereqs: prereqs,
      });

      expect(wrapper.text()).toContain('Athletics 3+, Power Strike');
    });

    it('does not show prerequisites section when array is empty', () => {
      const wrapper = createWrapper({
        talent: createTalent(),
        selected: false,
        available: true,
        unmetPrereqs: [],
      });

      expect(wrapper.text()).not.toContain('Requires:');
    });
  });

  // ========================================
  // Events
  // ========================================
  describe('events', () => {
    it('emits toggle when checkbox changes', async () => {
      const wrapper = createWrapper({
        talent: createTalent(),
        selected: false,
        available: true,
        unmetPrereqs: [],
      });

      await wrapper.find('.q-checkbox').trigger('change');

      expect(wrapper.emitted('toggle')).toBeTruthy();
      expect(wrapper.emitted('toggle')).toHaveLength(1);
    });

    it('has info button for showing details', () => {
      const wrapper = createWrapper({
        talent: createTalent({ id: 42, name: 'Special Talent' }),
        selected: false,
        available: true,
        unmetPrereqs: [],
      });

      // Info button exists - click event with .stop modifier tested via integration
      const btn = wrapper.find('.q-btn');
      expect(btn.exists()).toBe(true);
    });
  });
});
