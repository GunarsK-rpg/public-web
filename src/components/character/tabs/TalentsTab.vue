<template>
  <div class="talents-tab">
    <!-- Path Info -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-overline">Heroic Path</div>
        <div class="text-h6">{{ pathName }}</div>
        <div class="text-caption">Specialty: {{ specialtyName }}</div>
      </q-card-section>
    </q-card>

    <!-- Radiant Order (if applicable) -->
    <q-card v-if="isRadiant" flat bordered class="q-mb-md radiant-card">
      <q-card-section>
        <div class="text-overline">Radiant Order</div>
        <div class="text-h6">{{ orderName }}</div>
        <div class="text-caption">Ideal Level: {{ character?.radiantIdeal || 0 }}</div>
        <div class="text-caption">Surges: {{ surgeName1 }}, {{ surgeName2 }}</div>
      </q-card-section>
    </q-card>

    <!-- Acquired Talents -->
    <div class="section-title">Acquired Talents</div>
    <div v-if="talents.length === 0" class="text-grey q-pa-md">No talents acquired yet</div>
    <q-list v-else separator>
      <q-item v-for="talent in characterTalents" :key="talent.id">
        <q-item-section avatar>
          <q-icon
            :name="talent.isKeyTalent ? 'star' : 'auto_awesome'"
            :color="talent.isKeyTalent ? 'amber' : 'primary'"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ talent.name }}</q-item-label>
          <q-item-label caption>{{ talent.effect }}</q-item-label>
          <q-item-label caption class="q-mt-xs">
            <q-badge :color="getActivationColor(talent.activation)" class="q-mr-xs">
              {{ formatActivation(talent.activation) }}
            </q-badge>
            <q-badge v-if="talent.focusCost" color="teal" outline>
              {{ talent.focusCost }} Focus
            </q-badge>
            <q-badge v-if="talent.investitureCost" color="amber" outline>
              {{ talent.investitureCost }} Investiture
            </q-badge>
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterStore } from 'stores/character';
import { useClassifierStore } from 'stores/classifiers';
import type { TalentActivation, Talent } from 'src/types';

const characterStore = useCharacterStore();
const classifierStore = useClassifierStore();

const character = computed(() => characterStore.character);
const isRadiant = computed(() => characterStore.isRadiant);

const talents = computed(() => character.value?.talents || []);

const characterTalents = computed((): Talent[] => {
  return talents.value
    .map((t) => classifierStore.getTalentById(t.talentId))
    .filter((t): t is Talent => t !== undefined);
});

const pathName = computed(() => {
  if (!character.value) return '';
  const path = classifierStore.getHeroicPathById(character.value.heroicPath);
  return path?.name || character.value.heroicPath;
});

const specialtyName = computed(() => {
  if (!character.value) return '';
  const specialty = classifierStore.getSpecialtyById(character.value.specialty);
  return specialty?.name || character.value.specialty;
});

const orderName = computed(() => {
  if (!character.value?.radiantOrder) return '';
  const order = classifierStore.getRadiantOrderById(character.value.radiantOrder);
  return order?.name || character.value.radiantOrder;
});

const surgeName1 = computed(() => {
  if (!character.value?.radiantOrder) return '';
  const order = classifierStore.getRadiantOrderById(character.value.radiantOrder);
  if (!order) return '';
  const surge = classifierStore.getSurgeById(order.surges[0]);
  return surge?.name || order.surges[0];
});

const surgeName2 = computed(() => {
  if (!character.value?.radiantOrder) return '';
  const order = classifierStore.getRadiantOrderById(character.value.radiantOrder);
  if (!order) return '';
  const surge = classifierStore.getSurgeById(order.surges[1]);
  return surge?.name || order.surges[1];
});

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

function formatActivation(activation: TalentActivation): string {
  const labels: Record<TalentActivation, string> = {
    action: 'Action',
    'double-action': '2 Actions',
    'triple-action': '3 Actions',
    'free-action': 'Free',
    reaction: 'Reaction',
    special: 'Special',
    'always-active': 'Passive',
  };
  return labels[activation] || activation;
}
</script>

<style scoped>
.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 8px;
}

.radiant-card {
  border-left: 3px solid var(--q-warning);
}
</style>
