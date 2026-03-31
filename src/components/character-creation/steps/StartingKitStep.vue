<template>
  <q-form ref="formRef" greedy class="starting-kit-step">
    <div class="text-h6 q-mb-md">Choose Starting Kit</div>
    <p class="text-caption text-muted q-mb-lg">
      Your starting kit determines your initial equipment, currency, and may grant an expertise.
      Select one that fits your character concept.
    </p>

    <q-btn outline color="primary" class="q-mb-md" @click="kitDialogOpen = true"
      ><ArrowLeftRight v-if="selectedKitId" :size="20" class="on-left" aria-hidden="true" /><Plus
        v-else
        :size="20"
        class="on-left"
        aria-hidden="true"
      />{{ selectedKitId ? 'Change Starting Kit' : 'Choose Starting Kit' }}</q-btn
    >

    <StartingKitSelectionDialog
      v-model="kitDialogOpen"
      :selected-kit-id="selectedKitId"
      @select="selectKit"
    />

    <template v-if="selectedKit">
      <q-card bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-sm">{{ selectedKit.name }}</div>
          <div class="text-caption text-muted q-mb-sm">{{ selectedKit.description }}</div>

          <q-separator class="q-my-sm" />

          <div class="text-caption">
            <div class="row items-center q-mb-xs">
              <Coins :size="14" class="q-mr-xs" aria-hidden="true" />
              <span>
                <strong>{{ selectedKit.startingSpheres }}</strong> marks
              </span>
            </div>

            <div v-if="selectedKit.expertises?.[0]?.id" class="row items-center q-mb-xs">
              <Crown :size="14" class="q-mr-xs" aria-hidden="true" />
              <span>
                <strong>+1</strong>
                {{ findById(classifiers.expertises, selectedKit.expertises[0].id)?.name }}
              </span>
            </div>

            <div class="row items-start">
              <PackageIcon :size="14" class="q-mr-xs q-mt-xs" aria-hidden="true" />
              <span>{{ getEquipmentSummary(selectedKit) }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-separator class="q-mb-sm" />
          <div v-if="selectedKit.startingSpheres !== '0'" class="row items-center justify-center">
            <q-input
              :model-value="startingCurrency"
              type="number"
              label="Starting marks"
              :hint="`Roll ${selectedKit.startingSpheres}`"
              outlined
              dense
              :min="0"
              :max="999999"
              class="currency-input"
              @update:model-value="setStartingCurrency"
            />
          </div>
          <div v-else class="text-center text-caption text-muted">No starting currency</div>
        </q-card-section>
      </q-card>
    </template>

    <!-- Special notes for prisoner kit -->
    <q-banner v-if="isPrisonerKit" :class="`bg-${RPG_COLORS.bannerInfo} q-mt-md`" rounded>
      <template v-slot:avatar>
        <Sparkles :size="24" :class="`text-${RPG_COLORS.bannerInfoIcon}`" aria-hidden="true" />
      </template>
      <div class="text-caption">
        <strong>Prisoner Kit Special:</strong> You begin bonded to a Radiant spren at Ideal 1. You
        will select your Radiant Order in the Paths step.
      </div>
    </q-banner>
  </q-form>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { useHeroStore } from 'src/stores/hero';
import { useHeroEquipmentStore } from 'src/stores/heroEquipment';
import { useClassifierStore } from 'src/stores/classifiers';
import { findById, findByCode } from 'src/utils/arrayUtils';
import {
  ArrowLeftRight,
  Plus,
  Coins,
  Crown,
  Package as PackageIcon,
  Sparkles,
} from 'lucide-vue-next';
import { RPG_COLORS } from 'src/constants/theme';
import { clamp } from 'src/utils/numberUtils';
import type { DeletionTracker } from 'src/composables/useDeletionTracker';
import type { StartingKit } from 'src/types';
import { useFormValidation } from 'src/composables/useFormValidation';
import StartingKitSelectionDialog from '../shared/StartingKitSelectionDialog.vue';

const { formRef, validate } = useFormValidation();

const heroStore = useHeroStore();
const equipStore = useHeroEquipmentStore();
const classifiers = useClassifierStore();
const deletionTracker = inject<DeletionTracker>('deletionTracker');

const kitDialogOpen = ref(false);
const selectedKitId = computed(() => heroStore.hero?.startingKit?.id ?? null);
const selectedKit = computed((): StartingKit | undefined =>
  selectedKitId.value ? findById(classifiers.startingKits, selectedKitId.value) : undefined
);

const isPrisonerKit = computed(() => {
  const prisonerKit = findByCode(classifiers.startingKits, 'prisoner');
  return selectedKitId.value === prisonerKit?.id;
});

const startingCurrency = computed(() => heroStore.hero?.currency ?? 0);

function selectKit(kitId: number) {
  if (selectedKitId.value === kitId) return;

  // Track all current equipment and kit-source expertises for deletion
  // before the store clears them and applies new kit items
  if (heroStore.hero) {
    for (const equip of heroStore.hero.equipment) {
      deletionTracker?.trackDeletion('equipment', equip.id);
    }
    for (const exp of heroStore.hero.expertises) {
      if (exp.source?.sourceType === 'starting_kit') {
        deletionTracker?.trackDeletion('expertises', exp.id);
      }
    }
  }
  equipStore.setStartingKit(kitId);
}

function setStartingCurrency(val: string | number | null) {
  if (val === null || val === '') {
    equipStore.setCurrency(0);
    return;
  }
  const numVal = typeof val === 'string' ? Number(val) : val;
  if (Number.isNaN(numVal)) return;
  equipStore.setCurrency(clamp(numVal, 0, 999999));
}

function getEquipmentSummary(kit: StartingKit): string {
  if (!kit.equipment || kit.equipment.length === 0) {
    return 'No equipment';
  }

  const names = kit.equipment
    .map((item) => {
      const name = findById(classifiers.equipment, item.id)?.name;
      if (!name) return null;
      return item.quantity > 1 ? `${name} x${item.quantity}` : name;
    })
    .filter((name): name is string => name !== null);

  return names.length > 0 ? names.join(', ') : 'No equipment';
}

defineExpose({ validate });
</script>

<style scoped lang="scss">
.currency-input {
  max-width: 150px;
}
</style>
