<template>
  <q-expansion-item switch-toggle-side dense class="action-expansion-item">
    <template #header>
      <div class="action-header">
        <div class="action-main">
          <div class="action-row-name">
            <img
              v-if="activationType?.icon"
              :src="iconUrl"
              :alt="activationType?.name ?? 'Action'"
              :title="activationType?.name ?? 'Action'"
              class="action-icon icon-theme-aware"
            />
            <span class="action-name">{{ displayName }}</span>
            <SpecialBadges v-if="typedEntries.length" :specials="typedEntries" />
            <q-badge v-if="effectiveDice" :color="RPG_COLORS.badgeMuted" outline>
              {{ effectiveDice }}
            </q-badge>
            <q-badge v-if="action.damageType" :color="RPG_COLORS.badgeMuted" outline>
              {{ action.damageType.name }}
            </q-badge>
            <q-badge
              v-for="(mod, idx) in rollModifiers"
              :key="idx"
              :color="mod.display_value === 'Disadvantage' ? 'negative' : 'positive'"
              outline
            >
              {{ mod.display_value }}
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
        <q-btn
          v-if="!readonly"
          flat
          dense
          round
          size="xs"
          :color="isFavorite ? 'warning' : 'grey'"
          :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
          :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
          @click.stop="emit('toggle-favorite')"
        >
          <Star :size="14" :fill="isFavorite ? 'currentColor' : 'none'" />
        </q-btn>
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
        <!-- Equipment traits (expansion only) -->
        <TraitBadges
          v-if="equipmentInstance?.heroEquipment.equipment?.id"
          :equipment-id="equipmentInstance.heroEquipment.equipment.id"
          class="q-mt-xs"
        />
        <!-- Equipment modifications (expansion only) -->
        <div v-if="equipmentMods.length" class="q-mt-xs">
          <ModificationLabel v-for="mod in equipmentMods" :key="mod.id" :mod="mod" />
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Star } from 'lucide-vue-next';
import { useClassifierStore } from 'src/stores/classifiers';
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useEntityIcon } from 'src/composables/useEntityIcon';
import { RPG_COLORS } from 'src/constants/theme';
import { SPECIAL, resolveDamageScaling, resolveSkillModifier } from 'src/utils/specialUtils';
import { findByCode } from 'src/utils/arrayUtils';
import {
  getInstanceDice,
  getInstanceActionSpecial,
  getModRollModifiers,
  getInstanceWeaponLabel,
} from 'src/utils/equipmentActionUtils';
import SpecialBadges from 'src/components/shared/SpecialBadges.vue';
import TraitBadges from 'src/components/shared/TraitBadges.vue';
import ModificationLabel from './ModificationLabel.vue';
import type { Action, EquipmentActionInstance } from 'src/types';

const props = defineProps<{
  action: Action;
  equipmentInstance?: EquipmentActionInstance;
  readonly?: boolean;
  isFavorite?: boolean;
}>();

const emit = defineEmits<{
  'toggle-favorite': [];
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

// Display name: append weapon label when disambiguating and label isn't already in the name
const displayName = computed(() => {
  if (!props.equipmentInstance) return props.action.name;
  const label = getInstanceWeaponLabel(props.equipmentInstance);
  if (!label || props.action.name.toLowerCase().includes(label.toLowerCase()))
    return props.action.name;
  return `${props.action.name} — ${label}`;
});

// Effective dice: use equipment instance override when available
const effectiveDice = computed(() => {
  if (props.equipmentInstance) return getInstanceDice(props.equipmentInstance);
  return props.action.dice ?? null;
});

// Roll modifiers from equipment modifications (Advantage/Disadvantage)
const rollModifiers = computed(() => {
  if (!props.equipmentInstance) return [];
  return getModRollModifiers(props.equipmentInstance);
});

// Source special entries: from equipment instance or action classifier
const sourceSpecial = computed(() => {
  if (props.equipmentInstance) return getInstanceActionSpecial(props.equipmentInstance);
  return props.action.special ?? [];
});

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
  sourceSpecial.value
    .filter((s) => TYPED_SPECIAL.has(s.type) && (s.display_value || s.value != null))
    .map((s) => {
      if (s.type === SPECIAL.DAMAGE_SCALING && s.display_value) {
        const skill = s.skill ? findByCode(classifiers.skills, s.skill) : null;
        const rank = skill ? attrStore.getSkillRank(skill.id) : 0;
        return {
          ...s,
          display_value: resolveDamageScaling(s.display_value, rank, s.die_progression ?? []),
        };
      }
      if (s.type === SPECIAL.SKILL && s.skill && s.display_value) {
        const modifier = attrStore.getSkillModifier(s.skill);
        return { ...s, display_value: resolveSkillModifier(s.display_value, modifier) };
      }
      return s;
    })
);

const narrativeEntries = computed(() =>
  (props.action.special ?? []).filter(
    (s) => s.type === SPECIAL.NARRATIVE && (s.display_value || s.value != null)
  )
);

// Equipment modifications (shown in expansion only)
const equipmentMods = computed(() => {
  if (!props.equipmentInstance) return [];
  return props.equipmentInstance.heroEquipment.modifications;
});

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
  flex-direction: row;
  flex: 1;
  min-width: 0;
  gap: 4px;
  align-items: flex-start;
}

.action-main {
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
