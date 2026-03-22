<template>
  <div>
    <slot name="header">
      <div class="section-title section-title--lg">Attributes</div>
    </slot>
    <div class="row q-col-gutter-sm q-mb-md">
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
                input-class="text-center attribute-value"
                :min="0"
                @update:model-value="$emit('update', attr.type.code, Number($event) || 0)"
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
  }>(),
  { editable: false }
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
