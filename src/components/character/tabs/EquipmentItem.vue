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
        {{ displayName }}
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
      <!-- Charge controls -->
      <q-item-label v-if="heroEquipment.maxCharges != null" caption>
        <div class="row no-wrap items-center">
          <q-btn
            v-if="!readonly"
            flat
            dense
            round
            size="sm"
            :disable="saving || (heroEquipment.charges ?? 0) <= 0"
            aria-label="Decrease charges"
            @click="changeCharges(-1)"
            ><Minus :size="20"
          /></q-btn>
          <span class="q-mx-xs"
            >{{ heroEquipment.charges ?? 0 }}/{{ heroEquipment.maxCharges }} charges</span
          >
          <q-btn
            v-if="!readonly"
            flat
            dense
            round
            size="sm"
            :disable="saving || (heroEquipment.charges ?? 0) >= heroEquipment.maxCharges"
            aria-label="Increase charges"
            @click="changeCharges(1)"
            ><Plus :size="20"
          /></q-btn>
        </div>
      </q-item-label>
      <!-- Modifications (read-only display; editing in dialog) -->
      <q-item-label
        v-for="(mod, idx) in heroEquipment.modifications"
        :key="idx"
        caption
        :class="mod.type === 'upgrade' ? 'text-positive' : 'text-negative'"
      >
        {{ mod.type === 'upgrade' ? '+' : '-' }} {{ mod.display_value }}
      </q-item-label>
      <q-item-label v-if="heroEquipment.notes" caption class="text-italic">
        {{ heroEquipment.notes }}
      </q-item-label>
    </q-item-section>
    <q-item-section v-if="!readonly" side>
      <div class="row no-wrap items-center">
        <!-- Amount controls (stackable items only) -->
        <template v-if="!isIndividualItem">
          <q-btn
            flat
            dense
            round
            size="sm"
            :disable="saving || heroEquipment.amount <= 1"
            aria-label="Decrease amount"
            @click="changeAmount(-1)"
            ><Minus :size="20"
          /></q-btn>
          <span class="text-body2 q-mx-xs">{{ heroEquipment.amount }}</span>
          <q-btn
            flat
            dense
            round
            size="sm"
            :disable="saving || heroEquipment.amount >= MAX_EQUIPMENT_STACK"
            aria-label="Increase amount"
            @click="changeAmount(1)"
            ><Plus :size="20"
          /></q-btn>
        </template>

        <!-- Edit -->
        <q-btn
          flat
          dense
          round
          size="sm"
          :disable="saving"
          aria-label="Edit equipment"
          @click="$emit('edit')"
          ><Pencil :size="20"
        /></q-btn>

        <!-- Equip toggle -->
        <q-btn
          flat
          dense
          round
          size="sm"
          :color="heroEquipment.isEquipped ? 'primary' : 'grey'"
          :disable="saving"
          :aria-label="heroEquipment.isEquipped ? 'Unequip' : 'Equip'"
          @click="toggleEquipped"
        >
          <Shield v-if="heroEquipment.isEquipped" :size="20" />
          <ShieldOff v-else :size="20" />
          <q-tooltip>{{ heroEquipment.isEquipped ? 'Unequip' : 'Equip' }}</q-tooltip>
        </q-btn>

        <!-- Remove -->
        <q-btn
          flat
          dense
          round
          size="sm"
          color="negative"
          :disable="saving"
          aria-label="Remove equipment"
          @click="confirmRemove"
          ><Trash2 :size="20"
        /></q-btn>
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { useClassifierStore } from 'src/stores/classifiers';
import { useHeroStore } from 'src/stores/hero';
import { useEntityIcon } from 'src/composables/useEntityIcon';
import { Pencil, Minus, Plus, Shield, ShieldOff, Trash2 } from 'lucide-vue-next';
import { findById } from 'src/utils/arrayUtils';
import type { HeroEquipment } from 'src/types';
import { MAX_EQUIPMENT_STACK, INDIVIDUAL_EQUIPMENT_TYPES } from 'src/constants';
import { getSpecialByType, SPECIAL } from 'src/utils/specialUtils';

const props = defineProps<{
  heroEquipment: HeroEquipment;
  readonly?: boolean;
}>();

defineEmits<{
  edit: [];
}>();

const $q = useQuasar();
const classifiers = useClassifierStore();
const heroStore = useHeroStore();
const saving = computed(() => heroStore.saving);
const isIndividualItem = computed(() =>
  INDIVIDUAL_EQUIPMENT_TYPES.includes(props.heroEquipment.equipType?.code ?? '')
);

const equipment = computed(() =>
  findById(classifiers.equipment, props.heroEquipment.equipment?.id)
);

const { entity: equipmentType, iconUrl } = useEntityIcon(
  computed(() => props.heroEquipment.equipType?.id),
  computed(() => classifiers.equipmentTypes),
  'equipment'
);

const displayName = computed(
  () => props.heroEquipment.customName || equipment.value?.name || 'Custom Item'
);

// Build details line from special properties
const detailsLine = computed(() => {
  const eq = equipment.value;
  const special = eq?.special ?? [];
  if (!special.length) return '';

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

  return parts.join(' · ');
});

function changeCharges(delta: number): void {
  const current = props.heroEquipment.charges ?? 0;
  const max = props.heroEquipment.maxCharges ?? 0;
  const newCharges = Math.max(0, Math.min(current + delta, max));
  if (newCharges === current) return;
  void heroStore.updateEquipment(props.heroEquipment.id, { charges: newCharges });
}

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
