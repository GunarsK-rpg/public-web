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
          <div v-if="heroStore.cultures.length === 0" class="text-empty q-mb-md">
            No cultures selected
          </div>
          <q-list v-else separator class="q-mb-md">
            <q-item v-for="heroCulture in heroStore.cultures" :key="heroCulture.id" dense>
              <q-item-section>
                <q-item-label>{{
                  findById(classifiers.cultures, heroCulture.cultureId)?.name
                }}</q-item-label>
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
          <div v-if="heroStore.goals.length === 0" class="text-empty">No goals set</div>
          <q-list v-else separator>
            <q-item v-for="goal in heroStore.goals" :key="goal.id">
              <q-item-section>
                <q-item-label>{{ goal.name }}</q-item-label>
                <q-item-label v-if="goal.description" caption>{{ goal.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="grey">{{
                  findById(classifiers.goalStatuses, goal.statusId)?.name
                }}</q-badge>
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
          <div v-if="heroStore.connections.length === 0" class="text-empty">No connections</div>
          <q-list v-else separator>
            <q-item v-for="conn in heroStore.connections" :key="conn.id">
              <q-item-section>
                <q-item-label>{{ conn.description ?? 'Connection' }}</q-item-label>
                <q-item-label v-if="conn.notes" caption>{{ conn.notes }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="grey">{{
                  findById(classifiers.connectionTypes, conn.connTypeId)?.name
                }}</q-badge>
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
          <div v-if="heroStore.companions.length === 0" class="text-empty">No companions</div>
          <q-list v-else separator>
            <q-item v-for="comp in heroStore.companions" :key="comp.id">
              <q-item-section>
                <q-item-label>{{ comp.description ?? 'Companion' }}</q-item-label>
                <q-item-label v-if="comp.notes" caption>{{ comp.notes }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="grey">{{
                  findById(classifiers.companionTypes, comp.compTypeId)?.name
                }}</q-badge>
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
    <q-expansion-item icon="warning" label="Conditions & Injuries" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Active Conditions</div>
          <div v-if="heroStore.conditions.length === 0" class="text-empty q-mb-md">
            No active conditions
          </div>
          <div v-else class="q-mb-md">
            <q-chip v-for="cond in heroStore.conditions" :key="cond.id">
              {{ findById(classifiers.conditions, cond.conditionId)?.name }}
            </q-chip>
          </div>

          <div class="text-subtitle2 q-mb-sm">Injuries</div>
          <div v-if="heroStore.injuries.length === 0" class="text-empty">No injuries</div>
          <q-list v-else dense>
            <q-item v-for="injury in heroStore.injuries" :key="injury.id">
              <q-item-section>
                <q-item-label>{{
                  findById(classifiers.injuries, injury.injuryId)?.name
                }}</q-item-label>
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
</script>
