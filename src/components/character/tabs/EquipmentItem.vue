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
      </q-item-label>
      <q-item-label v-if="detailsLine" caption>
        {{ detailsLine }}
      </q-item-label>
      <q-item-label v-if="heroEquipment.notes" caption class="text-italic">
        {{ heroEquipment.notes }}
      </q-item-label>
    </q-item-section>
    <q-item-section side class="equipment-actions">
      <!-- Amount controls -->
      <div class="row no-wrap items-center q-mr-sm">
        <q-btn
          flat
          dense
          round
          size="xs"
          icon="remove"
          :disable="saving || heroEquipment.amount <= 1"
          aria-label="Decrease amount"
          @click="changeAmount(-1)"
        />
        <span class="text-body2 q-mx-xs">{{ heroEquipment.amount }}</span>
        <q-btn
          flat
          dense
          round
          size="xs"
          icon="add"
          :disable="saving || heroEquipment.amount >= MAX_EQUIPMENT_STACK"
          aria-label="Increase amount"
          @click="changeAmount(1)"
        />
      </div>

      <!-- Equip toggle -->
      <q-btn
        flat
        dense
        round
        size="sm"
        :icon="heroEquipment.isEquipped ? 'sym_o_shield' : 'sym_o_shield_question'"
        :color="heroEquipment.isEquipped ? 'primary' : 'grey'"
        :disable="saving"
        :aria-label="heroEquipment.isEquipped ? 'Unequip' : 'Equip'"
        @click="toggleEquipped"
      >
        <q-tooltip>{{ heroEquipment.isEquipped ? 'Unequip' : 'Equip' }}</q-tooltip>
      </q-btn>

      <!-- Remove -->
      <q-btn
        flat
        dense
        round
        size="sm"
        icon="delete"
        color="negative"
        :disable="saving"
        aria-label="Remove equipment"
        @click="confirmRemove"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { useClassifierStore } from 'src/stores/classifiers';
import { useHeroStore } from 'src/stores/hero';
import { useChainedEntityIcon } from 'src/composables/useEntityIcon';
import type { HeroEquipment, Equipment } from 'src/types';
import { MAX_EQUIPMENT_STACK } from 'src/constants';

const props = defineProps<{
  heroEquipment: HeroEquipment;
}>();

const $q = useQuasar();
const classifiers = useClassifierStore();
const heroStore = useHeroStore();
const saving = computed(() => heroStore.saving);

// Use chained lookup: heroEquipment.equipment.id → equipment → equipmentType (for icon)
const {
  primaryEntity: equipment,
  relatedEntity: equipmentType,
  iconUrl,
} = useChainedEntityIcon(
  computed(() => props.heroEquipment.equipment.id),
  computed(() => classifiers.equipment),
  (eq: Equipment) => eq.equipType.id,
  computed(() => classifiers.equipmentTypes),
  'equipment'
);

// Build details line from special properties
const detailsLine = computed(() => {
  const eq = equipment.value;
  if (!eq?.special) return '';

  const parts: string[] = [];

  if (eq.special.damage) {
    const damageTypeName = eq.damageType?.name;
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

function changeAmount(delta: number): void {
  const newAmount = props.heroEquipment.amount + delta;
  if (newAmount < 1 || newAmount > MAX_EQUIPMENT_STACK) return;
  void heroStore.updateEquipment(props.heroEquipment.id, { amount: newAmount });
}

function toggleEquipped(): void {
  void heroStore.updateEquipment(props.heroEquipment.id, {
    isEquipped: !props.heroEquipment.isEquipped,
  });
}

function confirmRemove(): void {
  $q.dialog({
    title: 'Remove Equipment',
    message: `Remove ${props.heroEquipment.customName || equipment.value?.name || 'this item'} from inventory?`,
    cancel: true,
    persistent: false,
  }).onOk(() => {
    void heroStore.removeEquipment(props.heroEquipment.id);
  });
}
</script>

<style scoped>
.equipment-icon {
  width: 24px;
  height: 24px;
}

.equipment-actions {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center;
  gap: 2px;
}
</style>
