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
              <div v-if="heroStore.isRadiant" class="col-6">
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
              <div v-if="getEquipmentByType(eqType.id).length > 0">
                <div class="text-caption text-weight-medium">{{ eqType.name }}</div>
                <q-chip v-for="item in getEquipmentByType(eqType.id)" :key="item.id" outline>
                  {{ item.name }} x{{ item.amount }}
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
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';
import { useStepValidation } from 'src/composables/useStepValidation';
import { buildDerivedStatsList } from 'src/utils/derivedStats';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();
const { allStepsValidation } = useStepValidation();

const validationErrors = computed(() => allStepsValidation.value.errors);
const isValid = computed(() => allStepsValidation.value.isValid);

// Basic info lookups
const ancestryName = computed(
  () => classifiers.getById(classifiers.ancestries, heroStore.hero?.ancestryId)?.name ?? 'Unknown'
);

const cultureName = computed(() => {
  const cultures = heroStore.hero?.cultures ?? [];
  const primaryCultureId = cultures[0]?.cultureId;
  return primaryCultureId
    ? (classifiers.getById(classifiers.cultures, primaryCultureId)?.name ?? 'None')
    : 'None';
});

const startingKitName = computed(
  () => classifiers.getById(classifiers.startingKits, heroStore.hero?.startingKitId)?.name ?? 'None'
);

const radiantOrderName = computed(
  () => classifiers.getById(classifiers.radiantOrders, heroStore.hero?.radiantOrderId)?.name ?? ''
);

// Attributes display
const attributeDisplay = computed(() =>
  classifiers.attributes.map((attr) => ({
    code: attr.code,
    abbr: attr.code.toUpperCase(),
    value: heroStore.getAttributeValue(attr.code),
  }))
);

// Derived stats calculated from attributes (matches AttributesStep display)
const derivedStatsList = computed(() => {
  const attrs = {
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
    heroStore.getDerivedStatModifier
  );
});

// Skills with ranks > 0
const skillDisplay = computed(() =>
  (heroStore.hero?.skills ?? [])
    .filter((s) => s.rank > 0)
    .map((s) => ({
      id: s.skillId,
      name: classifiers.getById(classifiers.skills, s.skillId)?.name ?? 'Unknown',
      rank: s.rank,
      modifier: s.modifier,
    }))
);

// Expertises
const expertiseDisplay = computed(() =>
  (heroStore.hero?.expertises ?? []).map((e) => ({
    id: e.expertiseId,
    name: classifiers.getById(classifiers.expertises, e.expertiseId)?.name ?? 'Unknown',
  }))
);

// Talents
const talentDisplay = computed(() =>
  (heroStore.hero?.talents ?? []).map((t) => ({
    id: t.talentId,
    name: classifiers.getById(classifiers.talents, t.talentId)?.name ?? 'Unknown',
  }))
);

// Equipment
const equipmentDisplay = computed(() =>
  (heroStore.hero?.equipment ?? []).map((e) => {
    const eq = classifiers.getById(classifiers.equipment, e.equipmentId);
    return {
      id: e.id,
      equipmentId: e.equipmentId,
      name: eq?.name ?? 'Unknown',
      amount: e.amount,
      equipTypeId: eq?.equipTypeId,
    };
  })
);

function getEquipmentByType(typeId: number) {
  return equipmentDisplay.value.filter((item) => item.equipTypeId === typeId);
}

// Currency in diamond marks
const totalCurrency = computed(() => heroStore.hero?.currency ?? 0);
</script>
