import { describe, it, expect } from 'vitest';
import { createGetIconUrl, type IconType } from './iconUrl';

// =============================================================================
// createGetIconUrl - Factory for Icon URL Resolution
// =============================================================================

// Mock icon modules for testing
const mockModules: Record<IconType, Record<string, string>> = {
  actions: {
    '../assets/icons/actions/attack.svg': '/assets/icons/actions/attack.abc123.svg',
    '../assets/icons/actions/defend.svg': '/assets/icons/actions/defend.def456.svg',
  },
  equipment: {
    '../assets/icons/equipment/sword.svg': '/assets/icons/equipment/sword.xyz789.svg',
    '../assets/icons/equipment/shield.svg': '/assets/icons/equipment/shield.uvw012.svg',
  },
};

// Create testable getIconUrl using factory with mock data
const getIconUrl = createGetIconUrl(mockModules);

describe('createGetIconUrl', () => {
  // ---------------------------------------------------------------------------
  // Valid Inputs
  // ---------------------------------------------------------------------------
  describe('valid inputs', () => {
    it('returns URL for existing action icon', () => {
      const url = getIconUrl('attack.svg', 'actions');
      expect(url).toBe('/assets/icons/actions/attack.abc123.svg');
    });

    it('returns URL for existing equipment icon', () => {
      const url = getIconUrl('sword.svg', 'equipment');
      expect(url).toBe('/assets/icons/equipment/sword.xyz789.svg');
    });

    it('returns different URLs for different icons of same type', () => {
      const url1 = getIconUrl('attack.svg', 'actions');
      const url2 = getIconUrl('defend.svg', 'actions');
      expect(url1).not.toBe(url2);
      expect(url1).toBe('/assets/icons/actions/attack.abc123.svg');
      expect(url2).toBe('/assets/icons/actions/defend.def456.svg');
    });
  });

  // ---------------------------------------------------------------------------
  // Empty/Undefined Handling
  // ---------------------------------------------------------------------------
  describe('empty/undefined handling', () => {
    it('returns empty string for undefined iconName', () => {
      const url = getIconUrl(undefined, 'actions');
      expect(url).toBe('');
    });

    it('returns empty string for empty iconName', () => {
      const url = getIconUrl('', 'actions');
      expect(url).toBe('');
    });
  });

  // ---------------------------------------------------------------------------
  // Not Found Cases
  // ---------------------------------------------------------------------------
  describe('not found cases', () => {
    it('returns empty string for non-existent icon', () => {
      const url = getIconUrl('nonexistent.svg', 'actions');
      expect(url).toBe('');
    });

    it('returns empty string when icon exists in different type', () => {
      // sword.svg exists in equipment, not actions
      const url = getIconUrl('sword.svg', 'actions');
      expect(url).toBe('');
    });
  });

  // ---------------------------------------------------------------------------
  // Factory Isolation
  // ---------------------------------------------------------------------------
  describe('factory isolation', () => {
    it('creates independent instances with different modules', () => {
      const customModules: Record<IconType, Record<string, string>> = {
        actions: {
          '../assets/icons/actions/custom.svg': '/custom/path.svg',
        },
        equipment: {},
      };
      const customGetIconUrl = createGetIconUrl(customModules);

      // Custom instance has custom icon
      expect(customGetIconUrl('custom.svg', 'actions')).toBe('/custom/path.svg');

      // Original instance doesn't have custom icon
      expect(getIconUrl('custom.svg', 'actions')).toBe('');
    });
  });
});
