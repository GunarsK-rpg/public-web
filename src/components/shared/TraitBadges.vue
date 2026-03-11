<template>
  <div v-if="traitBadges.length" class="row wrap q-gutter-xs">
    <q-badge
      v-for="trait in traitBadges"
      :key="trait.code"
      outline
      color="grey-7"
      class="trait-badge"
      :class="{ 'trait-badge--clickable': trait.description }"
      :tabindex="trait.description ? 0 : undefined"
      :role="trait.description ? 'button' : undefined"
      :aria-haspopup="trait.description ? 'dialog' : undefined"
      @keydown.enter.prevent="trait.description && ($event.currentTarget as HTMLElement).click()"
      @keydown.space.prevent="trait.description && ($event.currentTarget as HTMLElement).click()"
    >
      {{ trait.label }}
      <q-popup-proxy v-if="trait.description" :breakpoint="0" :offset="[0, 8]">
        <q-banner dense class="text-body2">{{ trait.description }}</q-banner>
      </q-popup-proxy>
    </q-badge>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById } from 'src/utils/arrayUtils';

const props = defineProps<{
  equipmentId: number;
}>();

const classifiers = useClassifierStore();

const fullEquipment = computed(() => findById(classifiers.equipment, props.equipmentId));

const traitBadges = computed(() => {
  const attrs = fullEquipment.value?.attributes ?? [];
  return attrs.map((attr) => {
    const full = findById(classifiers.equipmentAttributes, attr.id);
    let label = attr.name;
    if (attr.value != null) label += ` [${attr.value}]`;
    if (attr.isExpert) label += ' (Expert)';
    return { code: attr.code, label, description: full?.description ?? '' };
  });
});
</script>

<style scoped>
.trait-badge--clickable {
  cursor: pointer;
}
</style>
