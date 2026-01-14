<template>
  <div>
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
import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroTalentsStore } from 'src/stores/heroTalents';
import { useClassifierStore } from 'src/stores/classifiers';
import { findByCode } from 'src/utils/arrayUtils';
import SelectableCard from '../shared/SelectableCard.vue';

const heroStore = useHeroStore();
const talentStore = useHeroTalentsStore();
const classifiers = useClassifierStore();

const ancestries = computed(() => classifiers.ancestries);

const selectedAncestryId = computed(() => heroStore.hero?.ancestryId ?? 0);
const selectedFormId = computed(() => heroStore.hero?.activeSingerFormId ?? null);

const isSinger = computed(() => talentStore.isSinger);

// Forms available: no prerequisite talent OR hero has the required talent
const availableForms = computed(() =>
  classifiers.singerForms.filter((form) => {
    if (!form.talentId) return true;
    return heroStore.talents.some((t) => t.talentId === form.talentId);
  })
);

function selectAncestry(id: number) {
  talentStore.setAncestry(id);
  // Auto-select dullform for Singer only if no form is already chosen
  const singerAncestry = findByCode(classifiers.ancestries, 'singer');
  if (id === singerAncestry?.id && !heroStore.hero?.activeSingerFormId) {
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
