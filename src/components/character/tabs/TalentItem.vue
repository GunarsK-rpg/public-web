<template>
  <q-expansion-item switch-toggle-side dense class="talent-expansion-item">
    <template #header>
      <q-item-section>
        <q-item-label>{{ talent.name || 'Unknown Talent' }}</q-item-label>
        <q-item-label caption>{{
          talent.descriptionShort || talent.description || 'No description available'
        }}</q-item-label>
      </q-item-section>
      <q-item-section side top>
        <q-badge v-if="talent.isKey" :color="RPG_COLORS.talentKey" outline>Key</q-badge>
      </q-item-section>
    </template>

    <q-card>
      <q-card-section class="q-pt-sm q-pb-sm">
        <div class="text-body2 talent-description">
          {{ talent.description || 'No description available' }}
        </div>
        <PrerequisiteList :prerequisites="talent.prerequisites ?? []" />
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { RPG_COLORS } from 'src/constants/theme';
import PrerequisiteList from 'src/components/shared/PrerequisiteList.vue';
import type { Talent } from 'src/types';
import { logger } from 'src/utils/logger';

const props = defineProps<{
  talent: Talent;
}>();

// Runtime validation - log warning if talent is missing required fields
if (!props.talent?.name) {
  logger.warn('TalentItem received talent without name', {
    talentId: props.talent?.id,
  });
}
</script>

<style scoped>
.talent-description {
  white-space: pre-wrap;
}

.talent-expansion-item :deep(.q-expansion-item__container) {
  border-bottom: none;
}
</style>
