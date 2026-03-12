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
        <div v-if="grantedExpertises.length > 0" class="q-mt-xs">
          <q-badge
            v-for="exp in grantedExpertises"
            :key="exp.id"
            outline
            color="positive"
            class="q-mr-xs"
          >
            {{ exp.name }}
          </q-badge>
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RPG_COLORS } from 'src/constants/theme';
import { useHeroStore } from 'src/stores/hero';
import PrerequisiteList from 'src/components/shared/PrerequisiteList.vue';
import type { Talent } from 'src/types';
import { logger } from 'src/utils/logger';

const props = defineProps<{
  talent: Talent;
}>();

const heroStore = useHeroStore();

const grantedExpertises = computed(() =>
  (heroStore.hero?.expertises ?? [])
    .filter((e) => e.source?.sourceType === 'talent' && e.source?.sourceId === props.talent.id)
    .map((e) => ({ id: e.id, name: e.expertise?.name ?? e.customName ?? 'Unknown' }))
);

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
