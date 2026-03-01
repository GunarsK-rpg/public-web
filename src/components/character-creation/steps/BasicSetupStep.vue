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

    <q-input
      :model-value="heroStore.hero?.level ?? 1"
      type="number"
      label="Starting Level"
      outlined
      :min="1"
      :max="20"
      style="max-width: 200px"
      :rules="[(val) => (val >= 1 && val <= 20) || 'Level must be 1-20']"
      @update:model-value="setLevel"
    />

    <q-banner v-if="currentLevel > 1 && levelData" class="banner-info q-mt-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_info" aria-hidden="true" />
      </template>
      Starting at level {{ currentLevel }} gives you {{ levelData.attributePoints }} attribute
      points, {{ levelData.skillRanks }} skill ranks, and {{ levelData.talentSlots }} talent slots.
    </q-banner>

    <!-- Ancestry Selection -->
    <q-separator class="q-my-md" />
    <div class="text-subtitle1 q-mb-md">Choose your character's ancestry</div>

    <div class="row q-col-gutter-md" role="radiogroup" aria-label="Select ancestry">
      <div v-for="ancestry in ancestries" :key="ancestry.id" class="col-12 col-sm-6">
        <SelectableCard
          :title="ancestry.name"
          :subtitle="ancestry.description ?? ''"
          :selected="selectedAncestryId === ancestry.id"
          :aria-label="`${ancestry.name} ancestry`"
          @select="selectAncestry(ancestry.id)"
        />
      </div>
    </div>

    <!-- Singer Form Selection -->
    <template v-if="isSinger">
      <q-separator class="q-my-md" />
      <div class="text-subtitle1 q-mb-md">Select Initial Form</div>
      <div class="text-caption q-mb-sm">
        Singers begin in dullform by default. Other forms can be unlocked through talents.
      </div>

      <div class="row q-col-gutter-md" role="radiogroup" aria-label="Select singer form">
        <div v-for="form in availableForms" :key="form.id" class="col-12 col-sm-4">
          <SelectableCard
            :title="form.name"
            :subtitle="form.description ?? ''"
            :selected="selectedFormId === form.id"
            :aria-label="`${form.name} form`"
            @select="selectForm(form.id)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useCampaignStore } from 'src/stores/campaigns';
import { useClassifierStore } from 'src/stores/classifiers';
import { findByCode } from 'src/utils/arrayUtils';
import { clamp } from 'src/utils/numberUtils';
import type { DeletionTracker } from 'src/composables/useDeletionTracker';
import SelectableCard from '../shared/SelectableCard.vue';

const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();
const talentStore = useHeroTalentsStore();
const campaignStore = useCampaignStore();
const classifiers = useClassifierStore();
const deletionTracker = inject<DeletionTracker>('deletionTracker');

const currentLevel = computed(() => heroStore.hero?.level ?? 1);
const levelData = computed(() => attrStore.levelData);

// Ancestry
const ancestries = computed(() => classifiers.ancestries);
const selectedAncestryId = computed(() => heroStore.hero?.ancestry.id ?? 0);
const selectedFormId = computed(() => heroStore.hero?.activeSingerForm?.id ?? null);
const isSinger = computed(() => talentStore.isSinger);

const availableForms = computed(() =>
  classifiers.singerForms.filter((form) => {
    if (!form.talent?.id) return true;
    return heroStore.talents.some((t) => t.talent.id === form.talent?.id);
  })
);

onMounted(() => {
  // Resolve campaign code if campaignId was set (e.g., from invite URL) but code is missing
  if (heroStore.hero?.campaignId && !heroStore.hero.campaign?.code) {
    const campaign = campaignStore.campaigns.find((c) => c.id === heroStore.hero!.campaignId);
    if (campaign) {
      heroStore.setCampaign({ id: campaign.id, code: campaign.code, name: campaign.name });
    }
  }
});

function setName(val: string | number | null) {
  if (val !== null) {
    // Trim whitespace to match validation rule and prevent storing whitespace-only names
    heroStore.setName(String(val).trim());
  }
}

function setLevel(val: string | number | null) {
  if (val !== null) {
    const numVal = typeof val === 'string' ? Number(val) : val;
    if (!Number.isNaN(numVal)) {
      // Clamp level between 1 and 20
      heroStore.setLevel(clamp(numVal, 1, 20));
    }
  }
}

function selectAncestry(id: number) {
  // Track ancestry talent deletions before the store removes them
  if (heroStore.hero?.ancestry?.id) {
    const prevAncestryId = heroStore.hero.ancestry.id;
    const prevAncestryTalentIds = new Set(
      classifiers.talents.filter((t) => t.ancestry?.id === prevAncestryId).map((t) => t.id)
    );
    for (const ht of heroStore.hero.talents) {
      if (prevAncestryTalentIds.has(ht.talent.id)) {
        deletionTracker?.trackDeletion('talents', ht.id);
      }
    }
  }
  talentStore.setAncestry(id);
  // Auto-select dullform for Singer only if no form is already chosen
  if (talentStore.isSinger && !heroStore.hero?.activeSingerForm?.id) {
    const dullform = findByCode(classifiers.singerForms, 'dullform');
    if (dullform) {
      talentStore.setSingerForm(dullform.id);
    }
  }
}

function selectForm(id: number) {
  talentStore.setSingerForm(id);
}
</script>
