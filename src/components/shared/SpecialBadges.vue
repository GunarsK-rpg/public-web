<template>
  <q-badge
    v-for="(entry, idx) in displayEntries"
    :key="idx"
    :color="getBadgeColor(entry.type)"
    :title="entry.type"
    outline
  >
    {{ entry.display_value || entry.value }}
  </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SPECIAL } from 'src/utils/specialUtils';
import { RPG_COLORS } from 'src/constants/theme';
import type { SpecialEntry } from 'src/types';

const props = defineProps<{
  specials: SpecialEntry[];
}>();

const displayEntries = computed(() =>
  props.specials.filter((s) => s.display_value || s.value != null)
);

const ATTRIBUTE_TYPES: Set<string> = new Set([
  SPECIAL.ATTRIBUTE_STR,
  SPECIAL.ATTRIBUTE_SPD,
  SPECIAL.ATTRIBUTE_INT,
  SPECIAL.ATTRIBUTE_WIL,
  SPECIAL.ATTRIBUTE_AWA,
  SPECIAL.ATTRIBUTE_PRE,
]);

const DEFENSE_TYPES: Set<string> = new Set([
  SPECIAL.DEFENSE_PHYSICAL,
  SPECIAL.DEFENSE_COGNITIVE,
  SPECIAL.DEFENSE_SPIRITUAL,
  SPECIAL.DEFLECT,
]);

function getBadgeColor(type: string): string {
  if (ATTRIBUTE_TYPES.has(type)) return RPG_COLORS.talentAvailable;
  if (DEFENSE_TYPES.has(type)) return RPG_COLORS.cognitive;
  return RPG_COLORS.badgeMuted;
}
</script>
