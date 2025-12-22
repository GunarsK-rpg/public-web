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
            icon="sym_o_delete"
            color="negative"
            size="sm"
            :aria-label="`Remove goal: ${goal.name}`"
            @click="removeGoal(goal.id)"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-6">
        <q-input v-model="newGoalName" label="Goal Name" outlined dense />
      </div>
      <div class="col-12 col-sm-4">
        <q-input v-model="newGoalDescription" label="Description (Optional)" outlined dense />
      </div>
      <div class="col-12 col-sm-2">
        <q-btn
          color="primary"
          icon="sym_o_add"
          label="Add"
          :disable="!newGoalName"
          @click="addGoal"
        />
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
              {{ findById(classifiers.connectionTypes, conn.connTypeId)?.name }}
            </q-badge>
            <span v-if="conn.notes" class="q-ml-sm">{{ conn.notes }}</span>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            round
            icon="sym_o_delete"
            color="negative"
            size="sm"
            :aria-label="`Remove connection: ${conn.description}`"
            @click="removeConnection(conn.id)"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-4">
        <q-input v-model="newConnectionDescription" label="Name/Description" outlined dense />
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
        />
      </div>
      <div class="col-12 col-sm-3">
        <q-input v-model="newConnectionNotes" label="Notes (Optional)" outlined dense />
      </div>
      <div class="col-12 col-sm-2">
        <q-btn
          color="primary"
          icon="sym_o_add"
          label="Add"
          :disable="!newConnectionDescription || !newConnectionType"
          @click="addConnection"
        />
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
      @update:model-value="setNotes"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { debounce } from 'src/utils/debounce';
import { findById } from 'src/utils/arrayUtils';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

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

// Debounced store mutations to reduce updates during typing
const debouncedSetBiography = debounce((val: string) => heroStore.setBiography(val), 300);
const debouncedSetAppearance = debounce((val: string) => heroStore.setAppearance(val), 300);
const debouncedSetNotes = debounce((val: string) => heroStore.setNotes(val), 300);

function setBiography(val: string | number | null) {
  if (val !== null) {
    debouncedSetBiography(String(val));
  }
}

function setAppearance(val: string | number | null) {
  if (val !== null) {
    debouncedSetAppearance(String(val));
  }
}

function setNotes(val: string | number | null) {
  if (val !== null) {
    debouncedSetNotes(String(val));
  }
}

function addGoal() {
  if (newGoalName.value) {
    heroStore.addGoal(newGoalName.value, newGoalDescription.value || undefined);
    newGoalName.value = '';
    newGoalDescription.value = '';
  }
}

function removeGoal(goalId: number) {
  heroStore.removeGoalById(goalId);
}

function addConnection() {
  if (newConnectionDescription.value && newConnectionType.value) {
    heroStore.addConnection(
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
  heroStore.removeConnectionById(connectionId);
}
</script>
