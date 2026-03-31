<template>
  <q-form ref="formRef" greedy>
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

    <q-select
      :model-value="heroStore.hero?.level ?? 1"
      :options="levelOptions"
      option-value="value"
      option-label="label"
      emit-value
      map-options
      label="Starting Level"
      outlined
      style="max-width: 280px"
      @update:model-value="setLevel"
    />

    <LevelDiffBanner
      v-if="showDiff && originalLevelData && levelData"
      :from-level="originalLevelData"
      :to-level="levelData"
    />
    <LevelDiffBanner v-else-if="currentLevel > 1 && levelData" :to-level="levelData" />

    <!-- Campaign -->
    <template v-if="campaignName">
      <q-separator class="q-my-md" />
      <div class="text-subtitle1 q-mb-md">Campaign</div>
      <q-card flat bordered>
        <q-card-section>
          <div class="text-body1">{{ campaignName }}</div>
        </q-card-section>
      </q-card>
    </template>

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
      <div class="text-subtitle1 q-mb-md">Select Form</div>
      <div class="text-caption q-mb-sm">
        Singers begin in dullform by default. Other forms can be unlocked through talents.
      </div>

      <q-btn color="primary" outline @click="formDialogOpen = true"
        ><component
          :is="selectedForm ? ArrowLeftRight : Plus"
          :size="20"
          class="on-left"
          aria-hidden="true"
        />{{ selectedForm ? 'Change Form' : 'Choose Form' }}</q-btn
      >

      <SingerFormSelectionDialog
        v-model="formDialogOpen"
        :available-forms="availableForms"
        :selected-form-id="selectedFormId"
        @select="selectForm"
      />

      <q-card v-if="selectedForm" flat bordered class="q-mt-md" data-testid="singer-detail-card">
        <q-card-section>
          <div class="text-subtitle1">{{ selectedForm.name }}</div>
          <div v-if="selectedForm.sprenType" class="text-caption q-mb-sm">
            {{ selectedForm.sprenType }}
          </div>
          <div v-if="selectedForm.description" class="text-body2">
            {{ selectedForm.description }}
          </div>
          <TalentGrantChoice
            v-if="formHasChoices"
            source-type="singer_form"
            :source-id="selectedForm.id"
            :special="selectedForm.special"
          />
        </q-card-section>
      </q-card>
    </template>
  </q-form>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useClassifierStore } from 'src/stores/classifiers';
import { useWizardStore } from 'src/stores/wizard';
import { findByCode, findByProp } from 'src/utils/arrayUtils';
import { ArrowLeftRight, Plus } from 'lucide-vue-next';
import LevelDiffBanner from '../shared/LevelDiffBanner.vue';
import type { DeletionTracker } from 'src/composables/useDeletionTracker';
import { filterSpecial } from 'src/utils/talentGrants';
import { SPECIAL } from 'src/utils/specialUtils';
import { useFormValidation } from 'src/composables/useFormValidation';
import SelectableCard from '../shared/SelectableCard.vue';
import SingerFormSelectionDialog from '../shared/SingerFormSelectionDialog.vue';
import TalentGrantChoice from '../shared/TalentGrantChoice.vue';

const { formRef, validate } = useFormValidation();

const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();
const talentStore = useHeroTalentsStore();
const classifiers = useClassifierStore();
const wizardStore = useWizardStore();
const deletionTracker = inject<DeletionTracker>('deletionTracker');

const isEditMode = computed(() => wizardStore.mode === 'edit');
const currentLevel = computed(() => heroStore.hero?.level ?? 1);
const levelData = computed(() => attrStore.levelData);
const campaignName = computed(() => heroStore.hero?.campaign?.name);

const originalLevelData = computed(() =>
  wizardStore.originalLevel
    ? findByProp(classifiers.levels, 'level', wizardStore.originalLevel)
    : undefined
);
const showDiff = computed(
  () =>
    isEditMode.value &&
    wizardStore.originalLevel !== null &&
    currentLevel.value !== wizardStore.originalLevel
);

const levelOptions = computed(() =>
  classifiers.levels.map((l) => ({
    value: l.level,
    label: `Level ${l.level} — ${l.tier.name}`,
  }))
);

// Ancestry
const ancestries = computed(() => classifiers.ancestries);
const selectedAncestryId = computed(() => heroStore.hero?.ancestry.id ?? 0);
const selectedFormId = computed(() => heroStore.hero?.activeSingerForm?.id ?? null);
const selectedForm = computed(() =>
  selectedFormId.value ? classifiers.singerForms.find((f) => f.id === selectedFormId.value) : null
);
const isSinger = computed(() => talentStore.isSinger);
const formDialogOpen = ref(false);

const availableForms = computed(() =>
  classifiers.singerForms.filter((form) => {
    if (!form.talent?.id) return true;
    return heroStore.talents.some((t) => t.talent.id === form.talent?.id);
  })
);

const formHasChoices = computed(
  () =>
    selectedForm.value &&
    filterSpecial(
      selectedForm.value.special ?? [],
      SPECIAL.EXPERTISE_CHOICE,
      SPECIAL.EXPERTISE_TYPE_CHOICE,
      SPECIAL.ITEM_CHOICE
    ).length > 0
);

function setName(val: string | number | null) {
  if (val !== null) {
    // Trim whitespace to match validation rule and prevent storing whitespace-only names
    heroStore.setName(String(val).trim());
  }
}

function setLevel(val: number | null) {
  if (val !== null) {
    heroStore.setLevel(val);
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

defineExpose({ validate });
</script>
