<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: min(400px, 90vw); max-width: 600px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ talent?.name }}</div>
        <q-space />
        <q-btn icon="close" flat round dense aria-label="Close dialog" v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section v-if="talent">
        <div class="text-body2" style="white-space: pre-wrap">
          {{ talent.description }}
        </div>
        <template v-if="prerequisites.length">
          <q-separator class="q-my-sm" />
          <div class="text-caption text-muted">
            <strong>Prerequisites:</strong>
            {{ prerequisites.map(formatPrereq).join(', ') }}
          </div>
        </template>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Talent, TalentPrerequisite } from 'src/types';

const props = defineProps<{
  modelValue: boolean;
  talent: Talent | null;
  formatPrereq: (prereq: TalentPrerequisite) => string;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const prerequisites = computed(() => props.talent?.prerequisites ?? []);
</script>
