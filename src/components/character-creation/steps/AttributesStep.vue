<template>
  <q-form ref="formRef" greedy>
    <div class="text-subtitle1 q-mb-sm">Allocate your attribute points</div>
    <BudgetDisplay
      label="Points remaining"
      :remaining="pointsRemaining"
      :total="pointsBudget"
      :show-total="true"
    />

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
                :aria-label="`Decrease ${attr.name}`"
                :disable="getAttrValue(attr.id) <= 0"
                @click="decrementAttr(attr.id)"
                ><Minus :size="20"
              /></q-btn>
              <div
                class="text-h5 q-mx-md value-display"
                :aria-label="`${attr.name}: ${getAttrValue(attr.id)}`"
                role="status"
              >
                {{ getAttrValue(attr.id) }}
              </div>
              <q-btn
                round
                dense
                flat
                :aria-label="`Increase ${attr.name}`"
                :disable="getAttrValue(attr.id) >= 5 || pointsRemaining <= 0"
                @click="incrementAttr(attr.id)"
                ><Plus :size="20"
              /></q-btn>
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

    <!-- Other Stats -->
    <div class="section-title section-title--lg">Other Stats</div>
    <div class="row q-col-gutter-sm q-mb-md">
      <div v-for="stat in derivedStatsList" :key="stat.id" class="col-6 col-sm-3">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-caption text-muted">{{ stat.name }}</div>
            <div class="row items-center no-wrap">
              <div class="text-body1 q-mr-sm">{{ stat.baseDisplay }}</div>
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
              <div v-if="stat.modifier !== 0 || stat.bonus !== 0" class="text-caption q-ml-sm">
                <span v-if="stat.bonus !== 0">
                  {{ stat.bonus >= 0 ? '+' : '' }}{{ stat.bonus }}
                </span>
                = {{ stat.totalDisplay }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { QForm } from 'quasar';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useClassifierStore } from 'src/stores/classifiers';
import { useStepValidation } from 'src/composables/useStepValidation';
import { buildDerivedStatsList } from 'src/utils/derivedStats';
import { findById } from 'src/utils/arrayUtils';
import { normalizeModifierInput } from 'src/composables/useModifierInput';
import { clamp } from 'src/utils/numberUtils';
import { Minus, Plus } from 'lucide-vue-next';
import BudgetDisplay from '../shared/BudgetDisplay.vue';

const formRef = ref<QForm | null>(null);

const attrStore = useHeroAttributesStore();
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
    const attrType = findById(classifiers.attributeTypes, attr.attrType.id);
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
const derivedStatsList = computed(() =>
  buildDerivedStatsList(
    classifiers.derivedStats,
    classifiers.derivedStatValues,
    classifiers.attributes,
    attrStore.baseAttributeValues,
    attrStore.levelData,
    attrStore.tierData,
    (statId) => attrStore.getDerivedStatModifier(statId),
    (statCode) => attrStore.getStatBonus(statCode)
  )
);

function setStatModifier(statId: number, value: string | number | null) {
  const normalized = normalizeModifierInput(value);
  if (normalized !== null) {
    attrStore.setDerivedStatModifier(statId, normalized);
  }
}

function getAttrValue(attrId: number): number {
  return attrStore.getAttributeValueById(attrId);
}

function setAttrValue(attrId: number, value: number | null) {
  if (value === null) return;
  const currentValue = getAttrValue(attrId);
  const clampedValue = clamp(value, 0, 5);
  const pointsToSpend = clampedValue - currentValue;

  // If increasing, check budget
  if (pointsToSpend > 0 && pointsToSpend > pointsRemaining.value) {
    // Only allow spending what's available
    const maxAllowed = currentValue + pointsRemaining.value;
    attrStore.setAttribute(attrId, Math.min(5, maxAllowed));
  } else {
    attrStore.setAttribute(attrId, clampedValue);
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

async function validate(): Promise<boolean> {
  return (await formRef.value?.validate()) ?? true;
}

defineExpose({ validate });
</script>
