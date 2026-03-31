import { describe, it, expect, beforeEach, vi } from 'vitest';
import { type Ref, ref } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { useNpcStatDialog } from './useNpcStatDialog';
import type { Npc } from 'src/types';

const mockSkill = { id: 1, code: 'athletics', name: 'Athletics', attr: { name: 'STR' } };
const mockSkill2 = { id: 2, code: 'stealth', name: 'Stealth', attr: { name: 'SPD' } };
const mockDerivedStat = { id: 10, code: 'speed', name: 'Speed' };
const mockDerivedStat2 = { id: 11, code: 'initiative', name: 'Initiative' };

vi.mock('src/stores/classifiers', () => ({
  useClassifierStore: () => ({
    skills: [{ ...mockSkill }, { ...mockSkill2 }],
    derivedStats: [{ ...mockDerivedStat }, { ...mockDerivedStat2 }],
  }),
}));

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
    skills: [
      { type: { id: 1, code: 'athletics', name: 'Athletics' }, value: 3, displayValue: null },
    ],
    derivedStats: [
      { type: { id: 10, code: 'speed', name: 'Speed' }, value: 6, displayValue: '6m' },
    ],
    features: [],
    actions: [],
    opportunities: [],
    ...overrides,
  };
}

describe('useNpcStatDialog', () => {
  let editableNpc: Ref<Npc | null>;

  beforeEach(() => {
    setActivePinia(createPinia());
    editableNpc = ref<Npc | null>(makeMockNpc());
  });

  function setup(npc?: Npc | null) {
    editableNpc.value = npc === undefined ? makeMockNpc() : npc;
    return useNpcStatDialog(editableNpc);
  }

  // ========================================
  // computed properties
  // ========================================
  describe('computed properties', () => {
    it('statDialogTitle returns "Add Skill" for skills section', () => {
      const dialog = setup();
      dialog.onStatAdd('skills');
      expect(dialog.statDialogTitle.value).toBe('Add Skill');
    });

    it('statDialogTitle returns "Add Stat" for derivedStats section', () => {
      const dialog = setup();
      dialog.onStatAdd('derivedStats');
      expect(dialog.statDialogTitle.value).toBe('Add Stat');
    });

    it('statDialogShowDisplayValue is true for derivedStats', () => {
      const dialog = setup();
      dialog.onStatAdd('derivedStats');
      expect(dialog.statDialogShowDisplayValue.value).toBe(true);
    });

    it('statDialogShowDisplayValue is false for skills', () => {
      const dialog = setup();
      dialog.onStatAdd('skills');
      expect(dialog.statDialogShowDisplayValue.value).toBe(false);
    });

    it('statDialogOptions returns skills with attribute suffix for skills section', () => {
      const dialog = setup();
      dialog.onStatAdd('skills');

      expect(dialog.statDialogOptions.value).toHaveLength(2);
      expect(dialog.statDialogOptions.value[0]!.name).toBe('Athletics (STR)');
      expect(dialog.statDialogOptions.value[1]!.name).toBe('Stealth (SPD)');
    });

    it('statDialogOptions returns derived stats for derivedStats section', () => {
      const dialog = setup();
      dialog.onStatAdd('derivedStats');

      expect(dialog.statDialogOptions.value).toHaveLength(2);
      expect(dialog.statDialogOptions.value[0]!.name).toBe('Speed');
    });

    it('statDialogUsedCodes returns codes already in the NPC', () => {
      const dialog = setup();
      dialog.onStatAdd('skills');

      expect(dialog.statDialogUsedCodes.value).toEqual(['athletics']);
    });

    it('statDialogUsedCodes returns empty array when NPC is null', () => {
      const dialog = setup(null);
      dialog.onStatAdd('skills');

      expect(dialog.statDialogUsedCodes.value).toEqual([]);
    });
  });

  // ========================================
  // onStatAdd
  // ========================================
  describe('onStatAdd', () => {
    it('opens dialog with cleared fields for skills', () => {
      const dialog = setup();
      dialog.onStatAdd('skills');

      expect(dialog.showStatDialog.value).toBe(true);
      expect(dialog.statDialogEditIndex.value).toBeNull();
      expect(dialog.statDialogEditCode.value).toBeUndefined();
      expect(dialog.statDialogEditValue.value).toBeUndefined();
      expect(dialog.statDialogEditDisplayValue.value).toBeUndefined();
    });

    it('opens dialog for derivedStats', () => {
      const dialog = setup();
      dialog.onStatAdd('derivedStats');

      expect(dialog.showStatDialog.value).toBe(true);
      expect(dialog.statDialogTitle.value).toBe('Add Stat');
    });
  });

  // ========================================
  // onStatEdit
  // ========================================
  describe('onStatEdit', () => {
    it('loads existing skill into dialog', () => {
      const dialog = setup();
      dialog.onStatEdit('skills', 0);

      expect(dialog.showStatDialog.value).toBe(true);
      expect(dialog.statDialogEditIndex.value).toBe(0);
      expect(dialog.statDialogEditCode.value).toBe('athletics');
      expect(dialog.statDialogEditValue.value).toBe(3);
      expect(dialog.statDialogEditDisplayValue.value).toBeNull();
    });

    it('loads existing derived stat with displayValue', () => {
      const dialog = setup();
      dialog.onStatEdit('derivedStats', 0);

      expect(dialog.showStatDialog.value).toBe(true);
      expect(dialog.statDialogEditCode.value).toBe('speed');
      expect(dialog.statDialogEditValue.value).toBe(6);
      expect(dialog.statDialogEditDisplayValue.value).toBe('6m');
    });

    it('does nothing when editableNpc is null', () => {
      const dialog = setup(null);
      dialog.onStatEdit('skills', 0);

      expect(dialog.showStatDialog.value).toBe(false);
    });

    it('does nothing when entry does not exist at index', () => {
      const dialog = setup();
      dialog.onStatEdit('skills', 99);

      expect(dialog.showStatDialog.value).toBe(false);
    });
  });

  // ========================================
  // onStatRemove
  // ========================================
  describe('onStatRemove', () => {
    it('removes skill at index', () => {
      const dialog = setup();
      expect(editableNpc.value!.skills).toHaveLength(1);

      dialog.onStatRemove('skills', 0);

      expect(editableNpc.value!.skills).toHaveLength(0);
    });

    it('removes derivedStat at index', () => {
      const dialog = setup();
      expect(editableNpc.value!.derivedStats).toHaveLength(1);

      dialog.onStatRemove('derivedStats', 0);

      expect(editableNpc.value!.derivedStats).toHaveLength(0);
    });

    it('does nothing when editableNpc is null', () => {
      const dialog = setup(null);
      expect(() => dialog.onStatRemove('skills', 0)).not.toThrow();
    });
  });

  // ========================================
  // onStatDialogSave
  // ========================================
  describe('onStatDialogSave', () => {
    it('adds new skill', () => {
      const dialog = setup();
      dialog.onStatAdd('skills');

      dialog.onStatDialogSave('stealth', 5, null);

      expect(editableNpc.value!.skills).toHaveLength(2);
      expect(editableNpc.value!.skills[1]).toEqual({
        type: { id: 2, code: 'stealth', name: 'Stealth' },
        value: 5,
        displayValue: null,
      });
      expect(dialog.showStatDialog.value).toBe(false);
    });

    it('updates existing skill when editing', () => {
      const dialog = setup();
      dialog.onStatEdit('skills', 0);

      dialog.onStatDialogSave('athletics', 8, null);

      expect(editableNpc.value!.skills).toHaveLength(1);
      expect(editableNpc.value!.skills[0]!.value).toBe(8);
    });

    it('adds new derived stat with displayValue', () => {
      const dialog = setup();
      dialog.onStatAdd('derivedStats');

      dialog.onStatDialogSave('initiative', 4, '+4');

      expect(editableNpc.value!.derivedStats).toHaveLength(2);
      expect(editableNpc.value!.derivedStats[1]).toEqual({
        type: { id: 11, code: 'initiative', name: 'Initiative' },
        value: 4,
        displayValue: '+4',
      });
    });

    it('updates existing derived stat displayValue', () => {
      const dialog = setup();
      dialog.onStatEdit('derivedStats', 0);

      dialog.onStatDialogSave('speed', 8, '8m');

      expect(editableNpc.value!.derivedStats[0]!.value).toBe(8);
      expect(editableNpc.value!.derivedStats[0]!.displayValue).toBe('8m');
    });

    it('does nothing when classifier not found', () => {
      const dialog = setup();
      dialog.onStatAdd('skills');

      dialog.onStatDialogSave('nonexistent', 5, null);

      expect(editableNpc.value!.skills).toHaveLength(1);
    });

    it('does nothing when editableNpc is null', () => {
      const dialog = setup(null);
      dialog.onStatAdd('skills');
      editableNpc.value = null;

      expect(() => dialog.onStatDialogSave('athletics', 5, null)).not.toThrow();
    });
  });
});
