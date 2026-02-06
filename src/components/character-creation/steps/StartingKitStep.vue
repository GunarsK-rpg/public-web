<template>
  <div class="starting-kit-step">
    <div class="text-h6 q-mb-md">Choose Starting Kit</div>
    <p class="text-caption text-muted q-mb-lg">
      Your starting kit determines your initial equipment, currency, and may grant an expertise.
      Select one that fits your character concept.
    </p>

    <div class="row q-col-gutter-md" role="radiogroup" aria-label="Select starting kit">
      <div v-for="kit in startingKits" :key="kit.id" class="col-12 col-sm-6 col-md-4">
        <q-card
          role="radio"
          tabindex="0"
          :aria-checked="selectedKitId === kit.id"
          class="kit-card card-interactive cursor-pointer"
          :class="{ 'card-selected': selectedKitId === kit.id }"
          @click="selectKit(kit.id)"
          @keydown.enter="selectKit(kit.id)"
          @keydown.space.prevent="selectKit(kit.id)"
        >
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">{{ kit.name }}</div>

            <div class="text-caption text-muted q-mb-sm">
              {{ kit.description }}
            </div>

            <q-separator class="q-my-sm" />

            <div class="text-caption">
              <div class="row items-center q-mb-xs">
                <q-icon name="sym_o_payments" size="xs" class="q-mr-xs" aria-hidden="true" />
                <span>
                  <strong>{{ kit.startingSpheres }}</strong> marks
                </span>
              </div>

              <div v-if="kit.expertises?.[0]?.id" class="row items-center q-mb-xs">
                <q-icon
                  name="sym_o_workspace_premium"
                  size="xs"
                  class="q-mr-xs"
                  aria-hidden="true"
                />
                <span>
                  <strong>+1</strong>
                  {{ findById(classifiers.expertises, kit.expertises[0].id)?.name }}
                </span>
              </div>

              <div class="row items-start">
                <q-icon
                  name="sym_o_inventory_2"
                  size="xs"
                  class="q-mr-xs q-mt-xs"
                  aria-hidden="true"
                />
                <span>{{ getEquipmentSummary(kit) }}</span>
              </div>
            </div>
          </q-card-section>

          <q-card-section v-if="selectedKitId === kit.id" class="q-pt-none">
            <q-separator class="q-mb-sm" />

            <!-- Starting currency input -->
            <div v-if="kit.startingSpheres !== '0'" class="row items-center justify-center">
              <q-input
                :model-value="startingCurrency"
                type="number"
                label="Starting marks"
                :hint="`Roll ${kit.startingSpheres}`"
                outlined
                dense
                :min="0"
                :max="999999"
                class="currency-input"
                @update:model-value="setStartingCurrency"
                @click.stop
              />
            </div>
            <div v-else class="text-center text-caption text-muted">No starting currency</div>
          </q-card-section>

          <!-- Selection indicator -->
          <div v-if="selectedKitId === kit.id" class="selection-indicator">
            <q-icon name="check_circle" color="primary" aria-hidden="true" />
          </div>
        </q-card>
      </div>
    </div>

    <!-- Special notes for prisoner kit -->
    <q-banner v-if="isPrisonerKit" :class="`bg-${RPG_COLORS.bannerInfo} q-mt-md`" rounded>
      <template v-slot:avatar>
        <q-icon name="auto_awesome" :color="RPG_COLORS.bannerInfoIcon" aria-hidden="true" />
      </template>
      <div class="text-caption">
        <strong>Prisoner Kit Special:</strong> You begin bonded to a Radiant spren at Ideal 1. You
        will select your Radiant Order in the Paths step.
      </div>
    </q-banner>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroEquipmentStore } from 'src/stores/heroEquipment';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById, findByCode } from 'src/utils/arrayUtils';
import { RPG_COLORS } from 'src/constants/theme';

const heroStore = useHeroStore();
const equipStore = useHeroEquipmentStore();
const classifiers = useClassifierStore();

const startingKits = computed(() => classifiers.startingKits);
const selectedKitId = computed(() => heroStore.hero?.startingKit?.id ?? null);

const isPrisonerKit = computed(() => {
  const prisonerKit = findByCode(classifiers.startingKits, 'prisoner');
  return selectedKitId.value === prisonerKit?.id;
});

const startingCurrency = computed(() => heroStore.hero?.currency ?? 0);

function selectKit(kitId: number) {
  equipStore.setStartingKit(kitId);
}

function setStartingCurrency(val: string | number | null) {
  if (val === null || val === '') {
    equipStore.setCurrency(0);
    return;
  }
  const numVal = typeof val === 'string' ? Number(val) : val;
  if (Number.isNaN(numVal)) return;
  equipStore.setCurrency(Math.max(0, Math.min(999999, numVal)));
}

function getEquipmentSummary(kit: (typeof startingKits.value)[0]): string {
  if (!kit.equipment || kit.equipment.length === 0) {
    return 'No equipment';
  }

  return kit.equipment
    .map((item) => {
      const name = findById(classifiers.equipment, item.id)?.name;
      if (!name) return null;
      return item.quantity > 1 ? `${name} x${item.quantity}` : name;
    })
    .filter((name): name is string => name !== null)
    .join(', ');
}
</script>

<style scoped lang="scss">
.kit-card {
  position: relative;
  height: 100%;
}

.selection-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
}

.currency-input {
  max-width: 150px;
}
</style>
