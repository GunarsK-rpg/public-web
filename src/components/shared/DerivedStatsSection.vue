<template>
  <div>
    <slot name="header">
      <div class="section-title section-title--lg">{{ title }}</div>
    </slot>
    <template v-if="editable">
      <div class="row q-col-gutter-sm q-mb-sm">
        <div v-for="(stat, i) in stats" :key="stat.type.code" class="col-6 col-sm-3">
          <q-card flat bordered>
            <q-card-section class="q-pa-sm">
              <div class="row items-center no-wrap">
                <div class="text-caption text-muted col">{{ stat.type.name }}</div>
                <q-btn flat dense round size="xs" @click="$emit('edit', i)">
                  <Pencil :size="14" />
                </q-btn>
                <q-btn flat dense round size="xs" @click="$emit('remove', i)">
                  <X :size="14" />
                </q-btn>
              </div>
              <div class="text-body1">
                {{ stat.displayValue ?? stat.value }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <q-btn
        flat
        dense
        color="primary"
        :label="`Add ${title.replace(/s$/, '')}`"
        @click="$emit('add')"
      />
    </template>
    <template v-else>
      <div class="row q-col-gutter-sm q-mb-md">
        <div v-for="stat in stats" :key="stat.type.code" class="col-6 col-sm-3">
          <q-card flat bordered>
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-muted">{{ stat.type.name }}</div>
              <div class="text-body1">
                {{ stat.displayValue ?? stat.value }}
                <span v-if="stat.breakdown" class="text-caption">{{ stat.breakdown }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Pencil, X } from 'lucide-vue-next';
import type { StatValue } from 'src/types/shared';

withDefaults(
  defineProps<{
    title?: string;
    stats: StatValue[];
    editable?: boolean;
  }>(),
  { title: 'Other Stats', editable: false }
);

defineEmits<{
  add: [];
  edit: [index: number];
  remove: [index: number];
}>();
</script>
