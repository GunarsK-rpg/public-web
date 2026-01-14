<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Review your character before creation</div>

    <!-- Validation Summary -->
    <q-banner v-if="!isValid" class="banner-error q-mb-md" role="alert" aria-live="polite">
      <template v-slot:avatar>
        <q-icon name="sym_o_error" aria-hidden="true" />
      </template>
      <div class="text-subtitle2">Validation Errors</div>
      <ul class="q-pl-md q-my-xs">
        <li v-for="(error, i) in validationErrors" :key="i">{{ error }}</li>
      </ul>
    </q-banner>

    <q-banner v-else class="banner-success q-mb-md" role="status" aria-live="polite">
      <template v-slot:avatar>
        <q-icon name="sym_o_check_circle" aria-hidden="true" />
      </template>
      Character is ready to create!
    </q-banner>

    <!-- Character Summary -->
    <div class="row q-col-gutter-md">
      <!-- Basic Info -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">{{ heroStore.hero?.name || 'Unnamed Character' }}</div>
            <div class="text-subtitle2">Level {{ heroStore.hero?.level }} {{ ancestryName }}</div>
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
              <div v-if="talentStore.isRadiant" class="col-6">
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
              <div v-for="attr in attributeDisplay" :key="attr.code" class="col-2">
                <div class="text-center">
                  <div class="text-h5">{{ attr.value }}</div>
                  <div class="text-caption">{{ attr.abbr }}</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Derived Stats</div>
            <div class="row">
              <div v-for="stat in derivedStatsList" :key="stat.id" class="col-6">
                <span class="text-weight-medium">{{ stat.name }}:</span>
                {{ stat.baseDisplay }}
                <span v-if="stat.modifier !== 0" class="text-muted">
                  ({{ stat.modifier >= 0 ? '+' : '' }}{{ stat.modifier }} = {{ stat.totalDisplay }})
                </span>
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
                <span v-if="skill.modifier !== 0" class="text-muted"
                  >({{ skill.modifier >= 0 ? '+' : '' }}{{ skill.modifier }})</span
                >
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
                color="grey-7"
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

      <!-- Talents -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Talents</div>
            <div>
              <q-chip v-for="talent in talentDisplay" :key="talent.id" outline>
                {{ talent.name }}
              </q-chip>
            </div>
            <div v-if="talentDisplay.length === 0" class="text-caption text-muted">
              No talents selected
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
              <span class="text-weight-medium">Currency:</span> {{ totalCurrency }} diamond marks
            </div>
            <div v-for="eqType in classifiers.equipmentTypes" :key="eqType.id" class="q-mb-sm">
              <template v-if="equipmentByType[eqType.id]?.length">
                <div class="text-caption text-weight-medium">{{ eqType.name }}</div>
                <q-chip v-for="item in equipmentByType[eqType.id]" :key="item.id" outline>
                  {{ item.name }} x{{ item.amount }}
                </q-chip>
              </template>
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
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useClassifierStore } from 'src/stores/classifiers';
import { useStepValidation } from 'src/composables/useStepValidation';
import { buildDerivedStatsList } from 'src/utils/derivedStats';
import { findById } from 'src/utils/arrayUtils';

const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();
const talentStore = useHeroTalentsStore();
const classifiers = useClassifierStore();
const { allStepsValidation } = useStepValidation();

const validationErrors = computed(() => allStepsValidation.value.errors);
const isValid = computed(() => allStepsValidation.value.isValid);

// Basic info lookups
const ancestryName = computed(
  () => findById(classifiers.ancestries, heroStore.hero?.ancestryId)?.name || 'Unknown'
);

const cultureName = computed(() => {
  const primaryCultureId = heroStore.hero?.cultures?.[0]?.cultureId;
  return findById(classifiers.cultures, primaryCultureId)?.name || 'None';
});

const startingKitName = computed(
  () => findById(classifiers.startingKits, heroStore.hero?.startingKitId)?.name || 'None'
);

const radiantOrderName = computed(
  () => findById(classifiers.radiantOrders, heroStore.hero?.radiantOrderId)?.name
);

// Attributes display - abbr derived from code (e.g., 'str' -> 'STR')
const attributeDisplay = computed(() =>
  classifiers.attributes.map((attr) => ({
    code: attr.code,
    abbr: attr.code.slice(0, 3).toUpperCase(),
    value: attrStore.getAttributeValue(attr.code),
  }))
);

// Derived stats calculated from attributes
const derivedStatsList = computed(() => {
  // Build attrs dynamically from classifier codes
  const attrs: Record<string, number> = {};
  for (const attr of classifiers.attributes) {
    attrs[attr.code] = attrStore.getAttributeValue(attr.code);
  }

  return buildDerivedStatsList(
    classifiers.derivedStats,
    classifiers.derivedStatValues,
    classifiers.attributes,
    attrs,
    attrStore.levelData,
    attrStore.tierData,
    attrStore.getDerivedStatModifier
  );
});

// Skills with ranks > 0
const skillDisplay = computed(() =>
  heroStore.skills
    .filter((s) => s.rank > 0)
    .map((s) => ({
      id: s.skillId,
      name: findById(classifiers.skills, s.skillId)?.name || 'Unknown',
      rank: s.rank,
      modifier: s.modifier,
    }))
);

// Expertises
const expertiseDisplay = computed(() =>
  heroStore.expertises.map((e) => ({
    id: e.expertiseId,
    name: findById(classifiers.expertises, e.expertiseId)?.name || 'Unknown',
  }))
);

// Talents
const talentDisplay = computed(() =>
  heroStore.talents.map((t) => ({
    id: t.talentId,
    name: findById(classifiers.talents, t.talentId)?.name || 'Unknown',
  }))
);

// Equipment
const equipmentDisplay = computed(() =>
  heroStore.equipment.map((e) => {
    const eq = findById(classifiers.equipment, e.equipmentId);
    return {
      id: e.id,
      equipmentId: e.equipmentId,
      name: eq?.name || 'Unknown',
      amount: e.amount,
      equipTypeId: eq?.equipTypeId,
    };
  })
);

// Pre-computed equipment grouped by type
const equipmentByType = computed(() => {
  const result: Record<number, typeof equipmentDisplay.value> = {};
  for (const eqType of classifiers.equipmentTypes) {
    result[eqType.id] = equipmentDisplay.value.filter((item) => item.equipTypeId === eqType.id);
  }
  return result;
});

// Currency in diamond marks
const totalCurrency = computed(() => heroStore.hero?.currency ?? 0);
</script>
