<template>
  <q-expansion-item switch-toggle-side dense class="action-expansion-item">
    <template #header>
      <div class="action-header">
        <div class="action-row-name">
          <img
            v-if="activationType?.icon"
            :src="iconUrl"
            :alt="activationType?.name ?? 'Action'"
            :title="activationType?.name ?? 'Action'"
            class="action-icon icon-theme-aware"
          />
          <span class="action-name">{{ action.name }}</span>
          <SpecialBadges v-if="hasBadges" :specials="typedEntries" />
          <q-badge v-if="action.dice" :color="RPG_COLORS.badgeMuted" outline>
            {{ action.dice }}
          </q-badge>
          <q-badge v-if="action.damageType" :color="RPG_COLORS.badgeMuted" outline>
            {{ action.damageType.name }}
          </q-badge>
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
        <div v-if="action.descriptionShort || action.description" class="text-caption text-muted">
          {{ action.descriptionShort || action.description }}
        </div>
        <q-btn
          v-if="hasDeductibleCost && !readonly"
          class="use-action-btn"
          size="sm"
          flat
          dense
          color="primary"
          label="Use"
          :disable="!canUse"
          :loading="using"
          title="Use action"
          @click.stop="useAction"
        />
      </div>
    </template>

    <q-card>
      <q-card-section class="q-pt-sm q-pb-sm">
        <div class="text-body2">{{ action.description || 'No description available' }}</div>
        <div v-if="narrativeEntries.length" class="q-mt-xs">
          <span
            v-for="(entry, i) in narrativeEntries"
            :key="i"
            class="text-caption text-italic"
            :class="`text-${RPG_COLORS.specialAbility}`"
          >
            {{ entry.display_value || entry.value
            }}{{ i < narrativeEntries.length - 1 ? ' · ' : '' }}
          </span>
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useEntityIcon } from 'src/composables/useEntityIcon';
import { RPG_COLORS } from 'src/constants/theme';
import { SPECIAL, resolveDamageScaling } from 'src/utils/specialUtils';
import { findByCode } from 'src/utils/arrayUtils';
import SpecialBadges from 'src/components/shared/SpecialBadges.vue';
import type { Action } from 'src/types';

const props = defineProps<{
  action: Action;
  readonly?: boolean;
}>();

const classifiers = useClassifierStore();
const heroStore = useHeroStore();
const attrStore = useHeroAttributesStore();

// Use entity icon composable for activation type lookup
const { entity: activationType, iconUrl } = useEntityIcon(
  computed(() => props.action.activationType?.id),
  computed(() => classifiers.activationTypes),
  'actions'
);

// Types shown as badge tags in the header
const TYPED_SPECIAL: Set<string> = new Set([
  SPECIAL.SKILL,
  SPECIAL.DEFENSE,
  SPECIAL.RANGE,
  SPECIAL.DURATION,
  SPECIAL.REACH,
  SPECIAL.RADIUS,
  SPECIAL.DAMAGE_SCALING,
]);

const typedEntries = computed(() =>
  (props.action.special ?? [])
    .filter((s) => TYPED_SPECIAL.has(s.type) && (s.display_value || s.value != null))
    .map((s) => {
      if (s.type !== SPECIAL.DAMAGE_SCALING || !s.display_value) return s;
      const skill = s.skill ? findByCode(classifiers.skills, s.skill) : null;
      const rank = skill ? attrStore.getSkillRank(skill.id) : 0;
      return {
        ...s,
        display_value: resolveDamageScaling(s.display_value, rank, s.die_progression ?? []),
      };
    })
);

const narrativeEntries = computed(() =>
  (props.action.special ?? []).filter(
    (s) => !TYPED_SPECIAL.has(s.type) && (s.display_value || s.value != null)
  )
);

const hasBadges = computed(
  () =>
    typedEntries.value.length > 0 ||
    !!props.action.dice ||
    !!props.action.damageType ||
    actionCosts.value.length > 0
);

// Use action
const hasDeductibleCost = computed(
  () => props.action.focusCost > 0 || props.action.investitureCost > 0
);

const canUse = computed(() => {
  if (!heroStore.hero) return false;
  if (props.action.focusCost > 0 && heroStore.hero.currentFocus < props.action.focusCost)
    return false;
  if (
    props.action.investitureCost > 0 &&
    heroStore.hero.currentInvestiture < props.action.investitureCost
  )
    return false;
  return true;
});

const using = ref(false);

async function useAction(): Promise<void> {
  if (!heroStore.hero || !canUse.value || using.value) return;
  using.value = true;
  try {
    if (props.action.focusCost > 0) {
      await heroStore.patchFocus(heroStore.hero.currentFocus - props.action.focusCost);
    }
    if (props.action.investitureCost > 0) {
      await heroStore.patchInvestiture(
        heroStore.hero.currentInvestiture - props.action.investitureCost
      );
    }
  } finally {
    using.value = false;
  }
}

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
.action-header {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 4px;
}

.action-row-name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.action-name {
  font-weight: 500;
}

.action-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.use-action-btn {
  align-self: center;
}

.action-expansion-item :deep(.q-expansion-item__container) {
  border-bottom: none;
}
</style>
