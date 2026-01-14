<template>
  <q-item>
    <q-item-section avatar class="action-avatar">
      <img
        v-if="activationType?.icon"
        :src="iconUrl"
        :alt="activationType?.name ?? 'Action'"
        :title="activationType?.name ?? 'Action'"
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
        <q-badge
          v-for="cost in actionCosts"
          :key="cost.label"
          :color="cost.color"
          :title="cost.title"
          outline
        >
          {{ cost.value }} {{ cost.label }}
        </q-badge>
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import { useEntityIcon } from 'src/composables/useEntityIcon';
import { RPG_COLORS } from 'src/constants/theme';
import type { Action } from 'src/types';

const props = defineProps<{
  action: Action;
}>();

const classifiers = useClassifierStore();

// Use entity icon composable for activation type lookup
const { entity: activationType, iconUrl } = useEntityIcon(
  computed(() => props.action.activationTypeId),
  computed(() => classifiers.activationTypes),
  'actions'
);

// Consolidate cost badges into a single array for cleaner template
const actionCosts = computed(() => {
  const costs: { value: number; label: string; title: string; color: string }[] = [];
  if (props.action.focusCost > 0) {
    costs.push({
      value: props.action.focusCost,
      label: 'Focus',
      title: 'Focus',
      color: RPG_COLORS.focusCost,
    });
  }
  if (props.action.investitureCost > 0) {
    costs.push({
      value: props.action.investitureCost,
      label: 'Inv',
      title: 'Investiture',
      color: RPG_COLORS.investitureCost,
    });
  }
  return costs;
});
</script>

<style scoped>
.action-avatar {
  min-width: 24px;
  min-height: 24px;
}

.action-icon {
  width: 24px;
  height: 24px;
}
</style>
