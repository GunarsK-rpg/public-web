import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import RadiantPathPanel from './RadiantPathPanel.vue';
import type { Talent } from 'src/types';
import { classifierStore } from 'src/__tests__/mockStores';

// Mock classifiers store
const mockRadiantOrders = [
  {
    id: 1,
    code: 'order-light',
    name: 'Order of Light',
    surge1: { id: 10, code: 'surge-fire', name: 'Fire Surge' },
    surge2: { id: 11, code: 'surge-ice', name: 'Ice Surge' },
  },
  {
    id: 2,
    code: 'order-shadow',
    name: 'Order of Shadow',
    surge1: { id: 20, code: 'surge-dark', name: 'Dark Surge' },
    surge2: { id: 21, code: 'surge-void', name: 'Void Surge' },
  },
];

const mockSurges = [
  { id: 10, code: 'surge-fire', name: 'Fire Surge' },
  { id: 11, code: 'surge-ice', name: 'Ice Surge' },
  { id: 20, code: 'surge-dark', name: 'Dark Surge' },
  { id: 21, code: 'surge-void', name: 'Void Surge' },
];

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () =>
    classifierStore({ radiantOrders: mockRadiantOrders, surges: mockSurges }),
}));

// Mock talent prerequisites composable
const mockGetTalentsByRadiantOrder = vi.fn();
const mockGetRadiantOrderKeyTalent = vi.fn();
const mockGetTalentsBySurge = vi.fn();
const mockMapTalentsWithStatus = vi.fn();
const mockIsTalentSelected = vi.fn();

vi.mock('src/composables/useTalentPrerequisites', () => ({
  useTalentPrerequisites: () => ({
    getTalentsByRadiantOrder: mockGetTalentsByRadiantOrder,
    getRadiantOrderKeyTalent: mockGetRadiantOrderKeyTalent,
    getTalentsBySurge: mockGetTalentsBySurge,
    mapTalentsWithStatus: mockMapTalentsWithStatus,
    isTalentSelected: mockIsTalentSelected,
  }),
}));

// Mock arrayUtils
vi.mock('src/utils/arrayUtils', () => ({
  findById: (arr: { id: number; name?: string }[], id: number | null | undefined) =>
    arr.find((item) => item.id === id),
}));

describe('RadiantPathPanel', () => {
  const createKeyTalent = (): Talent => ({
    id: 100,
    code: 'radiant-key',
    name: 'Radiant Mastery',
    description: 'Key talent for radiant order',
    isKey: true,
    path: null,
    specialties: [],
    ancestry: null,
    radiantOrder: { id: 1, code: 'order-light', name: 'Order of Light' },
    surge: null,
    special: [],
  });

  const createWrapper = (props: { orderId: number | null; idealLevel: number }) =>
    mount(RadiantPathPanel, {
      props,
      global: {
        stubs: {
          QExpansionItem: {
            template: `<div class="q-expansion-item" :aria-label="$attrs['aria-label']">
              <div class="expansion-header"><slot name="header" /></div>
              <div class="expansion-content"><slot /></div>
            </div>`,
          },
          QItemSection: {
            template: '<div class="q-item-section"><slot /></div>',
          },
          QItemLabel: {
            template: '<div class="q-item-label"><slot /></div>',
          },
          QIcon: {
            template: '<span class="q-icon" />',
          },
          QBtn: {
            template: '<button class="q-btn" @click="$emit(\'click\', $event)"><slot /></button>',
            emits: ['click'],
          },
          QTooltip: {
            template: '<span class="q-tooltip"><slot /></span>',
          },
          QCard: {
            template: '<div class="q-card"><slot /></div>',
          },
          QCardSection: {
            template: '<div class="q-card-section"><slot /></div>',
          },
          QSlider: {
            template: `<input
              type="range"
              class="q-slider"
              :value="modelValue"
              :min="min"
              :max="max"
              @input="$emit('update:modelValue', parseInt($event.target.value))"
            />`,
            props: ['modelValue', 'min', 'max', 'step'],
            emits: ['update:modelValue'],
          },
          QBtnToggle: {
            template: `<div class="q-btn-toggle">
              <button
                v-for="opt in options"
                :key="opt.value"
                :class="{ active: modelValue === opt.value }"
                @click="$emit('update:modelValue', opt.value)"
              >{{ opt.label }}</button>
            </div>`,
            props: ['modelValue', 'options'],
            emits: ['update:modelValue'],
          },
          KeyTalentBanner: {
            template: '<div class="key-talent-banner">{{ talent?.name }}</div>',
            props: ['talent', 'label'],
          },
          TalentListPanel: {
            template: `<div class="talent-list-panel" :data-label="label">
              <button class="toggle-btn" @click="$emit('toggleTalent', 1, true)">Toggle</button>
              <button class="details-btn" @click="$emit('showDetails', { id: 1, name: 'Test' })">Details</button>
            </div>`,
            props: ['label', 'talents', 'emptyMessage'],
            emits: ['toggleTalent', 'showDetails'],
          },
        },
      },
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockGetTalentsByRadiantOrder.mockReturnValue([]);
    mockGetRadiantOrderKeyTalent.mockReturnValue(createKeyTalent());
    mockGetTalentsBySurge.mockReturnValue([]);
    mockMapTalentsWithStatus.mockReturnValue([]);
    mockIsTalentSelected.mockReturnValue(false);
  });

  // ========================================
  // Basic Rendering
  // ========================================
  describe('basic rendering', () => {
    it('renders order name in header', () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      expect(wrapper.text()).toContain('Order of Light');
    });

    it('shows Select Order when no order selected', () => {
      const wrapper = createWrapper({ orderId: null, idealLevel: 0 });

      expect(wrapper.text()).toContain('Select Order');
    });

    it('renders ideal level in header', () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 4 });

      expect(wrapper.text()).toContain('Ideal 4');
    });

    it('renders key talent banner when order selected', () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      expect(wrapper.find('.key-talent-banner').exists()).toBe(true);
      expect(wrapper.text()).toContain('Radiant Mastery');
    });

    it('does not render key talent banner when no order', () => {
      mockGetRadiantOrderKeyTalent.mockReturnValue(null);

      const wrapper = createWrapper({ orderId: null, idealLevel: 0 });

      expect(wrapper.find('.key-talent-banner').exists()).toBe(false);
    });

    it('renders talent list panel', () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      expect(wrapper.find('.talent-list-panel').exists()).toBe(true);
    });
  });

  // ========================================
  // Ideal Level Slider
  // ========================================
  describe('ideal level slider', () => {
    it('renders slider with correct value', () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      const slider = wrapper.find('.q-slider');
      expect(slider.attributes('value')).toBe('3');
    });

    it('emits update:idealLevel when slider changes', async () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      const slider = wrapper.find('.q-slider');
      await slider.setValue(5);

      expect(wrapper.emitted('update:idealLevel')).toBeTruthy();
      expect(wrapper.emitted('update:idealLevel')?.[0]).toEqual([5]);
    });

    it('slider has min 0 and max 5', () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      const slider = wrapper.find('.q-slider');
      expect(slider.attributes('min')).toBe('0');
      expect(slider.attributes('max')).toBe('5');
    });
  });

  // ========================================
  // Tab Selection
  // ========================================
  describe('tab selection', () => {
    it('renders surge tab options', () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      expect(wrapper.text()).toContain('Fire Surge');
      expect(wrapper.text()).toContain('Ice Surge');
    });

    it('renders order tab option', () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      expect(wrapper.text()).toContain('Order of Light');
    });

    it('defaults to order tab', () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      const toggle = wrapper.find('.q-btn-toggle');
      const activeButton = toggle.find('button.active');
      expect(activeButton?.text()).toContain('Order of Light');
    });
  });

  // ========================================
  // Talent Count
  // ========================================
  describe('talent count', () => {
    it('shows selected talent count', () => {
      mockGetTalentsByRadiantOrder.mockReturnValue([{ id: 1 }, { id: 2 }]);
      mockIsTalentSelected.mockImplementation((id: number) => id === 1);

      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      expect(wrapper.text()).toContain('1 talents selected');
    });

    it('includes surge talents in count', () => {
      mockGetTalentsByRadiantOrder.mockReturnValue([{ id: 1 }]);
      mockGetTalentsBySurge.mockImplementation((surgeId: number) => {
        if (surgeId === 10) return [{ id: 2 }];
        if (surgeId === 11) return [{ id: 3 }];
        return [];
      });
      mockIsTalentSelected.mockReturnValue(true);

      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      expect(wrapper.text()).toContain('3 talents selected');
    });

    it('shows 0 when no order selected', () => {
      const wrapper = createWrapper({ orderId: null, idealLevel: 0 });

      expect(wrapper.text()).toContain('0 talents selected');
    });
  });

  // ========================================
  // Events
  // ========================================
  describe('events', () => {
    it('has remove button in header', () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      // The remove button exists in the header
      const removeBtn = wrapper.find('.expansion-header .q-btn');
      expect(removeBtn.exists()).toBe(true);
    });

    it('emits toggleTalent from talent list', async () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      await wrapper.find('.toggle-btn').trigger('click');

      expect(wrapper.emitted('toggleTalent')).toBeTruthy();
    });

    it('emits showDetails from talent list', async () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      await wrapper.find('.details-btn').trigger('click');

      expect(wrapper.emitted('showDetails')).toBeTruthy();
    });
  });

  // ========================================
  // Accessibility
  // ========================================
  describe('accessibility', () => {
    it('has descriptive aria-label', () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      const expansionItem = wrapper.find('.q-expansion-item');
      expect(expansionItem.attributes('aria-label')).toContain('Order of Light order talents');
    });

    it('has aria-label on remove button', () => {
      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      expect(wrapper.text()).toContain('Remove Radiant path');
    });
  });

  // ========================================
  // Talent Filtering
  // ========================================
  describe('talent filtering', () => {
    it('filters out key talents from order list', async () => {
      mockGetTalentsByRadiantOrder.mockReturnValue([
        { id: 1, isKey: true },
        { id: 2, isKey: false },
      ]);
      mockMapTalentsWithStatus.mockImplementation((talents: Talent[]) =>
        talents.map((t) => ({ talent: t, available: true, unmetPrereqs: [] }))
      );

      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      // Switch to order tab to trigger orderTalentsWithStatus computed
      const orderTabBtn = wrapper.find('.q-btn-toggle button');
      expect(orderTabBtn.exists()).toBe(true);
      await orderTabBtn.trigger('click');

      // mapTalentsWithStatus should be called with non-key talents only
      expect(mockMapTalentsWithStatus).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 2, isKey: false })])
      );
      // Verify key talent was excluded
      expect(mockMapTalentsWithStatus).not.toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 1, isKey: true })])
      );
    });
  });

  // ========================================
  // Empty State
  // ========================================
  describe('empty state', () => {
    it('shows empty message when no talents available', () => {
      mockMapTalentsWithStatus.mockReturnValue([]);

      const wrapper = createWrapper({ orderId: 1, idealLevel: 3 });

      // TalentListPanel receives emptyMessage prop and renders
      const panel = wrapper.find('.talent-list-panel');
      expect(panel.exists()).toBe(true);
      // Verify component doesn't crash with empty talent list
      expect(wrapper.text()).toContain('0 talents selected');
    });
  });
});
