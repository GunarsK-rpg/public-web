<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Add personal details (optional)</div>

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

    <AddOtherDialog v-model="showGoalDialog" title="Add Goal" @add="handleAddGoal" />

    <AddOtherDialog
      v-model="showConnectionDialog"
      title="Add Connection"
      type-label="Connection type"
      :types="classifiers.connectionTypes"
      @add="handleAddConnection"
    />

    <AddOtherDialog
      v-model="showCompanionDialog"
      title="Add Companion"
      type-label="Companion type"
      :types="classifiers.companionTypes"
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
    typeName: findByCode(classifiers.connectionTypes, c.connectionType.code)?.name ?? 'Unknown',
  }))
);

const companionItems = computed(() =>
  heroStore.companions.map((c) => ({
    id: c.id,
    name: c.description ?? 'Companion',
    description: c.notes,
    typeName: findByCode(classifiers.companionTypes, c.companionType.code)?.name ?? 'Unknown',
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
  deletionTracker?.trackDeletion('goals', goalId);
  removeById(heroStore.hero?.goals, goalId);
}

// Connection actions
function handleAddConnection(name: string, description: string | null, typeCode: string | null) {
  if (!heroStore.hero || !typeCode) return;
  const connType = findByCode(classifiers.connectionTypes, typeCode);
  if (!connType) return;
  const trimmedDesc = trimText(name);
  if (!trimmedDesc) return;
  const trimmedNotes = description ? trimText(description) : undefined;
  heroStore.hero.connections.push({
    id: heroStore.nextTempId(),
    heroId: heroStore.hero.id,
    connectionType: toClassifierRef(connType),
    description: trimmedDesc,
    ...(trimmedNotes ? { notes: trimmedNotes } : {}),
  });
}

function removeConnection(connectionId: number) {
  deletionTracker?.trackDeletion('connections', connectionId);
  removeById(heroStore.hero?.connections, connectionId);
}

// Companion actions
function handleAddCompanion(name: string, description: string | null, typeCode: string | null) {
  if (!heroStore.hero || !typeCode) return;
  const compType = findByCode(classifiers.companionTypes, typeCode);
  if (!compType) return;
  const trimmedDesc = trimText(name);
  if (!trimmedDesc) return;
  const trimmedNotes = description ? trimText(description) : undefined;
  heroStore.hero.companions.push({
    id: heroStore.nextTempId(),
    heroId: heroStore.hero.id,
    companionType: toClassifierRef(compType),
    description: trimmedDesc,
    ...(trimmedNotes ? { notes: trimmedNotes } : {}),
  });
}

function removeCompanion(companionId: number) {
  deletionTracker?.trackDeletion('companions', companionId);
  removeById(heroStore.hero?.companions, companionId);
}
</script>
