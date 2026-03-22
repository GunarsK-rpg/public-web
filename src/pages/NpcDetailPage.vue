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
            <q-btn flat dense label="Cancel" class="q-mr-sm" @click="handleCancel" />
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePageTitle } from 'src/composables/usePageTitle';
import { useNpcEditState } from 'src/composables/useNpcEditState';
import { useNpcItemDialog } from 'src/composables/useNpcItemDialog';
import { useNpcStatDialog } from 'src/composables/useNpcStatDialog';
import { ArrowLeft, UserX } from 'lucide-vue-next';
import { useClassifierStore } from 'src/stores/classifiers';
import { useCombatStore } from 'src/stores/combat';
import combatService from 'src/services/combatService';
import NpcStatBlock from 'src/components/combat/NpcStatBlock.vue';
import NpcItemEditDialog from 'src/components/combat/NpcItemEditDialog.vue';
import NpcStatPickerDialog from 'src/components/combat/NpcStatPickerDialog.vue';
import { handleError } from 'src/utils/errorHandling';
import type { CombatNpc, NpcUpsert } from 'src/types';

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
const combatNpc = ref<CombatNpc | null>(null);

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

const currentResources = computed(() => {
  if (!combatNpc.value) return null;
  return {
    currentHp: combatNpc.value.currentHp,
    currentFocus: combatNpc.value.currentFocus,
    currentInvestiture: combatNpc.value.currentInvestiture,
  };
});

// Edit state
const {
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
} = useNpcEditState(numCampaignId, heroId, isCreateMode);

// Dialogs
const {
  showItemDialog,
  dialogItem,
  dialogShowActivationType,
  dialogItemLabel,
  onItemAdd,
  onItemEdit,
  onItemRemove,
  onItemSave,
} = useNpcItemDialog(editableNpc);

const {
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
} = useNpcStatDialog(editableNpc);

// Navigation
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

function handleCancel() {
  const result = cancelEdit(props.npcId ? Number(props.npcId) : null);
  if (result === 'goBack') goBack();
}

// Save
async function handleSave() {
  if (!isFormValid.value) return;
  const payload = buildPayload(props.npcId);

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

// Delete
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

// Resource patches (combat context)
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

// Init
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
