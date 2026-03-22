<template>
  <div class="npc-stat-block">
    <!-- Header + Resources -->
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6">
        <template v-if="editable">
          <q-input
            :model-value="npc.name"
            label="Name *"
            dense
            borderless
            input-class="text-h5"
            @update:model-value="emitField('name', $event)"
          />
          <div class="row q-col-gutter-sm q-mt-xs">
            <div class="col-4">
              <q-select
                :model-value="npc.tier.code"
                :options="tierOptions"
                label="Tier"
                dense
                outlined
                emit-value
                map-options
                behavior="menu"
                @update:model-value="emitField('tierCode', $event)"
              />
            </div>
            <div class="col-4">
              <q-select
                :model-value="npc.type"
                :options="typeOptions"
                label="Type"
                dense
                outlined
                emit-value
                map-options
                behavior="menu"
                @update:model-value="emitField('type', $event)"
              />
            </div>
            <div class="col-4">
              <q-select
                :model-value="npc.size"
                :options="NPC_SIZES"
                label="Size *"
                dense
                outlined
                emit-value
                map-options
                behavior="menu"
                @update:model-value="emitField('size', $event)"
              />
            </div>
          </div>
          <q-input
            :model-value="npc.languages ?? ''"
            label="Languages"
            dense
            borderless
            class="q-mt-xs"
            @update:model-value="emitField('languages', $event)"
          />
          <q-input
            :model-value="npc.immunities ?? ''"
            label="Immunities"
            dense
            borderless
            @update:model-value="emitField('immunities', $event)"
          />
          <q-toggle
            v-if="showCompanionToggle"
            :model-value="npc.isCompanion"
            label="Available as companion"
            @update:model-value="emitField('isCompanion', $event ?? false)"
          />
        </template>
        <template v-else>
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
        </template>
      </div>
      <div class="col-12 col-sm-6">
        <ResourcesBar
          :derived-stats="npc.derivedStats"
          :current="currentResources"
          :saving="saving"
          :readonly="readonly || !currentResources"
          @update="(code, value) => emit('resourceUpdate', code, value)"
        />
      </div>
    </div>

    <q-separator class="q-mb-md" />

    <DefensesSection
      :defenses="npc.defenses"
      :deflect="deflect"
      :editable="editable"
      @update="(code, val) => emit('statUpdate', 'defenses', code, val)"
    />
    <AttributesSection
      :attributes="npc.attributes"
      :editable="editable"
      @update="(code, val) => emit('statUpdate', 'attributes', code, val)"
    />
    <DerivedStatsSection
      :stats="npc.derivedStats"
      :editable="editable"
      @add="emit('statAdd', 'derivedStats')"
      @edit="(i) => emit('statEdit', 'derivedStats', i)"
      @remove="(i) => emit('statRemove', 'derivedStats', i)"
    />

    <DerivedStatsSection
      v-if="skillValues.length || editable"
      title="Skills"
      :stats="editable ? editableSkillValues : skillValues"
      :editable="editable"
      @add="emit('statAdd', 'skills')"
      @edit="(i) => emit('statEdit', 'skills', i)"
      @remove="(i) => emit('statRemove', 'skills', i)"
    />

    <q-separator class="q-mb-md" />

    <ItemListSection
      title="Features"
      :items="featureItems"
      :editable="editable"
      @add="emit('itemAdd', 'features')"
      @edit="(i) => emit('itemEdit', 'features', i)"
      @remove="(i) => emit('itemRemove', 'features', i)"
    />
    <ItemListSection
      title="Actions"
      :items="actionItems"
      :editable="editable"
      @add="emit('itemAdd', 'actions')"
      @edit="(i) => emit('itemEdit', 'actions', i)"
      @remove="(i) => emit('itemRemove', 'actions', i)"
    />
    <ItemListSection
      title="Opportunities"
      singular-label="Opportunity"
      :items="opportunityItems"
      :separator="false"
      :editable="editable"
      @add="emit('itemAdd', 'opportunities')"
      @edit="(i) => emit('itemEdit', 'opportunities', i)"
      @remove="(i) => emit('itemRemove', 'opportunities', i)"
    />

    <template v-if="!editable && notes">
      <q-separator class="q-my-md" />
      <TextSection title="DM Notes" :text="notes" />
    </template>

    <q-separator v-if="npc.description || npc.tactics || editable" class="q-my-md" />
    <TextSection
      title="Description"
      :text="npc.description"
      :editable="editable"
      @update="(v) => emitField('description', v)"
    />
    <TextSection
      title="Tactics"
      :text="npc.tactics"
      :editable="editable"
      @update="(v) => emitField('tactics', v)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import { NPC_SIZES } from 'src/constants/combat';
import ResourcesBar from 'src/components/shared/ResourcesBar.vue';
import DefensesSection from 'src/components/shared/DefensesSection.vue';
import AttributesSection from 'src/components/shared/AttributesSection.vue';
import DerivedStatsSection from 'src/components/shared/DerivedStatsSection.vue';
import ItemListSection from 'src/components/shared/ItemListSection.vue';
import TextSection from 'src/components/shared/TextSection.vue';
import type { ResourceValues } from 'src/types/shared';
import type { Npc } from 'src/types';

const props = withDefaults(
  defineProps<{
    npc: Npc;
    displayName?: string | null | undefined;
    currentResources?: ResourceValues | null | undefined;
    notes?: string | null | undefined;
    saving?: boolean;
    readonly?: boolean;
    editable?: boolean;
    showCompanionToggle?: boolean;
  }>(),
  { editable: false, showCompanionToggle: false }
);

const emit = defineEmits<{
  resourceUpdate: [code: string, value: number];
  fieldUpdate: [field: string, value: string | boolean];
  statUpdate: [section: string, code: string, value: number];
  statAdd: [section: string];
  statEdit: [section: string, index: number];
  statRemove: [section: string, index: number];
  itemAdd: [list: string];
  itemEdit: [list: string, index: number];
  itemRemove: [list: string, index: number];
}>();

function emitField(field: string, value: string | number | null | boolean) {
  emit('fieldUpdate', field, typeof value === 'number' ? String(value) : (value ?? ''));
}

const classifiers = useClassifierStore();

const tierOptions = computed(() =>
  classifiers.tiers.map((t) => ({ label: t.name, value: t.code }))
);

const typeOptions = [
  { label: 'Minion', value: 'minion' },
  { label: 'Rival', value: 'rival' },
  { label: 'Boss', value: 'boss' },
];

const deflect = computed(() => props.npc.derivedStats.find((s) => s.type.code === 'deflect'));

const skillValues = computed(() =>
  props.npc.skills.map((s) => ({
    ...s,
    displayValue: s.value >= 0 ? `+${s.value}` : String(s.value),
  }))
);

// In edit mode, show only added skills with attribute name
const editableSkillValues = computed(() =>
  props.npc.skills.map((s) => {
    const skill = classifiers.skills.find((cs) => cs.code === s.type.code);
    const attrName = skill?.attr?.name ? ` (${skill.attr.name})` : '';
    return {
      ...s,
      type: { ...s.type, name: `${s.type.name}${attrName}` },
      displayValue: s.value >= 0 ? `+${s.value}` : String(s.value),
    };
  })
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
