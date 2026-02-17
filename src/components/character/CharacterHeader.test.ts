import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import CharacterHeader from './CharacterHeader.vue';

const mockHero = ref<{
  name: string;
  level: number;
  currentHealth: number;
  currentFocus: number;
  currentInvestiture: number;
  currency: number;
  ancestry: { id: number; code: string; name: string } | null;
  radiantOrder: { id: number; code: string; name: string } | null;
  activeSingerForm: { id: number; code: string; name: string } | null;
  cultures: { culture: { id: number; code: string; name: string } }[];
} | null>(null);

const mockIsRadiant = ref(false);
const mockMaxHealth = ref(30);
const mockMaxFocus = ref(10);
const mockMaxInvestiture = ref(20);
const mockSaving = ref(false);

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get hero() {
      return mockHero.value;
    },
    get saving() {
      return mockSaving.value;
    },
    patchHealth: vi.fn(),
    patchFocus: vi.fn(),
    patchInvestiture: vi.fn(),
    patchCurrency: vi.fn(),
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

vi.mock('src/constants/theme', () => ({
  RPG_COLORS: {
    focus: 'blue',
    investiture: 'amber',
    singerForm: 'purple',
  },
}));

const mockRouterPush = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

describe('CharacterHeader', () => {
  const createWrapper = () =>
    shallowMount(CharacterHeader, {
      props: {
        campaignId: '1',
        characterId: '42',
      },
      global: {
        stubs: {
          ResourceBox: {
            template: '<div class="resource-box-stub" :data-label="$attrs.label" />',
          },
          QSeparator: {
            template: '<hr class="q-separator" />',
          },
          QBtn: {
            template:
              '<button class="q-btn-stub" :aria-label="$attrs[\'aria-label\']"><slot /></button>',
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
      ancestry: { id: 1, code: 'human', name: 'Human' },
      radiantOrder: { id: 1, code: 'windrunner', name: 'Windrunner' },
      activeSingerForm: null,
      cultures: [{ culture: { id: 1, code: 'alethi', name: 'Alethi' } }],
    };
    mockIsRadiant.value = true;
    mockMaxHealth.value = 30;
    mockMaxFocus.value = 10;
    mockMaxInvestiture.value = 20;
    mockSaving.value = false;
  });

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

  describe('resource boxes', () => {
    it('renders HP resource box', () => {
      const wrapper = createWrapper();
      const boxes = wrapper.findAll('.resource-box-stub');
      expect(boxes.some((b) => b.attributes('data-label') === 'HP')).toBe(true);
    });

    it('renders Focus resource box', () => {
      const wrapper = createWrapper();
      const boxes = wrapper.findAll('.resource-box-stub');
      expect(boxes.some((b) => b.attributes('data-label') === 'Focus')).toBe(true);
    });

    it('renders Investiture and Marks for radiants', () => {
      mockIsRadiant.value = true;
      const wrapper = createWrapper();
      const boxes = wrapper.findAll('.resource-box-stub');
      expect(boxes.some((b) => b.attributes('data-label') === 'Investiture')).toBe(true);
      expect(boxes.some((b) => b.attributes('data-label') === 'Marks')).toBe(true);
    });

    it('renders Marks without Investiture for non-radiants', () => {
      mockIsRadiant.value = false;
      const wrapper = createWrapper();
      const boxes = wrapper.findAll('.resource-box-stub');
      expect(boxes.some((b) => b.attributes('data-label') === 'Marks')).toBe(true);
      expect(boxes.some((b) => b.attributes('data-label') === 'Investiture')).toBe(false);
    });
  });

  describe('singer form display', () => {
    it('renders active singer form when set', () => {
      mockHero.value!.activeSingerForm = { id: 2, code: 'warform', name: 'Warform' };
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Warform');
    });

    it('does not render singer form when not set', () => {
      mockHero.value!.activeSingerForm = null;
      const wrapper = createWrapper();
      expect(wrapper.text()).not.toContain('Warform');
      expect(wrapper.text()).not.toContain('Mateform');
    });
  });

  describe('edit button', () => {
    it('navigates to edit route when edit button is clicked', async () => {
      const wrapper = createWrapper();
      const editBtn = wrapper.find('button[aria-label="Edit character"]');
      await editBtn.trigger('click');

      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'character-edit',
        params: { campaignId: '1', characterId: '42' },
      });
    });
  });

  describe('null/missing data handling', () => {
    it('handles null hero gracefully', () => {
      mockHero.value = null;
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
      mockHero.value!.radiantOrder = null;
      const wrapper = createWrapper();
      expect(wrapper.text()).not.toContain('· Windrunner');
    });

    it('handles missing ancestry gracefully', () => {
      mockHero.value!.ancestry = null;
      const wrapper = createWrapper();
      expect(wrapper.text()).not.toContain('Human');
    });
  });
});
