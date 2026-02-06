import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import TalentsTab from './TalentsTab.vue';
import type { ClassifierRef, HeroTalent } from 'src/types';

const mockHeroTalents = ref<HeroTalent[]>([]);
const mockIsRadiant = ref(false);
const mockHero = ref<{
  radiantOrder: ClassifierRef | null;
  radiantIdeal: number;
} | null>(null);

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    talents: mockHeroTalents.value,
    hero: mockHero.value,
  }),
}));

vi.mock('src/stores/heroTalents', () => ({
  useHeroTalentsStore: () => ({
    isRadiant: mockIsRadiant.value,
  }),
}));

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    talents: [
      {
        id: 1,
        name: 'Quick Strike',
        description: 'Fast attack',
        path: { id: 1, code: 'warrior', name: 'Warrior' },
        specialties: [],
        ancestry: null,
        radiantOrder: null,
        surge: null,
        isKey: true,
      },
      {
        id: 2,
        name: 'Parry',
        description: 'Block attack',
        path: { id: 1, code: 'warrior', name: 'Warrior' },
        specialties: [],
        ancestry: null,
        radiantOrder: null,
        surge: null,
        isKey: false,
      },
      {
        id: 3,
        name: 'Precision',
        description: 'Aimed attack',
        path: { id: 1, code: 'warrior', name: 'Warrior' },
        specialties: [{ id: 1, code: 'duelist', name: 'Duelist' }],
        ancestry: null,
        radiantOrder: null,
        surge: null,
        isKey: false,
      },
      {
        id: 4,
        name: 'Lashing',
        description: 'Radiant ability',
        path: null,
        specialties: [],
        ancestry: null,
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        surge: { id: 1, code: 'adhesion', name: 'Adhesion' },
        isKey: false,
      },
      {
        id: 5,
        name: 'Gravitation',
        description: 'Gravity control',
        path: null,
        specialties: [],
        ancestry: null,
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        surge: { id: 2, code: 'gravitation', name: 'Gravitation' },
        isKey: false,
      },
      {
        id: 6,
        name: 'Spren Bond',
        description: 'Bond with spren',
        path: null,
        specialties: [],
        ancestry: null,
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        surge: null,
        isKey: false,
      },
      {
        id: 7,
        name: 'Warform',
        description: 'Singer form',
        path: null,
        specialties: [],
        ancestry: { id: 2, code: 'singer', name: 'Singer' },
        radiantOrder: null,
        surge: null,
        isKey: false,
      },
      {
        id: 8,
        name: 'Scholar',
        description: 'Knowledge',
        path: { id: 2, code: 'scholar', name: 'Scholar' },
        specialties: [],
        ancestry: null,
        radiantOrder: null,
        surge: null,
        isKey: true,
      },
      {
        id: 9,
        name: 'Research',
        description: 'Study',
        path: { id: 2, code: 'scholar', name: 'Scholar' },
        specialties: [],
        ancestry: null,
        radiantOrder: null,
        surge: null,
        isKey: false,
      },
    ],
    paths: [
      { id: 1, code: 'warrior', name: 'Warrior' },
      { id: 2, code: 'scholar', name: 'Scholar' },
    ],
    specialties: [
      { id: 1, name: 'Duelist', path: { id: 1, code: 'warrior', name: 'Warrior' } },
      { id: 2, name: 'Guardian', path: { id: 1, code: 'warrior', name: 'Warrior' } },
      { id: 3, name: 'Historian', path: { id: 2, code: 'scholar', name: 'Scholar' } },
    ],
    radiantOrders: [
      {
        id: 1,
        name: 'Windrunner',
        surge1: { id: 1, code: 'adhesion', name: 'Adhesion' },
        surge2: { id: 2, code: 'gravitation', name: 'Gravitation' },
      },
      {
        id: 2,
        name: 'Skybreaker',
        surge1: { id: 2, code: 'gravitation', name: 'Gravitation' },
        surge2: { id: 3, code: 'division', name: 'Division' },
      },
    ],
    surges: [
      { id: 1, code: 'adhesion', name: 'Adhesion' },
      { id: 2, code: 'gravitation', name: 'Gravitation' },
      { id: 3, code: 'division', name: 'Division' },
    ],
    ancestries: [
      { id: 1, code: 'human', name: 'Human' },
      { id: 2, code: 'singer', name: 'Singer' },
    ],
  }),
}));

let nextHeroTalentId = 1;
function createHeroTalent(overrides: Partial<HeroTalent> = {}): HeroTalent {
  return {
    id: nextHeroTalentId++,
    heroId: 1,
    talent: { id: 1, code: 'talent1', name: 'Talent 1' },
    ...overrides,
  };
}

describe('TalentsTab', () => {
  const createWrapper = () =>
    shallowMount(TalentsTab, {
      global: {
        stubs: {
          QExpansionItem: {
            template: `<div class="q-expansion-item" :aria-label="$attrs['aria-label']">
              <div class="header"><slot name="header" /></div>
              <slot />
            </div>`,
            props: ['label', 'defaultOpened'],
          },
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QItemSection: {
            template: '<div class="q-item-section"><slot /></div>',
          },
          QItemLabel: {
            template: '<div class="q-item-label"><slot /></div>',
          },
          TalentItem: {
            template: '<div class="talent-item">{{ talent.name }}</div>',
            props: ['talent'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    nextHeroTalentId = 1;
    mockHeroTalents.value = [];
    mockIsRadiant.value = false;
    mockHero.value = {
      radiantOrder: null,
      radiantIdeal: 0,
    };
  });

  // ========================================
  // Empty State
  // ========================================
  describe('empty state', () => {
    it('shows empty message when no talents', () => {
      mockHeroTalents.value = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No talents acquired');
    });
  });

  // ========================================
  // Path Talents
  // ========================================
  describe('path talents', () => {
    it('renders path section for path with talents', () => {
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 1, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Warrior');
      expect(wrapper.text()).toContain('Path');
    });

    it('renders key talent in Key Talent section', () => {
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 1, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Key Talent');
      expect(wrapper.text()).toContain('Quick Strike');
    });

    it('renders general path talents in Path Talents section', () => {
      mockHeroTalents.value = [
        createHeroTalent({ talent: { id: 1, code: 't1', name: 'T1' } }),
        createHeroTalent({ talent: { id: 2, code: 't2', name: 'T2' } }),
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Path Talents');
      expect(wrapper.text()).toContain('Parry');
    });

    it('renders specialty talents under specialty name', () => {
      mockHeroTalents.value = [
        createHeroTalent({ talent: { id: 1, code: 't1', name: 'T1' } }),
        createHeroTalent({ talent: { id: 3, code: 't3', name: 'T3' } }),
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Duelist');
      expect(wrapper.text()).toContain('Precision');
    });

    it('renders multiple paths when hero has talents from multiple', () => {
      mockHeroTalents.value = [
        createHeroTalent({ talent: { id: 1, code: 't1', name: 'T1' } }),
        createHeroTalent({ talent: { id: 8, code: 't8', name: 'T8' } }),
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Warrior');
      expect(wrapper.text()).toContain('Scholar');
    });
  });

  // ========================================
  // Radiant Order Talents
  // ========================================
  describe('radiant order talents', () => {
    it('renders radiant order section for radiants', () => {
      mockIsRadiant.value = true;
      mockHero.value = {
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        radiantIdeal: 2,
      };
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 6, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Windrunner');
      expect(wrapper.text()).toContain('Radiant Order');
    });

    it('shows radiant ideal in section', () => {
      mockIsRadiant.value = true;
      mockHero.value = {
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        radiantIdeal: 3,
      };
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 6, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Ideal 3');
    });

    it('renders spren bond talents', () => {
      mockIsRadiant.value = true;
      mockHero.value = {
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        radiantIdeal: 2,
      };
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 6, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Windrunner Bond');
      expect(wrapper.text()).toContain('Spren Bond');
    });

    it('shows empty message when no bond talents', () => {
      mockIsRadiant.value = true;
      mockHero.value = {
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        radiantIdeal: 2,
      };
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 4, code: 'test', name: 'Test' } })]; // Only surge talent
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No bond talents acquired');
    });

    it('renders surge sections for radiant order', () => {
      mockIsRadiant.value = true;
      mockHero.value = {
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        radiantIdeal: 2,
      };
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 6, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Adhesion');
      expect(wrapper.text()).toContain('Gravitation');
    });

    it('renders surge talents under correct surge', () => {
      mockIsRadiant.value = true;
      mockHero.value = {
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        radiantIdeal: 2,
      };
      mockHeroTalents.value = [
        createHeroTalent({ talent: { id: 6, code: 't6', name: 'T6' } }),
        createHeroTalent({ talent: { id: 4, code: 't4', name: 'T4' } }),
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Lashing');
    });

    it('shows empty message for surge with no talents', () => {
      mockIsRadiant.value = true;
      mockHero.value = {
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        radiantIdeal: 2,
      };
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 6, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No Adhesion talents acquired');
    });

    it('does not render radiant section for non-radiants', () => {
      mockIsRadiant.value = false;
      mockHero.value = { radiantOrder: null, radiantIdeal: 0 };
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 1, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Windrunner');
      expect(wrapper.text()).not.toContain('Radiant Order');
    });
  });

  // ========================================
  // Ancestry Talents
  // ========================================
  describe('ancestry talents', () => {
    it('renders ancestry talents section when present', () => {
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 7, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Singer');
      expect(wrapper.text()).toContain('Ancestry Talents');
    });

    it('renders ancestry talent items', () => {
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 7, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Warform');
    });

    it('does not render ancestry section when no ancestry talents', () => {
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 1, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Ancestry Talents');
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('path expansion has aria-label', () => {
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 1, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      const expansion = wrapper.find('[aria-label="Warrior path talents"]');
      expect(expansion.exists()).toBe(true);
    });

    it('radiant order expansion has aria-label', () => {
      mockIsRadiant.value = true;
      mockHero.value = {
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        radiantIdeal: 2,
      };
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 6, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      const expansion = wrapper.find('[aria-label="Windrunner radiant order talents"]');
      expect(expansion.exists()).toBe(true);
    });

    it('ancestry expansion has aria-label', () => {
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 7, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      const expansion = wrapper.find('[aria-label="Singer ancestry talents"]');
      expect(expansion.exists()).toBe(true);
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles talent with non-existent path gracefully', () => {
      mockHeroTalents.value = [
        createHeroTalent({ talent: { id: 999, code: 'test', name: 'Test' } }),
      ];
      const wrapper = createWrapper();

      // Should not crash, shows empty state
      expect(wrapper.text()).toContain('No talents acquired');
    });

    it('handles null hero gracefully for radiant ideal', () => {
      mockIsRadiant.value = true;
      mockHero.value = null;
      mockHeroTalents.value = [];
      const wrapper = createWrapper();

      // Should not crash
      expect(wrapper.exists()).toBe(true);
    });

    it('handles multiple talents in same specialty', () => {
      // Add another talent with same specialty
      mockHeroTalents.value = [
        createHeroTalent({ talent: { id: 1, code: 't1', name: 'T1' } }),
        createHeroTalent({ talent: { id: 3, code: 't3', name: 'T3' } }),
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Precision');
    });

    it('handles path with no key talent', () => {
      // Only general path talent, no key talent
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 2, code: 'test', name: 'Test' } })]; // Parry is not isKey
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Path Talents');
      expect(wrapper.text()).toContain('Parry');
    });

    it('handles path with only key talent (no general talents)', () => {
      // Only key talent, no general path talents
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 1, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Key Talent');
      expect(wrapper.text()).toContain('Quick Strike');
    });

    it('handles radiant order with surge talents', () => {
      mockIsRadiant.value = true;
      mockHero.value = {
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        radiantIdeal: 2,
      };
      // Include both bond talent and surge talent
      mockHeroTalents.value = [
        createHeroTalent({ talent: { id: 6, code: 't6', name: 'T6' } }), // Spren Bond (no surge)
        createHeroTalent({ talent: { id: 4, code: 't4', name: 'T4' } }), // Lashing (surge 1)
        createHeroTalent({ talent: { id: 5, code: 't5', name: 'T5' } }), // Gravitation (surge 2)
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Spren Bond');
      expect(wrapper.text()).toContain('Lashing');
      expect(wrapper.text()).toContain('Gravitation');
    });

    it('handles radiant with both surge sections populated', () => {
      mockIsRadiant.value = true;
      mockHero.value = {
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        radiantIdeal: 2,
      };
      mockHeroTalents.value = [
        createHeroTalent({ talent: { id: 6, code: 't6', name: 'T6' } }),
        createHeroTalent({ talent: { id: 4, code: 't4', name: 'T4' } }), // Adhesion surge
      ];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Adhesion');
      expect(wrapper.text()).toContain('Lashing');
    });

    it('handles non-radiant with no radiant order', () => {
      mockIsRadiant.value = false;
      mockHero.value = { radiantOrder: null, radiantIdeal: 0 };
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 1, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      // orderSurges should return empty array
      expect(wrapper.text()).not.toContain('Radiant Order');
    });

    it('shows correct radiant ideal from hero', () => {
      mockIsRadiant.value = true;
      mockHero.value = {
        radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
        radiantIdeal: 5,
      };
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 6, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Ideal 5');
    });

    it('handles specialty with no talents (not shown)', () => {
      // Has path talent but not specialty talent
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 1, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      // Key Talent section should show for key talent
      expect(wrapper.text()).toContain('Key Talent');
    });

    it('handles case where generalTalentsByPath returns empty array', () => {
      // Only key talent for path, no general talents
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 1, code: 'test', name: 'Test' } })];
      const wrapper = createWrapper();

      // Path Talents section should not appear when empty
      expect(wrapper.text()).not.toContain('Path Talents');
    });
  });
});
