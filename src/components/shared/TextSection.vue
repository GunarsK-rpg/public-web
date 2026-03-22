<template>
  <div v-if="text || editable" class="q-mb-md">
    <div class="section-title section-title--lg">{{ title }}</div>
    <q-input
      v-if="editable"
      :model-value="text ?? ''"
      type="textarea"
      outlined
      autogrow
      dense
      :rows="2"
      :aria-label="`Edit ${title}`"
      @update:model-value="$emit('update', $event == null ? '' : String($event))"
    />
    <div v-else class="text-body2">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    text?: string | null;
    editable?: boolean;
  }>(),
  { editable: false }
);

defineEmits<{
  update: [value: string];
}>();
</script>
