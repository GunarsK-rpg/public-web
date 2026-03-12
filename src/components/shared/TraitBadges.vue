<template>
  <div v-if="traitBadges.length" class="row wrap q-gutter-xs">
    <q-badge
      v-for="trait in traitBadges"
      :key="trait.code"
      outline
      :color="trait.warning ? 'warning' : 'grey-7'"
      class="trait-badge"
      :class="{ 'trait-badge--clickable': trait.description || trait.warning }"
      :tabindex="trait.description || trait.warning ? 0 : undefined"
      :role="trait.description || trait.warning ? 'button' : undefined"
      :aria-haspopup="trait.description || trait.warning ? 'dialog' : undefined"
      @keydown.enter.prevent="
        (trait.description || trait.warning) && ($event.currentTarget as HTMLElement).click()
      "
      @keydown.space.prevent="
        (trait.description || trait.warning) && ($event.currentTarget as HTMLElement).click()
      "
    >
      {{ trait.label }}
      <InfoPopup v-if="trait.warning">{{ trait.warning }}</InfoPopup>
      <InfoPopup v-else-if="trait.description">{{ trait.description }}</InfoPopup>
    </q-badge>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import InfoPopup from 'src/components/shared/InfoPopup.vue';
import { findById } from 'src/utils/arrayUtils';

const props = defineProps<{
  equipmentId: number;
}>();

const classifiers = useClassifierStore();
const attrStore = useHeroAttributesStore();

const fullEquipment = computed(() => findById(classifiers.equipment, props.equipmentId));

const traitBadges = computed(() => {
  const attrs = fullEquipment.value?.attributes ?? [];
  return attrs.map((attr) => {
    const full = findById(classifiers.equipmentAttributes, attr.id);
    let label = attr.name;
    if (attr.value != null) label += ` [${attr.value}]`;
    if (attr.isExpert) label += ' (Expert)';

    let warning = '';
    if (attr.code === 'cumbersome' && attr.value != null) {
      const str = attrStore.attributeValues.str ?? 0;
      if (str < attr.value) {
        const isWeapon = fullEquipment.value?.equipType?.code === 'weapon';
        const penalty = isWeapon ? 'disadvantage on attacks' : 'disadvantage on SPD tests';
        warning = `STR ${str} < ${attr.value}: Slowed + ${penalty}`;
      }
    }

    return { code: attr.code, label, description: full?.description ?? '', warning };
  });
});
</script>

<style scoped>
.trait-badge--clickable {
  cursor: pointer;
}
</style>
