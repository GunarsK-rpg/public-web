<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Add personal details (optional)</div>

    <!-- Biography -->
    <q-input
      v-model="biography"
      type="textarea"
      label="Biography"
      outlined
      autogrow
      class="q-mb-md"
    />

    <!-- Appearance -->
    <q-input
      v-model="appearance"
      type="textarea"
      label="Appearance"
      outlined
      autogrow
      class="q-mb-md"
    />

    <q-separator class="q-my-md" />

    <!-- Goals -->
    <div class="text-subtitle2 q-mb-sm">Goals</div>
    <q-list bordered separator class="q-mb-sm">
      <q-item v-for="(goal, index) in goals" :key="index">
        <q-item-section>
          <q-item-label>{{ goal.description }}</q-item-label>
          <q-item-label caption>
            <q-badge :color="getGoalTypeColor(goal.type)">{{ goal.type }}</q-badge>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            round
            icon="sym_o_delete"
            color="negative"
            size="sm"
            @click="removeGoal(index)"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-4">
        <q-select
          v-model="newGoalType"
          :options="goalTypeOptions"
          label="Type"
          outlined
          dense
          emit-value
          map-options
        />
      </div>
      <div class="col-12 col-sm-6">
        <q-input v-model="newGoalDescription" label="Goal Description" outlined dense />
      </div>
      <div class="col-12 col-sm-2">
        <q-btn
          color="primary"
          icon="sym_o_add"
          label="Add"
          :disable="!newGoalDescription"
          @click="addGoal"
        />
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Connections -->
    <div class="text-subtitle2 q-mb-sm">Connections</div>
    <q-list bordered separator class="q-mb-sm">
      <q-item v-for="(conn, index) in connections" :key="index">
        <q-item-section>
          <q-item-label>{{ conn.name }}</q-item-label>
          <q-item-label caption>
            <q-badge :color="getConnectionColor(conn.connectionTypeId)">
              {{ getConnectionTypeName(conn.connectionTypeId) }}
            </q-badge>
            <span v-if="conn.description" class="q-ml-sm">{{ conn.description }}</span>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            round
            icon="sym_o_delete"
            color="negative"
            size="sm"
            @click="removeConnection(index)"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-3">
        <q-input v-model="newConnectionName" label="Name" outlined dense />
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
      <div class="col-12 col-sm-4">
        <q-input v-model="newConnectionDescription" label="Description (Optional)" outlined dense />
      </div>
      <div class="col-12 col-sm-2">
        <q-btn
          color="primary"
          icon="sym_o_add"
          label="Add"
          :disable="!newConnectionName || !newConnectionType"
          @click="addConnection"
        />
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Notes -->
    <q-input v-model="notes" type="textarea" label="Additional Notes" outlined autogrow />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCharacterCreationStore } from 'stores/character-creation';
import { connectionTypes } from 'src/mock/type-classifiers';
import type { GoalEntry, ConnectionEntry } from 'src/types';

const store = useCharacterCreationStore();

// Form fields bound to store
const biography = computed({
  get: () => store.personalDetails.biography || '',
  set: (val) => store.updatePersonalDetails({ biography: val }),
});

const appearance = computed({
  get: () => store.personalDetails.appearance || '',
  set: (val) => store.updatePersonalDetails({ appearance: val }),
});

const notes = computed({
  get: () => store.personalDetails.notes || '',
  set: (val) => store.updatePersonalDetails({ notes: val }),
});

const goals = computed(() => store.personalDetails.goals);
const connections = computed(() => store.personalDetails.connections);

// New goal form
const newGoalType = ref<GoalEntry['type']>('short-term');
const newGoalDescription = ref('');

const goalTypeOptions = [
  { value: 'drive', label: 'Drive' },
  { value: 'burden', label: 'Burden' },
  { value: 'personal', label: 'Personal' },
  { value: 'short-term', label: 'Short-Term' },
  { value: 'long-term', label: 'Long-Term' },
];

function getGoalTypeColor(type: string): string {
  const colors: Record<string, string> = {
    drive: 'blue',
    burden: 'red',
    personal: 'purple',
    'short-term': 'green',
    'long-term': 'orange',
  };
  return colors[type] || 'grey';
}

function addGoal() {
  if (newGoalDescription.value) {
    store.addGoal({
      type: newGoalType.value,
      description: newGoalDescription.value,
      statusCode: 'active',
    });
    newGoalDescription.value = '';
  }
}

function removeGoal(index: number) {
  store.removeGoal(index);
}

// New connection form
const newConnectionName = ref('');
const newConnectionType = ref<number | null>(null);
const newConnectionDescription = ref('');

const connectionTypeOptions = connectionTypes.map((t) => ({
  value: t.id,
  label: t.name,
}));

function getConnectionTypeName(typeId: number): string {
  return connectionTypes.find((t) => t.id === typeId)?.name || 'Unknown';
}

function getConnectionColor(typeId: number): string {
  const colors: Record<number, string> = {
    1: 'green', // ally
    2: 'blue', // contact
    3: 'orange', // rival
    4: 'red', // enemy
    5: 'purple', // patron
    6: 'teal', // follower
  };
  return colors[typeId] || 'grey';
}

function addConnection() {
  if (newConnectionName.value && newConnectionType.value) {
    const connection: ConnectionEntry = {
      name: newConnectionName.value,
      connectionTypeId: newConnectionType.value,
    };
    if (newConnectionDescription.value) {
      connection.description = newConnectionDescription.value;
    }
    store.addConnection(connection);
    newConnectionName.value = '';
    newConnectionType.value = null;
    newConnectionDescription.value = '';
  }
}

function removeConnection(index: number) {
  store.removeConnection(index);
}
</script>
