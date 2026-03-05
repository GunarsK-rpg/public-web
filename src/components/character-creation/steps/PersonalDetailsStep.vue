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
    <q-list v-if="goals.length > 0" bordered separator class="q-mb-sm">
      <q-item v-for="goal in goals" :key="goal.id">
        <q-item-section>
          <q-item-label>{{ goal.name }}</q-item-label>
          <q-item-label v-if="goal.description" caption>{{ goal.description }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            round
            color="negative"
            size="sm"
            :aria-label="`Remove goal: ${goal.name}`"
            @click="removeGoal(goal.id)"
            ><Trash2 :size="20"
          /></q-btn>
        </q-item-section>
      </q-item>
    </q-list>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-6">
        <q-input v-model="newGoalName" label="Goal Name" outlined dense maxlength="100" />
      </div>
      <div class="col-12 col-sm-4">
        <q-input
          v-model="newGoalDescription"
          label="Description (Optional)"
          outlined
          dense
          maxlength="500"
        />
      </div>
      <div class="col-12 col-sm-2">
        <q-btn color="primary" :disable="!newGoalName" @click="addGoal"
          ><Plus :size="20" class="on-left" />Add</q-btn
        >
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Connections -->
    <div class="text-subtitle2 q-mb-sm">Connections</div>
    <q-list v-if="connections.length > 0" bordered separator class="q-mb-sm">
      <q-item v-for="conn in connections" :key="conn.id">
        <q-item-section>
          <q-item-label>{{ conn.description }}</q-item-label>
          <q-item-label caption>
            <q-badge color="grey-7">
              {{ findById(classifiers.connectionTypes, conn.connectionType.id)?.name ?? 'Unknown' }}
            </q-badge>
            <span v-if="conn.notes" class="q-ml-sm">{{ conn.notes }}</span>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            round
            color="negative"
            size="sm"
            :aria-label="`Remove connection: ${conn.description}`"
            @click="removeConnection(conn.id)"
            ><Trash2 :size="20"
          /></q-btn>
        </q-item-section>
      </q-item>
    </q-list>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-4">
        <q-input
          v-model="newConnectionDescription"
          label="Name/Description"
          outlined
          dense
          maxlength="200"
        />
      </div>
      <div class="col-12 col-sm-3">
        <q-select
          v-model="newConnectionType"
          :options="connectionTypeOptions"
          label="Type"
          outlined
          dense
          emit-value
          map-options
          behavior="menu"
        />
      </div>
      <div class="col-12 col-sm-3">
        <q-input
          v-model="newConnectionNotes"
          label="Notes (Optional)"
          outlined
          dense
          maxlength="500"
        />
      </div>
      <div class="col-12 col-sm-2">
        <q-btn
          color="primary"
          :disable="!newConnectionDescription || !newConnectionType"
          @click="addConnection"
          ><Plus :size="20" class="on-left" />Add</q-btn
        >
      </div>
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onUnmounted } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroDetailsStore } from 'src/stores/heroDetails';
import { useClassifierStore } from 'src/stores/classifiers';
import { debounce } from 'src/utils/debounce';
import { findById } from 'src/utils/arrayUtils';
import { Trash2, Plus } from 'lucide-vue-next';
import type { DeletionTracker } from 'src/composables/useDeletionTracker';

const heroStore = useHeroStore();
const detailsStore = useHeroDetailsStore();
const classifiers = useClassifierStore();
const deletionTracker = inject<DeletionTracker>('deletionTracker');

// Goals and connections from hero
const goals = computed(() => heroStore.goals);
const connections = computed(() => heroStore.connections);

// New goal form
const newGoalName = ref('');
const newGoalDescription = ref('');

// New connection form
const newConnectionDescription = ref('');
const newConnectionType = ref<number | null>(null);
const newConnectionNotes = ref('');

// Connection type options from classifiers
const connectionTypeOptions = computed(() =>
  classifiers.connectionTypes.map((t) => ({ value: t.id, label: t.name }))
);

// Factory for creating debounced text input handlers
function createDebouncedHandler(setter: (val: string) => void) {
  const debouncedFn = debounce(setter, 300);
  const handler = (val: string | number | null) => {
    if (val !== null) {
      debouncedFn(String(val));
    }
  };
  return { handler, cancel: debouncedFn.cancel };
}

// Create debounced handlers for text inputs
const biographyHandler = createDebouncedHandler((val) => detailsStore.setBiography(val));
const appearanceHandler = createDebouncedHandler((val) => detailsStore.setAppearance(val));
const notesHandler = createDebouncedHandler((val) => detailsStore.setNotes(val));

// Export handlers for template use
const setBiography = biographyHandler.handler;
const setAppearance = appearanceHandler.handler;
const setNotes = notesHandler.handler;

// Cancel pending debounced calls on unmount to prevent memory leaks
onUnmounted(() => {
  biographyHandler.cancel();
  appearanceHandler.cancel();
  notesHandler.cancel();
});

function addGoal() {
  if (newGoalName.value) {
    detailsStore.addGoal(newGoalName.value, newGoalDescription.value || undefined);
    newGoalName.value = '';
    newGoalDescription.value = '';
  }
}

function removeGoal(goalId: number) {
  deletionTracker?.trackDeletion('goals', goalId);
  detailsStore.removeGoalById(goalId);
}

function addConnection() {
  if (newConnectionDescription.value && newConnectionType.value) {
    detailsStore.addConnection(
      newConnectionType.value,
      newConnectionDescription.value,
      newConnectionNotes.value || undefined
    );
    newConnectionDescription.value = '';
    newConnectionType.value = null;
    newConnectionNotes.value = '';
  }
}

function removeConnection(connectionId: number) {
  deletionTracker?.trackDeletion('connections', connectionId);
  detailsStore.removeConnectionById(connectionId);
}
</script>
