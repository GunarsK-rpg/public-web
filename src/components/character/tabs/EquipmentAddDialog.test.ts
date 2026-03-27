import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import EquipmentAddDialog from './EquipmentAddDialog.vue';
import type { HeroEquipment, AppliedModification, ModificationClassifier } from 'src/types';

// =============================================================================
// Mocks
// =============================================================================

const mockUpdateEquipment = vi.fn();
const mockAddEquipment = vi.fn().mockResolvedValue(true);
const mockAddCustomEquipment = vi.fn().mockResolvedValue(true);
const mockSaving = ref(false);
const mockHero = ref<{ id: number } | null>({ id: 1 });

vi.mock('src/stores/hero', () => ({
  useHeroStore: () => ({
    get saving() {
      return mockSaving.value;
    },
    get hero() {
      return mockHero.value;
    },
    updateEquipment: mockUpdateEquipment,
    addEquipment: mockAddEquipment,
    addCustomEquipment: mockAddCustomEquipment,
  }),
}));

const mockModifications: ModificationClassifier[] = [
  {
    id: 10,
    code: 'keen_edge',
    name: 'Keen Edge',
    description: null,
    modType: 'upgrade',
    category: 'item',
    tier: 'basic',
    equipment: null,
    special: [{ type: 'roll_modifier', display_value: 'Advantage' }],
    displayOrder: 0,
  },
  {
    id: 11,
    code: 'heavy',
    name: 'Heavy',
    description: null,
    modType: 'drawback',
    category: 'item',
    tier: 'basic',
    equipment: null,
    special: [{ type: 'die_modifier', value: -1 }],
    displayOrder: 1,
  },
  {
    id: 12,
    code: 'fabrial_boost',
    name: 'Fabrial Boost',
    description: null,
    modType: 'upgrade',
    category: 'fabrial',
    tier: 'basic',
    equipment: null,
    special: [{ type: 'die_modifier', value: 1 }],
    displayOrder: 2,
  },
];

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    initialized: true,
    equipment: [
      {
        id: 1,
        code: 'longsword',
        name: 'Longsword',
        equipType: { id: 1, code: 'weapon', name: 'Weapon' },
        maxCharges: null,
      },
    ],
    equipmentTypes: [
      { id: 1, code: 'weapon', name: 'Weapon' },
      { id: 2, code: 'armor', name: 'Armor' },
      { id: 3, code: 'fabrial', name: 'Fabrial' },
    ],
    get modifications() {
      return mockModifications;
    },
  }),
}));

const mockHandleError = vi.fn();

vi.mock('src/composables/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
  }),
}));

const mockAddModification = vi.fn();
const mockRemoveModification = vi.fn();

vi.mock('src/services/equipmentApi', () => ({
  default: {
    get addModification() {
      return mockAddModification;
    },
    get removeModification() {
      return mockRemoveModification;
    },
  },
}));

// =============================================================================
// Helpers
// =============================================================================

function createHeroEquipment(overrides: Partial<HeroEquipment> = {}): HeroEquipment {
  return {
    id: 100,
    heroId: 1,
    equipment: { id: 1, code: 'longsword', name: 'Longsword' },
    equipType: { id: 1, code: 'weapon', name: 'Weapon' },
    special: [
      { type: 'damage', display_value: '1d{dice_size}', value: 8 },
      { type: 'range', display_value: 'Melee' },
    ],
    specialOverrides: [],
    charges: null,
    maxCharges: null,
    amount: 1,
    isEquipped: true,
    customName: null,
    notes: null,
    modifications: [],
    ...overrides,
  };
}

const stubs = {
  QDialog: { template: '<div class="q-dialog"><slot /></div>', props: ['modelValue'] },
  QCard: { template: '<div class="q-card"><slot /></div>' },
  QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
  QCardActions: { template: '<div class="q-card-actions"><slot /></div>' },
  QSeparator: { template: '<hr />' },
  QSpace: { template: '<span />' },
  QBtn: {
    template:
      '<button class="q-btn" :disabled="$attrs.disable" :aria-label="$attrs[\'aria-label\']" @click="$emit(\'click\')"><slot /></button>',
  },
  QBtnToggle: {
    template: '<div class="q-btn-toggle" />',
    props: ['modelValue', 'options'],
    emits: ['update:modelValue'],
  },
  QSelect: {
    template: '<select class="q-select" :aria-label="$attrs[\'aria-label\']" />',
    props: ['modelValue', 'options', 'label'],
    emits: ['update:modelValue', 'filter'],
  },
  QInput: {
    template: '<input class="q-input" :aria-label="$attrs[\'aria-label\']" />',
    props: ['modelValue', 'label', 'type'],
    emits: ['update:modelValue'],
  },
  QItem: { template: '<div class="q-item"><slot /></div>' },
  QItemSection: { template: '<div class="q-item-section"><slot /></div>' },
  QList: { template: '<div class="q-list"><slot /></div>' },
  ModificationLabel: false,
};

// <script setup> does not expose internal refs on wrapper.vm.
// This helper centralizes the type assertion for all internal state access.
interface DialogVm {
  selectedModification: ModificationClassifier | null;
  availableModifications: ModificationClassifier[];
  newModType: string;
  newModValue: string;
  statDamageValue: number | null;
  statRange: string;
  statDeflect: number | null;
  mode: string;
  customTypeId: number | null;
  customName: string;
  showDamage: boolean;
  showRange: boolean;
  onSave: () => Promise<void>;
}

function getVm(wrapper: ReturnType<typeof shallowMount>): DialogVm {
  return wrapper.vm as unknown as DialogVm;
}

/** Mount with modelValue=false, then set props to trigger the watch. */
async function mountInEditMode(editItem: HeroEquipment) {
  const wrapper = shallowMount(EquipmentAddDialog, {
    props: { modelValue: false, editItem: null },
    global: { stubs },
  });
  await wrapper.setProps({ modelValue: true, editItem });
  await wrapper.vm.$nextTick();
  return wrapper;
}

async function mountInAddMode(equipmentTypeId?: number) {
  const wrapper = shallowMount(EquipmentAddDialog, {
    props: { modelValue: false },
    global: { stubs },
  });
  const setPropsPayload: Record<string, unknown> = { modelValue: true };
  if (equipmentTypeId != null) setPropsPayload.equipmentTypeId = equipmentTypeId;
  await wrapper.setProps(setPropsPayload);
  await wrapper.vm.$nextTick();
  return wrapper;
}

// =============================================================================
// Tests
// =============================================================================

describe('EquipmentAddDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSaving.value = false;
    mockHero.value = { id: 1 };
  });

  describe('edit mode - modifications display', () => {
    it('renders applied classifier modifications', async () => {
      const mods: AppliedModification[] = [
        {
          id: 1,
          modType: 'upgrade',
          modification: { id: 10, code: 'keen_edge', name: 'Keen Edge' },
          special: [{ type: 'roll_modifier', display_value: 'Advantage' }],
          customText: null,
          tier: 'basic',
        },
      ];
      const wrapper = await mountInEditMode(createHeroEquipment({ modifications: mods }));

      expect(wrapper.text()).toContain('Keen Edge');
      expect(wrapper.text()).toContain('+');
    });

    it('renders custom text modifications', async () => {
      const mods: AppliedModification[] = [
        {
          id: 2,
          modType: 'drawback',
          modification: null,
          special: [],
          customText: 'GM cursed this item',
          tier: null,
        },
      ];
      const wrapper = await mountInEditMode(createHeroEquipment({ modifications: mods }));

      expect(wrapper.text()).toContain('GM cursed this item');
      expect(wrapper.text()).toContain('-');
    });

    it('renders mixed classifier and custom modifications', async () => {
      const mods: AppliedModification[] = [
        {
          id: 1,
          modType: 'upgrade',
          modification: { id: 10, code: 'keen_edge', name: 'Keen Edge' },
          special: [],
          customText: null,
          tier: 'basic',
        },
        {
          id: 2,
          modType: 'drawback',
          modification: null,
          special: [],
          customText: 'Slightly damaged',
          tier: null,
        },
      ];
      const wrapper = await mountInEditMode(createHeroEquipment({ modifications: mods }));

      expect(wrapper.text()).toContain('Keen Edge');
      expect(wrapper.text()).toContain('Slightly damaged');
    });
  });

  describe('edit mode - classifier modification picker', () => {
    it('shows modification picker in edit mode', async () => {
      const wrapper = await mountInEditMode(createHeroEquipment());

      const selects = wrapper.findAll('.q-select');
      const modSelect = selects.find((s) => s.attributes('aria-label') === 'Select modification');
      expect(modSelect?.exists()).toBe(true);
    });

    it('calls API when adding classifier modification', async () => {
      const updatedEquipment = createHeroEquipment({
        modifications: [
          {
            id: 1,
            modType: 'upgrade',
            modification: { id: 10, code: 'keen_edge', name: 'Keen Edge' },
            special: [{ type: 'roll_modifier', display_value: 'Advantage' }],
            customText: null,
            tier: 'basic',
          },
        ],
      });
      mockAddModification.mockResolvedValueOnce({ data: updatedEquipment });

      const wrapper = await mountInEditMode(createHeroEquipment());

      getVm(wrapper).selectedModification = mockModifications[0]!;
      await wrapper.vm.$nextTick();

      const addBtn = wrapper.find('button[aria-label="Add classifier modification"]');
      await addBtn.trigger('click');
      // Wait for async operations
      await flushPromises();

      expect(mockAddModification).toHaveBeenCalledWith(1, 100, {
        equipmentId: 100,
        modification: { code: 'keen_edge' },
      });
    });

    it('filters out already-applied modifications', async () => {
      const mods: AppliedModification[] = [
        {
          id: 1,
          modType: 'upgrade',
          modification: { id: 10, code: 'keen_edge', name: 'Keen Edge' },
          special: [],
          customText: null,
          tier: 'basic',
        },
      ];
      const wrapper = await mountInEditMode(createHeroEquipment({ modifications: mods }));

      const available = getVm(wrapper).availableModifications;
      expect(available.find((m) => m.code === 'keen_edge')).toBeUndefined();
      expect(available.find((m) => m.code === 'heavy')).toBeDefined();
    });
  });

  describe('edit mode - custom modification', () => {
    it('calls API when adding custom modification', async () => {
      const updatedEquipment = createHeroEquipment({
        modifications: [
          {
            id: 3,
            modType: 'drawback',
            modification: null,
            special: [],
            customText: 'Cursed by GM',
            tier: null,
          },
        ],
      });
      mockAddModification.mockResolvedValueOnce({ data: updatedEquipment });

      const wrapper = await mountInEditMode(createHeroEquipment());

      const vm = getVm(wrapper);
      vm.newModType = 'drawback';
      vm.newModValue = 'Cursed by GM';
      await wrapper.vm.$nextTick();

      const addBtn = wrapper.find('button[aria-label="Add custom modification"]');
      await addBtn.trigger('click');
      await flushPromises();

      expect(mockAddModification).toHaveBeenCalledWith(1, 100, {
        equipmentId: 100,
        customText: 'Cursed by GM',
        modType: 'drawback',
      });
    });
  });

  describe('edit mode - remove modification', () => {
    it('calls API when removing modification', async () => {
      mockRemoveModification.mockResolvedValueOnce({ status: 204 });

      const mods: AppliedModification[] = [
        {
          id: 5,
          modType: 'upgrade',
          modification: { id: 10, code: 'keen_edge', name: 'Keen Edge' },
          special: [],
          customText: null,
          tier: 'basic',
        },
      ];
      const wrapper = await mountInEditMode(createHeroEquipment({ modifications: mods }));

      const removeBtn = wrapper.find('button[aria-label="Remove modification"]');
      await removeBtn.trigger('click');
      await flushPromises();

      expect(mockRemoveModification).toHaveBeenCalledWith(1, 100, 5);
    });
  });

  describe('edit mode - stat inputs', () => {
    it('pre-fills damage from effective special', async () => {
      const wrapper = await mountInEditMode(
        createHeroEquipment({
          special: [{ type: 'damage', display_value: '1d{dice_size}', value: 8 }],
        })
      );

      expect(getVm(wrapper).statDamageValue).toBe(8);
    });

    it('pre-fills damage from specialOverrides when present', async () => {
      const wrapper = await mountInEditMode(
        createHeroEquipment({
          special: [{ type: 'damage', display_value: '1d{dice_size}', value: 8 }],
          specialOverrides: [{ type: 'damage', display_value: '1d{dice_size}', value: 10 }],
        })
      );

      expect(getVm(wrapper).statDamageValue).toBe(10);
    });

    it('pre-fills range from effective special', async () => {
      const wrapper = await mountInEditMode(
        createHeroEquipment({
          special: [{ type: 'range', display_value: '80/320' }],
        })
      );

      expect(getVm(wrapper).statRange).toBe('80/320');
    });

    it('pre-fills deflect from effective special', async () => {
      const wrapper = await mountInEditMode(
        createHeroEquipment({
          equipType: { id: 2, code: 'armor', name: 'Armor' },
          special: [{ type: 'deflect', value: 3 }],
        })
      );

      expect(getVm(wrapper).statDeflect).toBe(3);
    });
  });

  describe('edit mode - save payload', () => {
    it('includes specialOverrides in save payload', async () => {
      mockUpdateEquipment.mockResolvedValueOnce(undefined);

      const wrapper = await mountInEditMode(
        createHeroEquipment({
          special: [{ type: 'damage', display_value: '1d{dice_size}', value: 8 }],
        })
      );

      const vm = getVm(wrapper);
      vm.statDamageValue = 10;
      await wrapper.vm.$nextTick();

      await vm.onSave();

      expect(mockUpdateEquipment).toHaveBeenCalledWith(
        100,
        expect.objectContaining({
          specialOverrides: expect.arrayContaining([
            expect.objectContaining({ type: 'damage', value: 10 }),
          ]),
        })
      );
    });

    it('preserves non-stat mod-derived specials in save payload', async () => {
      mockUpdateEquipment.mockResolvedValueOnce(undefined);

      const mods: AppliedModification[] = [
        {
          id: 1,
          modType: 'upgrade',
          modification: { id: 10, code: 'keen_edge', name: 'Keen Edge' },
          special: [{ type: 'roll_modifier', display_value: 'Advantage' }],
          customText: null,
          tier: 'basic',
        },
      ];
      const wrapper = await mountInEditMode(createHeroEquipment({ modifications: mods }));

      await getVm(wrapper).onSave();

      expect(mockUpdateEquipment).toHaveBeenCalledWith(
        100,
        expect.objectContaining({
          specialOverrides: expect.arrayContaining([
            expect.objectContaining({ type: 'roll_modifier', display_value: 'Advantage' }),
          ]),
        })
      );
    });

    it('does not include modifications in save payload', async () => {
      mockUpdateEquipment.mockResolvedValueOnce(undefined);

      const wrapper = await mountInEditMode(createHeroEquipment());

      await getVm(wrapper).onSave();

      expect(mockUpdateEquipment).toHaveBeenCalledTimes(1);
      const payload = mockUpdateEquipment.mock.calls[0]![1] as Record<string, unknown>;
      expect(payload).not.toHaveProperty('modifications');
    });
  });

  describe('custom add mode - stat inputs', () => {
    it('shows stat inputs when type is weapon', async () => {
      const wrapper = await mountInAddMode();

      const vm = getVm(wrapper);
      vm.mode = 'custom';
      vm.customTypeId = 1; // weapon

      expect(vm.showDamage).toBe(true);
      expect(vm.showRange).toBe(true);
    });

    it('includes specialOverrides in custom equipment payload', async () => {
      const wrapper = await mountInAddMode();

      const vm = getVm(wrapper);
      vm.mode = 'custom';
      vm.customTypeId = 1;
      vm.customName = 'Custom Sword';
      vm.statDamageValue = 6;
      vm.statRange = 'Melee';
      await wrapper.vm.$nextTick();

      await vm.onSave();

      expect(mockAddCustomEquipment).toHaveBeenCalledWith(
        'weapon',
        'Custom Sword',
        expect.objectContaining({
          specialOverrides: expect.arrayContaining([
            expect.objectContaining({ type: 'damage', value: 6 }),
            expect.objectContaining({ type: 'range', display_value: 'Melee' }),
          ]),
        })
      );
    });
  });

  describe('modification category filtering', () => {
    it('shows item mods for weapons', async () => {
      const wrapper = await mountInEditMode(
        createHeroEquipment({ equipType: { id: 1, code: 'weapon', name: 'Weapon' } })
      );

      const available = getVm(wrapper).availableModifications;
      expect(available.find((m) => m.code === 'keen_edge')).toBeDefined();
      expect(available.find((m) => m.code === 'heavy')).toBeDefined();
      expect(available.find((m) => m.code === 'fabrial_boost')).toBeUndefined();
    });

    it('shows both item and fabrial mods for fabrials', async () => {
      const wrapper = await mountInEditMode(
        createHeroEquipment({ equipType: { id: 3, code: 'fabrial', name: 'Fabrial' } })
      );

      const available = getVm(wrapper).availableModifications;
      expect(available.find((m) => m.code === 'keen_edge')).toBeDefined();
      expect(available.find((m) => m.code === 'fabrial_boost')).toBeDefined();
    });
  });
});
