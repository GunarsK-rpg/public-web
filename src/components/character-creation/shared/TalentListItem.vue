<template>
  <q-item :class="{ 'item-disabled': !available }">
    <q-item-section avatar>
      <q-checkbox
        :model-value="selected"
        :disable="!available && !selected"
        @update:model-value="$emit('toggle')"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label :class="{ [`text-${COLORS.muted}`]: !available }">
        {{ talent.name }}
        <q-icon v-if="!available" name="lock" size="xs" class="q-ml-xs" aria-hidden="true" />
      </q-item-label>
      <q-item-label caption>{{ talent.descriptionShort || talent.description }}</q-item-label>
      <q-item-label v-if="unmetPrereqs.length > 0" caption :class="`text-${COLORS.error}`">
        <strong>Requires:</strong>
        {{ unmetPrereqs.map(formatPrerequisite).join(', ') }}
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-btn
        flat
        dense
        icon="info"
        aria-label="View talent details"
        @click.stop="$emit('showDetails', talent)"
      >
        <q-tooltip>View details</q-tooltip>
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { COLORS } from 'src/constants/theme';
import { formatPrerequisite } from 'src/utils/talentUtils';
import type { Talent, TalentPrerequisite } from 'src/types';

defineProps<{
  talent: Talent;
  selected: boolean;
  available: boolean;
  unmetPrereqs: TalentPrerequisite[];
}>();

defineEmits<{
  toggle: [];
  showDetails: [talent: Talent];
}>();
</script>
