import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { useNpcEditState } from './useNpcEditState';
import type { Npc } from 'src/types';

const mockTier = { id: 1, code: 'common', name: 'Common' };
const mockTier2 = { id: 2, code: 'rare', name: 'Rare' };
const mockAttr = { id: 10, code: 'str', name: 'Strength' };
const mockAttrType = { id: 20, code: 'physical', name: 'Physical' };

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    tiers: [mockTier, mockTier2],
    attributes: [mockAttr],
    attributeTypes: [mockAttrType],
  }),
}));

function makeMockNpc(overrides?: Partial<Npc>): Npc {
  return {
    id: 1,
    campaignId: 10,
    name: 'Goblin',
    tier: { ...mockTier },
    type: 'minion',
    isCompanion: false,
    createdBy: 1,
    size: 'Medium',
    languages: null,
    description: null,
    tactics: null,
    immunities: null,
    attributes: [{ type: { ...mockAttr }, value: 3 }],
    defenses: [{ type: { ...mockAttrType }, value: 12 }],
    skills: [],
    derivedStats: [],
    features: [{ name: 'Sneak', display_value: '+2' }],
    actions: [{ name: 'Bite', display_value: '1d4', activation_type: 'fast' }],
    opportunities: [],
    ...overrides,
  };
}

describe('useNpcEditState', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function setup(createMode = false) {
    const campaignId = ref(10);
    const isCreateMode = ref(createMode);
    return useNpcEditState(campaignId, isCreateMode);
  }

  // ========================================
  // canEdit
  // ========================================
  describe('canEdit', () => {
    it('is false when npc is null', () => {
      const state = setup();
      expect(state.canEdit.value).toBe(false);
    });

    it('is true when createdBy is not null', () => {
      const state = setup();
      state.npc.value = makeMockNpc({ createdBy: 1 });
      expect(state.canEdit.value).toBe(true);
    });

    it('is false when createdBy is null (handbook NPC)', () => {
      const state = setup();
      state.npc.value = makeMockNpc({ createdBy: null });
      expect(state.canEdit.value).toBe(false);
    });
  });

  // ========================================
  // isFormValid
  // ========================================
  describe('isFormValid', () => {
    it('is false when editableNpc is null', () => {
      const state = setup();
      expect(state.isFormValid.value).toBe(false);
    });

    it('is true when all required fields are filled', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();
      expect(state.isFormValid.value).toBe(true);
    });

    it('is false when name is empty', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();
      state.onFieldUpdate('name', '');
      expect(state.isFormValid.value).toBe(false);
    });

    it('is false when name is whitespace only', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();
      state.onFieldUpdate('name', '   ');
      expect(state.isFormValid.value).toBe(false);
    });

    it('is false when size is empty', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();
      state.onFieldUpdate('size', '');
      expect(state.isFormValid.value).toBe(false);
    });
  });

  // ========================================
  // startEdit
  // ========================================
  describe('startEdit', () => {
    it('sets editing to true and creates editable clone', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();

      expect(state.editing.value).toBe(true);
      expect(state.editableNpc.value).not.toBeNull();
      expect(state.editableNpc.value!.name).toBe('Goblin');
    });

    it('does not modify original npc', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();
      state.editableNpc.value!.name = 'Modified';

      expect(state.npc.value.name).toBe('Goblin');
    });

    it('does nothing when npc is null', () => {
      const state = setup();
      state.startEdit();
      expect(state.editing.value).toBe(false);
    });

    it('does nothing for handbook NPCs (canEdit false)', () => {
      const state = setup();
      state.npc.value = makeMockNpc({ createdBy: null });
      state.startEdit();
      expect(state.editing.value).toBe(false);
    });

    it('deep clones arrays so edits do not leak', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();
      state.editableNpc.value!.attributes[0]!.value = 99;

      expect(state.npc.value.attributes[0]!.value).toBe(3);
    });
  });

  // ========================================
  // cloneAsNew
  // ========================================
  describe('cloneAsNew', () => {
    it('clones NPC with id=0 and appended (Copy) name', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.cloneAsNew();

      expect(state.editing.value).toBe(true);
      expect(state.isClone.value).toBe(true);
      expect(state.editableNpc.value!.id).toBe(0);
      expect(state.editableNpc.value!.name).toBe('Goblin (Copy)');
      expect(state.editableNpc.value!.campaignId).toBe(10);
    });

    it('does nothing when npc is null', () => {
      const state = setup();
      state.cloneAsNew();
      expect(state.editing.value).toBe(false);
    });
  });

  // ========================================
  // cancelEdit
  // ========================================
  describe('cancelEdit', () => {
    it('returns goBack in create mode', () => {
      const state = setup(true);
      expect(state.cancelEdit()).toBe('goBack');
    });

    it('resets editing state and restores original', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();
      state.editableNpc.value!.name = 'Modified';

      const result = state.cancelEdit();

      expect(result).toBe('stay');
      expect(state.editing.value).toBe(false);
      expect(state.editableNpc.value!.name).toBe('Goblin');
    });

    it('clears isClone flag', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.cloneAsNew();
      expect(state.isClone.value).toBe(true);

      state.cancelEdit();
      expect(state.isClone.value).toBe(false);
    });
  });

  // ========================================
  // onFieldUpdate
  // ========================================
  describe('onFieldUpdate', () => {
    it('updates string fields', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();

      state.onFieldUpdate('name', 'Troll');
      expect(state.editableNpc.value!.name).toBe('Troll');

      state.onFieldUpdate('size', 'Large');
      expect(state.editableNpc.value!.size).toBe('Large');

      state.onFieldUpdate('type', 'boss');
      expect(state.editableNpc.value!.type).toBe('boss');
    });

    it('sets nullable fields to null on empty string', () => {
      const state = setup();
      state.npc.value = makeMockNpc({ languages: 'Common', description: 'A goblin' });
      state.startEdit();

      state.onFieldUpdate('languages', '');
      expect(state.editableNpc.value!.languages).toBeNull();

      state.onFieldUpdate('description', '');
      expect(state.editableNpc.value!.description).toBeNull();
    });

    it('updates tier by code', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();

      state.onFieldUpdate('tierCode', 'rare');
      expect(state.editableNpc.value!.tier.code).toBe('rare');
      expect(state.editableNpc.value!.tier.name).toBe('Rare');
    });

    it('updates boolean fields', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();

      state.onFieldUpdate('isCompanion', true);
      expect(state.editableNpc.value!.isCompanion).toBe(true);
    });

    it('does nothing when editableNpc is null', () => {
      const state = setup();
      state.onFieldUpdate('name', 'Test');
      // No error thrown
    });
  });

  // ========================================
  // onStatUpdate
  // ========================================
  describe('onStatUpdate', () => {
    it('updates attribute value by code', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();

      state.onStatUpdate('attributes', 'str', 5);
      expect(state.editableNpc.value!.attributes[0]!.value).toBe(5);
    });

    it('ignores unknown sections', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();

      state.onStatUpdate('features', 'str', 5);
      // No error, features are not stat sections
    });

    it('does nothing when editableNpc is null', () => {
      const state = setup();
      state.onStatUpdate('attributes', 'str', 5);
      // No error thrown
    });
  });

  // ========================================
  // buildPayload
  // ========================================
  describe('buildPayload', () => {
    it('builds upsert payload with id for edit mode', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();

      const payload = state.buildPayload('1');

      expect(payload.id).toBe(1);
      expect(payload.campaignId).toBe(10);
      expect(payload.name).toBe('Goblin');
      expect(payload.tier).toEqual({ code: 'common' });
      expect(payload.type).toBe('minion');
      expect(payload.size).toBe('Medium');
    });

    it('omits id in create mode', () => {
      const state = setup(true);
      state.npc.value = makeMockNpc();
      state.startEdit();

      const payload = state.buildPayload('1');

      expect(payload.id).toBeUndefined();
    });

    it('omits id for cloned NPCs', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.cloneAsNew();

      const payload = state.buildPayload('1');

      expect(payload.id).toBeUndefined();
    });

    it('filters out zero-value attributes but keeps all defenses', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();
      state.editableNpc.value!.attributes[0]!.value = 0;

      const payload = state.buildPayload('1');

      expect(payload.attributes).toHaveLength(0);
      expect(payload.defenses).toHaveLength(1);
    });

    it('trims string fields', () => {
      const state = setup();
      state.npc.value = makeMockNpc();
      state.startEdit();
      state.editableNpc.value!.name = '  Spaced Name  ';
      state.editableNpc.value!.size = '  Large  ';

      const payload = state.buildPayload('1');

      expect(payload.name).toBe('Spaced Name');
      expect(payload.size).toBe('Large');
    });

    it('converts empty nullable strings to null', () => {
      const state = setup();
      state.npc.value = makeMockNpc({ languages: '   ', description: '   ' });
      state.startEdit();

      const payload = state.buildPayload('1');

      expect(payload.languages).toBeNull();
      expect(payload.description).toBeNull();
    });
  });

  // ========================================
  // buildEmptyNpc
  // ========================================
  describe('buildEmptyNpc', () => {
    it('creates NPC with classifier defaults', () => {
      const state = setup();
      const empty = state.buildEmptyNpc();

      expect(empty.id).toBe(0);
      expect(empty.campaignId).toBe(10);
      expect(empty.name).toBe('');
      expect(empty.tier.code).toBe('common');
      expect(empty.type).toBe('minion');
      expect(empty.attributes).toHaveLength(1);
      expect(empty.attributes[0]!.value).toBe(0);
      expect(empty.defenses).toHaveLength(1);
      expect(empty.defenses[0]!.value).toBe(10);
    });
  });
});
