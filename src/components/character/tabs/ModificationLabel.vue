<template>
  <span class="row no-wrap items-center" :class="colorClass">
    <span>{{ prefix }} {{ mod.modification?.name ?? mod.customText }}</span>
    <q-btn
      v-if="description"
      flat
      dense
      round
      size="xs"
      class="q-ml-xs"
      aria-label="Modification details"
    >
      <Info :size="14" />
      <InfoPopup>{{ description }}</InfoPopup>
    </q-btn>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import { Info } from 'lucide-vue-next';
import InfoPopup from 'src/components/shared/InfoPopup.vue';
import type { AppliedModification } from 'src/types';

const props = defineProps<{
  mod: AppliedModification;
}>();

const classifiers = useClassifierStore();

const prefix = computed(() => (props.mod.modType === 'upgrade' ? '+' : '-'));
const colorClass = computed(() =>
  props.mod.modType === 'upgrade' ? 'text-positive' : 'text-negative'
);

const description = computed(() => {
  if (!props.mod.modification) return '';
  return (
    classifiers.modifications.find((m) => m.code === props.mod.modification!.code)?.description ??
    ''
  );
});
</script>
