<template>
  <div>
    <slot name="header">
      <div class="section-title section-title--lg">Attributes</div>
    </slot>
    <div class="row q-col-gutter-sm q-mb-md">
      <template v-if="loading">
        <div v-for="n in 5" :key="n" class="col-6 col-sm-4 col-md-2">
          <q-card class="attribute-card">
            <q-card-section class="text-center q-pa-sm">
              <q-skeleton type="text" width="30px" height="12px" class="q-mx-auto" />
              <q-skeleton type="text" width="30px" height="24px" class="q-mx-auto q-mt-xs" />
              <q-skeleton type="text" width="50px" height="12px" class="q-mx-auto q-mt-xs" />
            </q-card-section>
          </q-card>
        </div>
      </template>
      <template v-else>
        <div v-for="attr in attributes" :key="attr.type.code" class="col-6 col-sm-4 col-md-2">
          <q-card class="attribute-card">
            <q-card-section class="text-center q-pa-sm">
              <div class="attribute-abbr">{{ attr.type.code.toUpperCase() }}</div>
              <template v-if="editable">
                <q-input
                  :model-value="attr.value"
                  type="number"
                  dense
                  borderless
                  input-style="text-align: center; font-size: 1.5rem; font-weight: 700; font-variant-numeric: tabular-nums"
                  :min="0"
                  :aria-label="`Edit ${attr.type.name}`"
                  @update:model-value="
                    $emit('update', attr.type.code, Math.max(0, Number($event) || 0))
                  "
                />
              </template>
              <template v-else>
                <div
                  class="attribute-value"
                  :class="{ 'text-positive': !!attr.breakdown }"
                  :aria-label="`${attr.type.name}: ${attr.value}`"
                >
                  {{ attr.value }}
                  <InfoPopup v-if="attr.breakdown">{{ attr.breakdown }}</InfoPopup>
                </div>
              </template>
              <div class="attribute-name">{{ attr.type.name }}</div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import InfoPopup from 'src/components/shared/InfoPopup.vue';
import type { StatValue } from 'src/types/shared';

withDefaults(
  defineProps<{
    attributes: StatValue[];
    editable?: boolean;
    loading?: boolean;
  }>(),
  { editable: false, loading: false }
);

defineEmits<{
  update: [code: string, value: number];
}>();
</script>

<style scoped>
.attribute-card {
  height: 100%;
}

.attribute-abbr {
  font-size: var(--font-size-sm);
  opacity: 0.6;
  text-transform: uppercase;
}

.attribute-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.attribute-name {
  font-size: var(--font-size-sm);
  opacity: 0.7;
}
</style>
