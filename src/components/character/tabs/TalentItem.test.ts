import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import TalentItem from './TalentItem.vue';
import type { Talent } from 'src/types';

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    hero: { expertises: [], talents: [] },
  }),
}));

const mockLoggerWarn = vi.fn();

vi.mock('src/utils/logger', () => ({
  logger: {
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
  },
}));

describe('TalentItem', () => {
  const baseTalent: Talent = {
    id: 1,
    code: 'swift_strike',
    name: 'Swift Strike',
    description: 'A quick attack that deals damage',
    descriptionShort: 'Quick attack',
    path: null,
    specialties: [],
    ancestry: null,
    radiantOrder: null,
    surge: null,
    isKey: false,
    special: [],
  };

  const createWrapper = (talent: Partial<Talent> = {}) =>
    shallowMount(TalentItem, {
      props: { talent: { ...baseTalent, ...talent } as Talent },
      global: {
        stubs: {
          QExpansionItem: {
            template: `<div class="q-expansion-item">
              <div class="header"><slot name="header" /></div>
              <div class="content"><slot /></div>
            </div>`,
            props: ['dense', 'switchToggleSide'],
          },
          QItemSection: { template: '<div class="q-item-section"><slot /></div>' },
          QItemLabel: { template: '<div class="q-item-label"><slot /></div>' },
          QCard: { template: '<div class="q-card"><slot /></div>' },
          QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
          QBadge: {
            template: '<span class="q-badge"><slot /></span>',
            props: ['color', 'outline'],
          },
          PrerequisiteList: {
            template:
              '<div class="prerequisite-list" :data-prerequisites="JSON.stringify(prerequisites)" />',
            props: ['prerequisites'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // Collapsed State (Header)
  // ========================================
  describe('collapsed state (header)', () => {
    it('renders talent name', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.header').text()).toContain('Swift Strike');
    });

    it('renders short description', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.header').text()).toContain('Quick attack');
    });

    it('falls back to full description when short is missing', () => {
      const wrapper = createWrapper({ descriptionShort: null });
      expect(wrapper.find('.header').text()).toContain('A quick attack that deals damage');
    });

    it('shows key talent badge when isKey is true', () => {
      const wrapper = createWrapper({ isKey: true });
      expect(wrapper.find('.header').text()).toContain('Key');
    });

    it('does not show key badge when isKey is false', () => {
      const wrapper = createWrapper({ isKey: false });
      const badges = wrapper.findAll('.q-badge');
      const keyBadge = badges.filter((b) => b.text() === 'Key');
      expect(keyBadge.length).toBe(0);
    });
  });

  // ========================================
  // Expanded State (Content)
  // ========================================
  describe('expanded state (content)', () => {
    it('renders full description in expanded content', () => {
      const wrapper = createWrapper();
      const content = wrapper.find('.content');
      expect(content.text()).toContain('A quick attack that deals damage');
    });

    it('renders PrerequisiteList with correct prerequisites', () => {
      const prerequisites = [{ type: 'level', value: 3 }];
      const wrapper = createWrapper({ prerequisites });
      const prereqs = wrapper.find('.prerequisite-list');
      expect(prereqs.exists()).toBe(true);
      expect(JSON.parse(prereqs.attributes('data-prerequisites')!)).toEqual(prerequisites);
    });
  });

  // ========================================
  // Logging
  // ========================================
  describe('logging', () => {
    it('logs warning when talent has no name', () => {
      createWrapper({ name: '' });
      expect(mockLoggerWarn).toHaveBeenCalledWith('TalentItem received talent without name', {
        talentId: 1,
      });
    });

    it('logs warning when talent name is undefined', () => {
      createWrapper({ name: undefined } as unknown as Partial<Talent>);
      expect(mockLoggerWarn).toHaveBeenCalledWith('TalentItem received talent without name', {
        talentId: 1,
      });
    });

    it('does not log warning when talent has name', () => {
      createWrapper();
      expect(mockLoggerWarn).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('shows fallback for missing name', () => {
      const wrapper = createWrapper({ name: '' });
      expect(wrapper.text()).toContain('Unknown Talent');
    });

    it('shows fallback for missing descriptions', () => {
      const wrapper = createWrapper({ descriptionShort: '', description: '' });
      expect(wrapper.text()).toContain('No description available');
    });

    it('handles null prerequisites', () => {
      const wrapper = createWrapper({ prerequisites: null });
      expect(wrapper.exists()).toBe(true);
    });

    it('handles null-ish description values', () => {
      const wrapper = createWrapper({
        descriptionShort: undefined,
        description: undefined,
      } as unknown as Talent);
      expect(wrapper.text()).toContain('No description available');
    });
  });
});
