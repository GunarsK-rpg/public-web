<template>
  <q-banner class="banner-info q-mb-md">
    <template v-slot:avatar>
      <component :is="icon" aria-hidden="true" />
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
import type { Component } from 'vue';

defineProps<{
  icon: Component;
  title?: string;
  content: string;
  caption?: string;
}>();
</script>
