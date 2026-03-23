import { type Ref, ref, computed, reactive } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import type { Npc, NpcUpsert } from 'src/types';
import type { TypedValue } from 'src/types/shared';

export function useNpcEditState(numCampaignId: Ref<number>, isCreateMode: Ref<boolean>) {
  const classifiers = useClassifierStore();

  const npc = ref<Npc | null>(null);
  const editableNpc = ref<Npc | null>(null);
  const editing = ref(false);
  const isClone = ref(false);

  const canEdit = computed(() => npc.value?.createdBy !== null);

  const isFormValid = computed(
    () =>
      !!editableNpc.value?.name.trim() &&
      !!editableNpc.value?.tier.code &&
      !!editableNpc.value?.type &&
      !!editableNpc.value?.size.trim()
  );

  function cloneNpc(source: Npc): Npc {
    return {
      ...source,
      attributes: source.attributes.map((a) => ({ ...a, type: { ...a.type } })),
      defenses: source.defenses.map((d) => ({ ...d, type: { ...d.type } })),
      skills: source.skills.map((s) => ({ ...s, type: { ...s.type } })),
      derivedStats: source.derivedStats.map((ds) => ({ ...ds, type: { ...ds.type } })),
      features: source.features.map((f) => ({ ...f })),
      actions: source.actions.map((a) => ({ ...a })),
      opportunities: source.opportunities.map((o) => ({ ...o })),
    };
  }

  function buildEmptyNpc(): Npc {
    const firstTier = classifiers.tiers[0];
    return reactive({
      id: 0,
      campaignId: numCampaignId.value,
      createdBy: 1,
      name: '',
      tier: { id: firstTier?.id ?? 0, code: firstTier?.code ?? '', name: firstTier?.name ?? '' },
      type: 'minion',
      isCompanion: false,
      size: '',
      languages: null,
      description: null,
      tactics: null,
      immunities: null,
      attributes: classifiers.attributes.map((a) => ({
        type: { id: a.id, code: a.code, name: a.name },
        value: 0,
      })),
      defenses: classifiers.attributeTypes.map((at) => ({
        type: { id: at.id, code: at.code, name: at.name },
        value: 10,
      })),
      skills: [],
      derivedStats: [],
      features: [],
      actions: [],
      opportunities: [],
    });
  }

  function startEdit() {
    if (!npc.value || !canEdit.value) return;
    editableNpc.value = reactive(cloneNpc(npc.value));
    editing.value = true;
  }

  function cloneAsNew() {
    if (!npc.value) return;
    const clone = reactive(cloneNpc(npc.value));
    clone.id = 0;
    clone.createdBy = 1;
    clone.campaignId = numCampaignId.value;
    clone.name = `${npc.value.name} (Copy)`;
    editableNpc.value = clone;
    editing.value = true;
    isClone.value = true;
  }

  function cancelEdit() {
    if (isCreateMode.value) return 'goBack' as const;
    if (isClone.value) {
      isClone.value = false;
    }
    editableNpc.value = npc.value;
    editing.value = false;
    return 'stay' as const;
  }

  function onFieldUpdate(field: string, value: string | boolean) {
    if (!editableNpc.value) return;
    switch (field) {
      case 'name':
        editableNpc.value.name = String(value);
        break;
      case 'tierCode': {
        const tier = classifiers.tiers.find((t) => t.code === value);
        if (tier) editableNpc.value.tier = { id: tier.id, code: tier.code, name: tier.name };
        break;
      }
      case 'type':
        editableNpc.value.type = String(value);
        break;
      case 'size':
        editableNpc.value.size = String(value);
        break;
      case 'languages':
        editableNpc.value.languages = String(value) || null;
        break;
      case 'immunities':
        editableNpc.value.immunities = String(value) || null;
        break;
      case 'isCompanion':
        editableNpc.value.isCompanion = Boolean(value);
        break;
      case 'description':
        editableNpc.value.description = String(value) || null;
        break;
      case 'tactics':
        editableNpc.value.tactics = String(value) || null;
        break;
    }
  }

  const statSections = new Set<string>(['attributes', 'defenses', 'skills']);

  function onStatUpdate(section: string, code: string, value: number) {
    if (!editableNpc.value || !statSections.has(section)) return;
    const list = editableNpc.value[section as 'attributes' | 'defenses' | 'skills'] as TypedValue[];
    const entry = list.find((e) => e.type.code === code);
    if (entry) {
      entry.value = value;
    }
  }

  function buildPayload(npcId?: string): NpcUpsert {
    const n = editableNpc.value!;
    return {
      ...(isCreateMode.value || isClone.value ? {} : { id: Number(npcId) }),
      campaignId: numCampaignId.value,
      name: n.name.trim(),
      tier: { code: n.tier.code },
      type: n.type,
      size: n.size.trim(),
      languages: n.languages?.trim() || null,
      description: n.description?.trim() || null,
      tactics: n.tactics?.trim() || null,
      immunities: n.immunities?.trim() || null,
      isCompanion: n.isCompanion,
      features: n.features,
      actions: n.actions,
      opportunities: n.opportunities,
      attributes: n.attributes
        .filter((a) => a.value !== 0)
        .map((a) => ({ code: a.type.code, value: a.value })),
      defenses: n.defenses.map((d) => ({ code: d.type.code, value: d.value })),
      skills: n.skills
        .filter((s) => s.value !== 0)
        .map((s) => ({ code: s.type.code, value: s.value })),
      derivedStats: n.derivedStats
        .filter((ds) => ds.value !== 0 || ds.displayValue)
        .map((ds) => ({
          code: ds.type.code,
          value: ds.value,
          displayValue: ds.displayValue ?? null,
        })),
    };
  }

  return {
    npc,
    editableNpc,
    editing,
    isClone,
    canEdit,
    isFormValid,
    buildEmptyNpc,
    startEdit,
    cloneAsNew,
    cancelEdit,
    onFieldUpdate,
    onStatUpdate,
    buildPayload,
  };
}
