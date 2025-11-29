<template>
  <div class="stats-tab">
    <!-- Attributes Section -->
    <div class="section-title">Attributes</div>
    <div class="row q-col-gutter-sm q-mb-md">
      <div v-for="attr in attributes" :key="attr.id" class="col-6 col-sm-4 col-md-2">
        <q-card class="attribute-card" :class="attr.category">
          <q-card-section class="text-center q-pa-sm">
            <div class="attribute-abbr">{{ attr.abbreviation }}</div>
            <div class="attribute-value">{{ getAttributeValue(attr.id) }}</div>
            <div class="attribute-name">{{ attr.name }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Defenses Section -->
    <div class="section-title">Defenses</div>
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-4">
        <q-card class="defense-card physical">
          <q-card-section class="text-center q-pa-sm">
            <div class="defense-value">{{ physicalDefense }}</div>
            <div class="defense-name">Physical</div>
            <div class="defense-formula text-caption">10 + STR + SPD</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-4">
        <q-card class="defense-card cognitive">
          <q-card-section class="text-center q-pa-sm">
            <div class="defense-value">{{ cognitiveDefense }}</div>
            <div class="defense-name">Cognitive</div>
            <div class="defense-formula text-caption">10 + INT + WIL</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-4">
        <q-card class="defense-card spiritual">
          <q-card-section class="text-center q-pa-sm">
            <div class="defense-value">{{ spiritualDefense }}</div>
            <div class="defense-name">Spiritual</div>
            <div class="defense-formula text-caption">10 + AWA + PRE</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Deflect -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-4">
        <q-card class="defense-card">
          <q-card-section class="text-center q-pa-sm">
            <div class="defense-value">{{ deflect }}</div>
            <div class="defense-name">Deflect</div>
            <div class="defense-formula text-caption">From Armor</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Derived Stats -->
    <div class="section-title">Derived Stats</div>
    <div class="row q-col-gutter-sm">
      <div class="col-6 col-sm-3">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-caption text-grey">Movement</div>
            <div class="text-body1">{{ movementRate }} ft</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-caption text-grey">Recovery Die</div>
            <div class="text-body1">{{ recoveryDie }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-caption text-grey">Lift Capacity</div>
            <div class="text-body1">{{ liftCapacity }} lb</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-caption text-grey">Senses Range</div>
            <div class="text-body1">{{ sensesRange }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterStore } from 'stores/character';
import { useClassifierStore } from 'stores/classifiers';
import type { AttributeId } from 'src/types';

const characterStore = useCharacterStore();
const classifierStore = useClassifierStore();

const character = computed(() => characterStore.character);
const attributes = computed(() => classifierStore.attributes);
const physicalDefense = computed(() => characterStore.physicalDefense);
const cognitiveDefense = computed(() => characterStore.cognitiveDefense);
const spiritualDefense = computed(() => characterStore.spiritualDefense);
const deflect = computed(() => characterStore.deflect);

function getAttributeValue(attrId: AttributeId): number {
  if (!character.value) return 0;
  return character.value[attrId] || 0;
}

// Derived stat calculations
const movementRate = computed(() => {
  const spd = character.value?.speed || 0;
  const rates: Record<number, number> = {
    0: 20,
    1: 25,
    2: 30,
    3: 35,
    4: 40,
    5: 50,
  };
  return rates[Math.min(spd, 5)] || 20 + spd * 10;
});

const recoveryDie = computed(() => {
  const wil = character.value?.willpower || 0;
  const dice: Record<number, string> = {
    0: 'd4',
    1: 'd6',
    2: 'd8',
    3: 'd10',
    4: 'd12',
    5: 'd20',
  };
  return dice[Math.min(wil, 5)] || 'd4';
});

const liftCapacity = computed(() => {
  const str = character.value?.strength || 0;
  const caps: Record<number, number> = {
    0: 100,
    1: 200,
    2: 500,
    3: 1000,
    4: 2000,
    5: 10000,
  };
  return caps[Math.min(str, 5)] || 100;
});

const sensesRange = computed(() => {
  const awa = character.value?.awareness || 0;
  const ranges: Record<number, string> = {
    0: '5 ft',
    1: '10 ft',
    2: '30 ft',
    3: '60 ft',
    4: '120 ft',
    5: 'Unaffected',
  };
  return ranges[Math.min(awa, 5)] || '5 ft';
});
</script>

<style scoped>
.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  opacity: 0.8;
}

.attribute-card {
  height: 100%;
}

.attribute-card.physical {
  border-left: 3px solid var(--q-info);
}

.attribute-card.cognitive {
  border-left: 3px solid var(--q-accent);
}

.attribute-card.spiritual {
  border-left: 3px solid var(--q-warning);
}

.attribute-abbr {
  font-size: 0.75rem;
  opacity: 0.6;
  text-transform: uppercase;
}

.attribute-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.attribute-name {
  font-size: 0.75rem;
  opacity: 0.7;
}

.defense-card {
  height: 100%;
}

.defense-card.physical {
  border-top: 3px solid var(--q-info);
}

.defense-card.cognitive {
  border-top: 3px solid var(--q-accent);
}

.defense-card.spiritual {
  border-top: 3px solid var(--q-warning);
}

.defense-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.defense-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.defense-formula {
  opacity: 0.6;
}
</style>
