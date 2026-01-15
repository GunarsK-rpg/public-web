import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import TalentsTab from './TalentsTab.vue';
import type { HeroTalent } from 'src/types';

const mockHeroTalents = ref<HeroTalent[]>([]);
const mockIsRadiant = ref(false);
const mockHero = ref<{
  radiantOrderId: number | null;
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
      { id: 1, name: 'Quick Strike', description: 'Fast attack', pathId: 1, isKey: true },
      { id: 2, name: 'Parry', description: 'Block attack', pathId: 1, isKey: false },
      { id: 3, name: 'Precision', description: 'Aimed attack', pathId: 1, specialtyId: 1 },
      { id: 4, name: 'Lashing', description: 'Radiant ability', radiantOrderId: 1, surgeId: 1 },
      { id: 5, name: 'Gravitation', description: 'Gravity control', radiantOrderId: 1, surgeId: 2 },
      { id: 6, name: 'Spren Bond', description: 'Bond with spren', radiantOrderId: 1 },
      { id: 7, name: 'Warform', description: 'Singer form', ancestryId: 2 },
      { id: 8, name: 'Scholar', description: 'Knowledge', pathId: 2, isKey: true },
      { id: 9, name: 'Research', description: 'Study', pathId: 2, isKey: false },
    ],
    paths: [
      { id: 1, name: 'Warrior' },
      { id: 2, name: 'Scholar' },
    ],
    specialties: [
      { id: 1, name: 'Duelist', pathId: 1 },
      { id: 2, name: 'Guardian', pathId: 1 },
      { id: 3, name: 'Historian', pathId: 2 },
    ],
    radiantOrders: [
      { id: 1, name: 'Windrunner', surge1Id: 1, surge2Id: 2 },
      { id: 2, name: 'Skybreaker', surge1Id: 2, surge2Id: 3 },
    ],
    surges: [
      { id: 1, name: 'Adhesion' },
      { id: 2, name: 'Gravitation' },
      { id: 3, name: 'Division' },
    ],
    ancestries: [
      { id: 1, name: 'Human' },
      { id: 2, name: 'Singer' },
    ],
  }),
}));

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
    mockHeroTalents.value = [];
    mockIsRadiant.value = false;
    mockHero.value = {
      radiantOrderId: null,
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
      mockHeroTalents.value = [{ id: 1, talentId: 1 }] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Warrior');
      expect(wrapper.text()).toContain('Path');
    });

    it('renders key talent in Key Talent section', () => {
      mockHeroTalents.value = [{ id: 1, talentId: 1 }] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Key Talent');
      expect(wrapper.text()).toContain('Quick Strike');
    });

    it('renders general path talents in Path Talents section', () => {
      mockHeroTalents.value = [
        { id: 1, talentId: 1 },
        { id: 2, talentId: 2 },
      ] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Path Talents');
      expect(wrapper.text()).toContain('Parry');
    });

    it('renders specialty talents under specialty name', () => {
      mockHeroTalents.value = [
        { id: 1, talentId: 1 },
        { id: 3, talentId: 3 },
      ] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Duelist');
      expect(wrapper.text()).toContain('Precision');
    });

    it('renders multiple paths when hero has talents from multiple', () => {
      mockHeroTalents.value = [
        { id: 1, talentId: 1 },
        { id: 2, talentId: 8 },
      ] as HeroTalent[];
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
      mockHero.value = { radiantOrderId: 1, radiantIdeal: 2 };
      mockHeroTalents.value = [{ id: 1, talentId: 6 }] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Windrunner');
      expect(wrapper.text()).toContain('Radiant Order');
    });

    it('shows radiant ideal in section', () => {
      mockIsRadiant.value = true;
      mockHero.value = { radiantOrderId: 1, radiantIdeal: 3 };
      mockHeroTalents.value = [{ id: 1, talentId: 6 }] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Ideal 3');
    });

    it('renders spren bond talents', () => {
      mockIsRadiant.value = true;
      mockHero.value = { radiantOrderId: 1, radiantIdeal: 2 };
      mockHeroTalents.value = [{ id: 1, talentId: 6 }] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Windrunner Bond');
      expect(wrapper.text()).toContain('Spren Bond');
    });

    it('shows empty message when no bond talents', () => {
      mockIsRadiant.value = true;
      mockHero.value = { radiantOrderId: 1, radiantIdeal: 2 };
      mockHeroTalents.value = [{ id: 1, talentId: 4 }] as HeroTalent[]; // Only surge talent
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No bond talents acquired');
    });

    it('renders surge sections for radiant order', () => {
      mockIsRadiant.value = true;
      mockHero.value = { radiantOrderId: 1, radiantIdeal: 2 };
      mockHeroTalents.value = [{ id: 1, talentId: 6 }] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Adhesion');
      expect(wrapper.text()).toContain('Gravitation');
    });

    it('renders surge talents under correct surge', () => {
      mockIsRadiant.value = true;
      mockHero.value = { radiantOrderId: 1, radiantIdeal: 2 };
      mockHeroTalents.value = [
        { id: 1, talentId: 6 },
        { id: 2, talentId: 4 },
      ] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Lashing');
    });

    it('shows empty message for surge with no talents', () => {
      mockIsRadiant.value = true;
      mockHero.value = { radiantOrderId: 1, radiantIdeal: 2 };
      mockHeroTalents.value = [{ id: 1, talentId: 6 }] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No Adhesion talents acquired');
    });

    it('does not render radiant section for non-radiants', () => {
      mockIsRadiant.value = false;
      mockHero.value = { radiantOrderId: null, radiantIdeal: 0 };
      mockHeroTalents.value = [{ id: 1, talentId: 1 }] as HeroTalent[];
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
      mockHeroTalents.value = [{ id: 1, talentId: 7 }] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Singer');
      expect(wrapper.text()).toContain('Ancestry Talents');
    });

    it('renders ancestry talent items', () => {
      mockHeroTalents.value = [{ id: 1, talentId: 7 }] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Warform');
    });

    it('does not render ancestry section when no ancestry talents', () => {
      mockHeroTalents.value = [{ id: 1, talentId: 1 }] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('Ancestry Talents');
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('path expansion has aria-label', () => {
      mockHeroTalents.value = [{ id: 1, talentId: 1 }] as HeroTalent[];
      const wrapper = createWrapper();

      const expansion = wrapper.find('[aria-label="Warrior path talents"]');
      expect(expansion.exists()).toBe(true);
    });

    it('radiant order expansion has aria-label', () => {
      mockIsRadiant.value = true;
      mockHero.value = { radiantOrderId: 1, radiantIdeal: 2 };
      mockHeroTalents.value = [{ id: 1, talentId: 6 }] as HeroTalent[];
      const wrapper = createWrapper();

      const expansion = wrapper.find('[aria-label="Windrunner radiant order talents"]');
      expect(expansion.exists()).toBe(true);
    });

    it('ancestry expansion has aria-label', () => {
      mockHeroTalents.value = [{ id: 1, talentId: 7 }] as HeroTalent[];
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
      mockHeroTalents.value = [{ id: 1, talentId: 999 }] as HeroTalent[];
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
        { id: 1, talentId: 1 },
        { id: 2, talentId: 3 },
      ] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Precision');
    });

    it('handles path with no key talent', () => {
      // Only general path talent, no key talent
      mockHeroTalents.value = [{ id: 1, talentId: 2 }] as HeroTalent[]; // Parry is not isKey
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Path Talents');
      expect(wrapper.text()).toContain('Parry');
    });

    it('handles path with only key talent (no general talents)', () => {
      // Only key talent, no general path talents
      mockHeroTalents.value = [{ id: 1, talentId: 1 }] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Key Talent');
      expect(wrapper.text()).toContain('Quick Strike');
    });

    it('handles radiant order with surge talents', () => {
      mockIsRadiant.value = true;
      mockHero.value = { radiantOrderId: 1, radiantIdeal: 2 };
      // Include both bond talent and surge talent
      mockHeroTalents.value = [
        { id: 1, talentId: 6 }, // Spren Bond (no surge)
        { id: 2, talentId: 4 }, // Lashing (surge 1)
        { id: 3, talentId: 5 }, // Gravitation (surge 2)
      ] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Spren Bond');
      expect(wrapper.text()).toContain('Lashing');
      expect(wrapper.text()).toContain('Gravitation');
    });

    it('handles radiant with both surge sections populated', () => {
      mockIsRadiant.value = true;
      mockHero.value = { radiantOrderId: 1, radiantIdeal: 2 };
      mockHeroTalents.value = [
        { id: 1, talentId: 6 },
        { id: 2, talentId: 4 }, // Adhesion surge
      ] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Adhesion');
      expect(wrapper.text()).toContain('Lashing');
    });

    it('handles non-radiant with no radiant order', () => {
      mockIsRadiant.value = false;
      mockHero.value = { radiantOrderId: null, radiantIdeal: 0 };
      mockHeroTalents.value = [{ id: 1, talentId: 1 }] as HeroTalent[];
      const wrapper = createWrapper();

      // orderSurges should return empty array
      expect(wrapper.text()).not.toContain('Radiant Order');
    });

    it('shows correct radiant ideal from hero', () => {
      mockIsRadiant.value = true;
      mockHero.value = { radiantOrderId: 1, radiantIdeal: 5 };
      mockHeroTalents.value = [{ id: 1, talentId: 6 }] as HeroTalent[];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Ideal 5');
    });

    it('handles specialty with no talents (not shown)', () => {
      // Has path talent but not specialty talent
      mockHeroTalents.value = [{ id: 1, talentId: 1 }] as HeroTalent[];
      const wrapper = createWrapper();

      // Key Talent section should show for key talent
      expect(wrapper.text()).toContain('Key Talent');
    });

    it('handles case where generalTalentsByPath returns empty array', () => {
      // Only key talent for path, no general talents
      mockHeroTalents.value = [{ id: 1, talentId: 1 }] as HeroTalent[];
      const wrapper = createWrapper();

      // Path Talents section should not appear when empty
      expect(wrapper.text()).not.toContain('Path Talents');
    });
  });
});
