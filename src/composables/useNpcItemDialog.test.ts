import { describe, it, expect, beforeEach } from 'vitest';
import { type Ref, ref } from 'vue';
import { useNpcItemDialog } from './useNpcItemDialog';
import type { Npc, NpcFeature, NpcAction } from 'src/types';

function makeMockNpc(overrides?: Partial<Npc>): Npc {
  return {
    id: 1,
    campaignId: 10,
    name: 'Goblin',
    tier: { id: 1, code: 'common', name: 'Common' },
    type: 'minion',
    isCompanion: false,
    createdBy: 1,
    size: 'Medium',
    languages: null,
    description: null,
    tactics: null,
    immunities: null,
    attributes: [],
    defenses: [],
    skills: [],
    derivedStats: [],
    features: [{ name: 'Sneak', display_value: '+2' }],
    actions: [{ name: 'Bite', display_value: '1d4', activation_type: 'fast' }],
    opportunities: [],
    ...overrides,
  };
}

describe('useNpcItemDialog', () => {
  let editableNpc: Ref<Npc | null>;

  beforeEach(() => {
    editableNpc = ref<Npc | null>(makeMockNpc());
  });

  function setup(npc?: Npc | null) {
    editableNpc.value = npc === undefined ? makeMockNpc() : npc;
    return useNpcItemDialog(editableNpc);
  }

  // ========================================
  // onItemAdd
  // ========================================
  describe('onItemAdd', () => {
    it('opens dialog for features with correct label', () => {
      const dialog = setup();
      dialog.onItemAdd('features');

      expect(dialog.showItemDialog.value).toBe(true);
      expect(dialog.dialogItemLabel.value).toBe('Feature');
      expect(dialog.dialogItem.value).toBeNull();
      expect(dialog.dialogShowActivationType.value).toBe(false);
    });

    it('opens dialog for actions with activation type shown', () => {
      const dialog = setup();
      dialog.onItemAdd('actions');

      expect(dialog.showItemDialog.value).toBe(true);
      expect(dialog.dialogItemLabel.value).toBe('Action');
      expect(dialog.dialogShowActivationType.value).toBe(true);
    });

    it('opens dialog for opportunities with correct label', () => {
      const dialog = setup();
      dialog.onItemAdd('opportunities');

      expect(dialog.showItemDialog.value).toBe(true);
      expect(dialog.dialogItemLabel.value).toBe('Opportunity');
      expect(dialog.dialogShowActivationType.value).toBe(false);
    });
  });

  // ========================================
  // onItemEdit
  // ========================================
  describe('onItemEdit', () => {
    it('loads existing feature into dialog', () => {
      const dialog = setup();
      dialog.onItemEdit('features', 0);

      expect(dialog.showItemDialog.value).toBe(true);
      expect(dialog.dialogItem.value).toEqual({ name: 'Sneak', display_value: '+2' });
      expect(dialog.dialogItemLabel.value).toBe('Feature');
    });

    it('loads existing action with activation type shown', () => {
      const dialog = setup();
      dialog.onItemEdit('actions', 0);

      expect(dialog.showItemDialog.value).toBe(true);
      expect(dialog.dialogItem.value).toEqual({
        name: 'Bite',
        display_value: '1d4',
        activation_type: 'fast',
      });
      expect(dialog.dialogShowActivationType.value).toBe(true);
    });

    it('does nothing when editableNpc is null', () => {
      const dialog = setup(null);
      dialog.onItemEdit('features', 0);

      expect(dialog.showItemDialog.value).toBe(false);
    });
  });

  // ========================================
  // onItemRemove
  // ========================================
  describe('onItemRemove', () => {
    it('removes feature at index', () => {
      const dialog = setup();
      expect(editableNpc.value!.features).toHaveLength(1);

      dialog.onItemRemove('features', 0);

      expect(editableNpc.value!.features).toHaveLength(0);
    });

    it('removes action at index', () => {
      const dialog = setup();
      expect(editableNpc.value!.actions).toHaveLength(1);

      dialog.onItemRemove('actions', 0);

      expect(editableNpc.value!.actions).toHaveLength(0);
    });

    it('does nothing when editableNpc is null', () => {
      const dialog = setup(null);
      expect(() => dialog.onItemRemove('features', 0)).not.toThrow();
    });
  });

  // ========================================
  // onItemSave
  // ========================================
  describe('onItemSave', () => {
    it('adds new feature when index is -1', () => {
      const dialog = setup();
      dialog.onItemAdd('features');

      const newFeature: NpcFeature = { name: 'Camouflage', display_value: '+3' };
      dialog.onItemSave(newFeature);

      expect(editableNpc.value!.features).toHaveLength(2);
      expect(editableNpc.value!.features[1]).toEqual(newFeature);
      expect(dialog.showItemDialog.value).toBe(false);
    });

    it('updates existing feature when editing', () => {
      const dialog = setup();
      dialog.onItemEdit('features', 0);

      const updated: NpcFeature = { name: 'Stealth', display_value: '+5' };
      dialog.onItemSave(updated);

      expect(editableNpc.value!.features).toHaveLength(1);
      expect(editableNpc.value!.features[0]).toEqual(updated);
    });

    it('adds new action when index is -1', () => {
      const dialog = setup();
      dialog.onItemAdd('actions');

      const newAction: NpcAction = {
        name: 'Claw',
        display_value: '1d6',
        activation_type: 'slow',
      };
      dialog.onItemSave(newAction);

      expect(editableNpc.value!.actions).toHaveLength(2);
      expect(editableNpc.value!.actions[1]).toEqual(newAction);
    });

    it('updates existing action when editing', () => {
      const dialog = setup();
      dialog.onItemEdit('actions', 0);

      const updated: NpcAction = {
        name: 'Bite II',
        display_value: '2d4',
        activation_type: 'fast',
      };
      dialog.onItemSave(updated);

      expect(editableNpc.value!.actions).toHaveLength(1);
      expect(editableNpc.value!.actions[0]).toEqual(updated);
    });

    it('adds new opportunity', () => {
      const dialog = setup();
      dialog.onItemAdd('opportunities');

      const opp: NpcFeature = { name: 'Flank', display_value: 'Advantage' };
      dialog.onItemSave(opp);

      expect(editableNpc.value!.opportunities).toHaveLength(1);
      expect(editableNpc.value!.opportunities[0]).toEqual(opp);
    });

    it('does nothing when editableNpc is null', () => {
      const dialog = setup(null);
      dialog.onItemAdd('features');
      editableNpc.value = null;

      const item: NpcFeature = { name: 'Test', display_value: '1' };
      expect(() => dialog.onItemSave(item)).not.toThrow();
    });
  });
});
