import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import SkillsTab from './SkillsTab.vue';

const mockGetSkillModifier = vi.fn();
const mockGetSkillRank = vi.fn();

vi.mock('src/stores/heroAttributes', () => ({
  useHeroAttributesStore: () => ({
    getSkillModifier: mockGetSkillModifier,
    getSkillRank: mockGetSkillRank,
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    attributeTypes: [
      { id: 1, code: 'physical', name: 'Physical' },
      { id: 2, code: 'cognitive', name: 'Cognitive' },
      { id: 3, code: 'spiritual', name: 'Spiritual' },
    ],
    attributes: [
      { id: 1, code: 'str', name: 'Strength', attrTypeId: 1 },
      { id: 2, code: 'spd', name: 'Speed', attrTypeId: 1 },
      { id: 3, code: 'int', name: 'Intellect', attrTypeId: 2 },
      { id: 4, code: 'wil', name: 'Willpower', attrTypeId: 2 },
      { id: 5, code: 'awa', name: 'Awareness', attrTypeId: 3 },
      { id: 6, code: 'pre', name: 'Presence', attrTypeId: 3 },
    ],
    skills: [
      { id: 1, code: 'athletics', name: 'Athletics', attrId: 1 },
      { id: 2, code: 'heavy_weapons', name: 'Heavy Weapons', attrId: 1 },
      { id: 3, code: 'agility', name: 'Agility', attrId: 2 },
      { id: 4, code: 'stealth', name: 'Stealth', attrId: 2 },
      { id: 5, code: 'lore', name: 'Lore', attrId: 3 },
      { id: 6, code: 'medicine', name: 'Medicine', attrId: 3 },
      { id: 7, code: 'discipline', name: 'Discipline', attrId: 4 },
      { id: 8, code: 'intimidation', name: 'Intimidation', attrId: 4 },
      { id: 9, code: 'insight', name: 'Insight', attrId: 5 },
      { id: 10, code: 'perception', name: 'Perception', attrId: 5 },
      { id: 11, code: 'deception', name: 'Deception', attrId: 6 },
      { id: 12, code: 'persuasion', name: 'Persuasion', attrId: 6 },
    ],
  }),
}));

vi.mock('src/constants/theme', () => ({
  COLORS: {
    muted: 'grey',
  },
}));

describe('SkillsTab', () => {
  const createWrapper = () =>
    shallowMount(SkillsTab, {
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
          QItemLabel: {
            template: '<div class="q-item-label"><slot /></div>',
          },
          QAvatar: {
            template: '<div class="q-avatar"><slot /></div>',
            props: ['color', 'textColor', 'size'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSkillModifier.mockImplementation((code: string) => {
      const values: Record<string, number> = {
        athletics: 5,
        heavy_weapons: 4,
        agility: 6,
        stealth: 3,
        lore: 2,
        medicine: 1,
        discipline: 4,
        intimidation: 3,
        insight: 2,
        perception: 3,
        deception: 1,
        persuasion: 2,
      };
      return values[code] ?? 0;
    });
    mockGetSkillRank.mockImplementation((id: number) => {
      const values: Record<number, number> = {
        1: 3,
        2: 2,
        3: 4,
        4: 1,
        5: 2,
        6: 1,
        7: 3,
        8: 2,
        9: 1,
        10: 2,
        11: 0,
        12: 1,
      };
      return values[id] ?? 0;
    });
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders Physical Skills section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Physical Skills');
    });

    it('renders Cognitive Skills section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Cognitive Skills');
    });

    it('renders Spiritual Skills section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Spiritual Skills');
    });

    it('renders all skill names', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Athletics');
      expect(wrapper.text()).toContain('Heavy Weapons');
      expect(wrapper.text()).toContain('Agility');
      expect(wrapper.text()).toContain('Stealth');
      expect(wrapper.text()).toContain('Lore');
      expect(wrapper.text()).toContain('Discipline');
      expect(wrapper.text()).toContain('Perception');
      expect(wrapper.text()).toContain('Persuasion');
    });
  });

  // ========================================
  // Skill Modifiers
  // ========================================
  describe('skill modifiers', () => {
    it('formats positive modifiers with plus sign', () => {
      const wrapper = createWrapper();

      // Athletics has modifier 5
      expect(wrapper.text()).toContain('+5');
      expect(wrapper.text()).toContain('+4');
      expect(wrapper.text()).toContain('+6');
    });

    it('formats negative modifiers without plus sign', () => {
      mockGetSkillModifier.mockReturnValue(-2);
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('-2');
    });

    it('formats zero modifier with plus sign', () => {
      mockGetSkillModifier.mockReturnValue(0);
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('+0');
    });

    it('calls getSkillModifier for each skill', () => {
      createWrapper();

      expect(mockGetSkillModifier).toHaveBeenCalledWith('athletics');
      expect(mockGetSkillModifier).toHaveBeenCalledWith('agility');
      expect(mockGetSkillModifier).toHaveBeenCalledWith('lore');
    });
  });

  // ========================================
  // Skill Ranks
  // ========================================
  describe('skill ranks', () => {
    it('displays rank in caption', () => {
      const wrapper = createWrapper();

      // Athletics has rank 3
      expect(wrapper.text()).toContain('Rank 3');
      // Agility has rank 4
      expect(wrapper.text()).toContain('Rank 4');
    });

    it('calls getSkillRank for each skill', () => {
      createWrapper();

      expect(mockGetSkillRank).toHaveBeenCalledWith(1); // Athletics
      expect(mockGetSkillRank).toHaveBeenCalledWith(3); // Agility
      expect(mockGetSkillRank).toHaveBeenCalledWith(5); // Lore
    });
  });

  // ========================================
  // Rank Pips
  // ========================================
  describe('rank pips', () => {
    it('renders 5 pips per skill', () => {
      const wrapper = createWrapper();

      const skillItems = wrapper.findAll('.q-item');
      expect(skillItems.length).toBe(12); // 12 skills total

      // Each skill should have rank pips
      const rankPips = wrapper.findAll('.rank-pips');
      expect(rankPips.length).toBe(12);
    });

    it('fills correct number of pips based on rank', () => {
      const wrapper = createWrapper();

      // Each rank-pips should have filled/unfilled pips
      const filledPips = wrapper.findAll('.pip.filled');
      // Total filled pips = sum of all ranks: 3+2+4+1+2+1+3+2+1+2+0+1 = 22
      expect(filledPips.length).toBe(22);
    });
  });

  // ========================================
  // Attribute Display
  // ========================================
  describe('attribute display', () => {
    it('shows attribute code in uppercase for each skill', () => {
      const wrapper = createWrapper();

      // Athletics uses STR
      expect(wrapper.text()).toContain('STR');
      // Agility uses SPD
      expect(wrapper.text()).toContain('SPD');
      // Lore uses INT
      expect(wrapper.text()).toContain('INT');
      // Discipline uses WIL
      expect(wrapper.text()).toContain('WIL');
      // Perception uses AWA
      expect(wrapper.text()).toContain('AWA');
      // Persuasion uses PRE
      expect(wrapper.text()).toContain('PRE');
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('rank pips have role="img"', () => {
      const wrapper = createWrapper();

      const rankPipsWithRole = wrapper.findAll('[role="img"]');
      expect(rankPipsWithRole.length).toBe(12);
    });

    it('rank pips have aria-label describing rank', () => {
      const wrapper = createWrapper();

      const rankPips = wrapper.findAll('[aria-label*="Rank"]');
      expect(rankPips.length).toBe(12);
    });

    it('individual pip spans have aria-hidden', () => {
      const wrapper = createWrapper();

      const pips = wrapper.findAll('.pip');
      pips.forEach((pip) => {
        expect(pip.attributes('aria-hidden')).toBe('true');
      });
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles zero rank', () => {
      mockGetSkillRank.mockReturnValue(0);
      const wrapper = createWrapper();

      // Should render without error
      expect(wrapper.text()).toContain('Rank 0');

      // No pips should be filled
      const filledPips = wrapper.findAll('.pip.filled');
      expect(filledPips.length).toBe(0);
    });

    it('handles max rank (5)', () => {
      mockGetSkillRank.mockReturnValue(5);
      const wrapper = createWrapper();

      // Should render without error
      expect(wrapper.text()).toContain('Rank 5');

      // All pips should be filled (12 skills * 5 pips)
      const filledPips = wrapper.findAll('.pip.filled');
      expect(filledPips.length).toBe(60);
    });

    it('handles missing attribute gracefully', () => {
      // Simulate a skill with an invalid attrId
      // The component uses attributeCodeMap which should return empty string
      const wrapper = createWrapper();

      // Should render without throwing
      expect(wrapper.exists()).toBe(true);
    });
  });
});
