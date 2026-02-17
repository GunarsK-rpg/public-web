<template>
  <div class="stats-tab" aria-live="polite" aria-atomic="false">
    <!-- Attributes Section -->
    <div class="section-title section-title--lg">Attributes</div>
    <div class="row q-col-gutter-sm q-mb-md">
      <div v-for="attr in classifiers.attributes" :key="attr.id" class="col-6 col-sm-4 col-md-2">
        <q-card class="attribute-card">
          <q-card-section class="text-center q-pa-sm">
            <div class="attribute-abbr">{{ attr.code.toUpperCase() }}</div>
            <div
              class="attribute-value"
              :aria-label="`${attr.name}: ${attrStore.getAttributeValue(attr.code)}`"
            >
              {{ attrStore.getAttributeValue(attr.code) }}
            </div>
            <div class="attribute-name">{{ attr.name }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Defenses Section -->
    <div class="section-title section-title--lg">Defenses</div>
    <div class="row q-col-gutter-sm q-mb-md">
      <div v-for="attrType in classifiers.attributeTypes" :key="attrType.id" class="col-4">
        <q-card class="defense-card">
          <q-card-section class="text-center q-pa-sm">
            <div
              class="defense-value"
              :aria-label="`${attrType.name} defense: ${attrStore.getDefenseValue(attrType.code)}`"
            >
              {{ attrStore.getDefenseValue(attrType.code) }}
            </div>
            <div class="defense-name">{{ attrType.name }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Other Stats -->
    <div class="section-title section-title--lg">Other Stats</div>
    <div class="row q-col-gutter-sm">
      <div v-for="stat in derivedStatsList" :key="stat.id" class="col-6 col-sm-3">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-caption text-muted">{{ stat.name }}</div>
            <div class="text-body1">
              {{ stat.totalDisplay }}
              <span v-if="stat.hasModifier && stat.modifier !== 0" class="text-caption">
                ({{ stat.baseDisplay }} {{ stat.modifier >= 0 ? '+' : '' }}{{ stat.modifier }})
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useClassifierStore } from 'src/stores/classifiers';
import { buildDerivedStatsList } from 'src/utils/derivedStats';

const attrStore = useHeroAttributesStore();
const classifiers = useClassifierStore();

const derivedStatsList = computed(() => {
  return buildDerivedStatsList(
    classifiers.derivedStats,
    classifiers.derivedStatValues,
    classifiers.attributes,
    attrStore.attributeValues,
    attrStore.levelData,
    attrStore.tierData,
    (statId) => attrStore.getDerivedStatModifier(statId),
    (statCode) => attrStore.getStatBonus(statCode)
  );
});
</script>

<style scoped>
.attribute-card {
  height: 100%;
}

.attribute-abbr {
  font-size: var(--font-size-sm);
  opacity: 0.6;
  text-transform: uppercase;
}

.attribute-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.attribute-name {
  font-size: var(--font-size-sm);
  opacity: 0.7;
}

.defense-card {
  height: 100%;
}

.defense-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.defense-name {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
