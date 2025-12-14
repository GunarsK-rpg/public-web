<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Choose your character's ancestry</div>

    <div class="row q-col-gutter-md">
      <div v-for="ancestry in ancestries" :key="ancestry.id" class="col-12 col-sm-6">
        <q-card
          :class="['cursor-pointer', { 'card-selected': selectedAncestryId === ancestry.id }]"
          @click="selectAncestry(ancestry.id)"
        >
          <q-card-section>
            <div class="text-h6">{{ ancestry.name }}</div>
            <div class="text-body2">{{ ancestry.description }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Singer Form Selection -->
    <template v-if="isSinger">
      <q-separator class="q-my-md" />
      <div class="text-subtitle1 q-mb-md">Select Initial Form</div>
      <div class="text-caption q-mb-sm">
        Singers begin in dullform by default. Other forms can be unlocked through talents.
      </div>

      <div class="row q-col-gutter-md">
        <div v-for="form in availableForms" :key="form.id" class="col-12 col-sm-4">
          <q-card
            :class="['cursor-pointer', { 'card-selected': selectedFormId === form.id }]"
            @click="selectForm(form.id)"
          >
            <q-card-section>
              <div class="text-subtitle2">{{ form.name }}</div>
              <div class="text-caption">{{ form.description }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useClassifierStore } from 'src/stores/classifiers';

const heroStore = useHeroStore();
const classifiers = useClassifierStore();

const ancestries = computed(() => classifiers.ancestries);

const selectedAncestryId = computed(() => heroStore.hero?.ancestryId ?? 0);
const selectedFormId = computed(() => heroStore.hero?.activeSingerFormId ?? null);

const isSinger = computed(() => heroStore.isSinger);

// Forms available: no prerequisite talent OR hero has the required talent
const availableForms = computed(() =>
  classifiers.singerForms.filter((form) => {
    if (!form.talentId) return true;
    return heroStore.hero?.talents.some((t) => t.talentId === form.talentId);
  })
);

function selectAncestry(id: number) {
  heroStore.setAncestry(id);
  // Auto-select dullform for Singer
  const singerAncestry = classifiers.getByCode(classifiers.ancestries, 'singer');
  if (id === singerAncestry?.id) {
    const dullform = classifiers.getByCode(classifiers.singerForms, 'dullform');
    if (dullform) {
      heroStore.setSingerForm(dullform.id);
    }
  }
}

function selectForm(id: number) {
  heroStore.setSingerForm(id);
}
</script>
