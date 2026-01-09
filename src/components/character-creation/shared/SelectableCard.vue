<template>
  <q-card
    :role="multiSelect ? 'checkbox' : 'radio'"
    tabindex="0"
    :aria-checked="selected"
    :aria-label="ariaLabel"
    :class="['cursor-pointer', { 'card-selected': selected }]"
    @click="$emit('select')"
    @keydown.enter="$emit('select')"
    @keydown.space.prevent="$emit('select')"
  >
    <q-card-section>
      <div class="text-h6">{{ title }}</div>
      <div v-if="subtitle" class="text-body2">{{ subtitle }}</div>
      <slot />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  /** Card title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Whether this card is currently selected */
  selected: boolean;
  /** Accessibility label for screen readers */
  ariaLabel?: string;
  /** Use checkbox role instead of radio (for multi-select scenarios) */
  multiSelect?: boolean;
}>();

defineEmits<{
  select: [];
}>();
</script>
