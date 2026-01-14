<template>
  <q-item class="talent-item">
    <q-item-section>
      <q-item-label>{{ talent.name || 'Unknown Talent' }}</q-item-label>
      <q-item-label caption>{{
        talent.descriptionShort || talent.description || 'No description available'
      }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
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
.talent-item {
  min-height: 48px;
}
</style>
