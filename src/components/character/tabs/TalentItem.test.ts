import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import TalentItem from './TalentItem.vue';
import type { Talent } from 'src/types';

const mockLoggerWarn = vi.fn();

vi.mock('src/utils/logger', () => ({
  logger: {
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
  },
}));

describe('TalentItem', () => {
  const createWrapper = (talent: Partial<Talent>) =>
    shallowMount(TalentItem, {
      props: {
        talent: talent as Talent,
      },
      global: {
        stubs: {
          QItem: {
            template: '<div class="q-item"><slot /></div>',
          },
          QItemSection: {
            template: '<div class="q-item-section"><slot /></div>',
          },
          QItemLabel: {
            template: '<div class="q-item-label"><slot /></div>',
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders talent name', () => {
      const wrapper = createWrapper({
        id: 1,
        name: 'Swift Strike',
        description: 'A quick attack',
      });

      expect(wrapper.text()).toContain('Swift Strike');
    });

    it('renders talent description', () => {
      const wrapper = createWrapper({
        id: 1,
        name: 'Swift Strike',
        description: 'A quick attack that deals damage',
      });

      expect(wrapper.text()).toContain('A quick attack that deals damage');
    });

    it('renders short description when available', () => {
      const wrapper = createWrapper({
        id: 1,
        name: 'Swift Strike',
        descriptionShort: 'Quick attack',
        description: 'A quick attack that deals damage',
      });

      expect(wrapper.text()).toContain('Quick attack');
    });

    it('prefers short description over full description', () => {
      const wrapper = createWrapper({
        id: 1,
        name: 'Swift Strike',
        descriptionShort: 'Quick attack',
        description: 'A quick attack that deals massive damage to enemies',
      });

      expect(wrapper.text()).toContain('Quick attack');
      // Full description should not be shown when short is available
    });
  });

  // ========================================
  // Fallback Values
  // ========================================
  describe('fallback values', () => {
    it('shows "Unknown Talent" when name is missing', () => {
      const wrapper = createWrapper({
        id: 1,
        name: '',
        description: 'Some description',
      });

      expect(wrapper.text()).toContain('Unknown Talent');
    });

    it('shows "No description available" when both descriptions missing', () => {
      const wrapper = createWrapper({
        id: 1,
        name: 'Swift Strike',
        descriptionShort: '',
        description: '',
      });

      expect(wrapper.text()).toContain('No description available');
    });

    it('falls back to description when short description is empty', () => {
      const wrapper = createWrapper({
        id: 1,
        name: 'Swift Strike',
        descriptionShort: '',
        description: 'Full description here',
      });

      expect(wrapper.text()).toContain('Full description here');
    });
  });

  // ========================================
  // Logging
  // ========================================
  describe('logging', () => {
    it('logs warning when talent has no name', () => {
      createWrapper({
        id: 1,
        name: '',
        description: 'Description',
      });

      expect(mockLoggerWarn).toHaveBeenCalledWith('TalentItem received talent without name', {
        talentId: 1,
      });
    });

    it('logs warning when talent name is undefined', () => {
      createWrapper({
        id: 2,
        description: 'Description',
      } as Partial<Talent>);

      expect(mockLoggerWarn).toHaveBeenCalledWith('TalentItem received talent without name', {
        talentId: 2,
      });
    });

    it('does not log warning when talent has name', () => {
      createWrapper({
        id: 1,
        name: 'Swift Strike',
        description: 'Description',
      });

      expect(mockLoggerWarn).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles null-ish description values', () => {
      const wrapper = createWrapper({
        id: 1,
        name: 'Swift Strike',
        descriptionShort: undefined,
        description: undefined,
      } as unknown as Talent);

      expect(wrapper.text()).toContain('No description available');
    });

    it('renders with minimal talent data', () => {
      const wrapper = createWrapper({
        id: 1,
        name: 'Basic Talent',
      });

      expect(wrapper.text()).toContain('Basic Talent');
    });

    it('has talent-item class', () => {
      const wrapper = createWrapper({
        id: 1,
        name: 'Swift Strike',
        description: 'Description',
      });

      expect(wrapper.find('.q-item').exists()).toBe(true);
    });
  });
});
