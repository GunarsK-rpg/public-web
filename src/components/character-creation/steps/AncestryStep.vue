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
import { useCharacterCreationStore } from 'stores/character-creation';
import { useClassifierStore } from 'stores/classifiers';

const store = useCharacterCreationStore();
const classifiers = useClassifierStore();

const ancestries = computed(() => classifiers.ancestries);

const selectedAncestryId = computed(() => store.ancestry.ancestryId);
const selectedFormId = computed(() => store.ancestry.singerFormId);

const isSinger = computed(() => store.isSinger);

// Singers start with dullform, mateform available
const availableForms = computed(() =>
  classifiers.singerForms.filter((f) => ['dullform', 'mateform'].includes(f.code))
);

function selectAncestry(id: number) {
  store.updateAncestry({ ancestryId: id });
  // Auto-select dullform for Singer
  if (id === 2) {
    const dullform = classifiers.singerForms.find((f) => f.code === 'dullform');
    if (dullform) {
      store.updateAncestry({ singerFormId: dullform.id });
    }
  }
}

function selectForm(id: number) {
  store.updateAncestry({ singerFormId: id });
}
</script>
