import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import CampaignFormPage from './CampaignFormPage.vue';

const mockPush = vi.fn();
const mockSelectCampaign = vi.fn();
const mockCreateCampaign = vi.fn();
const mockUpdateCampaign = vi.fn();
const mockSaving = ref(false);
const mockError = ref<string | null>(null);
const mockCurrentCampaign = ref<{
  id: number;
  name: string;
  description: string | null;
  talentsModifier: number;
  skillsModifier: number;
  expertisesModifier: number;
} | null>(null);

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('src/stores/campaigns', () => ({
  useCampaignStore: () => ({
    get saving() {
      return mockSaving.value;
    },
    get error() {
      return mockError.value;
    },
    get currentCampaign() {
      return mockCurrentCampaign.value;
    },
    selectCampaign: mockSelectCampaign,
    createCampaign: mockCreateCampaign,
    updateCampaign: mockUpdateCampaign,
  }),
}));

vi.mock('src/composables/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    showWarning: vi.fn(),
  }),
}));

vi.mock('src/constants/validation', () => ({
  MAX_CAMPAIGN_NAME_LENGTH: 100,
  MIN_CAMPAIGN_MODIFIER: -10,
  MAX_CAMPAIGN_MODIFIER: 10,
}));

describe('CampaignFormPage', () => {
  const stubs = {
    QPage: { template: '<div class="q-page"><slot /></div>' },
    QCard: { template: '<div class="q-card"><slot /></div>' },
    QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
    QCardActions: { template: '<div class="q-card-actions"><slot /></div>' },
    QInput: {
      template:
        '<input class="q-input" :type="type || \'text\'" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'label', 'type', 'maxlength'],
      emits: ['update:modelValue'],
    },
    QBtn: {
      template:
        '<button class="q-btn" :disabled="disable" @click="$emit(\'click\')">{{ label }}</button>',
      props: ['label', 'loading', 'disable', 'color', 'flat', 'type'],
      emits: ['click'],
    },
    QSeparator: { template: '<hr />' },
    QSpinnerDots: { template: '<div class="q-spinner-dots" />', props: ['size', 'color'] },
    QBanner: { template: '<div class="q-banner"><slot /></div>' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaving.value = false;
    mockError.value = null;
    mockCurrentCampaign.value = null;
  });

  describe('create mode', () => {
    const createWrapper = () =>
      shallowMount(CampaignFormPage, {
        props: {},
        global: { stubs },
      });

    it('renders create title', () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Create Campaign');
    });

    it('renders form fields', () => {
      const wrapper = createWrapper();
      const inputs = wrapper.findAll('.q-input');
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });

    it('renders Create button', () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Create');
    });

    it('renders modifier inputs', () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain('Hero Budget Modifiers');
    });

    it('Create button is disabled when name is empty', () => {
      const wrapper = createWrapper();
      const createBtn = wrapper.findAll('.q-btn').find((b) => b.text() === 'Create');
      expect(createBtn?.attributes('disabled')).toBeDefined();
    });

    it('calls createCampaign on submit', async () => {
      mockCreateCampaign.mockResolvedValue({ id: 5 });
      const wrapper = createWrapper();

      const inputs = wrapper.findAll('.q-input');
      await inputs[0]!.setValue('New Campaign');

      const createBtn = wrapper.findAll('.q-btn').find((b) => b.text() === 'Create');
      await createBtn!.trigger('click');
      await flushPromises();

      expect(mockCreateCampaign).toHaveBeenCalled();
    });
  });

  describe('edit mode', () => {
    const createWrapper = () => {
      mockCurrentCampaign.value = {
        id: 3,
        name: 'Existing Campaign',
        description: 'A description',
        talentsModifier: 2,
        skillsModifier: 1,
        expertisesModifier: 0,
      };
      return shallowMount(CampaignFormPage, {
        props: { campaignId: '3' },
        global: { stubs },
      });
    };

    it('renders edit title', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.text()).toContain('Edit Campaign');
    });

    it('renders Save button', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.text()).toContain('Save');
    });

    it('shows error for invalid campaign ID', async () => {
      mockCurrentCampaign.value = null;
      const wrapper = shallowMount(CampaignFormPage, {
        props: { campaignId: 'abc' },
        global: { stubs },
      });
      await flushPromises();

      expect(wrapper.text()).toContain('Invalid campaign ID');
    });
  });
});
