<template>
  <div class="stats-tab" aria-live="polite" aria-atomic="false">
    <DefensesSection :defenses="defenseValues" :deflect="deflectValue" :loading="loading" />
    <AttributesSection :attributes="attributeValues" :loading="loading" />
    <DerivedStatsSection :stats="derivedStatValues" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useClassifierStore } from 'src/stores/classifiers';
import { buildDerivedStatsList } from 'src/utils/derivedStats';
import { getConditionBonus } from 'src/utils/specialUtils';
import DefensesSection from 'src/components/shared/DefensesSection.vue';
import AttributesSection from 'src/components/shared/AttributesSection.vue';
import DerivedStatsSection from 'src/components/shared/DerivedStatsSection.vue';
import type { StatValue } from 'src/types/shared';

withDefaults(
  defineProps<{
    loading?: boolean;
  }>(),
  { loading: false }
);

const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();
const classifiers = useClassifierStore();

// Defenses
const defenseValues = computed((): StatValue[] =>
  classifiers.attributeTypes.map((at) => ({
    type: { id: at.id, code: at.code, name: at.name },
    value: attrStore.getDefenseValue(at.code),
  }))
);

const allDerivedStats = computed(() =>
  buildDerivedStatsList(
    classifiers.derivedStats,
    classifiers.derivedStatValues,
    classifiers.attributes,
    attrStore.attributeValues,
    attrStore.levelData,
    attrStore.tierData,
    (statId) => attrStore.getDerivedStatModifier(statId),
    (statCode) => attrStore.getStatBonus(statCode),
    (statCode, value) =>
      statCode === 'movement' ? attrStore.applyMovementConditions(value) : value
  )
);

const deflectValue = computed((): StatValue | null => {
  const stat = allDerivedStats.value.find((s) => s.code === 'deflect');
  if (!stat) return null;
  return {
    type: { id: stat.id, code: stat.code, name: stat.name },
    value: stat.totalValue,
  };
});

// Attributes
function getEnhancedBonus(attrCode: string): number {
  return getConditionBonus(heroStore.conditions, `attribute_${attrCode}`);
}

const attributeValues = computed((): StatValue[] =>
  classifiers.attributes.map((a) => {
    const bonus = getEnhancedBonus(a.code);
    const base = attrStore.baseAttributeValues[a.code] ?? 0;
    return {
      type: { id: a.id, code: a.code, name: a.name },
      value: attrStore.attributeValues[a.code] ?? 0,
      breakdown: bonus !== 0 ? `Base ${base} + Enhanced ${bonus > 0 ? '+' : ''}${bonus}` : null,
    };
  })
);

// Derived Stats
function statBreakdown(stat: { baseDisplay: string; modifier: number; bonus: number }): string {
  let result = `(${stat.baseDisplay}`;
  if (stat.modifier !== 0) result += ` ${stat.modifier >= 0 ? '+' : ''}${stat.modifier}`;
  if (stat.bonus !== 0) result += ` ${stat.bonus >= 0 ? '+' : ''}${stat.bonus}`;
  return result + ')';
}

const derivedStatValues = computed((): StatValue[] =>
  allDerivedStats.value
    .filter((s) => s.code !== 'deflect')
    .map((s) => ({
      type: { id: s.id, code: s.code, name: s.name },
      value: s.totalValue,
      displayValue: s.totalDisplay,
      breakdown: s.hasModifier && (s.modifier !== 0 || s.bonus !== 0) ? statBreakdown(s) : null,
    }))
);
</script>
