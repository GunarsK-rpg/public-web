<template>
  <div>
    <div class="text-subtitle1 q-mb-sm">Allocate your attribute points</div>
    <div class="text-caption q-mb-md">
      Points remaining:
      <strong :class="pointsRemaining >= 0 ? 'text-positive' : 'text-negative'">{{
        pointsRemaining
      }}</strong>
      / {{ pointBudgets.attributes }}
    </div>

    <!-- Attribute Sliders -->
    <div class="row q-col-gutter-md">
      <div v-for="attr in attributeList" :key="attr.code" class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="text-subtitle2">{{ attr.name }} ({{ attr.abbr }})</div>
              <q-space />
              <q-badge :color="attr.typeColor">{{ attr.typeName }}</q-badge>
            </div>
            <div class="text-caption q-mb-sm">{{ attr.description }}</div>
            <div class="row items-center">
              <q-btn
                round
                dense
                flat
                icon="remove"
                :disable="getAttrValue(attr.code) <= 0"
                @click="decrementAttr(attr.code)"
              />
              <div class="text-h5 q-mx-md" style="min-width: 30px; text-align: center">
                {{ getAttrValue(attr.code) }}
              </div>
              <q-btn
                round
                dense
                flat
                icon="add"
                :disable="getAttrValue(attr.code) >= 5 || pointsRemaining <= 0"
                @click="incrementAttr(attr.code)"
              />
              <q-slider
                :model-value="getAttrValue(attr.code)"
                :min="0"
                :max="5"
                :step="1"
                label
                class="q-ml-md col"
                @update:model-value="setAttrValue(attr.code, $event)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Derived Stats Preview -->
    <div class="text-subtitle1 q-mb-md">Derived Stats Preview</div>
    <div class="row q-col-gutter-sm">
      <div class="col-6 col-sm-4 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-caption">Max Health</div>
            <div class="text-h6">{{ derivedStats.maxHealth }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-caption">Max Focus</div>
            <div class="text-h6">{{ derivedStats.maxFocus }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-caption">Physical Defense</div>
            <div class="text-h6">{{ derivedStats.physicalDefense }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-caption">Cognitive Defense</div>
            <div class="text-h6">{{ derivedStats.cognitiveDefense }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-caption">Spiritual Defense</div>
            <div class="text-h6">{{ derivedStats.spiritualDefense }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-caption">Movement</div>
            <div class="text-h6">{{ derivedStats.movement }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-caption">Recovery Die</div>
            <div class="text-h6">{{ derivedStats.recoveryDie }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-caption">Carry Capacity</div>
            <div class="text-h6">{{ derivedStats.carryCapacity }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterCreationStore } from 'stores/character-creation';
import type { AttributeAllocation } from 'src/types';

const store = useCharacterCreationStore();

const pointBudgets = computed(() => store.pointBudgets);
const pointsRemaining = computed(() => store.attributePointsRemaining);
const derivedStats = computed(() => store.derivedStatsPreview);

const attributeList = [
  {
    code: 'strength',
    abbr: 'STR',
    name: 'Strength',
    typeName: 'Physical',
    typeColor: 'red',
    description: 'Raw physical power and endurance',
  },
  {
    code: 'speed',
    abbr: 'SPD',
    name: 'Speed',
    typeName: 'Physical',
    typeColor: 'red',
    description: 'Agility, reflexes, and quickness',
  },
  {
    code: 'intellect',
    abbr: 'INT',
    name: 'Intellect',
    typeName: 'Cognitive',
    typeColor: 'blue',
    description: 'Reasoning, memory, and learning',
  },
  {
    code: 'willpower',
    abbr: 'WIL',
    name: 'Willpower',
    typeName: 'Cognitive',
    typeColor: 'blue',
    description: 'Mental fortitude and focus',
  },
  {
    code: 'awareness',
    abbr: 'AWA',
    name: 'Awareness',
    typeName: 'Spiritual',
    typeColor: 'purple',
    description: 'Perception and intuition',
  },
  {
    code: 'presence',
    abbr: 'PRE',
    name: 'Presence',
    typeName: 'Spiritual',
    typeColor: 'purple',
    description: 'Force of personality and leadership',
  },
];

function getAttrValue(code: string): number {
  return store.attributes.allocation[code as keyof AttributeAllocation] || 0;
}

function setAttrValue(code: string, value: number | null) {
  if (value !== null) {
    store.updateAttributes({ [code]: Math.max(0, Math.min(5, value)) });
  }
}

function incrementAttr(code: string) {
  const current = getAttrValue(code);
  if (current < 5 && pointsRemaining.value > 0) {
    setAttrValue(code, current + 1);
  }
}

function decrementAttr(code: string) {
  const current = getAttrValue(code);
  if (current > 0) {
    setAttrValue(code, current - 1);
  }
}
</script>
