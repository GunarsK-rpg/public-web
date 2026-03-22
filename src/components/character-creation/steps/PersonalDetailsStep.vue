<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Add personal details (optional)</div>

    <!-- Avatar -->
    <div class="q-mb-md">
      <div class="text-subtitle2 q-mb-sm">Avatar</div>
      <AvatarUpload
        :avatar-key="heroStore.hero?.avatarKey ?? null"
        :disabled="!heroStore.hero?.id"
        :loading="heroStore.saving"
        @upload="onAvatarUpload"
        @delete="onAvatarDelete"
      />
      <div v-if="!heroStore.hero?.id" class="text-caption text-grey-6 q-mt-xs">
        Save character first to upload avatar
      </div>
    </div>

    <!-- Biography -->
    <q-input
      :model-value="heroStore.hero?.biography ?? ''"
      type="textarea"
      label="Biography"
      outlined
      autogrow
      maxlength="2000"
      class="q-mb-md"
      @update:model-value="setBiography"
    />

    <!-- Appearance -->
    <q-input
      :model-value="heroStore.hero?.appearance ?? ''"
      type="textarea"
      label="Appearance"
      outlined
      autogrow
      maxlength="2000"
      class="q-mb-md"
      @update:model-value="setAppearance"
    />

    <q-separator class="q-my-md" />

    <!-- Goals -->
    <div class="text-subtitle2 q-mb-sm">Goals</div>
    <EditableItemList
      :items="goalItems"
      item-label="goal"
      add-label="Add Goal"
      bordered
      @add="showGoalDialog = true"
      @remove="removeGoal"
    />

    <q-separator class="q-my-md" />

    <!-- Connections -->
    <div class="text-subtitle2 q-mb-sm">Connections</div>
    <EditableItemList
      :items="connectionItems"
      item-label="connection"
      add-label="Add Connection"
      bordered
      @add="showConnectionDialog = true"
      @remove="removeConnection"
    />

    <q-separator class="q-my-md" />

    <!-- Companions -->
    <div class="text-subtitle2 q-mb-sm">Companions</div>
    <EditableItemList
      :items="companionItems"
      item-label="companion"
      add-label="Add Companion"
      bordered
      @add="showCompanionDialog = true"
      @remove="removeCompanion"
    />

    <q-separator class="q-my-md" />

    <!-- Notes -->
    <q-input
      :model-value="heroStore.hero?.notes ?? ''"
      type="textarea"
      label="Additional Notes"
      outlined
      autogrow
      maxlength="5000"
      @update:model-value="setNotes"
    />

    <AddOtherDialog
      v-model="showGoalDialog"
      title="Add Goal"
      data-testid="add-other-goal"
      @add="handleAddGoal"
    />

    <AddOtherDialog
      v-model="showConnectionDialog"
      title="Add Connection"
      type-label="Connection type"
      :types="classifiers.connectionTypes"
      data-testid="add-other-connection"
      @add="handleAddConnection"
    />

    <AddOtherDialog
      v-model="showCompanionDialog"
      title="Add Companion"
      type-label="Companion type"
      :types="classifiers.companionTypes"
      data-testid="add-other-companion"
      @add="handleAddCompanion"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onUnmounted } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { debounce } from 'src/utils/debounce';
import { findByCode, removeById, toClassifierRef } from 'src/utils/arrayUtils';
import { trimText, trimName } from 'src/utils/stringUtils';
import EditableItemList from 'src/components/shared/EditableItemList.vue';
import AddOtherDialog from 'src/components/character/AddOtherDialog.vue';
import AvatarUpload from 'src/components/shared/AvatarUpload.vue';
import type { DeletionTracker } from 'src/composables/useDeletionTracker';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();
const deletionTracker = inject<DeletionTracker>('deletionTracker');

// Normalized list items
const goalItems = computed(() =>
  heroStore.goals.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
  }))
);

const connectionItems = computed(() =>
  heroStore.connections.map((c) => ({
    id: c.id,
    name: c.description ?? 'Connection',
    description: c.notes,
    typeName:
      findByCode(classifiers.connectionTypes, c.connectionType.code)?.name ??
      c.connectionType.name ??
      'Unknown',
  }))
);

const companionItems = computed(() =>
  heroStore.companions.map((c) => ({
    id: c.id,
    name: c.description ?? 'Companion',
    description: c.notes,
    typeName:
      findByCode(classifiers.companionTypes, c.companionType.code)?.name ??
      c.companionType.name ??
      'Unknown',
  }))
);

// Dialog state
const showGoalDialog = ref(false);
const showConnectionDialog = ref(false);
const showCompanionDialog = ref(false);

// Debounced text setters
function createDebouncedHandler(setter: (val: string) => void) {
  const debouncedFn = debounce(setter, 300);
  const handler = (val: string | number | null) => {
    if (val !== null) {
      debouncedFn(String(val));
    }
  };
  return { handler, cancel: debouncedFn.cancel };
}

const biographyHandler = createDebouncedHandler((val) => {
  if (!heroStore.hero) return;
  heroStore.hero.biography = trimText(val);
});
const appearanceHandler = createDebouncedHandler((val) => {
  if (!heroStore.hero) return;
  heroStore.hero.appearance = trimText(val);
});
const notesHandler = createDebouncedHandler((val) => {
  if (!heroStore.hero) return;
  heroStore.hero.notes = trimText(val);
});

const setBiography = biographyHandler.handler;
const setAppearance = appearanceHandler.handler;
const setNotes = notesHandler.handler;

onUnmounted(() => {
  biographyHandler.cancel();
  appearanceHandler.cancel();
  notesHandler.cancel();
});

// Avatar
async function onAvatarUpload(file: File): Promise<void> {
  await heroStore.uploadAvatar(file);
}

async function onAvatarDelete(): Promise<void> {
  await heroStore.deleteAvatar();
}

// Goal actions
function handleAddGoal(name: string, description: string | null) {
  if (!heroStore.hero) return;
  const activeStatus = findByCode(classifiers.goalStatuses, 'active');
  if (!activeStatus) return;
  const trimmedName = trimName(name);
  if (!trimmedName) return;
  const trimmedDesc = description ? trimText(description) : undefined;
  heroStore.hero.goals.push({
    id: heroStore.nextTempId(),
    heroId: heroStore.hero.id,
    name: trimmedName,
    ...(trimmedDesc && { description: trimmedDesc }),
    value: 0,
    status: toClassifierRef(activeStatus),
  });
}

function removeGoal(goalId: number) {
  const removed = removeById(heroStore.hero?.goals, goalId);
  if (removed && goalId > 0) deletionTracker?.trackDeletion('goals', goalId);
}

// Connection actions
function handleAddConnection(name: string, description: string | null, typeCode: string | null) {
  if (!heroStore.hero || !typeCode) return;
  const connType = findByCode(classifiers.connectionTypes, typeCode);
  if (!connType) return;
  const trimmedName = trimName(name);
  if (!trimmedName) return;
  const trimmedNotes = description ? trimText(description) : undefined;
  heroStore.hero.connections.push({
    id: heroStore.nextTempId(),
    heroId: heroStore.hero.id,
    connectionType: toClassifierRef(connType),
    description: trimmedName,
    ...(trimmedNotes ? { notes: trimmedNotes } : {}),
  });
}

function removeConnection(connectionId: number) {
  const removed = removeById(heroStore.hero?.connections, connectionId);
  if (removed && connectionId > 0) deletionTracker?.trackDeletion('connections', connectionId);
}

// Companion actions
function handleAddCompanion(name: string, description: string | null, typeCode: string | null) {
  if (!heroStore.hero || !typeCode) return;
  const compType = findByCode(classifiers.companionTypes, typeCode);
  if (!compType) return;
  const trimmedName = trimName(name);
  if (!trimmedName) return;
  const trimmedNotes = description ? trimText(description) : undefined;
  heroStore.hero.companions.push({
    id: heroStore.nextTempId(),
    heroId: heroStore.hero.id,
    companionType: toClassifierRef(compType),
    description: trimmedName,
    ...(trimmedNotes ? { notes: trimmedNotes } : {}),
  });
}

function removeCompanion(companionId: number) {
  const removed = removeById(heroStore.hero?.companions, companionId);
  if (removed && companionId > 0) deletionTracker?.trackDeletion('companions', companionId);
}
</script>
