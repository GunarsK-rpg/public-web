<template>
  <div class="stats-tab">
    <!-- Attributes Section -->
    <div class="section-title">Attributes</div>
    <div class="row q-col-gutter-sm q-mb-md">
      <div v-for="attr in classifiers.attributes" :key="attr.id" class="col-6 col-sm-4 col-md-2">
        <q-card class="attribute-card">
          <q-card-section class="text-center q-pa-sm">
            <div class="attribute-abbr">{{ attr.code.toUpperCase() }}</div>
            <div
              class="attribute-value"
              :aria-label="`${attr.name}: ${heroStore.getAttributeValue(attr.code)}`"
            >
              {{ heroStore.getAttributeValue(attr.code) }}
            </div>
            <div class="attribute-name">{{ attr.name }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Defenses Section -->
    <div class="section-title">Defenses</div>
    <div class="row q-col-gutter-sm q-mb-md">
      <div v-for="attrType in classifiers.attributeTypes" :key="attrType.id" class="col-4">
        <q-card class="defense-card">
          <q-card-section class="text-center q-pa-sm">
            <div
              class="defense-value"
              :aria-label="`${attrType.name} defense: ${heroStore.getDefenseValue(attrType.code)}`"
            >
              {{ heroStore.getDefenseValue(attrType.code) }}
            </div>
            <div class="defense-name">{{ attrType.name }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Other Stats -->
    <div class="section-title">Other Stats</div>
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
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { buildDerivedStatsList, type AttributeValues } from 'src/utils/derivedStats';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

const derivedStatsList = computed(() => {
  const attrs: AttributeValues = {
    str: heroStore.getAttributeValue('str'),
    spd: heroStore.getAttributeValue('spd'),
    int: heroStore.getAttributeValue('int'),
    wil: heroStore.getAttributeValue('wil'),
    awa: heroStore.getAttributeValue('awa'),
    pre: heroStore.getAttributeValue('pre'),
  };

  return buildDerivedStatsList(
    classifiers.derivedStats,
    classifiers.derivedStatValues,
    classifiers.attributes,
    attrs,
    heroStore.levelData,
    heroStore.tierData,
    (statId) => heroStore.getDerivedStatModifier(statId)
  );
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

.defense-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.defense-name {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
