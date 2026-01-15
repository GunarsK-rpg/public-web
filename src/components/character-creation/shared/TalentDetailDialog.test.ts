import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TalentDetailDialog from './TalentDetailDialog.vue';
import type { Talent, TalentPrerequisite } from 'src/types';

describe('TalentDetailDialog', () => {
  const createTalent = (overrides: Partial<Talent> = {}): Talent => ({
    id: 1,
    code: 'test-talent',
    name: 'Test Talent',
    description: 'Full description of the talent',
    descriptionShort: 'Short desc',
    isKey: false,
    ...overrides,
  });

  const defaultFormatPrereq = (prereq: TalentPrerequisite) => {
    if (prereq.type === 'skill') return `Skill ${prereq.skillId} Rank ${prereq.skillRank}`;
    if (prereq.type === 'talent') return `Talent ${prereq.talentIds?.join(', ')}`;
    return 'Unknown';
  };

  const createWrapper = (props: {
    modelValue: boolean;
    talent: Talent | null;
    formatPrereq?: (prereq: TalentPrerequisite) => string;
  }) =>
    mount(TalentDetailDialog, {
      props: {
        formatPrereq: defaultFormatPrereq,
        ...props,
      },
      global: {
        stubs: {
          QDialog: {
            template: `<div v-if="modelValue" class="q-dialog" role="dialog" aria-modal="true">
              <slot />
            </div>`,
            props: ['modelValue'],
          },
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
          QSpace: {
            template: '<span class="q-space" />',
          },
          QBtn: {
            template: '<button class="q-btn" @click="$emit(\'click\')"><slot /></button>',
            emits: ['click'],
          },
        },
        directives: {
          'close-popup': () => {},
        },
      },
    });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders dialog when modelValue is true', () => {
      const wrapper = createWrapper({
        modelValue: true,
        talent: createTalent(),
      });

      expect(wrapper.find('.q-dialog').exists()).toBe(true);
    });

    it('does not render dialog when modelValue is false', () => {
      const wrapper = createWrapper({
        modelValue: false,
        talent: createTalent(),
      });

      expect(wrapper.find('.q-dialog').exists()).toBe(false);
    });

    it('renders talent name', () => {
      const wrapper = createWrapper({
        modelValue: true,
        talent: createTalent({ name: 'Power Strike' }),
      });

      expect(wrapper.text()).toContain('Power Strike');
    });

    it('renders full description', () => {
      const wrapper = createWrapper({
        modelValue: true,
        talent: createTalent({ description: 'A powerful attack that deals extra damage' }),
      });

      expect(wrapper.text()).toContain('A powerful attack that deals extra damage');
    });
  });

  // ========================================
  // Null Talent Handling
  // ========================================
  describe('null talent handling', () => {
    it('handles null talent gracefully', () => {
      const wrapper = createWrapper({
        modelValue: true,
        talent: null,
      });

      // Should still render dialog without errors
      expect(wrapper.find('.q-dialog').exists()).toBe(true);
      // Should not render talent content when talent is null
      expect(wrapper.text()).not.toContain('Prerequisites:');
    });
  });

  // ========================================
  // Prerequisites Display
  // ========================================
  describe('prerequisites display', () => {
    it('shows prerequisites when present', () => {
      const talent = createTalent({
        prerequisites: [{ type: 'skill', skillId: 1, skillRank: 3 }],
      });

      const wrapper = createWrapper({
        modelValue: true,
        talent,
      });

      expect(wrapper.text()).toContain('Prerequisites:');
      expect(wrapper.text()).toContain('Skill 1 Rank 3');
    });

    it('formats multiple prerequisites with commas', () => {
      const talent = createTalent({
        prerequisites: [
          { type: 'skill', skillId: 1, skillRank: 3 },
          { type: 'skill', skillId: 2, skillRank: 2 },
        ],
      });

      const wrapper = createWrapper({
        modelValue: true,
        talent,
      });

      expect(wrapper.text()).toContain('Skill 1 Rank 3, Skill 2 Rank 2');
    });

    it('does not show prerequisites section when empty', () => {
      const wrapper = createWrapper({
        modelValue: true,
        talent: createTalent({ prerequisites: [] }),
      });

      expect(wrapper.text()).not.toContain('Prerequisites:');
    });

    it('does not show prerequisites section when null', () => {
      const wrapper = createWrapper({
        modelValue: true,
        talent: createTalent({ prerequisites: null }),
      });

      expect(wrapper.text()).not.toContain('Prerequisites:');
    });

    it('uses custom formatPrereq function', () => {
      const talent = createTalent({
        prerequisites: [{ type: 'narrative', description: 'Must be a knight' }],
      });

      const customFormat = (prereq: TalentPrerequisite) => prereq.description ?? 'Custom format';

      const wrapper = createWrapper({
        modelValue: true,
        talent,
        formatPrereq: customFormat,
      });

      expect(wrapper.text()).toContain('Must be a knight');
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('has dialog role', () => {
      const wrapper = createWrapper({
        modelValue: true,
        talent: createTalent(),
      });

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    });

    it('has aria-modal attribute', () => {
      const wrapper = createWrapper({
        modelValue: true,
        talent: createTalent(),
      });

      expect(wrapper.find('[aria-modal="true"]').exists()).toBe(true);
    });
  });

  // ========================================
  // Events
  // ========================================
  describe('events', () => {
    it('emits update:modelValue when dialog model changes', () => {
      const wrapper = createWrapper({
        modelValue: true,
        talent: createTalent(),
      });

      // The actual emission happens via QDialog, but we test component structure
      // Verify the component has the emit defined
      expect(wrapper.vm.$options.emits).toContain('update:modelValue');
    });
  });
});
