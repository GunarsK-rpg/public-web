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
        <q-btn
          icon="close"
          flat
          round
          dense
          aria-label="Close dialog"
          @click="$emit('update:modelValue', false)"
        />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list bordered separator>
          <q-item v-for="path in classifiers.paths" :key="path.id" :active="isSelected(path.id)">
            <q-item-section>
              <q-item-label>{{ path.name }}</q-item-label>
              <q-item-label caption>{{ path.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon v-if="isSelected(path.id)" name="check" color="positive" size="sm" />
              <q-btn
                v-else
                flat
                dense
                color="primary"
                label="Select"
                size="sm"
                @click="selectPath(path.id)"
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
