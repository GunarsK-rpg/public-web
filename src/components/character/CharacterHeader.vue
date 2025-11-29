<template>
  <div>
    <div class="q-pa-md row items-center q-col-gutter-md">
      <!-- Name and Level -->
      <div class="col-12 col-sm-6">
        <div class="text-h5">{{ character?.name }}</div>
        <div class="text-subtitle1 text-grey">
          Level {{ character?.level }}
          {{ pathName }}
          <span v-if="character?.radiantOrder">/ {{ orderName }}</span>
        </div>
      </div>

      <!-- Resources -->
      <div class="col-12 col-sm-6">
        <div class="row q-col-gutter-sm">
          <!-- Health -->
          <div class="col-4">
            <div class="resource-box">
              <div class="resource-label">HP</div>
              <div class="resource-value">{{ character?.currentHealth }} / {{ maxHealth }}</div>
              <q-linear-progress :value="healthPercent" color="negative" track-color="grey-6" />
            </div>
          </div>

          <!-- Focus -->
          <div class="col-4">
            <div class="resource-box">
              <div class="resource-label">Focus</div>
              <div class="resource-value">{{ character?.currentFocus }} / {{ maxFocus }}</div>
              <q-linear-progress :value="focusPercent" color="teal" track-color="grey-6" />
            </div>
          </div>

          <!-- Investiture (Radiants only) -->
          <div v-if="isRadiant" class="col-4">
            <div class="resource-box">
              <div class="resource-label">Investiture</div>
              <div class="resource-value">
                {{ character?.currentInvestiture }} / {{ maxInvestiture }}
              </div>
              <q-linear-progress :value="investiturePercent" color="amber" track-color="grey-6" />
            </div>
          </div>

          <!-- Spheres (non-Radiants) -->
          <div v-else class="col-4">
            <div class="resource-box">
              <div class="resource-label">Spheres</div>
              <div class="resource-value">{{ character?.spheres }} mk</div>
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
import { useCharacterStore } from 'stores/character';
import { useClassifierStore } from 'stores/classifiers';

const characterStore = useCharacterStore();
const classifierStore = useClassifierStore();

const character = computed(() => characterStore.character);
const maxHealth = computed(() => characterStore.maxHealth);
const maxFocus = computed(() => characterStore.maxFocus);
const maxInvestiture = computed(() => characterStore.maxInvestiture);
const isRadiant = computed(() => characterStore.isRadiant);

const healthPercent = computed(() => {
  if (!character.value || maxHealth.value === 0) return 0;
  return character.value.currentHealth / maxHealth.value;
});

const focusPercent = computed(() => {
  if (!character.value || maxFocus.value === 0) return 0;
  return character.value.currentFocus / maxFocus.value;
});

const investiturePercent = computed(() => {
  if (!character.value || maxInvestiture.value === 0) return 0;
  return character.value.currentInvestiture / maxInvestiture.value;
});

const pathName = computed(() => {
  if (!character.value) return '';
  const path = classifierStore.getHeroicPathById(character.value.heroicPath);
  return path?.name || character.value.heroicPath;
});

const orderName = computed(() => {
  if (!character.value?.radiantOrder) return '';
  const order = classifierStore.getRadiantOrderById(character.value.radiantOrder);
  return order?.name || character.value.radiantOrder;
});
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
