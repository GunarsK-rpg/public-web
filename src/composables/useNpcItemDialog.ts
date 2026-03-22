import { type Ref, ref } from 'vue';
import type { Npc, NpcFeature, NpcAction } from 'src/types';

type ItemListKey = 'features' | 'actions' | 'opportunities';

const itemLabelMap: Record<ItemListKey, string> = {
  features: 'Feature',
  actions: 'Action',
  opportunities: 'Opportunity',
};

export function useNpcItemDialog(editableNpc: Ref<Npc | null>) {
  const showItemDialog = ref(false);
  const dialogItem = ref<NpcFeature | NpcAction | null>(null);
  const dialogShowActivationType = ref(false);
  const dialogItemLabel = ref('Item');
  const dialogContext = ref<{ list: ItemListKey; index: number }>({
    list: 'features',
    index: -1,
  });

  function onItemAdd(list: string) {
    const key = list as ItemListKey;
    dialogItem.value = null;
    dialogShowActivationType.value = key === 'actions';
    dialogItemLabel.value = itemLabelMap[key];
    dialogContext.value = { list: key, index: -1 };
    showItemDialog.value = true;
  }

  function onItemEdit(list: string, index: number) {
    if (!editableNpc.value) return;
    const key = list as ItemListKey;
    dialogItem.value = editableNpc.value[key][index] ?? null;
    dialogShowActivationType.value = key === 'actions';
    dialogItemLabel.value = itemLabelMap[key];
    dialogContext.value = { list: key, index };
    showItemDialog.value = true;
  }

  function onItemRemove(list: string, index: number) {
    if (!editableNpc.value) return;
    editableNpc.value[list as ItemListKey].splice(index, 1);
  }

  function onItemSave(item: NpcFeature | NpcAction) {
    if (!editableNpc.value) return;
    const { list, index } = dialogContext.value;
    if (list === 'actions') {
      if (index >= 0) {
        editableNpc.value.actions[index] = item as NpcAction;
      } else {
        editableNpc.value.actions.push(item as NpcAction);
      }
    } else {
      const arr = editableNpc.value[list];
      if (index >= 0) {
        arr[index] = item as NpcFeature;
      } else {
        arr.push(item as NpcFeature);
      }
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
