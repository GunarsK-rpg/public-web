<template>
  <div class="npc-stat-block">
    <!-- Header -->
    <div class="q-mb-md">
      <div class="text-h5">{{ npc.name }}</div>
      <div class="text-subtitle1 text-grey">
        {{ npc.tier.name }} {{ npc.type }}
        <span v-if="npc.size"> · {{ npc.size }}</span>
      </div>
    </div>

    <!-- Languages / Immunities -->
    <div v-if="npc.languages || npc.immunities" class="q-mb-md">
      <div v-if="npc.languages" class="text-body2">
        <span class="text-weight-bold">Languages:</span> {{ npc.languages }}
      </div>
      <div v-if="npc.immunities" class="text-body2">
        <span class="text-weight-bold">Immunities:</span> {{ npc.immunities }}
      </div>
    </div>

    <q-separator class="q-mb-md" />

    <!-- Defenses -->
    <div class="section-label">Defenses</div>
    <div class="row q-col-gutter-sm q-mb-md">
      <div v-for="def in npc.defenses" :key="def.type.code" class="col-3">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="stat-value">{{ def.value }}</div>
            <div class="stat-label">{{ def.type.name }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Attributes -->
    <div class="section-label">Attributes</div>
    <div class="row q-col-gutter-sm q-mb-md">
      <div v-for="attr in npc.attributes" :key="attr.type.code" class="col-4 col-sm-2">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="stat-abbr">{{ attr.type.code.toUpperCase() }}</div>
            <div class="stat-value">{{ attr.value }}</div>
            <div class="stat-label">{{ attr.type.name }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Derived Stats -->
    <div class="section-label">Derived Stats</div>
    <div class="row q-col-gutter-sm q-mb-md">
      <div v-for="stat in npc.derivedStats" :key="stat.type.code" class="col-6 col-sm-3">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-caption text-grey">{{ stat.type.name }}</div>
            <div class="text-body1">{{ stat.displayValue ?? stat.value }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Skills -->
    <template v-if="npc.skills.length">
      <div class="section-label">Skills</div>
      <div class="row q-col-gutter-sm q-mb-md">
        <div v-for="skill in npc.skills" :key="skill.type.code" class="col-6 col-sm-3">
          <q-card flat bordered>
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-grey">{{ skill.type.name }}</div>
              <div class="text-body1">{{ formatModifier(skill.value) }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <q-separator class="q-mb-md" />

    <!-- Features -->
    <template v-if="npc.features.length">
      <div class="section-label">Features</div>
      <div v-for="(feat, i) in npc.features" :key="i" class="q-mb-sm">
        <div class="text-weight-bold">{{ feat.name }}</div>
        <div class="text-body2">{{ feat.display_value }}</div>
      </div>
      <q-separator class="q-my-md" />
    </template>

    <!-- Actions -->
    <template v-if="npc.actions.length">
      <div class="section-label">Actions</div>
      <div v-for="(action, i) in npc.actions" :key="i" class="q-mb-sm">
        <div>
          <span class="text-weight-bold">{{ action.name }}</span>
          <q-badge class="q-ml-xs" color="grey-7" :label="action.activation_type" />
        </div>
        <div class="text-body2">{{ action.display_value }}</div>
      </div>
      <q-separator class="q-my-md" />
    </template>

    <!-- Opportunities -->
    <template v-if="npc.opportunities.length">
      <div class="section-label">Opportunities</div>
      <div v-for="(opp, i) in npc.opportunities" :key="i" class="q-mb-sm">
        <div class="text-weight-bold">{{ opp.name }}</div>
        <div class="text-body2">{{ opp.display_value }}</div>
      </div>
    </template>

    <!-- Description / Tactics -->
    <template v-if="npc.description || npc.tactics">
      <q-separator class="q-my-md" />
      <div v-if="npc.description" class="q-mb-md">
        <div class="section-label">Description</div>
        <div class="text-body2">{{ npc.description }}</div>
      </div>
      <div v-if="npc.tactics">
        <div class="section-label">Tactics</div>
        <div class="text-body2">{{ npc.tactics }}</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Npc } from 'src/types';

defineProps<{
  npc: Npc;
}>();

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
</script>

<style scoped>
.section-label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--q-grey-7, #616161);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.stat-abbr {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.7;
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.7;
}
</style>
