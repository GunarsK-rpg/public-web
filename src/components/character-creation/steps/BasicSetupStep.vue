<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Name your character and set their starting level</div>

    <q-input
      :model-value="heroStore.hero?.name ?? ''"
      label="Character Name"
      outlined
      class="q-mb-md"
      maxlength="100"
      counter
      :rules="[
        (val) => !!val.trim() || 'Name is required',
        (val) => val.length <= 100 || 'Name must be 100 characters or less',
      ]"
      @update:model-value="setName"
    />

    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6">
        <q-input
          :model-value="heroStore.hero?.level ?? 1"
          type="number"
          label="Starting Level"
          outlined
          :min="1"
          :max="20"
          :rules="[(val) => (val >= 1 && val <= 20) || 'Level must be 1-20']"
          @update:model-value="setLevel"
        />
      </div>
      <div class="col-12 col-sm-6">
        <q-select
          :model-value="heroStore.hero?.campaignId ?? null"
          :options="campaignOptions"
          label="Campaign (Optional)"
          outlined
          emit-value
          map-options
          clearable
          @update:model-value="setCampaignId"
        />
      </div>
    </div>

    <q-banner v-if="currentLevel > 1 && levelData" class="banner-info q-mt-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_info" aria-hidden="true" />
      </template>
      Starting at level {{ currentLevel }} gives you {{ levelData.attributePoints }} attribute
      points, {{ levelData.skillRanks }} skill ranks, and {{ levelData.talentSlots }} talent slots.
    </q-banner>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useHeroStore } from 'src/stores/hero';
import { useCampaignStore } from 'src/stores/campaigns';
import { logger } from 'src/utils/logger';

const $q = useQuasar();
const heroStore = useHeroStore();
const campaignStore = useCampaignStore();

const currentLevel = computed(() => heroStore.hero?.level ?? 1);
const levelData = computed(() => heroStore.levelData);

const campaignOptions = computed(() =>
  campaignStore.campaigns.map((c) => ({ value: c.id, label: c.name }))
);

onMounted(async () => {
  if (!campaignStore.hasCampaigns) {
    try {
      await campaignStore.fetchCampaigns();
    } catch (err) {
      logger.error(
        'Failed to fetch campaigns',
        err instanceof Error ? err : { error: String(err) }
      );
      $q.notify({
        type: 'warning',
        message: 'Could not load campaigns. You can continue without selecting one.',
        position: 'top',
      });
    }
  }
});

function setName(val: string | number | null) {
  if (val !== null) {
    heroStore.setName(String(val));
  }
}

function setLevel(val: string | number | null) {
  if (val !== null) {
    const numVal = typeof val === 'string' ? Number(val) : val;
    if (!Number.isNaN(numVal)) {
      // Clamp level between 1 and 20
      heroStore.setLevel(Math.max(1, Math.min(20, numVal)));
    }
  }
}

function setCampaignId(val: number | null) {
  // Campaign is optional - allow clearing
  heroStore.setCampaignId(val);
}
</script>
