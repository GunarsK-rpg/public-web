<template>
  <div class="starting-kit-step">
    <div class="text-h6 q-mb-md">Choose Starting Kit</div>
    <p class="text-caption text-muted q-mb-lg">
      Your starting kit determines your initial equipment, currency, and may grant an expertise.
      Select one that fits your character concept.
    </p>

    <div class="row q-col-gutter-md">
      <div v-for="kit in startingKits" :key="kit.id" class="col-12 col-sm-6 col-md-4">
        <q-card
          class="kit-card cursor-pointer"
          :class="{ 'card-selected': selectedKitId === kit.id }"
          @click="selectKit(kit.id)"
        >
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-icon :name="getKitIcon(kit.code)" size="sm" class="q-mr-sm" />
              <div class="text-subtitle1 text-weight-bold">{{ kit.name }}</div>
            </div>

            <div class="text-caption text-muted q-mb-sm">
              {{ kit.description }}
            </div>

            <q-separator class="q-my-sm" />

            <div class="text-caption">
              <div class="row items-center q-mb-xs">
                <q-icon name="sym_o_payments" size="xs" class="q-mr-xs" />
                <span>
                  <strong>{{ kit.startingSpheres }}</strong> marks
                  <span v-if="kit.startingSpheres !== '0'" class="text-muted">
                    (avg ~{{ calculateAverageSpheres(kit.startingSpheres) }})
                  </span>
                </span>
              </div>

              <div
                v-if="kit.expertises && kit.expertises.length > 0"
                class="row items-center q-mb-xs"
              >
                <q-icon name="sym_o_workspace_premium" size="xs" class="q-mr-xs" />
                <span>
                  <strong>+1</strong> {{ getExpertiseName(kit.expertises[0]!.expertiseId) }}
                </span>
              </div>

              <div class="row items-start">
                <q-icon name="sym_o_inventory_2" size="xs" class="q-mr-xs q-mt-xs" />
                <span>{{ getEquipmentSummary(kit) }}</span>
              </div>
            </div>
          </q-card-section>

          <q-card-section v-if="selectedKitId === kit.id" class="q-pt-none">
            <q-separator class="q-mb-sm" />

            <!-- Roll spheres button -->
            <div v-if="kit.startingSpheres !== '0'" class="text-center">
              <q-btn
                :label="
                  rolledSpheres ? `Rolled: ${rolledSpheres} marks` : `Roll ${kit.startingSpheres}`
                "
                :color="rolledSpheres ? 'positive' : 'primary'"
                outline
                dense
                @click.stop="rollSpheres(kit.startingSpheres)"
              />
            </div>
            <div v-else class="text-center text-caption text-muted">No starting currency</div>
          </q-card-section>

          <!-- Selection indicator -->
          <div v-if="selectedKitId === kit.id" class="selection-indicator">
            <q-icon name="check_circle" color="primary" />
          </div>
        </q-card>
      </div>
    </div>

    <!-- Special notes for prisoner kit -->
    <q-banner v-if="selectedKitId === 6" class="bg-amber-2 q-mt-md" rounded>
      <template v-slot:avatar>
        <q-icon name="auto_awesome" color="amber-8" />
      </template>
      <div class="text-caption">
        <strong>Prisoner Kit Special:</strong> You begin bonded to a Radiant spren at Ideal 1. You
        will select your Radiant Order in the Paths step.
      </div>
    </q-banner>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useCharacterCreationStore } from 'stores/character-creation';
import { useClassifierStore } from 'stores/classifiers';
import type { StartingKitCode } from 'src/types';

const creationStore = useCharacterCreationStore();
const classifierStore = useClassifierStore();

const startingKits = computed(() => classifierStore.startingKits);
const selectedKitId = computed(() => creationStore.startingKit.startingKitId);
const rolledSpheres = ref<number | undefined>(creationStore.startingKit.rolledSpheres);

// Watch for external changes
watch(
  () => creationStore.startingKit.rolledSpheres,
  (newVal) => {
    rolledSpheres.value = newVal;
  }
);

function selectKit(kitId: number) {
  // Clear rolled spheres when changing kit
  rolledSpheres.value = undefined;
  creationStore.updateStartingKit({ startingKitId: kitId });
}

function rollSpheres(formula: string) {
  const result = rollDice(formula);
  rolledSpheres.value = result;
  creationStore.updateStartingKit({ rolledSpheres: result });
}

function rollDice(formula: string): number {
  if (formula === '0') return 0;

  const match = formula.match(/^(\d+)d(\d+)$/);
  if (!match || !match[1] || !match[2]) return 0;

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);

  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

function calculateAverageSpheres(formula: string): number {
  if (formula === '0') return 0;

  const match = formula.match(/^(\d+)d(\d+)$/);
  if (!match || !match[1] || !match[2]) return 0;

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  return Math.round(count * ((sides + 1) / 2));
}

function getExpertiseName(expertiseId: number): string {
  return classifierStore.getExpertiseById(expertiseId)?.name || 'Unknown';
}

function getEquipmentSummary(kit: (typeof startingKits.value)[0]): string {
  if (!kit.equipment || kit.equipment.length === 0) {
    return 'No equipment';
  }

  return kit.equipment
    .map((item) => {
      const equip = classifierStore.getEquipmentById(item.equipmentId);
      if (!equip) return null;
      return item.quantity > 1 ? `${equip.name} x${item.quantity}` : equip.name;
    })
    .filter((name): name is string => name !== null)
    .join(', ');
}

function getKitIcon(code: StartingKitCode): string {
  const icons: Record<StartingKitCode, string> = {
    academic: 'sym_o_school',
    artisan: 'sym_o_construction',
    military: 'sym_o_shield',
    courtier: 'sym_o_diamond',
    underworld: 'sym_o_visibility_off',
    prisoner: 'sym_o_lock',
  };
  return icons[code] || 'sym_o_backpack';
}
</script>

<style scoped>
.kit-card {
  position: relative;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  height: 100%;
}

.kit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.selection-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
