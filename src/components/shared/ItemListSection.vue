<template>
  <div v-if="items.length">
    <div class="section-title section-title--lg">{{ title }}</div>
    <div v-for="(item, i) in items" :key="i" class="q-mb-sm">
      <div class="row items-center no-wrap q-gutter-xs">
        <img
          v-if="item.activationType && getIcon(item.activationType)"
          :src="getIcon(item.activationType)"
          alt=""
          aria-hidden="true"
          class="activation-icon icon-theme-aware"
        />
        <span class="text-weight-bold">{{ item.name }}</span>
      </div>
      <div class="text-body2">{{ item.displayValue }}</div>
    </div>
    <q-separator v-if="separator" class="q-my-md" />
  </div>
</template>

<script setup lang="ts">
import { getIconUrl } from 'src/utils/iconUrl';

export interface ListItem {
  name: string;
  displayValue: string;
  activationType?: string;
}

withDefaults(
  defineProps<{
    title: string;
    items: ListItem[];
    separator?: boolean;
  }>(),
  { separator: true }
);

function getIcon(code: string): string {
  return getIconUrl(code.replace(/_/g, '-') + '.svg', 'actions');
}
</script>

<style scoped>
.activation-icon {
  width: 20px;
  height: 20px;
}
</style>
