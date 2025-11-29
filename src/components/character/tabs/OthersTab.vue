<template>
  <div class="others-tab">
    <!-- Goals Section -->
    <q-expansion-item icon="flag" label="Goals" default-opened class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div v-if="goals.length === 0" class="text-grey">No goals set</div>
          <q-list v-else separator>
            <q-item v-for="goal in goals" :key="goal.name">
              <q-item-section avatar>
                <q-icon
                  :name="getGoalIcon(goal.type)"
                  :color="goal.status === 'completed' ? 'positive' : 'primary'"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label :class="{ 'text-strike': goal.status === 'completed' }">
                  {{ goal.name }}
                </q-item-label>
                <q-item-label caption>{{ goal.description }}</q-item-label>
                <q-item-label caption>
                  <q-badge :color="getGoalTypeColor(goal.type)" class="q-mr-xs">
                    {{ goal.type }}
                  </q-badge>
                  <q-badge outline>{{ goal.category }}</q-badge>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="goal.status === 'completed' ? 'positive' : 'grey'">
                  {{ goal.status }}
                </q-badge>
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
          <div v-if="connections.length === 0" class="text-grey">No connections</div>
          <q-list v-else separator>
            <q-item v-for="conn in connections" :key="conn.name">
              <q-item-section avatar>
                <q-icon
                  :name="getConnectionIcon(conn.type)"
                  :color="getConnectionColor(conn.type)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ conn.name }}</q-item-label>
                <q-item-label caption>{{ conn.description }}</q-item-label>
                <q-item-label v-if="conn.organization" caption>
                  Organization: {{ conn.organization }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="getConnectionColor(conn.type)">
                  {{ conn.type }}
                </q-badge>
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
          <div v-if="companions.length === 0" class="text-grey">No companions</div>
          <q-list v-else separator>
            <q-item v-for="comp in companions" :key="comp.name">
              <q-item-section avatar>
                <q-icon :name="getCompanionIcon(comp.type)" :color="getCompanionColor(comp.type)" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ comp.name }}</q-item-label>
                <q-item-label caption>{{ comp.type }}</q-item-label>
                <q-item-label v-if="comp.personality" caption>
                  {{ comp.personality }}
                </q-item-label>
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
            {{ character?.appearance || 'No appearance description' }}
          </div>

          <div class="text-subtitle2 q-mb-sm">Biography</div>
          <div class="text-body2 q-mb-md">
            {{ character?.biography || 'No biography' }}
          </div>

          <div class="text-subtitle2 q-mb-sm">Notes</div>
          <div class="text-body2">
            {{ character?.notes || 'No notes' }}
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Conditions Section -->
    <q-expansion-item icon="warning" label="Conditions & Injuries" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Active Conditions</div>
          <div v-if="conditions.length === 0" class="text-grey q-mb-md">No active conditions</div>
          <div v-else class="q-mb-md">
            <q-chip
              v-for="cond in conditions"
              :key="cond.id"
              :color="isPositiveCondition(cond.conditionId) ? 'positive' : 'negative'"
              text-color="white"
            >
              {{ getConditionName(cond.conditionId) }}
              <span v-if="cond.value">[{{ cond.value }}]</span>
            </q-chip>
          </div>

          <div class="text-subtitle2 q-mb-sm">Injuries</div>
          <div v-if="injuries.length === 0" class="text-grey">No injuries</div>
          <q-list v-else dense>
            <q-item v-for="injury in injuries" :key="injury.id">
              <q-item-section>
                <q-item-label>{{ injury.injuryId }}</q-item-label>
                <q-item-label caption v-if="injury.daysRemaining">
                  {{ injury.daysRemaining }} days remaining
                </q-item-label>
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
import { useCharacterStore } from 'stores/character';
import { useClassifierStore } from 'stores/classifiers';
import type { GoalType, ConnectionType, CompanionType, ConditionId } from 'src/types';

const characterStore = useCharacterStore();
const classifierStore = useClassifierStore();

const character = computed(() => characterStore.character);
const goals = computed(() => character.value?.goals || []);
const connections = computed(() => character.value?.connections || []);
const companions = computed(() => character.value?.companions || []);
const conditions = computed(() => character.value?.conditions || []);
const injuries = computed(() => character.value?.injuries || []);

function getGoalIcon(type: GoalType): string {
  const icons: Record<GoalType, string> = {
    'short-term': 'schedule',
    'long-term': 'trending_up',
    personal: 'person',
  };
  return icons[type] || 'flag';
}

function getGoalTypeColor(type: GoalType): string {
  const colors: Record<GoalType, string> = {
    'short-term': 'blue',
    'long-term': 'purple',
    personal: 'teal',
  };
  return colors[type] || 'grey';
}

function getConnectionIcon(type: ConnectionType): string {
  const icons: Record<ConnectionType, string> = {
    ally: 'handshake',
    contact: 'contact_phone',
    rival: 'sports_kabaddi',
    enemy: 'dangerous',
    patron: 'volunteer_activism',
    follower: 'group',
  };
  return icons[type] || 'person';
}

function getConnectionColor(type: ConnectionType): string {
  const colors: Record<ConnectionType, string> = {
    ally: 'positive',
    contact: 'info',
    rival: 'warning',
    enemy: 'negative',
    patron: 'purple',
    follower: 'teal',
  };
  return colors[type] || 'grey';
}

function getCompanionIcon(type: CompanionType): string {
  const icons: Record<CompanionType, string> = {
    spren: 'auto_awesome',
    animal: 'pets',
    follower: 'person',
  };
  return icons[type] || 'pets';
}

function getCompanionColor(type: CompanionType): string {
  const colors: Record<CompanionType, string> = {
    spren: 'amber',
    animal: 'brown',
    follower: 'blue',
  };
  return colors[type] || 'grey';
}

function getConditionName(id: ConditionId): string {
  return classifierStore.getConditionById(id)?.name || id;
}

function isPositiveCondition(id: ConditionId): boolean {
  return classifierStore.getConditionById(id)?.isPositive || false;
}
</script>
