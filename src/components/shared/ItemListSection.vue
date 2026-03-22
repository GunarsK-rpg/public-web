<template>
  <div v-if="items.length || editable">
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
        <q-space />
        <template v-if="editable">
          <q-btn flat dense round size="sm" @click="$emit('edit', i)">
            <Pencil :size="16" />
          </q-btn>
          <q-btn flat dense round size="sm" @click="$emit('remove', i)">
            <X :size="16" />
          </q-btn>
        </template>
      </div>
      <div class="text-body2">{{ item.displayValue }}</div>
    </div>
    <q-btn
      v-if="editable"
      flat
      dense
      color="primary"
      :label="`Add ${title.replace(/s$/, '')}`"
      class="q-mt-xs"
      @click="$emit('add')"
    />
    <q-separator v-if="separator" class="q-my-md" />
  </div>
</template>

<script setup lang="ts">
import { Pencil, X } from 'lucide-vue-next';
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
    editable?: boolean;
  }>(),
  { separator: true, editable: false }
);

defineEmits<{
  add: [];
  edit: [index: number];
  remove: [index: number];
}>();

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
