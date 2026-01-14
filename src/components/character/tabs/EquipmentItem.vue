<template>
  <q-item>
    <q-item-section avatar>
      <img
        v-if="equipmentType?.icon"
        :src="iconUrl"
        :alt="equipmentType.name"
        class="equipment-icon icon-theme-aware"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label>
        {{ heroEquipment.customName || equipment?.name }}
        <q-badge
          v-if="heroEquipment.isEquipped"
          color="primary"
          class="q-ml-xs"
          aria-label="Equipped"
        >
          Equipped
        </q-badge>
        <q-badge
          v-if="heroEquipment.isPrimary"
          :color="RPG_COLORS.equipmentPrimary"
          class="q-ml-xs"
          aria-label="Primary weapon"
        >
          Primary
        </q-badge>
      </q-item-label>
      <q-item-label v-if="detailsLine" caption>
        {{ detailsLine }}
      </q-item-label>
      <q-item-label v-if="heroEquipment.notes" caption class="text-italic">
        {{ heroEquipment.notes }}
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-badge
        v-if="heroEquipment.amount > 1"
        :color="RPG_COLORS.badgeMuted"
        :aria-label="`Quantity: ${heroEquipment.amount}`"
      >
        x{{ heroEquipment.amount }}
      </q-badge>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById } from 'src/utils/arrayUtils';
import { useChainedEntityIcon } from 'src/composables/useEntityIcon';
import { RPG_COLORS } from 'src/constants/theme';
import type { HeroEquipment, Equipment } from 'src/types';

const props = defineProps<{
  heroEquipment: HeroEquipment;
}>();

const classifiers = useClassifierStore();

// Use chained lookup: heroEquipment.equipmentId → equipment → equipmentType (for icon)
const {
  primaryEntity: equipment,
  relatedEntity: equipmentType,
  iconUrl,
} = useChainedEntityIcon(
  computed(() => props.heroEquipment.equipmentId),
  computed(() => classifiers.equipment),
  (eq: Equipment) => eq.equipTypeId,
  computed(() => classifiers.equipmentTypes),
  'equipment'
);

// Build details line from special properties
const detailsLine = computed(() => {
  const eq = equipment.value;
  if (!eq?.special) return '';

  const parts: string[] = [];

  if (eq.special.damage) {
    const damageTypeName = findById(classifiers.damageTypes, eq.damageTypeId)?.name;
    parts.push(`${eq.special.damage}${damageTypeName ? ` ${damageTypeName}` : ''}`);
  }

  if (eq.special.range) {
    parts.push(eq.special.range);
  }

  if (eq.special.deflect) {
    parts.push(`Deflect ${eq.special.deflect}`);
  }

  if (eq.special.charges !== undefined && eq.special.maxCharges !== undefined) {
    parts.push(`${eq.special.charges}/${eq.special.maxCharges} charges`);
  }

  return parts.join(' · ');
});
</script>

<style scoped>
.equipment-icon {
  width: 24px;
  height: 24px;
}
</style>
