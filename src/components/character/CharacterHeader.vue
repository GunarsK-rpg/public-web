<template>
  <div>
    <div class="q-pa-md row items-center q-col-gutter-md">
      <!-- Name and Level -->
      <div class="col-12 col-sm-6">
        <div class="text-h5">{{ hero?.name }}</div>
        <div class="text-subtitle1 text-muted">
          Level {{ hero?.level }}
          {{ ancestryName }}
          <span v-if="cultureName">· {{ cultureName }}</span>
          <span v-if="orderName">· {{ orderName }}</span>
        </div>
        <div v-if="activeSingerFormName" class="text-caption text-purple">
          {{ activeSingerFormName }}
        </div>
      </div>

      <!-- Resources -->
      <div class="col-12 col-sm-6">
        <div class="row q-col-gutter-sm">
          <!-- Health -->
          <div class="col-4">
            <div class="resource-box">
              <div class="resource-label">HP</div>
              <div class="resource-value">{{ hero?.currentHealth }} / {{ maxHealth }}</div>
              <q-linear-progress :value="healthPercent" color="negative" track-color="grey-6" />
            </div>
          </div>

          <!-- Focus -->
          <div class="col-4">
            <div class="resource-box">
              <div class="resource-label">Focus</div>
              <div class="resource-value">{{ hero?.currentFocus }} / {{ maxFocus }}</div>
              <q-linear-progress :value="focusPercent" color="teal" track-color="grey-6" />
            </div>
          </div>

          <!-- Investiture (Radiants only) -->
          <div v-if="isRadiant" class="col-4">
            <div class="resource-box">
              <div class="resource-label">Investiture</div>
              <div class="resource-value">
                {{ hero?.currentInvestiture }} / {{ maxInvestiture }}
              </div>
              <q-linear-progress :value="investiturePercent" color="amber" track-color="grey-6" />
            </div>
          </div>

          <!-- Spheres (non-Radiants) -->
          <div v-else class="col-4">
            <div class="resource-box">
              <div class="resource-label">Spheres</div>
              <div class="resource-value">{{ totalSpheres }} mk</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <q-separator />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

const hero = computed(() => heroStore.hero);
const maxHealth = computed(() => heroStore.getDerivedStatTotal('max_health'));
const maxFocus = computed(() => heroStore.getDerivedStatTotal('max_focus'));
const maxInvestiture = computed(() => heroStore.getDerivedStatTotal('max_investiture'));
const isRadiant = computed(() => heroStore.isRadiant);

const healthPercent = computed(() => {
  if (!hero.value || !maxHealth.value) return 0;
  return maxHealth.value > 0 ? hero.value.currentHealth / maxHealth.value : 0;
});

const focusPercent = computed(() => {
  if (!hero.value || !maxFocus.value) return 0;
  return maxFocus.value > 0 ? hero.value.currentFocus / maxFocus.value : 0;
});

const investiturePercent = computed(() => {
  if (!hero.value || !maxInvestiture.value) return 0;
  return maxInvestiture.value > 0 ? hero.value.currentInvestiture / maxInvestiture.value : 0;
});

const orderName = computed(() => {
  return classifiers.getById(classifiers.radiantOrders, hero.value?.radiantOrderId)?.name ?? '';
});

const ancestryName = computed(() => {
  return classifiers.getById(classifiers.ancestries, hero.value?.ancestryId)?.name ?? '';
});

const activeSingerFormName = computed(() => {
  return classifiers.getById(classifiers.singerForms, hero.value?.activeSingerFormId)?.name ?? '';
});

const cultureName = computed(() => {
  const cultureId = hero.value?.cultures?.[0]?.cultureId;
  if (!cultureId) return '';
  return classifiers.getById(classifiers.cultures, cultureId)?.name ?? '';
});

const totalSpheres = computed(() => hero.value?.currency ?? 0);
</script>

<style scoped>
.resource-box {
  text-align: center;
  padding: 8px;
  border-radius: 4px;
}

.resource-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  opacity: 0.7;
}

.resource-value {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
}
</style>
