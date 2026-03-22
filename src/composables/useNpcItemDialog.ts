import { type Ref, ref } from 'vue';
import type { Npc, NpcFeature, NpcAction } from 'src/types';

const itemLabelMap: Record<string, string> = {
  features: 'Feature',
  actions: 'Action',
  opportunities: 'Opportunity',
};

export function useNpcItemDialog(editableNpc: Ref<Npc | null>) {
  const showItemDialog = ref(false);
  const dialogItem = ref<NpcFeature | NpcAction | null>(null);
  const dialogShowActivationType = ref(false);
  const dialogItemLabel = ref('Item');
  const dialogContext = ref<{ list: 'features' | 'actions' | 'opportunities'; index: number }>({
    list: 'features',
    index: -1,
  });

  function onItemAdd(list: string) {
    const key = list as 'features' | 'actions' | 'opportunities';
    dialogItem.value = null;
    dialogShowActivationType.value = key === 'actions';
    dialogItemLabel.value = itemLabelMap[key] ?? 'Item';
    dialogContext.value = { list: key, index: -1 };
    showItemDialog.value = true;
  }

  function onItemEdit(list: string, index: number) {
    if (!editableNpc.value) return;
    const key = list as 'features' | 'actions' | 'opportunities';
    dialogItem.value = editableNpc.value[key][index] ?? null;
    dialogShowActivationType.value = key === 'actions';
    dialogItemLabel.value = itemLabelMap[key] ?? 'Item';
    dialogContext.value = { list: key, index };
    showItemDialog.value = true;
  }

  function onItemRemove(list: string, index: number) {
    if (!editableNpc.value) return;
    const key = list as 'features' | 'actions' | 'opportunities';
    editableNpc.value[key].splice(index, 1);
  }

  function onItemSave(item: NpcFeature | NpcAction) {
    if (!editableNpc.value) return;
    const { list, index } = dialogContext.value;
    if (index >= 0) {
      editableNpc.value[list][index] = item as NpcFeature & NpcAction;
    } else {
      (editableNpc.value[list] as (NpcFeature | NpcAction)[]).push(item);
    }
    showItemDialog.value = false;
  }

  return {
    showItemDialog,
    dialogItem,
    dialogShowActivationType,
    dialogItemLabel,
    onItemAdd,
    onItemEdit,
    onItemRemove,
    onItemSave,
  };
}
