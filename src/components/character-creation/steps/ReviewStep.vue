<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Review your character before creation</div>

    <!-- Validation Summary -->
    <q-banner v-if="!isValid" class="banner-error q-mb-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_error" />
      </template>
      <div class="text-subtitle2">Validation Errors</div>
      <ul class="q-pl-md q-my-xs">
        <li v-for="(error, i) in validationErrors" :key="i">{{ error }}</li>
      </ul>
    </q-banner>

    <q-banner v-else class="banner-success q-mb-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_check_circle" />
      </template>
      Character is ready to create!
    </q-banner>

    <!-- Character Summary -->
    <div class="row q-col-gutter-md">
      <!-- Basic Info -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">{{ characterName || 'Unnamed Character' }}</div>
            <div class="text-subtitle2">Level {{ level }} {{ ancestryName }} {{ primaryPath }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <div class="text-caption">Ancestry</div>
                <div>{{ ancestryName }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption">Culture</div>
                <div>{{ cultureName }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption">Starting Kit</div>
                <div>{{ startingKitName }}</div>
              </div>
              <div class="col-6" v-if="isRadiant">
                <div class="text-caption">Radiant Order</div>
                <div>{{ radiantOrderName }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Attributes -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Attributes</div>
            <div class="row">
              <div class="col-2" v-for="attr in attributeDisplay" :key="attr.abbr">
                <div class="text-center">
                  <div class="text-h5">{{ attr.value }}</div>
                  <div class="text-caption" :class="attr.color">{{ attr.abbr }}</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Derived Stats</div>
            <div class="row">
              <div class="col-6">
                <span class="text-weight-medium">HP:</span> {{ derivedStats.maxHealth }}
              </div>
              <div class="col-6">
                <span class="text-weight-medium">Focus:</span> {{ derivedStats.maxFocus }}
              </div>
              <div class="col-6">
                <span class="text-weight-medium">Phys Def:</span> {{ derivedStats.physicalDefense }}
              </div>
              <div class="col-6">
                <span class="text-weight-medium">Cog Def:</span> {{ derivedStats.cognitiveDefense }}
              </div>
              <div class="col-6">
                <span class="text-weight-medium">Spir Def:</span>
                {{ derivedStats.spiritualDefense }}
              </div>
              <div class="col-6">
                <span class="text-weight-medium">Movement:</span> {{ derivedStats.movement }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Skills -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Skills</div>
            <div class="row">
              <div v-for="skill in skillDisplay" :key="skill.id" class="col-6">
                <span class="text-weight-medium">{{ skill.name }}:</span> {{ skill.rank }}
              </div>
            </div>
            <div v-if="skillDisplay.length === 0" class="text-caption text-muted">
              No skills allocated
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Expertises -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Expertises</div>
            <div>
              <q-chip
                v-for="exp in expertiseDisplay"
                :key="exp.id"
                :color="getSourceColor(exp.source)"
                text-color="white"
              >
                {{ exp.name }}
              </q-chip>
            </div>
            <div v-if="expertiseDisplay.length === 0" class="text-caption text-muted">
              No expertises selected
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Paths & Talents -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Heroic Paths & Talents</div>
            <div v-for="path in pathDisplay" :key="path.pathId" class="q-mb-sm">
              <div class="text-weight-medium">
                {{ path.pathName }}
                <span v-if="path.specialtyName" class="text-muted">
                  - {{ path.specialtyName }}</span
                >
              </div>
              <div class="text-caption text-muted">
                <span class="text-weight-medium">Talents:</span>
                {{ path.talents.join(', ') || 'None selected' }}
              </div>
            </div>
            <div v-if="pathDisplay.length === 0" class="text-caption text-muted">
              No paths selected
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Equipment -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Equipment</div>
            <div class="q-mb-sm">
              <span class="text-weight-medium">Spheres:</span> {{ spheres }}
            </div>
            <div v-for="eqType in equipmentTypesList" :key="eqType.id" class="q-mb-sm">
              <div v-if="getEquipmentByType(eqType.id).length > 0">
                <div class="text-caption text-weight-medium">{{ eqType.name }}</div>
                <q-chip
                  v-for="item in getEquipmentByType(eqType.id)"
                  :key="item.equipmentId"
                  outline
                >
                  {{ item.name }} x{{ item.quantity }}
                </q-chip>
              </div>
            </div>
            <div v-if="equipmentDisplay.length === 0" class="text-caption text-muted">
              No equipment
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterCreationStore } from 'stores/character-creation';
import { useClassifierStore } from 'stores/classifiers';
import { getTalentById } from 'src/mock/talents';
import { equipmentTypes } from 'src/mock/equipment';

const store = useCharacterCreationStore();
const classifiers = useClassifierStore();

// Validation
const validation = computed(() => store.validateStep(11));
const isValid = computed(() => validation.value.isValid);
const validationErrors = computed(() => validation.value.errors);

// Basic info
const characterName = computed(() => store.basicSetup.name);
const level = computed(() => store.basicSetup.level);

const ancestryName = computed(
  () => classifiers.ancestries.find((a) => a.id === store.ancestry.ancestryId)?.name || 'Unknown'
);

const cultureName = computed(
  () => classifiers.cultures.find((c) => c.id === store.culture.primaryCultureId)?.name || 'Unknown'
);

const startingKitName = computed(
  () => classifiers.getStartingKitById(store.startingKit.startingKitId)?.name || 'Unknown'
);

const primaryPath = computed(() => {
  if (store.paths.paths.length === 0) return '';
  const firstPath = store.paths.paths[0];
  if (!firstPath) return '';
  const path = classifiers.heroicPaths.find((p) => p.id === firstPath.pathId);
  return path?.name || '';
});

const isRadiant = computed(() => store.isRadiant);
const radiantOrderName = computed(
  () => classifiers.radiantOrders.find((o) => o.id === store.paths.radiantPath?.orderId)?.name || ''
);

// Attributes
const attributeDisplay = computed(() => {
  const alloc = store.attributes.allocation;
  return [
    { abbr: 'STR', value: alloc.strength, color: 'text-positive' },
    { abbr: 'SPD', value: alloc.speed, color: 'text-positive' },
    { abbr: 'INT', value: alloc.intellect, color: 'text-info' },
    { abbr: 'WIL', value: alloc.willpower, color: 'text-info' },
    { abbr: 'AWA', value: alloc.awareness, color: 'text-accent' },
    { abbr: 'PRE', value: alloc.presence, color: 'text-accent' },
  ];
});

const derivedStats = computed(() => store.derivedStatsPreview);

// Skills
const skillDisplay = computed(() =>
  store.skills.allocations
    .filter((s) => s.rank > 0)
    .map((s) => ({
      id: s.skillId,
      name: classifiers.skills.find((sk) => sk.id === s.skillId)?.name || 'Unknown',
      rank: s.rank,
    }))
);

// Expertises
const expertiseDisplay = computed(() =>
  store.expertises.allocations.map((e) => ({
    id: e.expertiseId,
    name: classifiers.expertises.find((ex) => ex.id === e.expertiseId)?.name || 'Unknown',
    source: e.source,
  }))
);

function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    starting_kit: 'green',
    culture: 'blue',
    intellect: 'purple',
    talent: 'orange',
    training: 'grey',
  };
  return colors[source] || 'grey';
}

// Paths
const pathDisplay = computed(() =>
  store.paths.paths.map((p) => ({
    pathId: p.pathId,
    pathName: classifiers.heroicPaths.find((hp) => hp.id === p.pathId)?.name || 'Unknown',
    specialtyName: classifiers.specialties.find((s) => s.id === p.specialtyId)?.name,
    talents: p.talentIds.map((tid) => getTalentById(tid)?.name || 'Unknown'),
  }))
);

// Equipment
const spheres = computed(() => store.equipment.spheres);
const equipmentTypesList = equipmentTypes;
const equipmentDisplay = computed(() =>
  store.equipment.equipment.map((e) => ({
    equipmentId: e.equipmentId,
    name: classifiers.equipment.find((eq) => eq.id === e.equipmentId)?.name || 'Unknown',
    quantity: e.quantity,
    equipTypeId: classifiers.equipment.find((eq) => eq.id === e.equipmentId)?.equipTypeId,
  }))
);

function getEquipmentByType(typeId: number) {
  return equipmentDisplay.value.filter((item) => item.equipTypeId === typeId);
}
</script>
