<template>
  <q-btn-toggle
    :model-value="modelValue"
    :options="options"
    no-caps
    dense
    spread
    toggle-color="primary"
    class="turn-speed-toggle"
    :disable="saving"
    aria-label="Turn speed"
    @update:model-value="onToggle"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: 'fast' | 'slow' | null;
  saving: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: 'fast' | 'slow' | null];
}>();

const options = [
  { label: 'Fast', value: 'fast' as const },
  { label: 'Slow', value: 'slow' as const },
];

function onToggle(value: 'fast' | 'slow' | null) {
  // Click selected to deselect
  emit('update:modelValue', value === props.modelValue ? null : value);
}
</script>

<style scoped>
.turn-speed-toggle {
  max-width: 140px;
}
</style>
