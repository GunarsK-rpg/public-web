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
        <div v-if="activeSingerFormName" :class="`text-caption text-${RPG_COLORS.singerForm}`">
          {{ activeSingerFormName }}
        </div>
      </div>

      <!-- Resources -->
      <div class="col-12 col-sm-6">
        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <ResourceBox
              label="HP"
              :current="hero?.currentHealth ?? 0"
              :max="maxHealth"
              color="negative"
              :saving="saving"
              @update="heroStore.patchHealth($event)"
            />
          </div>
          <div class="col-4">
            <ResourceBox
              label="Focus"
              :current="hero?.currentFocus ?? 0"
              :max="maxFocus"
              :color="RPG_COLORS.focus"
              :saving="saving"
              @update="heroStore.patchFocus($event)"
            />
          </div>
          <div v-if="isRadiant" class="col-4">
            <ResourceBox
              label="Investiture"
              :current="hero?.currentInvestiture ?? 0"
              :max="maxInvestiture"
              :color="RPG_COLORS.investiture"
              :saving="saving"
              @update="heroStore.patchInvestiture($event)"
            />
          </div>
          <div v-else class="col-4">
            <ResourceBox
              label="Spheres"
              :current="hero?.currency ?? 0"
              suffix="mk"
              :saving="saving"
              @update="heroStore.patchCurrency($event)"
            />
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
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { RPG_COLORS } from 'src/constants/theme';
import ResourceBox from './ResourceBox.vue';

const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();
const talentStore = useHeroTalentsStore();
const hero = computed(() => heroStore.hero);
const saving = computed(() => heroStore.saving);
const maxHealth = computed(() => attrStore.getDerivedStatTotal('max_health'));
const maxFocus = computed(() => attrStore.getDerivedStatTotal('max_focus'));
const maxInvestiture = computed(() => attrStore.getDerivedStatTotal('max_investiture'));
const isRadiant = computed(() => talentStore.isRadiant);

const orderName = computed(() => hero.value?.radiantOrder?.name);
const ancestryName = computed(() => hero.value?.ancestry?.name);
const activeSingerFormName = computed(() => hero.value?.activeSingerForm?.name);
const cultureName = computed(() => hero.value?.cultures?.[0]?.culture?.name);
</script>
