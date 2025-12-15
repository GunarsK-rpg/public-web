<template>
  <div class="others-tab">
    <!-- Ancestry & Culture Section -->
    <q-expansion-item icon="public" label="Ancestry & Culture" default-opened class="q-mb-sm">
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
          <div v-if="heroCultures.length === 0" class="text-empty q-mb-md">
            No cultures selected
          </div>
          <q-list v-else separator class="q-mb-md">
            <q-item v-for="heroCulture in heroCultures" :key="heroCulture.id" dense>
              <q-item-section>
                <q-item-label>{{ getCultureName(heroCulture.cultureId) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Goals Section -->
    <q-expansion-item icon="flag" label="Goals" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div v-if="heroGoals.length === 0" class="text-empty">No goals set</div>
          <q-list v-else separator>
            <q-item v-for="goal in heroGoals" :key="goal.id">
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
    <q-expansion-item icon="people" label="Connections" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div v-if="heroConnections.length === 0" class="text-empty">No connections</div>
          <q-list v-else separator>
            <q-item v-for="conn in heroConnections" :key="conn.id">
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
    <q-expansion-item icon="pets" label="Companions" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div v-if="heroCompanions.length === 0" class="text-empty">No companions</div>
          <q-list v-else separator>
            <q-item v-for="comp in heroCompanions" :key="comp.id">
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
    <q-expansion-item icon="person" label="Biography" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Appearance</div>
          <div class="text-body2 q-mb-md">
            {{ heroStore.hero?.appearance ?? 'No appearance description' }}
          </div>

          <div class="text-subtitle2 q-mb-sm">Biography</div>
          <div class="text-body2 q-mb-md">
            {{ heroStore.hero?.biography ?? 'No biography' }}
          </div>

          <div class="text-subtitle2 q-mb-sm">Notes</div>
          <div class="text-body2">
            {{ heroStore.hero?.notes ?? 'No notes' }}
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Conditions Section -->
    <q-expansion-item icon="warning" label="Conditions & Injuries" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Active Conditions</div>
          <div v-if="heroConditions.length === 0" class="text-empty q-mb-md">
            No active conditions
          </div>
          <div v-else class="q-mb-md">
            <q-chip v-for="cond in heroConditions" :key="cond.id">
              {{ getConditionName(cond.conditionId) }}
            </q-chip>
          </div>

          <div class="text-subtitle2 q-mb-sm">Injuries</div>
          <div v-if="heroInjuries.length === 0" class="text-empty">No injuries</div>
          <q-list v-else dense>
            <q-item v-for="injury in heroInjuries" :key="injury.id">
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

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

// Hero data
const heroGoals = computed(() => heroStore.hero?.goals ?? []);
const heroConnections = computed(() => heroStore.hero?.connections ?? []);
const heroCompanions = computed(() => heroStore.hero?.companions ?? []);
const heroConditions = computed(() => heroStore.hero?.conditions ?? []);
const heroInjuries = computed(() => heroStore.hero?.injuries ?? []);
const heroCultures = computed(() => heroStore.hero?.cultures ?? []);

// Ancestry & Singer Form
const ancestry = computed(() =>
  classifiers.getById(classifiers.ancestries, heroStore.hero?.ancestryId)
);

const activeSingerForm = computed(() =>
  classifiers.getById(classifiers.singerForms, heroStore.hero?.activeSingerFormId)
);

// Generic lookup helper - uses direct array lookup instead of store method
// to avoid type issues with getById expecting Classifier type
function getClassifierName<T extends { id: number; name: string }>(
  list: T[],
  id: number | undefined
): string {
  if (id === undefined) return '';
  return list.find((item) => item.id === id)?.name ?? '';
}

// Lookup functions using generic helper
const getCultureName = (id: number) => getClassifierName(classifiers.cultures, id);
const getGoalStatusName = (id: number) => getClassifierName(classifiers.goalStatuses, id);
const getConnectionTypeName = (id: number) => getClassifierName(classifiers.connectionTypes, id);
const getCompanionTypeName = (id: number) => getClassifierName(classifiers.companionTypes, id);
const getConditionName = (id: number) => getClassifierName(classifiers.conditions, id);
const getInjuryName = (id: number) => getClassifierName(classifiers.injuries, id);
</script>
