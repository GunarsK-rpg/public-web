import { describe, it, expect } from 'vitest';
import { filterSpecial, extractCodes } from './talentGrants';
import type { SpecialEntry } from 'src/types';

describe('talentGrants', () => {
  describe('extractCodes', () => {
    it('extracts codes from matching type entries', () => {
      const special: SpecialEntry[] = [
        { type: 'expertise_grant', codes: ['legal_codes'] },
        { type: 'defense_physical', value: 1 },
      ];
      expect(extractCodes(special, 'expertise_grant')).toEqual(['legal_codes']);
    });

    it('flattens multiple matching entries', () => {
      const special: SpecialEntry[] = [
        { type: 'expertise_grant', codes: ['knives', 'slings'] },
        { type: 'expertise_grant', codes: ['military_life'] },
      ];
      expect(extractCodes(special, 'expertise_grant')).toEqual([
        'knives',
        'slings',
        'military_life',
      ]);
    });

    it('returns empty array when no matches', () => {
      expect(extractCodes([], 'expertise_grant')).toEqual([]);
      expect(extractCodes([{ type: 'defense_physical', value: 1 }], 'expertise_grant')).toEqual([]);
    });

    it('extracts item_grant codes', () => {
      const special: SpecialEntry[] = [{ type: 'item_grant', codes: ['gemstone_fabrial'] }];
      expect(extractCodes(special, 'item_grant')).toEqual(['gemstone_fabrial']);
    });
  });

  describe('filterSpecial', () => {
    it('filters by single type', () => {
      const special: SpecialEntry[] = [
        { type: 'expertise_choice', codes: ['armor_crafting', 'equipment_crafting'] },
        { type: 'defense_physical', value: 1 },
      ];
      const result = filterSpecial(special, 'expertise_choice');
      expect(result).toHaveLength(1);
      expect(result[0]!.type).toBe('expertise_choice');
    });

    it('filters by multiple types', () => {
      const special: SpecialEntry[] = [
        { type: 'expertise_choice', codes: ['x'] },
        { type: 'item_choice', codes: ['y'] },
        { type: 'skill_modifier_choice', codes: ['int'], value: 1 },
      ];
      const result = filterSpecial(special, 'expertise_choice', 'item_choice');
      expect(result).toHaveLength(2);
    });

    it('excludes entries without codes', () => {
      const special: SpecialEntry[] = [{ type: 'expertise_choice' }];
      expect(filterSpecial(special, 'expertise_choice')).toHaveLength(0);
    });

    it('can check for skill_modifier_choice', () => {
      const special: SpecialEntry[] = [
        { type: 'skill_modifier_choice', codes: ['int', 'wil'], value: 2 },
      ];
      const result = filterSpecial(special, 'skill_modifier_choice');
      expect(result).toHaveLength(1);
      expect(result[0]!.codes).toEqual(['int', 'wil']);
      expect(result[0]!.value).toBe(2);
    });
  });
});
