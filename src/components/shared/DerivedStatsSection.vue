<template>
  <div>
    <slot name="header">
      <div class="section-title section-title--lg">{{ title }}</div>
    </slot>
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
  </div>
</template>

<script setup lang="ts">
import type { StatValue } from 'src/types/shared';

withDefaults(
  defineProps<{
    title?: string;
    stats: StatValue[];
  }>(),
  { title: 'Other Stats' }
);
</script>
