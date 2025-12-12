<template>
  <div>
    <div class="text-subtitle1 q-mb-md">Name your character and set their starting level</div>

    <q-input
      v-model="characterName"
      label="Character Name"
      outlined
      class="q-mb-md"
      :rules="[(val) => !!val.trim() || 'Name is required']"
    />

    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6">
        <q-input
          v-model.number="level"
          type="number"
          label="Starting Level"
          outlined
          :min="1"
          :max="20"
          :rules="[(val) => (val >= 1 && val <= 20) || 'Level must be 1-20']"
        />
      </div>
      <div class="col-12 col-sm-6">
        <q-select
          v-model="campaignId"
          :options="campaignOptions"
          label="Campaign (Optional)"
          outlined
          emit-value
          map-options
          clearable
        />
      </div>
    </div>

    <q-banner v-if="level > 1" class="banner-info q-mt-md">
      <template v-slot:avatar>
        <q-icon name="sym_o_info" />
      </template>
      Starting at level {{ level }} gives you {{ pointBudgets.attributes }} attribute points,
      {{ pointBudgets.skills }} skill points, and {{ pointBudgets.talents }} talent slots.
    </q-banner>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterCreationStore } from 'stores/character-creation';

const store = useCharacterCreationStore();

const characterName = computed({
  get: () => store.basicSetup.name,
  set: (val) => store.updateBasicSetup({ name: val }),
});

const level = computed({
  get: () => store.basicSetup.level,
  set: (val) => store.updateBasicSetup({ level: val }),
});

const campaignId = computed({
  get: () => store.basicSetup.campaignId ?? null,
  set: (val: number | null) => {
    if (val === null) {
      // Remove the property when clearing - spread to create new object without campaignId
      const { name, level } = store.basicSetup;
      store.updateBasicSetup({ name, level });
    } else {
      store.updateBasicSetup({ campaignId: val });
    }
  },
});

const pointBudgets = computed(() => store.pointBudgets);

// TODO: Load campaigns from store/API
const campaignOptions = [
  { value: 1, label: 'The Shattered Plains Campaign' },
  { value: 2, label: 'Secrets of Urithiru' },
];
</script>
