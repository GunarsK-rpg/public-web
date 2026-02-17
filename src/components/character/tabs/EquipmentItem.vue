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
    <q-item-section side>
      <div class="row no-wrap items-center">
        <!-- Amount controls -->
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
      </div>
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
import { getSpecialByType, SPECIAL } from 'src/utils/specialUtils';

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
  const special = eq?.special ?? [];
  if (!special.length && props.heroEquipment.charges === null) return '';

  const parts: string[] = [];

  const damage = getSpecialByType(special, SPECIAL.DAMAGE);
  if (damage?.display_value) {
    const damageTypeName = eq?.damageType?.name;
    parts.push(`${damage.display_value}${damageTypeName ? ` ${damageTypeName}` : ''}`);
  }

  const range = getSpecialByType(special, SPECIAL.RANGE);
  if (range?.display_value) {
    parts.push(range.display_value);
  }

  const deflect = getSpecialByType(special, SPECIAL.DEFLECT);
  if (deflect?.value != null) {
    parts.push(`Deflect ${deflect.value}`);
  }

  const heq = props.heroEquipment;
  if (heq.charges != null && heq.maxCharges != null) {
    parts.push(`${heq.charges}/${heq.maxCharges} charges`);
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
</style>
