import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import KeyTalentBanner from './KeyTalentBanner.vue';
import type { Talent } from 'src/types';

describe('KeyTalentBanner', () => {
  const createTalent = (overrides: Partial<Talent> = {}): Talent => ({
    id: 1,
    code: 'test-talent',
    name: 'Test Talent',
    description: 'Full description of the talent',
    descriptionShort: 'Short description',
    isKey: true,
    ...overrides,
  });

  const createWrapper = (props: { talent: Talent | null | undefined; label?: string }) =>
    mount(KeyTalentBanner, {
      props,
      global: {
        stubs: {
          QBanner: { template: '<div class="q-banner"><slot name="avatar" /><slot /></div>' },
          QIcon: { template: '<span class="q-icon" />' },
        },
      },
    });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders talent name', () => {
      const talent = createTalent({ name: 'Power Strike' });
      const wrapper = createWrapper({ talent });

      expect(wrapper.text()).toContain('Power Strike');
    });

    it('renders default label "Key Talent"', () => {
      const talent = createTalent();
      const wrapper = createWrapper({ talent });

      expect(wrapper.text()).toContain('Key Talent:');
    });

    it('renders custom label when provided', () => {
      const talent = createTalent();
      const wrapper = createWrapper({ talent, label: 'Ancestry Talent' });

      expect(wrapper.text()).toContain('Ancestry Talent:');
      expect(wrapper.text()).not.toContain('Key Talent:');
    });
  });

  // ========================================
  // Description Display
  // ========================================
  describe('description display', () => {
    it('shows short description when available', () => {
      const talent = createTalent({
        description: 'Full description',
        descriptionShort: 'Short version',
      });
      const wrapper = createWrapper({ talent });

      expect(wrapper.text()).toContain('Short version');
    });

    it('falls back to full description when short is not available', () => {
      const talent = createTalent({
        description: 'Full description only',
        descriptionShort: null,
      });
      const wrapper = createWrapper({ talent });

      expect(wrapper.text()).toContain('Full description only');
    });

    it('handles empty descriptionShort by using description', () => {
      const talent = createTalent({
        description: 'Full description',
        descriptionShort: '',
      });
      const wrapper = createWrapper({ talent });

      // Empty string is falsy, so falls back to description
      expect(wrapper.text()).toContain('Full description');
    });
  });

  // ========================================
  // Null/Undefined Talent
  // ========================================
  describe('null/undefined talent', () => {
    it('handles null talent gracefully', () => {
      const wrapper = createWrapper({ talent: null });

      // Should render without crashing
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toContain('Key Talent:');
    });

    it('handles undefined talent gracefully', () => {
      const wrapper = createWrapper({ talent: undefined });

      expect(wrapper.exists()).toBe(true);
      // Should show label but no talent name
      expect(wrapper.text()).toContain('Key Talent:');
    });
  });

  // ========================================
  // Icon
  // ========================================
  describe('icon', () => {
    it('renders star icon', () => {
      const talent = createTalent();
      const wrapper = createWrapper({ talent });

      expect(wrapper.find('.q-icon').exists()).toBe(true);
    });
  });
});
