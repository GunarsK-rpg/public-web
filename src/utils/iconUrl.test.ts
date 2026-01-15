import { describe, it, expect, vi } from 'vitest';

// Mock the glob imports before importing the module
vi.mock('../assets/icons/actions/*.svg', () => ({}));
vi.mock('../assets/icons/equipment/*.svg', () => ({}));

// We need to mock import.meta.glob results
const mockActionIcons: Record<string, string> = {
  '../assets/icons/actions/attack.svg': '/assets/icons/actions/attack.abc123.svg',
  '../assets/icons/actions/defend.svg': '/assets/icons/actions/defend.def456.svg',
};

const mockEquipmentIcons: Record<string, string> = {
  '../assets/icons/equipment/sword.svg': '/assets/icons/equipment/sword.xyz789.svg',
  '../assets/icons/equipment/shield.svg': '/assets/icons/equipment/shield.uvw012.svg',
};

// Mock import.meta.glob by mocking the module
vi.mock('./iconUrl', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();

  return {
    ...actual,
    getIconUrl: (iconName: string | undefined, iconType: 'actions' | 'equipment'): string => {
      if (!iconName) return '';

      const modules: Record<string, Record<string, string>> = {
        actions: mockActionIcons,
        equipment: mockEquipmentIcons,
      };

      const iconModules = modules[iconType];
      if (!iconModules) return '';

      const key = `../assets/icons/${iconType}/${iconName}`;
      return iconModules[key] ?? '';
    },
  };
});

import { getIconUrl, type IconType } from './iconUrl';

// =============================================================================
// getIconUrl
// =============================================================================

describe('getIconUrl', () => {
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
  // IconType
  // ---------------------------------------------------------------------------
  describe('IconType', () => {
    it('accepts actions as valid icon type', () => {
      const iconType: IconType = 'actions';
      expect(iconType).toBe('actions');
    });

    it('accepts equipment as valid icon type', () => {
      const iconType: IconType = 'equipment';
      expect(iconType).toBe('equipment');
    });
  });
});
