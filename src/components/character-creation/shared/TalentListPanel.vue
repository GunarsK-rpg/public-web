<template>
  <div>
    <div class="text-caption q-mb-xs">{{ label }}</div>
    <q-list bordered separator class="rounded-borders">
      <TalentListItem
        v-for="talentInfo in talents"
        :key="talentInfo.talent.id"
        :talent="talentInfo.talent"
        :selected="isTalentSelected(talentInfo.talent.id)"
        :available="talentInfo.available"
        :unmet-prereqs="talentInfo.unmetPrereqs"
        @toggle="$emit('toggleTalent', talentInfo.talent.id, talentInfo.available)"
        @show-details="$emit('showDetails', $event)"
      />
      <q-item v-if="talents.length === 0 && emptyMessage">
        <q-item-section class="text-muted">
          {{ emptyMessage }}
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import {
  useTalentPrerequisites,
  type TalentWithStatus,
} from 'src/composables/useTalentPrerequisites';
import TalentListItem from './TalentListItem.vue';
import type { Talent } from 'src/types';

defineProps<{
  label: string;
  talents: TalentWithStatus[];
  emptyMessage?: string;
}>();

defineEmits<{
  toggleTalent: [talentId: number, available: boolean];
  showDetails: [talent: Talent];
}>();

const { isTalentSelected } = useTalentPrerequisites();
</script>
