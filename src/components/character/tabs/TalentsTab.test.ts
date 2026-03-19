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
        special: [],
      },
      {
        id: 2,
        name: 'Parry',
        description: 'Block attack',
        path: null,
        specialties: [{ id: 10, code: 'bladework', name: 'Bladework' }],
        ancestry: null,
        radiantOrder: null,
        surge: null,
        isKey: false,
        special: [],
      },
      {
        id: 3,
        name: 'Shield Bash',
        description: 'Bash with shield',
        path: null,
        specialties: [{ id: 11, code: 'guardian', name: 'Guardian' }],
        ancestry: null,
        radiantOrder: null,
        surge: null,
        isKey: false,
        special: [],
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
        special: [],
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
        special: [],
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
        special: [],
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
        special: [],
      },
      {
        id: 8,
        name: 'Scholar Key',
        description: 'Knowledge',
        path: { id: 2, code: 'scholar', name: 'Scholar' },
        specialties: [],
        ancestry: null,
        radiantOrder: null,
        surge: null,
        isKey: true,
        special: [],
      },
      {
        id: 9,
        name: 'Research',
        description: 'Study topic',
        path: null,
        specialties: [{ id: 20, code: 'academics', name: 'Academics' }],
        ancestry: null,
        radiantOrder: null,
        surge: null,
        isKey: false,
        special: [],
      },
    ],
    specialties: [
      {
        id: 10,
        code: 'bladework',
        name: 'Bladework',
        path: { id: 1, code: 'warrior', name: 'Warrior' },
      },
      {
        id: 11,
        code: 'guardian',
        name: 'Guardian',
        path: { id: 1, code: 'warrior', name: 'Warrior' },
      },
      {
        id: 20,
        code: 'academics',
        name: 'Academics',
        path: { id: 2, code: 'scholar', name: 'Scholar' },
      },
    ],
    paths: [
      { id: 1, code: 'warrior', name: 'Warrior' },
      { id: 2, code: 'scholar', name: 'Scholar' },
    ],
    radiantOrders: [
      {
        id: 1,
        code: 'windrunner',
        name: 'Windrunner',
        surge1: { id: 1, code: 'adhesion', name: 'Adhesion' },
        surge2: { id: 2, code: 'gravitation', name: 'Gravitation' },
      },
    ],
    surges: [
      { id: 1, code: 'adhesion', name: 'Adhesion' },
      { id: 2, code: 'gravitation', name: 'Gravitation' },
    ],
  }),
}));

const WINDRUNNER_ORDER: ClassifierRef = { id: 1, code: 'windrunner', name: 'Windrunner' };

function setRadiantHero(radiantIdeal = 2) {
  mockIsRadiant.value = true;
  mockHero.value = { radiantOrder: WINDRUNNER_ORDER, radiantIdeal };
}

let nextId = 1;
function createHeroTalent(overrides: Partial<HeroTalent> = {}): HeroTalent {
  return {
    id: nextId++,
    heroId: 1,
    talent: { id: 1, code: 'talent1', name: 'Talent 1' },
    special: [],
    grantSelections: [],
    ...overrides,
  };
}

describe('TalentsTab', () => {
  const createWrapper = () =>
    shallowMount(TalentsTab, {
      global: {
        stubs: {
          QTabs: {
            template: '<div class="q-tabs"><slot /></div>',
            props: ['modelValue'],
          },
          QTab: {
            template: '<div class="q-tab" :data-name="name">{{ label }}</div>',
            props: ['name', 'label'],
          },
          QTabPanels: {
            template: '<div class="q-tab-panels" :data-active="modelValue"><slot /></div>',
            props: ['modelValue'],
          },
          QTabPanel: {
            template: '<div class="q-tab-panel" :data-name="name"><slot /></div>',
            props: ['name'],
          },
          QList: { template: '<div class="q-list"><slot /></div>' },
          TalentItem: {
            template: '<div class="talent-item">{{ talent.name }}</div>',
            props: ['talent'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    nextId = 1;
    mockHeroTalents.value = [];
    mockIsRadiant.value = false;
    mockHero.value = { radiantOrder: null, radiantIdeal: 0 };
  });

  // ========================================
  // Empty State
  // ========================================
  describe('empty state', () => {
    it('shows empty message when no talents', () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('No talents acquired');
    });

    it('does not render tabs when no talents', () => {
      const wrapper = createWrapper();
      expect(wrapper.findAll('.q-tab').length).toBe(0);
    });
  });

  // ========================================
  // Tab Generation
  // ========================================
  describe('tab generation', () => {
    it('creates tab for each path with talents', () => {
      mockHeroTalents.value = [
        createHeroTalent({ talent: { id: 1, code: 't1', name: 'T1' } }),
        createHeroTalent({ talent: { id: 8, code: 't8', name: 'T8' } }),
      ];
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text().includes('Warrior'))).toBe(true);
      expect(tabs.some((t) => t.text().includes('Scholar'))).toBe(true);
    });

    it('creates path tab for specialty-only talents via specialty path resolution', () => {
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 2, code: 't2', name: 'T2' } })];
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text().includes('Warrior'))).toBe(true);
    });

    it('creates bond tab for radiant order', () => {
      setRadiantHero();
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 6, code: 't6', name: 'T6' } })];
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text().includes('Windrunner'))).toBe(true);
    });

    it('creates separate tabs for each surge with talents', () => {
      setRadiantHero();
      mockHeroTalents.value = [
        createHeroTalent({ talent: { id: 4, code: 't4', name: 'T4' } }),
        createHeroTalent({ talent: { id: 5, code: 't5', name: 'T5' } }),
      ];
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text().includes('Adhesion'))).toBe(true);
      expect(tabs.some((t) => t.text().includes('Gravitation'))).toBe(true);
    });

    it('does not create surge tab when no talents for that surge', () => {
      setRadiantHero();
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 4, code: 't4', name: 'T4' } })];
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text().includes('Adhesion'))).toBe(true);
      expect(tabs.some((t) => t.text().includes('Gravitation'))).toBe(false);
    });

    it('creates tab for singer ancestry when hero has ancestry talents', () => {
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 7, code: 't7', name: 'T7' } })];
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text().includes('Singer'))).toBe(true);
    });

    it('does not create radiant or surge tabs for non-radiant hero', () => {
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 1, code: 't1', name: 'T1' } })];
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text().includes('Windrunner'))).toBe(false);
      expect(tabs.some((t) => t.text().includes('Adhesion'))).toBe(false);
    });

    it('does not create ancestry tab when no ancestry talents', () => {
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 1, code: 't1', name: 'T1' } })];
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text().includes('Singer'))).toBe(false);
    });
  });

  // ========================================
  // Talent Rendering
  // ========================================
  describe('talent rendering', () => {
    it('renders key and specialty talents together in path tab', () => {
      mockHeroTalents.value = [
        createHeroTalent({ talent: { id: 1, code: 't1', name: 'T1' } }),
        createHeroTalent({ talent: { id: 2, code: 't2', name: 'T2' } }),
        createHeroTalent({ talent: { id: 3, code: 't3', name: 'T3' } }),
      ];
      const wrapper = createWrapper();
      const panel = wrapper.find('.q-tab-panel[data-name="path-1"]');
      expect(panel.text()).toContain('Quick Strike');
      expect(panel.text()).toContain('Parry');
      expect(panel.text()).toContain('Shield Bash');
    });

    it('renders radiant bond talents', () => {
      setRadiantHero();
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 6, code: 't6', name: 'T6' } })];
      const wrapper = createWrapper();
      const panel = wrapper.find('.q-tab-panel[data-name="order-1"]');
      expect(panel.text()).toContain('Spren Bond');
    });

    it('renders surge talents', () => {
      setRadiantHero();
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 4, code: 't4', name: 'T4' } })];
      const wrapper = createWrapper();
      const panel = wrapper.find('.q-tab-panel[data-name="surge-1"]');
      expect(panel.text()).toContain('Lashing');
    });

    it('renders ancestry talents', () => {
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 7, code: 't7', name: 'T7' } })];
      const wrapper = createWrapper();
      const panel = wrapper.find('.q-tab-panel[data-name="ancestry-2"]');
      expect(panel.text()).toContain('Warform');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('edge cases', () => {
    it('handles talent with non-existent classifier gracefully', () => {
      mockHeroTalents.value = [
        createHeroTalent({ talent: { id: 999, code: 'missing', name: 'Missing' } }),
      ];
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('No talents acquired');
    });

    it('handles null hero gracefully', () => {
      mockHero.value = null;
      const wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    it('sets first tab as active by default', () => {
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 1, code: 't1', name: 'T1' } })];
      const wrapper = createWrapper();
      expect(wrapper.find('.q-tab-panels').attributes('data-active')).toBe('path-1');
    });

    it('renders all talent categories together', () => {
      setRadiantHero();
      mockHeroTalents.value = [
        createHeroTalent({ talent: { id: 1, code: 't1', name: 'T1' } }),
        createHeroTalent({ talent: { id: 2, code: 't2', name: 'T2' } }),
        createHeroTalent({ talent: { id: 6, code: 't6', name: 'T6' } }),
        createHeroTalent({ talent: { id: 4, code: 't4', name: 'T4' } }),
        createHeroTalent({ talent: { id: 7, code: 't7', name: 'T7' } }),
      ];
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text().includes('Warrior'))).toBe(true);
      expect(tabs.some((t) => t.text().includes('Windrunner'))).toBe(true);
      expect(tabs.some((t) => t.text().includes('Adhesion'))).toBe(true);
      expect(tabs.some((t) => t.text().includes('Singer'))).toBe(true);
    });

    it('does not create bond tab when no bond talents exist', () => {
      setRadiantHero();
      mockHeroTalents.value = [createHeroTalent({ talent: { id: 4, code: 't4', name: 'T4' } })];
      const wrapper = createWrapper();
      const tabs = wrapper.findAll('.q-tab');
      expect(tabs.some((t) => t.text().includes('Windrunner'))).toBe(false);
      expect(tabs.some((t) => t.text().includes('Adhesion'))).toBe(true);
    });
  });
});
