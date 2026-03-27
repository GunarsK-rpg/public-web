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
          <template v-else-if="!isArchived">
            <q-btn flat dense label="Clone" color="secondary" @click="cloneAsNew" />
            <template v-if="canEdit">
              <q-btn flat dense label="Edit" color="primary" @click="startEdit" />
              <q-btn flat dense label="Archive" color="negative" @click="confirmDelete" />
            </template>
          </template>
        </div>

        <q-banner v-if="isArchived" class="bg-grey-3 text-grey-8 q-mb-md">
          This NPC has been archived. It remains visible in existing combats and companions.
        </q-banner>

        <NpcStatBlock
          :npc="editableNpc"
          :saving="saving"
          :readonly="true"
          :editable="editing"
          :show-companion-toggle="editing"
          :avatar-saving="avatarSaving"
          @field-update="onFieldUpdate"
          @stat-update="onStatUpdate"
          @stat-add="onStatAdd"
          @stat-edit="onStatEdit"
          @stat-remove="onStatRemove"
          @item-add="onItemAdd"
          @item-edit="onItemEdit"
          @item-remove="onItemRemove"
          @avatar-upload="onAvatarUpload"
          @avatar-delete="onAvatarDelete"
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
import filesApi, { FILE_TYPE_HERO_AVATAR } from 'src/services/filesApi';
import { useErrorHandler } from 'src/composables/useErrorHandler';
import type { NpcUpsert } from 'src/types';

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
const { handleError } = useErrorHandler();

const loadingInit = ref(true);
const error = ref<string | null>(null);

const saving = computed(() => combatStore.saving);
const isCreateMode = computed(() => route.name === 'npc-create');
const isEditRoute = computed(() => route.name === 'npc-edit');
const loading = computed(() => loadingInit.value || combatStore.loading);

const numCampaignId = computed(() => Number(props.campaignId));

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
} = useNpcEditState(numCampaignId, isCreateMode);

const isArchived = computed(() => !!npc.value?.deletedAt);

// Avatar
const avatarSaving = ref(false);

async function onAvatarUpload(file: File): Promise<void> {
  if (!editableNpc.value?.id || !numCampaignId.value) return;
  avatarSaving.value = true;
  try {
    const uploadRes = await filesApi.upload(file, FILE_TYPE_HERO_AVATAR);
    const key = uploadRes.data.url.split('/').pop();
    if (!key) throw new Error('Invalid upload response: missing key');
    await combatService.setNpcAvatar(numCampaignId.value, editableNpc.value.id, key);
    editableNpc.value.avatarKey = key;
    if (npc.value) npc.value.avatarKey = key;
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to upload avatar' });
  } finally {
    avatarSaving.value = false;
  }
}

async function onAvatarDelete(): Promise<void> {
  if (!editableNpc.value?.id || !numCampaignId.value) return;
  avatarSaving.value = true;
  try {
    await combatService.deleteNpcAvatar(numCampaignId.value, editableNpc.value.id);
    editableNpc.value.avatarKey = null;
    if (npc.value) npc.value.avatarKey = null;
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to delete avatar' });
  } finally {
    avatarSaving.value = false;
  }
}

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
  return { name: 'campaign-detail', params: { campaignId: props.campaignId } };
}

function goBack() {
  void router.push(backRoute());
}

function handleCancel() {
  const result = cancelEdit();
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
      setPageTitle(result.name);
    }
  }
}

// Delete
function confirmDelete() {
  $q.dialog({
    title: 'Archive NPC',
    message: `Archive "${npc.value?.name}"? It will remain visible in existing combats and companions but cannot be added to new ones.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    combatStore
      .deleteNpc(numCampaignId.value, Number(props.npcId))
      .then((deleted) => {
        if (deleted) {
          goBack();
        } else if (combatStore.error) {
          $q.notify({ type: 'negative', message: combatStore.error });
        }
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: 'Failed to delete NPC' });
      });
  });
}

onUnmounted(() => {
  combatStore.currentNpc = null;
});

// Init
onMounted(async () => {
  const campaignId = numCampaignId.value;

  try {
    if (!classifiers.initialized) {
      await classifiers.initialize();
    }

    if (isNaN(campaignId) || campaignId <= 0) {
      error.value = 'Invalid campaign ID';
      return;
    }

    if (isCreateMode.value) {
      editableNpc.value = buildEmptyNpc();
      editing.value = true;
      setPageTitle('Create NPC');
      return;
    }

    const npcId = Number(props.npcId);
    if (isNaN(npcId) || npcId <= 0) {
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
  } catch (err: unknown) {
    handleError(err as Error, { retryKey: 'npc-detail-load', entityName: 'NPC' });
    error.value = 'Failed to load NPC';
  } finally {
    loadingInit.value = false;
  }
});
</script>
