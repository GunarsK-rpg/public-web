<template>
  <div class="others-tab">
    <!-- Ancestry & Culture Section -->
    <q-expansion-item
      icon="public"
      label="Ancestry & Culture"
      aria-label="Ancestry and Culture section"
      default-opened
      class="q-mb-sm"
    >
      <q-card>
        <q-card-section>
          <!-- Ancestry -->
          <div class="text-subtitle2 q-mb-sm">Ancestry</div>
          <div class="row items-center q-mb-md">
            <div>
              <div class="text-body1 text-weight-medium">{{ ancestry?.name ?? 'Unknown' }}</div>
              <div class="text-caption text-muted">{{ ancestry?.description }}</div>
            </div>
          </div>

          <!-- Singer Form (if Singer) -->
          <template v-if="heroStore.isSinger && activeSingerForm">
            <div class="text-subtitle2 q-mb-sm">Current Form</div>
            <div class="row items-center q-mb-md">
              <q-chip>{{ activeSingerForm.name }}</q-chip>
            </div>
            <div v-if="activeSingerForm.description" class="text-caption q-mb-md">
              {{ activeSingerForm.description }}
            </div>
          </template>

          <!-- Cultures -->
          <div class="text-subtitle2 q-mb-sm">Cultures</div>
          <div v-if="heroStore.cultures.length === 0" class="text-empty q-mb-md">
            No cultures selected
          </div>
          <q-list v-else separator class="q-mb-md">
            <q-item v-for="heroCulture in heroStore.cultures" :key="heroCulture.id" dense>
              <q-item-section>
                <q-item-label>{{ getCultureName(heroCulture.cultureId) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Goals Section -->
    <q-expansion-item icon="flag" label="Goals" aria-label="Goals section" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div v-if="heroStore.goals.length === 0" class="text-empty">No goals set</div>
          <q-list v-else separator>
            <q-item v-for="goal in heroStore.goals" :key="goal.id">
              <q-item-section>
                <q-item-label>{{ goal.name }}</q-item-label>
                <q-item-label v-if="goal.description" caption>{{ goal.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="grey">{{ getGoalStatusName(goal.statusId) }}</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Connections Section -->
    <q-expansion-item
      icon="people"
      label="Connections"
      aria-label="Connections section"
      class="q-mb-sm"
    >
      <q-card>
        <q-card-section>
          <div v-if="heroStore.connections.length === 0" class="text-empty">No connections</div>
          <q-list v-else separator>
            <q-item v-for="conn in heroStore.connections" :key="conn.id">
              <q-item-section>
                <q-item-label>{{ conn.description ?? 'Connection' }}</q-item-label>
                <q-item-label v-if="conn.notes" caption>{{ conn.notes }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="grey">{{ getConnectionTypeName(conn.connTypeId) }}</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Companions Section -->
    <q-expansion-item
      icon="pets"
      label="Companions"
      aria-label="Companions section"
      class="q-mb-sm"
    >
      <q-card>
        <q-card-section>
          <div v-if="heroStore.companions.length === 0" class="text-empty">No companions</div>
          <q-list v-else separator>
            <q-item v-for="comp in heroStore.companions" :key="comp.id">
              <q-item-section>
                <q-item-label>{{ comp.description ?? 'Companion' }}</q-item-label>
                <q-item-label v-if="comp.notes" caption>{{ comp.notes }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="grey">{{ getCompanionTypeName(comp.compTypeId) }}</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Biography Section -->
    <q-expansion-item
      icon="person"
      label="Biography"
      aria-label="Biography section"
      class="q-mb-sm"
    >
      <q-card>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Appearance</div>
          <div class="text-body2 q-mb-md">
            {{ heroAppearance }}
          </div>

          <div class="text-subtitle2 q-mb-sm">Biography</div>
          <div class="text-body2 q-mb-md">
            {{ heroBiography }}
          </div>

          <div class="text-subtitle2 q-mb-sm">Notes</div>
          <div class="text-body2">
            {{ heroNotes }}
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Conditions Section -->
    <q-expansion-item
      icon="warning"
      label="Conditions & Injuries"
      aria-label="Conditions and Injuries section"
      class="q-mb-sm"
    >
      <q-card>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Active Conditions</div>
          <div v-if="heroStore.conditions.length === 0" class="text-empty q-mb-md">
            No active conditions
          </div>
          <div v-else class="q-mb-md">
            <q-chip v-for="cond in heroStore.conditions" :key="cond.id">
              {{ getConditionName(cond.conditionId) }}
            </q-chip>
          </div>

          <div class="text-subtitle2 q-mb-sm">Injuries</div>
          <div v-if="heroStore.injuries.length === 0" class="text-empty">No injuries</div>
          <q-list v-else dense>
            <q-item v-for="injury in heroStore.injuries" :key="injury.id">
              <q-item-section>
                <q-item-label>{{ getInjuryName(injury.injuryId) }}</q-item-label>
                <q-item-label v-if="injury.notes" caption>{{ injury.notes }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById } from 'src/utils/arrayUtils';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// Biography fields - computed for consistency with other hero data access
const heroAppearance = computed(() => heroStore.hero?.appearance ?? 'No appearance description');
const heroBiography = computed(() => heroStore.hero?.biography ?? 'No biography');
const heroNotes = computed(() => heroStore.hero?.notes ?? 'No notes');

// Ancestry & Singer Form
const ancestry = computed(() => findById(classifiers.ancestries, heroStore.hero?.ancestryId));

const activeSingerForm = computed(() =>
  findById(classifiers.singerForms, heroStore.hero?.activeSingerFormId)
);

// Pre-computed lookup maps for null-safe template access
const cultureNamesMap = computed(() => {
  const map = new Map<number, string>();
  for (const c of classifiers.cultures) map.set(c.id, c.name);
  return map;
});

const goalStatusNamesMap = computed(() => {
  const map = new Map<number, string>();
  for (const s of classifiers.goalStatuses) map.set(s.id, s.name);
  return map;
});

const connectionTypeNamesMap = computed(() => {
  const map = new Map<number, string>();
  for (const t of classifiers.connectionTypes) map.set(t.id, t.name);
  return map;
});

const companionTypeNamesMap = computed(() => {
  const map = new Map<number, string>();
  for (const t of classifiers.companionTypes) map.set(t.id, t.name);
  return map;
});

const conditionNamesMap = computed(() => {
  const map = new Map<number, string>();
  for (const c of classifiers.conditions) map.set(c.id, c.name);
  return map;
});

const injuryNamesMap = computed(() => {
  const map = new Map<number, string>();
  for (const i of classifiers.injuries) map.set(i.id, i.name);
  return map;
});

// Null-safe accessor functions
function getCultureName(id: number): string {
  return cultureNamesMap.value.get(id) ?? 'Unknown';
}

function getGoalStatusName(id: number): string {
  return goalStatusNamesMap.value.get(id) ?? 'Unknown';
}

function getConnectionTypeName(id: number): string {
  return connectionTypeNamesMap.value.get(id) ?? 'Unknown';
}

function getCompanionTypeName(id: number): string {
  return companionTypeNamesMap.value.get(id) ?? 'Unknown';
}

function getConditionName(id: number): string {
  return conditionNamesMap.value.get(id) ?? 'Unknown';
}

function getInjuryName(id: number): string {
  return injuryNamesMap.value.get(id) ?? 'Unknown';
}
</script>
