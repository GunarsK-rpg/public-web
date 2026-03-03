<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="order-selection-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="order-selection-card" role="dialog">
      <q-card-section class="row items-center">
        <div id="order-selection-dialog-title" class="text-h6">Select Radiant Order</div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          aria-label="Close dialog"
          @click="$emit('update:modelValue', false)"
        />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list bordered separator>
          <q-item
            v-for="order in classifiers.radiantOrders"
            :key="order.id"
            :active="selectedOrderId === order.id"
            clickable
            v-ripple
            @click="selectedOrderId !== order.id && selectOrder(order.id)"
          >
            <q-item-section>
              <q-item-label>{{ order.name }}</q-item-label>
              <q-item-label caption>{{ getOrderSubtitle(order) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon v-if="selectedOrderId === order.id" name="check" color="positive" size="sm" />
              <q-btn
                v-else
                flat
                dense
                color="primary"
                label="Select"
                size="sm"
                @click.stop="selectOrder(order.id)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useClassifierStore } from 'src/stores/classifiers';
import { findById } from 'src/utils/arrayUtils';
import type { RadiantOrder } from 'src/types';

defineProps<{
  modelValue: boolean;
  selectedOrderId: number | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  select: [orderId: number];
}>();

const classifiers = useClassifierStore();

function getOrderSubtitle(order: RadiantOrder): string {
  const surge1 = order.surge1?.id ? findById(classifiers.surges, order.surge1.id)?.name : null;
  const surge2 = order.surge2?.id ? findById(classifiers.surges, order.surge2.id)?.name : null;
  if (surge1 && surge2) return `${surge1} \u00b7 ${surge2}`;
  if (surge1) return surge1;
  return '';
}

function selectOrder(orderId: number) {
  emit('select', orderId);
  emit('update:modelValue', false);
}
</script>

<style scoped>
.order-selection-card {
  min-width: min(400px, 90vw);
  max-width: 500px;
}
</style>
