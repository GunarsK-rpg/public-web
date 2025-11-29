<template>
  <div class="actions-tab">
    <div class="text-h6 q-mb-md">Combat Actions</div>

    <!-- Basic Actions -->
    <q-expansion-item icon="flash_on" label="Basic Actions" default-opened class="q-mb-sm">
      <q-card>
        <q-card-section>
          <q-list separator>
            <q-item>
              <q-item-section avatar>
                <q-badge color="primary">1</q-badge>
              </q-item-section>
              <q-item-section>
                <q-item-label>Strike</q-item-label>
                <q-item-label caption> Attack with equipped weapon </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-badge color="primary">1</q-badge>
              </q-item-section>
              <q-item-section>
                <q-item-label>Move</q-item-label>
                <q-item-label caption> Move up to your movement rate </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-badge color="primary">1</q-badge>
              </q-item-section>
              <q-item-section>
                <q-item-label>Defend</q-item-label>
                <q-item-label caption> +2 to all defenses until next turn </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Talent Actions -->
    <q-expansion-item icon="auto_awesome" label="Talent Actions" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div v-if="talents.length === 0" class="text-grey text-center q-pa-md">
            No talent actions available
          </div>
          <q-list v-else separator>
            <q-item v-for="talent in talentActions" :key="talent.id">
              <q-item-section avatar>
                <q-badge :color="getActivationColor(talent.activation)">
                  {{ getActivationCost(talent.activation) }}
                </q-badge>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ talent.name }}</q-item-label>
                <q-item-label caption>{{ talent.effect }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="talent.focusCost">
                <q-badge color="teal" outline> {{ talent.focusCost }} Focus </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Surge Actions (Radiants) -->
    <q-expansion-item v-if="isRadiant" icon="whatshot" label="Surge Actions" class="q-mb-sm">
      <q-card>
        <q-card-section>
          <div class="text-center text-grey q-pa-md">
            Surge actions will be implemented based on Radiant order
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterStore } from 'stores/character';
import { useClassifierStore } from 'stores/classifiers';
import type { TalentActivation, Talent } from 'src/types';

const characterStore = useCharacterStore();
const classifierStore = useClassifierStore();

const isRadiant = computed(() => characterStore.isRadiant);

const talents = computed((): Talent[] => {
  const char = characterStore.character;
  if (!char) return [];
  return char.talents
    .map((t) => classifierStore.getTalentById(t.talentId))
    .filter((t): t is Talent => t !== undefined);
});

const talentActions = computed((): Talent[] =>
  talents.value.filter((t) =>
    ['action', 'double-action', 'triple-action', 'reaction'].includes(t.activation)
  )
);

function getActivationColor(activation: TalentActivation): string {
  const colors: Record<TalentActivation, string> = {
    action: 'primary',
    'double-action': 'secondary',
    'triple-action': 'accent',
    'free-action': 'positive',
    reaction: 'warning',
    special: 'info',
    'always-active': 'grey',
  };
  return colors[activation] || 'grey';
}

function getActivationCost(activation: TalentActivation): string {
  const costs: Record<TalentActivation, string> = {
    action: '1',
    'double-action': '2',
    'triple-action': '3',
    'free-action': 'F',
    reaction: 'R',
    special: 'S',
    'always-active': '-',
  };
  return costs[activation] || '?';
}
</script>
