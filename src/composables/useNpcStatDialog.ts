import { type Ref, ref, computed } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import type { Npc } from 'src/types';

type StatSection = 'skills' | 'derivedStats';

export function useNpcStatDialog(editableNpc: Ref<Npc | null>) {
  const classifiers = useClassifierStore();

  const showStatDialog = ref(false);
  const statDialogSection = ref<StatSection>('skills');
  const statDialogEditIndex = ref<number | null>(null);
  const statDialogEditCode = ref<string | undefined>(undefined);
  const statDialogEditValue = ref<number | undefined>(undefined);
  const statDialogEditDisplayValue = ref<string | null | undefined>(undefined);

  const statDialogTitle = computed(() =>
    statDialogSection.value === 'skills' ? 'Add Skill' : 'Add Stat'
  );

  const statDialogShowDisplayValue = computed(() => statDialogSection.value === 'derivedStats');

  const statDialogOptions = computed(() =>
    statDialogSection.value === 'skills'
      ? classifiers.skills.map((s) => ({ ...s, name: `${s.name} (${s.attr.name})` }))
      : [...classifiers.derivedStats]
  );

  const statDialogUsedCodes = computed(() => {
    if (!editableNpc.value) return [];
    const list = editableNpc.value[statDialogSection.value];
    return list.map((e) => e.type.code);
  });

  function onStatAdd(section: string) {
    statDialogSection.value = section as StatSection;
    statDialogEditIndex.value = null;
    statDialogEditCode.value = undefined;
    statDialogEditValue.value = undefined;
    statDialogEditDisplayValue.value = undefined;
    showStatDialog.value = true;
  }

  function onStatEdit(section: string, index: number) {
    if (!editableNpc.value) return;
    const key = section as StatSection;
    const entry = editableNpc.value[key][index];
    if (!entry) return;
    statDialogSection.value = key;
    statDialogEditIndex.value = index;
    statDialogEditCode.value = entry.type.code;
    statDialogEditValue.value = entry.value;
    statDialogEditDisplayValue.value = entry.displayValue ?? null;
    showStatDialog.value = true;
  }

  function onStatRemove(section: string, index: number) {
    if (!editableNpc.value) return;
    editableNpc.value[section as StatSection].splice(index, 1);
  }

  function onStatDialogSave(code: string, value: number, displayValue: string | null) {
    if (!editableNpc.value) return;
    const key = statDialogSection.value;
    const list = editableNpc.value[key];

    const classifier =
      key === 'skills'
        ? classifiers.skills.find((s) => s.code === code)
        : classifiers.derivedStats.find((ds) => ds.code === code);
    if (!classifier) return;

    if (statDialogEditIndex.value != null && statDialogEditIndex.value >= 0) {
      const entry = list[statDialogEditIndex.value];
      if (entry) {
        entry.value = value;
        entry.displayValue = displayValue;
      }
    } else {
      list.push({
        type: { id: classifier.id, code: classifier.code, name: classifier.name },
        value,
        displayValue,
      });
    }
    showStatDialog.value = false;
  }

  return {
    showStatDialog,
    statDialogTitle,
    statDialogOptions,
    statDialogUsedCodes,
    statDialogEditIndex,
    statDialogEditCode,
    statDialogEditValue,
    statDialogEditDisplayValue,
    statDialogShowDisplayValue,
    onStatAdd,
    onStatEdit,
    onStatRemove,
    onStatDialogSave,
  };
}
