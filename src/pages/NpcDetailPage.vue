<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-spinner-dots v-if="loading" size="50px" color="primary" />

      <q-banner v-else-if="error" class="bg-negative text-white q-mb-md">
        {{ error }}
        <template v-slot:action>
          <q-btn flat label="Go Back" @click="goBack" />
        </template>
      </q-banner>

      <div v-else-if="!editableNpc && !isCreateMode" class="text-center q-pa-xl">
        <UserX :size="64" class="text-grey-5" aria-hidden="true" />
        <div class="text-h6 text-grey-7 q-mt-md">NPC not found</div>
        <q-btn color="primary" label="Go Back" class="q-mt-md" @click="goBack" />
      </div>

      <template v-else-if="editableNpc">
        <!-- Header bar -->
        <div class="row items-center q-mb-md">
          <q-btn flat dense round size="sm" aria-label="Back" @click="goBack">
            <ArrowLeft :size="20" />
          </q-btn>
          <q-space />
          <template v-if="editing">
            <q-btn flat dense label="Cancel" class="q-mr-sm" @click="cancelEdit" />
            <q-btn
              dense
              color="primary"
              label="Save"
              :loading="saving"
              :disable="!isFormValid"
              @click="handleSave"
            />
          </template>
          <template v-else>
            <q-btn flat dense label="Clone" color="secondary" @click="cloneAsNew" />
            <template v-if="canEdit">
              <q-btn flat dense label="Edit" color="primary" @click="startEdit" />
              <q-btn flat dense label="Delete" color="negative" @click="confirmDelete" />
            </template>
          </template>
        </div>

        <NpcStatBlock
          :npc="editableNpc"
          :display-name="combatNpc?.displayName"
          :current-resources="currentResources"
          :notes="combatNpc?.notes"
          :saving="saving"
          :readonly="!combatStore.currentCombat?.isActive"
          :editable="editing"
          :show-companion-toggle="editing && !heroId"
          @resource-update="onResourceUpdate"
          @field-update="onFieldUpdate"
          @stat-update="onStatUpdate"
          @stat-add="onStatAdd"
          @stat-edit="onStatEdit"
          @stat-remove="onStatRemove"
          @item-add="onItemAdd"
          @item-edit="onItemEdit"
          @item-remove="onItemRemove"
        />

        <!-- Item edit dialog -->
        <NpcItemEditDialog
          v-if="editing"
          v-model="showItemDialog"
          :item="dialogItem"
          :show-activation-type="dialogShowActivationType"
          :item-label="dialogItemLabel"
          @save="onItemSave"
        />

        <!-- Stat picker dialog (skills / derived stats) -->
        <NpcStatPickerDialog
          v-if="editing"
          v-model="showStatDialog"
          :title="statDialogTitle"
          :options="statDialogOptions"
          :used-codes="statDialogUsedCodes"
          :edit-index="statDialogEditIndex"
          :edit-code="statDialogEditCode"
          :edit-value="statDialogEditValue"
          :edit-display-value="statDialogEditDisplayValue"
          :show-display-value="statDialogShowDisplayValue"
          @save="onStatDialogSave"
        />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePageTitle } from 'src/composables/usePageTitle';
import { ArrowLeft, UserX } from 'lucide-vue-next';
import { useClassifierStore } from 'src/stores/classifiers';
import { useCombatStore } from 'src/stores/combat';
import combatService from 'src/services/combatService';
import NpcStatBlock from 'src/components/combat/NpcStatBlock.vue';
import NpcItemEditDialog from 'src/components/combat/NpcItemEditDialog.vue';
import NpcStatPickerDialog from 'src/components/combat/NpcStatPickerDialog.vue';
import { handleError } from 'src/utils/errorHandling';
import type { Npc, NpcFeature, NpcAction, NpcUpsert, CombatNpc } from 'src/types';
import type { TypedValue } from 'src/types/shared';

const props = defineProps<{
  campaignId: string;
  npcId?: string;
}>();

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const combatStore = useCombatStore();
const classifiers = useClassifierStore();
const { setPageTitle } = usePageTitle();

const loadingInit = ref(true);
const error = ref<string | null>(null);
const npc = ref<Npc | null>(null);
const combatNpc = ref<CombatNpc | null>(null);
const editing = ref(false);
const isClone = ref(false);

// Editable copy of the NPC -- mutations happen here, not on the original
const editableNpc = ref<Npc | null>(null);

const saving = computed(() => combatStore.saving);

const isCreateMode = computed(() => route.name === 'npc-create');
const isEditRoute = computed(() => route.name === 'npc-edit');

const loading = computed(() => loadingInit.value || combatStore.loading);

const combatId = computed(() => {
  const n = Number(route.query.combatId);
  return Number.isFinite(n) && n > 0 ? n : null;
});

const instanceId = computed(() => {
  const n = Number(route.query.instanceId);
  return Number.isFinite(n) && n > 0 ? n : null;
});

const heroId = computed(() => {
  const n = Number(route.query.heroId);
  return Number.isFinite(n) && n > 0 ? n : null;
});

const numCampaignId = computed(() => Number(props.campaignId));

const canEdit = computed(() => npc.value?.createdBy !== null);

const isFormValid = computed(
  () =>
    !!editableNpc.value?.name.trim() &&
    !!editableNpc.value?.tier.code &&
    !!editableNpc.value?.type &&
    !!editableNpc.value?.size.trim()
);

const currentResources = computed(() => {
  if (!combatNpc.value) return null;
  return {
    currentHp: combatNpc.value.currentHp,
    currentFocus: combatNpc.value.currentFocus,
    currentInvestiture: combatNpc.value.currentInvestiture,
  };
});

function backRoute() {
  if (combatId.value) {
    return {
      name: 'combat-detail',
      params: { campaignId: props.campaignId, combatId: String(combatId.value) },
    };
  }
  if (heroId.value) {
    return {
      name: 'character-sheet',
      params: { characterId: String(heroId.value) },
      query: { tab: 'companions' },
    };
  }
  return { name: 'campaign-detail', params: { campaignId: props.campaignId } };
}

function goBack() {
  void router.push(backRoute());
}

// =====================
// EDIT MODE
// =====================

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
    campaignId: heroId.value ? null : numCampaignId.value,
    heroId: heroId.value,
    createdBy: 1,
    name: '',
    tier: { id: firstTier?.id ?? 0, code: firstTier?.code ?? '', name: firstTier?.name ?? '' },
    type: 'minion',
    isCompanion: !!heroId.value,
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
  if (!npc.value) return;
  editableNpc.value = reactive(cloneNpc(npc.value));
  editing.value = true;
}

function cloneAsNew() {
  if (!npc.value) return;
  const clone = reactive(cloneNpc(npc.value));
  clone.id = 0;
  clone.createdBy = 1;
  clone.campaignId = heroId.value ? null : numCampaignId.value;
  clone.heroId = heroId.value;
  clone.name = `${npc.value.name} (Copy)`;
  editableNpc.value = clone;
  npc.value = null;
  editing.value = true;
  isClone.value = true;
}

function cancelEdit() {
  if (isCreateMode.value) {
    goBack();
    return;
  }
  if (isClone.value) {
    // Reload original NPC
    isClone.value = false;
    const npcId = Number(props.npcId);
    void combatStore.fetchNpc(numCampaignId.value, npcId).then((result) => {
      npc.value = result;
      editableNpc.value = result;
    });
  } else {
    editableNpc.value = npc.value;
  }
  editing.value = false;
}

// =====================
// FIELD UPDATES
// =====================

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

function onStatUpdate(section: string, code: string, value: number) {
  if (!editableNpc.value) return;
  const list = editableNpc.value[section as 'attributes' | 'defenses' | 'skills'] as TypedValue[];
  const entry = list.find((e) => e.type.code === code);
  if (entry) {
    entry.value = value;
  }
}

// =====================
// STAT PICKER DIALOG (skills / derived stats)
// =====================

const showStatDialog = ref(false);
const statDialogSection = ref<'skills' | 'derivedStats'>('skills');
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
  const list =
    statDialogSection.value === 'skills'
      ? editableNpc.value.skills
      : editableNpc.value.derivedStats;
  return list.map((e) => e.type.code);
});

function onStatAdd(section: string) {
  statDialogSection.value = section as 'skills' | 'derivedStats';
  statDialogEditIndex.value = null;
  statDialogEditCode.value = undefined;
  statDialogEditValue.value = undefined;
  statDialogEditDisplayValue.value = undefined;
  showStatDialog.value = true;
}

function onStatEdit(section: string, index: number) {
  if (!editableNpc.value) return;
  const key = section as 'skills' | 'derivedStats';
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
  const key = section as 'skills' | 'derivedStats';
  editableNpc.value[key].splice(index, 1);
}

function onStatDialogSave(code: string, value: number, displayValue: string | null) {
  if (!editableNpc.value) return;
  const key = statDialogSection.value;
  const list = editableNpc.value[key];

  // Look up classifier for name
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

// =====================
// JSONB ITEM EDITING
// =====================

const showItemDialog = ref(false);
const dialogItem = ref<NpcFeature | NpcAction | null>(null);
const dialogShowActivationType = ref(false);
const dialogItemLabel = ref('Item');
const dialogContext = ref<{ list: 'features' | 'actions' | 'opportunities'; index: number }>({
  list: 'features',
  index: -1,
});

const itemLabelMap: Record<string, string> = {
  features: 'Feature',
  actions: 'Action',
  opportunities: 'Opportunity',
};

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

// =====================
// SAVE / DELETE
// =====================

function buildPayload(): NpcUpsert {
  const n = editableNpc.value!;
  return {
    ...(isCreateMode.value || isClone.value ? {} : { id: Number(props.npcId) }),
    campaignId: numCampaignId.value,
    heroId: heroId.value,
    name: n.name.trim(),
    tier: { code: n.tier.code },
    type: n.type,
    size: n.size.trim(),
    languages: n.languages?.trim() || null,
    description: n.description?.trim() || null,
    tactics: n.tactics?.trim() || null,
    immunities: n.immunities?.trim() || null,
    isCompanion: heroId.value ? true : n.isCompanion,
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

async function handleSave() {
  if (!isFormValid.value) return;
  const payload = buildPayload();

  const isNew = isCreateMode.value || isClone.value;
  const result = isNew
    ? await combatStore.createNpc(payload)
    : await combatStore.updateNpc(payload as NpcUpsert & { id: number });

  if (result) {
    if (isNew) {
      isClone.value = false;
      goBack();
    } else {
      npc.value = result;
      editableNpc.value = result;
      editing.value = false;
    }
  }
}

function confirmDelete() {
  $q.dialog({
    title: 'Delete NPC',
    message: `Delete "${npc.value?.name}"? This cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void combatStore.deleteNpc(numCampaignId.value, Number(props.npcId)).then((deleted) => {
      if (deleted) {
        goBack();
      } else if (combatStore.error) {
        $q.notify({ type: 'negative', message: combatStore.error });
      }
    });
  });
}

// =====================
// RESOURCE PATCHES (combat context)
// =====================

const resourcePatchMap: Record<
  string,
  (data: { id: number; combatId: number; campaignId: number; value: number }) => Promise<void>
> = {
  max_health: (d) => combatStore.patchHp(d),
  max_focus: (d) => combatStore.patchFocus(d),
  max_investiture: (d) => combatStore.patchInvestiture(d),
};

function onResourceUpdate(code: string, value: number) {
  if (!combatNpc.value || !combatId.value) return;
  const patchFn = resourcePatchMap[code];
  if (!patchFn) return;
  void patchFn({
    id: combatNpc.value.id,
    combatId: combatId.value,
    campaignId: numCampaignId.value,
    value,
  });
}

// =====================
// INIT
// =====================

onMounted(async () => {
  const campaignId = numCampaignId.value;

  try {
    if (!classifiers.initialized) {
      await classifiers.initialize();
    }

    if (isCreateMode.value) {
      editableNpc.value = buildEmptyNpc();
      editing.value = true;
      setPageTitle('Create NPC');
      return;
    }

    const npcId = Number(props.npcId);
    if (isNaN(campaignId) || campaignId <= 0 || isNaN(npcId) || npcId <= 0) {
      error.value = 'Invalid NPC ID';
      return;
    }

    const response = await combatService.getNpc(campaignId, npcId);
    npc.value = response.data;
    editableNpc.value = response.data;
    setPageTitle(response.data.name);

    if (isEditRoute.value) {
      startEdit();
    }

    // Load combat NPC instance if combat context provided
    if (combatId.value && instanceId.value) {
      await combatStore.selectCombat(campaignId, combatId.value);
      combatNpc.value =
        combatStore.currentCombat?.npcs.find((n) => n.id === instanceId.value) ?? null;
    }
  } catch (err: unknown) {
    handleError(err, { errorRef: error, message: 'Failed to load NPC' });
  } finally {
    loadingInit.value = false;
  }
});
</script>
