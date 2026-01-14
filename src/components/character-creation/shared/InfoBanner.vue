<template>
  <q-banner class="banner-info q-mb-md">
    <template v-slot:avatar>
      <q-icon :name="icon" aria-hidden="true" />
    </template>
    <div>
      <strong v-if="title">{{ title }}:</strong>
      {{ content }}
    </div>
    <div v-if="caption" class="text-caption text-muted">{{ caption }}</div>
    <slot />
  </q-banner>
</template>

<script setup lang="ts">
defineProps<{
  /** Material Symbols icon name (e.g., "sym_o_backpack") */
  icon: string;
  /** Optional bold title before content */
  title?: string;
  /** Main banner content text */
  content: string;
  /** Optional caption/subtext shown below content */
  caption?: string;
}>();
</script>
