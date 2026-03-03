<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="path-selection-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="path-selection-card" role="dialog">
      <q-card-section class="row items-center">
        <div id="path-selection-dialog-title" class="text-h6">Add Heroic Path</div>
        <q-space />
        <q-btn flat round dense aria-label="Close dialog" @click="$emit('update:modelValue', false)"
          ><X :size="20"
        /></q-btn>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list bordered separator>
          <q-item
            v-for="path in classifiers.paths"
            :key="path.id"
            :active="isSelected(path.id)"
            clickable
            v-ripple
            @click="!isSelected(path.id) && selectPath(path.id)"
          >
            <q-item-section>
              <q-item-label>{{ path.name }}</q-item-label>
              <q-item-label caption>{{ path.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <Check v-if="isSelected(path.id)" :size="18" class="text-positive" />
              <q-btn
                v-else
                flat
                dense
                color="primary"
                label="Select"
                size="sm"
                @click.stop="selectPath(path.id)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useClassifierStore } from 'src/stores/classifiers';
import { Check, X } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: boolean;
  selectedPathIds: number[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  select: [pathId: number];
}>();

const classifiers = useClassifierStore();

function isSelected(pathId: number): boolean {
  return props.selectedPathIds.includes(pathId);
}

function selectPath(pathId: number) {
  emit('select', pathId);
  emit('update:modelValue', false);
}
</script>

<style scoped>
.path-selection-card {
  min-width: min(400px, 90vw);
  max-width: 500px;
}
</style>
