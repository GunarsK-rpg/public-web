<template>
  <q-item>
    <q-item-section avatar>
      <img
        v-if="activationType?.icon"
        :src="iconUrl"
        :alt="activationType.name"
        class="action-icon icon-theme-aware"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ action.name }}</q-item-label>
      <q-item-label caption>{{ action.description }}</q-item-label>
      <q-item-label v-if="action.special" caption class="text-italic text-purple">
        {{ action.special }}
      </q-item-label>
      <q-item-label v-if="action.dice" caption class="text-weight-medium">
        Dice: {{ action.dice }}
      </q-item-label>
    </q-item-section>
    <q-item-section side top>
      <div class="column items-end q-gutter-xs">
        <q-badge v-if="action.focusCost > 0" color="teal" outline>
          {{ action.focusCost }} Focus
        </q-badge>
        <q-badge v-if="action.investitureCost > 0" color="amber" outline>
          {{ action.investitureCost }} Inv
        </q-badge>
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import { getIconUrl } from 'src/utils/iconUrl';
import type { Action } from 'src/types';

const props = defineProps<{
  action: Action;
}>();

const classifiers = useClassifierStore();

const activationType = computed(() =>
  classifiers.getById(classifiers.activationTypes, props.action.activationTypeId)
);

const iconUrl = computed(() => getIconUrl(activationType.value?.icon, 'actions'));
</script>

<style scoped>
.action-icon {
  width: 24px;
  height: 24px;
}
</style>
