<template>
  <q-expansion-item switch-toggle-side dense class="action-expansion-item">
    <template #header>
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
        <q-item-label caption>{{
          action.descriptionShort || action.description || 'No description available'
        }}</q-item-label>
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
    </template>

    <q-card>
      <q-card-section class="q-pt-sm q-pb-sm">
        <div class="text-body2">{{ action.description }}</div>
        <div
          v-if="action.special"
          :class="`text-caption text-italic text-${RPG_COLORS.specialAbility} q-mt-xs`"
        >
          {{ action.special }}
        </div>
        <div v-if="action.dice" class="text-caption text-weight-medium q-mt-xs">
          Dice: {{ action.dice }}
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
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
  computed(() => props.action.activationType?.id),
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

.action-expansion-item :deep(.q-expansion-item__container) {
  border-bottom: none;
}
</style>
