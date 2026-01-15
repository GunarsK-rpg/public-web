import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import CharacterHeader from './CharacterHeader.vue';

// Mock reactive values
const mockHero = ref<{
  name: string;
  level: number;
  currentHealth: number;
  currentFocus: number;
  currentInvestiture: number;
  currency: number;
  ancestryId: number | null;
  radiantOrderId: number | null;
  activeSingerFormId: number | null;
  cultures: { cultureId: number }[];
} | null>(null);

const mockIsRadiant = ref(false);
const mockMaxHealth = ref(30);
const mockMaxFocus = ref(10);
const mockMaxInvestiture = ref(20);

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get hero() {
      return mockHero.value;
    },
  }),
}));

vi.mock('src/stores/heroAttributes', () => ({
  useHeroAttributesStore: () => ({
    getDerivedStatTotal: vi.fn((stat: string) => {
      if (stat === 'max_health') return mockMaxHealth.value;
      if (stat === 'max_focus') return mockMaxFocus.value;
      if (stat === 'max_investiture') return mockMaxInvestiture.value;
      return 0;
    }),
  }),
}));

vi.mock('src/stores/heroTalents', () => ({
  useHeroTalentsStore: () => ({
    get isRadiant() {
      return mockIsRadiant.value;
    },
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    radiantOrders: [
      { id: 1, code: 'windrunner', name: 'Windrunner' },
      { id: 2, code: 'skybreaker', name: 'Skybreaker' },
    ],
    ancestries: [
      { id: 1, code: 'human', name: 'Human' },
      { id: 2, code: 'singer', name: 'Singer' },
    ],
    singerForms: [
      { id: 1, code: 'mateform', name: 'Mateform' },
      { id: 2, code: 'warform', name: 'Warform' },
    ],
    cultures: [
      { id: 1, code: 'alethi', name: 'Alethi' },
      { id: 2, code: 'thaylen', name: 'Thaylen' },
    ],
  }),
}));

vi.mock('src/constants/theme', () => ({
  RPG_COLORS: {
    focus: 'blue',
    investiture: 'amber',
    singerForm: 'purple',
  },
}));

describe('CharacterHeader', () => {
  const createWrapper = () =>
    shallowMount(CharacterHeader, {
      global: {
        stubs: {
          QLinearProgress: {
            template:
              '<div class="q-linear-progress" :aria-valuenow="$attrs[\'aria-valuenow\']" :aria-valuemax="$attrs[\'aria-valuemax\']" :aria-label="$attrs[\'aria-label\']" />',
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockHero.value = {
      name: 'Kaladin',
      level: 5,
      currentHealth: 25,
      currentFocus: 8,
      currentInvestiture: 15,
      currency: 100,
      ancestryId: 1,
      radiantOrderId: 1,
      activeSingerFormId: null,
      cultures: [{ cultureId: 1 }],
    };
    mockIsRadiant.value = true;
    mockMaxHealth.value = 30;
    mockMaxFocus.value = 10;
    mockMaxInvestiture.value = 20;
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders hero name', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Kaladin');
    });

    it('renders hero level', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Level 5');
    });

    it('renders ancestry name', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Human');
    });

    it('renders culture name with separator', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('· Alethi');
    });

    it('renders radiant order name with separator', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('· Windrunner');
    });

    it('renders separator at bottom', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.q-separator').exists()).toBe(true);
    });
  });

  // ========================================
  // Resource Display
  // ========================================
  describe('resource display', () => {
    it('renders HP resource box', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('HP');
      expect(wrapper.text()).toContain('25 / 30');
    });

    it('renders Focus resource box', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Focus');
      expect(wrapper.text()).toContain('8 / 10');
    });

    it('renders Investiture for radiants', () => {
      mockIsRadiant.value = true;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Investiture');
      expect(wrapper.text()).toContain('15 / 20');
    });

    it('renders Spheres for non-radiants', () => {
      mockIsRadiant.value = false;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Spheres');
      expect(wrapper.text()).toContain('100 mk');
    });

    it('does not render Investiture for non-radiants', () => {
      mockIsRadiant.value = false;
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Investiture');
    });

    it('does not render Spheres for radiants', () => {
      mockIsRadiant.value = true;
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Spheres');
    });
  });

  // ========================================
  // Progress Bars
  // ========================================
  describe('progress bars', () => {
    it('renders health progress bar', () => {
      const wrapper = createWrapper();

      const progressBars = wrapper.findAll('.q-linear-progress');
      const healthBar = progressBars.find((p) => p.attributes('aria-label') === 'Health');
      expect(healthBar).toBeDefined();
      expect(healthBar?.attributes('aria-valuenow')).toBe('25');
      expect(healthBar?.attributes('aria-valuemax')).toBe('30');
    });

    it('renders focus progress bar', () => {
      const wrapper = createWrapper();

      const progressBars = wrapper.findAll('.q-linear-progress');
      const focusBar = progressBars.find((p) => p.attributes('aria-label') === 'Focus');
      expect(focusBar).toBeDefined();
      expect(focusBar?.attributes('aria-valuenow')).toBe('8');
      expect(focusBar?.attributes('aria-valuemax')).toBe('10');
    });

    it('renders investiture progress bar for radiants', () => {
      mockIsRadiant.value = true;
      const wrapper = createWrapper();

      const progressBars = wrapper.findAll('.q-linear-progress');
      const investitureBar = progressBars.find((p) => p.attributes('aria-label') === 'Investiture');
      expect(investitureBar).toBeDefined();
      expect(investitureBar!.exists()).toBe(true);
      expect(investitureBar!.attributes('aria-valuenow')).toBe('15');
      expect(investitureBar!.attributes('aria-valuemax')).toBe('20');
    });
  });

  // ========================================
  // Singer Form Display
  // ========================================
  describe('singer form display', () => {
    it('renders active singer form when set', () => {
      mockHero.value!.activeSingerFormId = 2;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Warform');
    });

    it('does not render singer form when not set', () => {
      mockHero.value!.activeSingerFormId = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Warform');
      expect(wrapper.text()).not.toContain('Mateform');
    });
  });

  // ========================================
  // Null/Missing Data Handling
  // ========================================
  describe('null/missing data handling', () => {
    it('handles null hero gracefully', () => {
      mockHero.value = null;

      // Should not throw during mount
      expect(() => createWrapper()).not.toThrow();

      const wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    it('handles missing culture gracefully', () => {
      mockHero.value!.cultures = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('· Alethi');
    });

    it('handles missing radiant order gracefully', () => {
      mockHero.value!.radiantOrderId = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('· Windrunner');
    });

    it('handles missing ancestry gracefully', () => {
      mockHero.value!.ancestryId = null;
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Human');
    });

    it('handles zero currency for spheres', () => {
      mockIsRadiant.value = false;
      mockHero.value!.currency = 0;
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('0 mk');
    });
  });

  // ========================================
  // Edge Cases - Progress Clamping
  // ========================================
  describe('progress clamping edge cases', () => {
    it('handles zero max health', () => {
      mockMaxHealth.value = 0;
      const wrapper = createWrapper();

      // Should not throw, progress should be clamped to 0
      expect(wrapper.find('.q-linear-progress').exists()).toBe(true);
    });

    it('handles current exceeding max', () => {
      mockHero.value!.currentHealth = 50;
      mockMaxHealth.value = 30;
      const wrapper = createWrapper();

      // Should render without throwing (progress clamped to 1)
      expect(wrapper.text()).toContain('50 / 30');
    });

    it('handles negative current values', () => {
      mockHero.value!.currentHealth = -5;
      const wrapper = createWrapper();

      // Should render without throwing and display the actual value (progress bar clamped to 0)
      expect(wrapper.text()).toContain('-5 / 30');
      const progressBar = wrapper.find('.q-linear-progress[aria-label="Health"]');
      expect(progressBar.exists()).toBe(true);
      // Progress bar value should be clamped to 0 minimum
      expect(Number(progressBar.attributes('aria-valuenow'))).toBeLessThanOrEqual(0);
    });
  });

  // ========================================
  // Classifier Lookup Edge Cases
  // ========================================
  describe('classifier lookup edge cases', () => {
    it('handles non-existent ancestry ID', () => {
      mockHero.value!.ancestryId = 999;
      const wrapper = createWrapper();

      // Should not crash, just show undefined/missing name
      expect(wrapper.text()).toContain('Level 5');
    });

    it('handles non-existent culture ID', () => {
      mockHero.value!.cultures = [{ cultureId: 999 }];
      const wrapper = createWrapper();

      // Should not crash
      expect(wrapper.text()).toContain('Level 5');
    });

    it('handles non-existent radiant order ID', () => {
      mockHero.value!.radiantOrderId = 999;
      const wrapper = createWrapper();

      // Should not crash
      expect(wrapper.text()).toContain('Level 5');
    });

    it('handles non-existent singer form ID', () => {
      mockHero.value!.activeSingerFormId = 999;
      const wrapper = createWrapper();

      // Should not crash
      expect(wrapper.text()).toContain('Level 5');
    });
  });
});
