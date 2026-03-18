<template>
  <div v-if="text" class="q-mb-md">
    <div class="section-title section-title--lg">{{ title }}</div>
    <div class="text-body2">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  text?: string | null;
}>();
</script>
