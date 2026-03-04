<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="talent-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="talent-dialog-card" role="dialog">
      <q-card-section class="row items-center">
        <div id="talent-dialog-title" class="text-h6">{{ talent?.name }}</div>
        <q-space />
        <q-btn flat round dense aria-label="Close dialog" v-close-popup
          ><X :size="20" aria-hidden="true"
        /></q-btn>
      </q-card-section>
      <q-separator />
      <q-card-section v-if="talent">
        <div class="text-body2 talent-description">
          {{ talent.description }}
        </div>
        <PrerequisiteList :prerequisites="prerequisites" />
        <div v-if="talent.special?.length" class="q-mt-sm">
          <SpecialBadges :specials="talent.special" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PrerequisiteList from 'src/components/shared/PrerequisiteList.vue';
import SpecialBadges from 'src/components/shared/SpecialBadges.vue';
import { X } from 'lucide-vue-next';
import type { Talent } from 'src/types';

const props = defineProps<{
  modelValue: boolean;
  talent: Talent | null;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const prerequisites = computed(() => props.talent?.prerequisites ?? []);
</script>

<style scoped>
.talent-dialog-card {
  min-width: min(400px, 90vw);
  max-width: 600px;
}

.talent-description {
  white-space: pre-wrap;
}
</style>
