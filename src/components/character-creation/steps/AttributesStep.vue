<template>
  <div>
    <div class="text-subtitle1 q-mb-sm">Allocate your attribute points</div>
    <div class="text-caption q-mb-md">
      Points remaining:
      <strong :class="pointsRemaining >= 0 ? 'text-positive' : 'text-negative'">{{
        pointsRemaining
      }}</strong>
      / {{ pointsBudget }}
    </div>

    <!-- Attribute Sliders -->
    <div class="row q-col-gutter-md">
      <div v-for="attr in attributeList" :key="attr.id" class="col-12 col-md-6">
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
                :aria-label="`Decrease ${attr.name}`"
                :disable="getAttrValue(attr.id) <= 0"
                @click="decrementAttr(attr.id)"
              />
              <div
                class="text-h5 q-mx-md"
                style="min-width: 30px; text-align: center"
                :aria-label="`${attr.name}: ${getAttrValue(attr.id)}`"
                role="status"
              >
                {{ getAttrValue(attr.id) }}
              </div>
              <q-btn
                round
                dense
                flat
                icon="add"
                :aria-label="`Increase ${attr.name}`"
                :disable="getAttrValue(attr.id) >= 5 || pointsRemaining <= 0"
                @click="incrementAttr(attr.id)"
              />
              <q-slider
                :model-value="getAttrValue(attr.id)"
                :aria-label="`${attr.name} slider`"
                :min="0"
                :max="5"
                :step="1"
                label
                class="q-ml-md col"
                @update:model-value="setAttrValue(attr.id, $event)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Derived Stats -->
    <div class="text-subtitle1 q-mb-md">Derived Stats</div>
    <div class="row q-col-gutter-sm">
      <div v-for="stat in derivedStatsList" :key="stat.id" class="col-6 col-sm-4 col-md-3">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-caption q-mb-xs">{{ stat.name }}</div>
            <div class="row items-center no-wrap">
              <div class="text-h6 q-mr-sm">{{ stat.baseDisplay }}</div>
              <q-input
                v-if="stat.hasModifier"
                :model-value="stat.modifier"
                :aria-label="`${stat.name} modifier`"
                type="number"
                dense
                outlined
                class="modifier-input"
                :prefix="stat.modifier > 0 ? '+' : ''"
                @update:model-value="setStatModifier(stat.id, $event)"
              />
              <div v-if="stat.hasModifier && stat.modifier !== 0" class="text-subtitle2 q-ml-sm">
                = {{ stat.totalDisplay }}
              </div>
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
import { useStepValidation } from 'src/composables/useStepValidation';
import { buildDerivedStatsList } from 'src/utils/derivedStats';
import { findById } from 'src/utils/arrayUtils';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();
const { budget } = useStepValidation();

const attrBudget = computed(() => budget('attributes'));
const pointsRemaining = computed(() => attrBudget.value.remaining);
const pointsBudget = computed(() => attrBudget.value.budget);

const TYPE_COLORS: Record<string, string> = {
  physical: 'red',
  cognitive: 'blue',
  spiritual: 'purple',
};

const attributeList = computed(() =>
  classifiers.attributes.map((attr) => {
    const attrType = findById(classifiers.attributeTypes, attr.attrTypeId);
    return {
      id: attr.id,
      code: attr.code,
      abbr: attr.code.toUpperCase(),
      name: attr.name,
      typeName: attrType?.name ?? '',
      typeColor: TYPE_COLORS[attrType?.code ?? ''] ?? 'grey',
      description: attr.description ?? '',
    };
  })
);

// Derived stats list built from classifiers with calculated base values
const derivedStatsList = computed(() => {
  // Dynamically build attribute values from classifiers instead of hardcoding codes
  const attrs = Object.fromEntries(
    classifiers.attributes.map((attr) => [attr.code, heroStore.getAttributeValue(attr.code)])
  );

  return buildDerivedStatsList(
    classifiers.derivedStats,
    classifiers.derivedStatValues,
    classifiers.attributes,
    attrs,
    heroStore.levelData,
    heroStore.tierData,
    heroStore.getDerivedStatModifier
  );
});

function setStatModifier(statId: number, value: string | number | null) {
  // Handle null and empty string - reset to 0
  if (value === null || value === '') {
    heroStore.setDerivedStatModifier(statId, 0);
    return;
  }
  const numValue = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(numValue)) return;
  heroStore.setDerivedStatModifier(statId, numValue);
}

function getAttrValue(attrId: number): number {
  return heroStore.hero?.attributes.find((a) => a.attrId === attrId)?.value ?? 0;
}

function setAttrValue(attrId: number, value: number | null) {
  if (value === null) return;
  const currentValue = getAttrValue(attrId);
  const clampedValue = Math.max(0, Math.min(5, value));
  const pointsToSpend = clampedValue - currentValue;

  // If increasing, check budget
  if (pointsToSpend > 0 && pointsToSpend > pointsRemaining.value) {
    // Only allow spending what's available
    const maxAllowed = currentValue + pointsRemaining.value;
    heroStore.setAttribute(attrId, Math.min(5, maxAllowed));
  } else {
    heroStore.setAttribute(attrId, clampedValue);
  }
}

function incrementAttr(attrId: number) {
  const current = getAttrValue(attrId);
  if (current < 5 && pointsRemaining.value > 0) {
    setAttrValue(attrId, current + 1);
  }
}

function decrementAttr(attrId: number) {
  const current = getAttrValue(attrId);
  if (current > 0) {
    setAttrValue(attrId, current - 1);
  }
}
</script>
