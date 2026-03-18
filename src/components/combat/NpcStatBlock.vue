<template>
  <div class="npc-stat-block">
    <!-- Header + Resources -->
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6">
        <div class="text-h5">{{ displayName || npc.name }}</div>
        <div class="text-subtitle1 text-grey">
          {{ npc.tier.name }} {{ npc.type }}
          <span v-if="npc.size"> · {{ npc.size }}</span>
        </div>
        <div v-if="npc.languages" class="text-body2">
          <span class="text-weight-bold">Languages:</span> {{ npc.languages }}
        </div>
        <div v-if="npc.immunities" class="text-body2">
          <span class="text-weight-bold">Immunities:</span> {{ npc.immunities }}
        </div>
      </div>
      <div class="col-12 col-sm-6">
        <ResourcesBar
          :derived-stats="npc.derivedStats"
          :current="currentResources"
          :saving="saving"
          :readonly="!currentResources"
          @update="(code, value) => $emit('resource-update', code, value)"
        />
      </div>
    </div>

    <q-separator class="q-mb-md" />

    <DefensesSection :defenses="npc.defenses" :deflect="deflect" />
    <AttributesSection :attributes="npc.attributes" />
    <DerivedStatsSection :stats="npc.derivedStats" />

    <DerivedStatsSection v-if="skillValues.length" title="Skills" :stats="skillValues" />

    <q-separator class="q-mb-md" />

    <ItemListSection title="Features" :items="featureItems" />
    <ItemListSection title="Actions" :items="actionItems" />
    <ItemListSection title="Opportunities" :items="opportunityItems" :separator="false" />

    <q-separator v-if="npc.description || npc.tactics" class="q-my-md" />
    <TextSection title="Description" :text="npc.description" />
    <TextSection title="Tactics" :text="npc.tactics" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ResourcesBar from 'src/components/shared/ResourcesBar.vue';
import DefensesSection from 'src/components/shared/DefensesSection.vue';
import AttributesSection from 'src/components/shared/AttributesSection.vue';
import DerivedStatsSection from 'src/components/shared/DerivedStatsSection.vue';
import ItemListSection from 'src/components/shared/ItemListSection.vue';
import TextSection from 'src/components/shared/TextSection.vue';
import type { ResourceValues } from 'src/types/shared';
import type { Npc } from 'src/types';

const props = defineProps<{
  npc: Npc;
  displayName?: string | null | undefined;
  currentResources?: ResourceValues | null | undefined;
  saving?: boolean;
}>();

defineEmits<{
  'resource-update': [code: string, value: number];
}>();

const deflect = computed(() => props.npc.derivedStats.find((s) => s.type.code === 'deflect'));

const skillValues = computed(() =>
  props.npc.skills.map((s) => ({
    ...s,
    displayValue: s.value >= 0 ? `+${s.value}` : String(s.value),
  }))
);

const featureItems = computed(() =>
  props.npc.features.map((f) => ({ name: f.name, displayValue: f.display_value }))
);

const actionItems = computed(() =>
  props.npc.actions.map((a) => ({
    name: a.name,
    displayValue: a.display_value,
    activationType: a.activation_type,
  }))
);

const opportunityItems = computed(() =>
  props.npc.opportunities.map((o) => ({ name: o.name, displayValue: o.display_value }))
);
</script>

<style scoped>
.section-label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--q-grey-7, #616161);
  margin-bottom: 4px;
}
</style>
