<template>
  <div>
    <div v-if="items.length === 0 && emptyMessage" class="text-empty">{{ emptyMessage }}</div>
    <q-list
      v-if="items.length > 0"
      :bordered="bordered"
      separator
      :class="bordered ? 'q-mb-sm' : ''"
    >
      <q-item v-for="item in items" :key="item.id">
        <q-item-section>
          <q-item-label>{{ item.name }}</q-item-label>
          <q-item-label v-if="item.description" caption>{{ item.description }}</q-item-label>
        </q-item-section>
        <q-item-section v-if="item.typeName || !readonly" side>
          <div class="row items-center no-wrap q-gutter-x-sm">
            <q-badge v-if="item.typeName" :color="badgeColor">{{ item.typeName }}</q-badge>
            <q-btn
              v-if="!readonly"
              flat
              dense
              round
              size="sm"
              icon="close"
              :aria-label="`Remove ${itemLabel}: ${item.name}`"
              @click="$emit('remove', item.id)"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    <q-btn
      v-if="!readonly"
      flat
      dense
      color="primary"
      :label="addLabel"
      class="q-mt-sm"
      @click="$emit('add')"
    />
  </div>
</template>

<script setup lang="ts">
export interface ListItem {
  id: number;
  name: string;
  description?: string | null | undefined;
  typeName?: string | null | undefined;
}

withDefaults(
  defineProps<{
    items: ListItem[];
    itemLabel: string;
    addLabel: string;
    emptyMessage?: string | undefined;
    readonly?: boolean;
    bordered?: boolean;
    badgeColor?: string;
  }>(),
  {
    emptyMessage: undefined,
    readonly: false,
    bordered: false,
    badgeColor: 'grey-7',
  }
);

defineEmits<{
  add: [];
  remove: [id: number];
}>();
</script>
