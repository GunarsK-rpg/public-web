<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="kit-selection-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="kit-selection-card" role="dialog">
      <q-card-section class="row items-center">
        <div id="kit-selection-dialog-title" class="text-h6">Select Starting Kit</div>
        <q-space />
        <q-btn flat round dense aria-label="Close dialog" @click="$emit('update:modelValue', false)"
          ><X :size="20" aria-hidden="true"
        /></q-btn>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list bordered separator role="listbox" aria-label="Starting kits">
          <q-item
            v-for="kit in classifiers.startingKits"
            :key="kit.id"
            :active="selectedKitId === kit.id"
            :aria-selected="selectedKitId === kit.id"
            role="option"
            clickable
            v-ripple
            @click="selectedKitId !== kit.id && selectKit(kit.id)"
          >
            <q-item-section>
              <q-item-label>{{ kit.name }}</q-item-label>
              <q-item-label caption>{{ getKitSubtitle(kit) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <Check
                v-if="selectedKitId === kit.id"
                :size="18"
                class="text-positive selected-indicator"
                aria-hidden="true"
              />
              <span v-if="selectedKitId === kit.id" class="sr-only">Selected</span>
              <span v-else class="text-primary text-caption">Select</span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useClassifierStore } from 'src/stores/classifiers';
import { findById } from 'src/utils/arrayUtils';
import { Check, X } from 'lucide-vue-next';
import type { StartingKit } from 'src/types';

defineProps<{
  modelValue: boolean;
  selectedKitId: number | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  select: [kitId: number];
}>();

const classifiers = useClassifierStore();

function getKitSubtitle(kit: StartingKit): string {
  const currency =
    kit.startingSpheres === '0' ? 'No starting currency' : `${kit.startingSpheres} marks`;
  const expertise = kit.expertises?.[0]?.id
    ? findById(classifiers.expertises, kit.expertises[0].id)?.name
    : null;
  return expertise ? `${currency} \u00b7 ${expertise}` : currency;
}

function selectKit(kitId: number) {
  emit('select', kitId);
  emit('update:modelValue', false);
}
</script>

<style scoped>
.kit-selection-card {
  min-width: min(400px, 90vw);
  max-width: 500px;
}
</style>
