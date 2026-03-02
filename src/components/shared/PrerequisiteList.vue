<template>
  <div v-if="prerequisites.length" class="prerequisite-list">
    <q-separator class="q-my-sm" />
    <div class="text-caption text-muted">
      <strong>Prerequisites:</strong>
      {{ prerequisites.map(formatPrerequisite).join(', ') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrerequisite } from 'src/utils/talentUtils';
import type { TalentPrerequisite } from 'src/types/talents';

defineProps<{
  prerequisites: TalentPrerequisite[];
}>();
</script>
