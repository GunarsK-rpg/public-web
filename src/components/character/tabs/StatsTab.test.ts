import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { Info } from 'lucide-vue-next';
import StatsTab from './StatsTab.vue';

const mockGetDefenseValue = vi.fn();
const mockAttributeValues: Record<string, number> = {
  str: 3,
  spd: 4,
  int: 2,
  wil: 3,
  awa: 2,
  pre: 1,
};

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    conditions: [],
  }),
}));

vi.mock('src/stores/heroAttributes', () => ({
  useHeroAttributesStore: () => ({
    attributeValues: mockAttributeValues,
    baseAttributeValues: mockAttributeValues,
    getDefenseValue: mockGetDefenseValue,
    levelData: { level: 5, tier: 2 },
    tierData: { tier: 2, name: 'Journeyman' },
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    attributes: [
      { id: 1, code: 'str', name: 'Strength' },
      { id: 2, code: 'spd', name: 'Speed' },
      { id: 3, code: 'int', name: 'Intellect' },
      { id: 4, code: 'wil', name: 'Willpower' },
      { id: 5, code: 'awa', name: 'Awareness' },
      { id: 6, code: 'pre', name: 'Presence' },
    ],
    attributeTypes: [
      { id: 1, code: 'physical', name: 'Physical' },
      { id: 2, code: 'cognitive', name: 'Cognitive' },
      { id: 3, code: 'spiritual', name: 'Spiritual' },
    ],
    derivedStats: [
      { id: 1, code: 'max_health', name: 'Max Health', formula: 'base' },
      { id: 2, code: 'movement', name: 'Movement', formula: 'spd' },
      {
        id: 3,
        code: 'deflect',
        name: 'Deflect',
        description:
          'Reduces impact, keen, and energy damage by this amount. Does not reduce spirit or vital damage.',
      },
    ],
    derivedStatValues: [
      { derivedStatId: 1, tier: 2, baseValue: 30 },
      { derivedStatId: 2, tier: 2, baseValue: 5 },
    ],
  }),
}));

vi.mock('src/utils/derivedStats', () => ({
  buildDerivedStatsList: vi.fn(() => [
    {
      id: 1,
      code: 'max_health',
      name: 'Max Health',
      totalDisplay: '35',
      totalValue: 35,
      hasModifier: true,
      modifier: 5,
      bonus: 0,
      baseDisplay: '30',
      displayValue: null,
    },
    {
      id: 2,
      code: 'movement',
      name: 'Movement',
      totalDisplay: '6',
      totalValue: 6,
      hasModifier: true,
      modifier: 1,
      bonus: 0,
      baseDisplay: '5',
      displayValue: null,
    },
    {
      id: 3,
      code: 'deflect',
      name: 'Deflect',
      totalDisplay: '10',
      totalValue: 10,
      hasModifier: false,
      modifier: 0,
      bonus: 0,
      baseDisplay: '10',
      displayValue: null,
    },
  ]),
}));

describe('StatsTab', () => {
  const createWrapper = () =>
    shallowMount(StatsTab, {
      global: {
        stubs: {
          QCard: {
            template:
              '<div class="q-card" :tabindex="$attrs.tabindex" :role="$attrs.role" :aria-haspopup="$attrs[\'aria-haspopup\']"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          InfoPopup: {
            template: '<div class="info-popup-stub"><slot /></div>',
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDefenseValue.mockImplementation((code: string) => {
      const values: Record<string, number> = {
        physical: 12,
        cognitive: 14,
        spiritual: 11,
      };
      return values[code] ?? 0;
    });
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders Attributes section title', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Attributes');
    });

    it('renders Defenses section title', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Defenses');
    });

    it('renders Other Stats section title', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Other Stats');
    });

    it('has aria-live region for accessibility', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true);
    });
  });

  // ========================================
  // Attributes Display
  // ========================================
  describe('attributes display', () => {
    it('renders all attribute cards', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Strength');
      expect(wrapper.text()).toContain('Speed');
      expect(wrapper.text()).toContain('Intellect');
      expect(wrapper.text()).toContain('Willpower');
      expect(wrapper.text()).toContain('Awareness');
      expect(wrapper.text()).toContain('Presence');
    });

    it('renders attribute abbreviations in uppercase', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('STR');
      expect(wrapper.text()).toContain('SPD');
      expect(wrapper.text()).toContain('INT');
      expect(wrapper.text()).toContain('WIL');
      expect(wrapper.text()).toContain('AWA');
      expect(wrapper.text()).toContain('PRE');
    });

    it('renders attribute values', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('3'); // str
      expect(wrapper.text()).toContain('4'); // spd
      expect(wrapper.text()).toContain('2'); // int, awa
      expect(wrapper.text()).toContain('1'); // pre
    });
  });

  // ========================================
  // Defenses Display
  // ========================================
  describe('defenses display', () => {
    it('renders all defense types', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Physical');
      expect(wrapper.text()).toContain('Cognitive');
      expect(wrapper.text()).toContain('Spiritual');
    });

    it('renders defense values', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('12'); // physical
      expect(wrapper.text()).toContain('14'); // cognitive
      expect(wrapper.text()).toContain('11'); // spiritual
    });

    it('calls getDefenseValue for each defense type', () => {
      createWrapper();

      expect(mockGetDefenseValue).toHaveBeenCalledWith('physical');
      expect(mockGetDefenseValue).toHaveBeenCalledWith('cognitive');
      expect(mockGetDefenseValue).toHaveBeenCalledWith('spiritual');
    });

    it('renders deflect value in defenses section', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Deflect');
      expect(wrapper.text()).toContain('10');
    });

    it('renders deflect description popup', () => {
      const wrapper = createWrapper();

      const popup = wrapper.find('.info-popup-stub');
      expect(popup.exists()).toBe(true);
      expect(popup.text()).toContain('Reduces impact, keen, and energy damage');
    });

    it('renders help icon on deflect card', () => {
      const wrapper = createWrapper();

      expect(wrapper.findComponent(Info).exists()).toBe(true);
    });

    it('has keyboard accessibility on deflect card', () => {
      const wrapper = createWrapper();

      const deflectCard = wrapper.findAll('.q-card').find((c) => c.text().includes('Deflect'));
      expect(deflectCard).toBeDefined();
      expect(deflectCard!.attributes('tabindex')).toBe('0');
      expect(deflectCard!.attributes('role')).toBe('button');
      expect(deflectCard!.attributes('aria-haspopup')).toBe('dialog');
    });

    it('has keyboard event handlers on deflect card', () => {
      const wrapper = createWrapper();

      const deflectCard = wrapper.findAll('.q-card').find((c) => c.text().includes('Deflect'));
      expect(deflectCard).toBeDefined();
      // Keyboard handlers simulate click to trigger popup auto-open
      expect(deflectCard!.attributes('tabindex')).toBe('0');
    });
  });

  // ========================================
  // Derived Stats Display
  // ========================================
  describe('derived stats display', () => {
    it('renders derived stat names excluding deflect', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Max Health');
      expect(wrapper.text()).toContain('Movement');
      // Deflect should not appear in Other Stats section (it's in Defenses)
      const rows = wrapper.findAll('.row');
      const otherStatsRow = rows[rows.length - 1]!;
      expect(otherStatsRow.text()).not.toContain('Deflect');
    });

    it('renders total display values', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('35');
      expect(wrapper.text()).toContain('6');
      expect(wrapper.text()).toContain('10');
    });

    it('shows modifier breakdown for stats with modifiers', () => {
      const wrapper = createWrapper();

      // Max Health: 35 (30 +5)
      expect(wrapper.text()).toContain('(30 +5)');
      // Movement: 6 (5 +1)
      expect(wrapper.text()).toContain('(5 +1)');
    });

    it('shows equipment bonus in breakdown', async () => {
      const { buildDerivedStatsList } = await import('src/utils/derivedStats');
      vi.mocked(buildDerivedStatsList).mockReturnValueOnce([
        {
          id: 1,
          code: 'movement',
          name: 'Movement',
          baseValue: 25,
          baseDisplay: '25 ft',
          modifier: 1,
          bonus: -3,
          totalValue: 23,
          totalDisplay: '23 ft',
          hasModifier: true,
          displayValue: null,
        },
      ]);
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('23 ft');
      expect(wrapper.text()).toContain('(25 ft +1 -3)');
    });

    it('does not show modifier breakdown when modifier is 0', () => {
      const wrapper = createWrapper();

      // Deflect is in defenses section, not derived stats -- verify no breakdown
      const text = wrapper.text();
      expect(text).not.toMatch(/\(10\s*[+-]\s*0\)/);
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('has aria-label on attribute values', () => {
      const wrapper = createWrapper();

      const attrValues = wrapper.findAll('[aria-label*="Strength"]');
      expect(attrValues.length).toBeGreaterThan(0);
      // Verify the aria-label contains the attribute value
      expect(attrValues[0]!.attributes('aria-label')).toMatch(/3/);
    });

    it('has aria-label on defense values', () => {
      const wrapper = createWrapper();

      const defenseValues = wrapper.findAll('[aria-label*="Physical defense"]');
      expect(defenseValues.length).toBeGreaterThan(0);
      // Verify the aria-label contains the defense value
      expect(defenseValues[0]!.attributes('aria-label')).toMatch(/12/);
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles zero attribute values', () => {
      const original = { ...mockAttributeValues };
      try {
        Object.keys(mockAttributeValues).forEach((k) => (mockAttributeValues[k] = 0));
        const wrapper = createWrapper();

        // Should render without error
        expect(wrapper.text()).toContain('0');
      } finally {
        Object.assign(mockAttributeValues, original);
      }
    });

    it('handles zero defense values', () => {
      mockGetDefenseValue.mockReturnValue(0);
      const wrapper = createWrapper();

      // Should render without error
      expect(wrapper.text()).toContain('0');
    });

    it('handles negative modifiers', async () => {
      // Override the buildDerivedStatsList mock for this test
      const { buildDerivedStatsList } = await import('src/utils/derivedStats');
      vi.mocked(buildDerivedStatsList).mockReturnValueOnce([
        {
          id: 1,
          code: 'debuffed',
          name: 'Debuffed Stat',
          baseValue: 30,
          baseDisplay: '30',
          modifier: -5,
          bonus: 0,
          totalValue: 25,
          totalDisplay: '25',
          hasModifier: true,
          displayValue: null,
        },
      ]);
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Debuffed Stat');
      expect(wrapper.text()).toContain('25');
      expect(wrapper.text()).toContain('(30 -5)');
    });
  });
});
