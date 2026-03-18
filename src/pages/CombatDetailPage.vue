<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-spinner-dots v-if="loading" size="50px" color="primary" />

      <q-banner v-else-if="error" class="bg-negative text-white q-mb-md">
        {{ error }}
        <template v-slot:action>
          <q-btn flat label="Go Back" @click="goBack" />
        </template>
      </q-banner>

      <div v-else-if="!combat" class="text-center q-pa-xl">
        <Swords :size="64" class="text-grey-5" aria-hidden="true" />
        <div class="text-h6 text-grey-7 q-mt-md">Combat not found</div>
        <div class="text-body2 text-grey-6 q-mb-md">
          This combat doesn't exist or you don't have access to it.
        </div>
        <q-btn color="primary" label="Back to Campaign" @click="goBack" />
      </div>

      <template v-else>
        <!-- Header -->
        <div class="row items-center q-mb-xs">
          <q-btn flat dense round size="sm" class="q-mr-sm" aria-label="Back" @click="goBack">
            <ArrowLeft :size="20" />
          </q-btn>
          <div class="text-h5">{{ combat.name }}</div>
        </div>

        <!-- Round tracker + controls -->
        <div class="row items-center q-gutter-sm q-mb-md">
          <ResourceBox
            label="Round"
            :current="combat.round"
            :saving="saving"
            :readonly="!combat.isActive"
            @update="onRoundUpdate"
          />
          <q-space />
          <q-toggle
            :model-value="combat.isActive"
            label="Active"
            :disable="saving"
            @update:model-value="onToggleActive"
          />
        </div>

        <!-- Notes -->
        <q-input
          v-if="combat.isActive"
          v-model="notesInput"
          label="Notes"
          type="textarea"
          autogrow
          class="q-mb-lg"
          :disable="saving"
          @blur="saveNotes"
        />
        <div v-else-if="combat.notes" class="text-body2 text-grey q-mb-lg">
          {{ combat.notes }}
        </div>

        <CombatNpcSection
          title="Allies"
          add-label="Add Ally"
          :npcs="allies"
          :campaign-id="numCampaignId"
          :saving="saving"
          :can-edit="combat.isActive"
          class="q-mb-lg"
          @add="openAddNpc('ally')"
          @update-turn-speed="onTurnSpeed"
          @update-hp="onPatchHp"
          @update-focus="onPatchFocus"
          @update-investiture="onPatchInvestiture"
          @remove="onRemoveNpc"
        />

        <CombatNpcSection
          title="Enemies"
          add-label="Add Enemy"
          :npcs="enemies"
          :campaign-id="numCampaignId"
          :saving="saving"
          :can-edit="combat.isActive"
          @add="openAddNpc('enemy')"
          @update-turn-speed="onTurnSpeed"
          @update-hp="onPatchHp"
          @update-focus="onPatchFocus"
          @update-investiture="onPatchInvestiture"
          @remove="onRemoveNpc"
        />

        <!-- Add NPC Dialog -->
        <AddNpcDialog
          v-model="showAddNpc"
          :npc-options="combatStore.npcOptions"
          :saving="combatStore.saving"
          @add="onAddNpc"
        />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Swords, ArrowLeft } from 'lucide-vue-next';
import { useCombatStore } from 'src/stores/combat';
import ResourceBox from 'src/components/shared/ResourceBox.vue';
import CombatNpcSection from 'src/components/combat/CombatNpcSection.vue';
import AddNpcDialog from 'src/components/combat/AddNpcDialog.vue';
import type { CombatNpc } from 'src/types';

const props = defineProps<{
  campaignId: string;
  combatId: string;
}>();

const router = useRouter();
const combatStore = useCombatStore();

const initializing = ref(true);
const combat = computed(() => combatStore.currentCombat);
const loading = computed(() => initializing.value || combatStore.loading);
const error = computed(() => combatStore.error);
const saving = computed(() => combatStore.saving);
const allies = computed(() => combatStore.allies);
const enemies = computed(() => combatStore.enemies);

const numCampaignId = computed(() => Number(props.campaignId));
const numCombatId = computed(() => Number(props.combatId));

const notesInput = ref('');
const showAddNpc = ref(false);
const addNpcSide = ref<'ally' | 'enemy'>('enemy');

// Sync notes input when combat loads
watch(combat, (c) => {
  if (c) notesInput.value = c.notes ?? '';
});

onMounted(async () => {
  const campaignId = numCampaignId.value;
  const combatId = numCombatId.value;
  if (isNaN(campaignId) || campaignId <= 0 || isNaN(combatId) || combatId <= 0) {
    combatStore.setError('Invalid combat ID');
    initializing.value = false;
    return;
  }
  try {
    await combatStore.selectCombat(campaignId, combatId);
    void combatStore.fetchNpcOptions(campaignId);
  } finally {
    initializing.value = false;
  }
});

function goBack() {
  void router.push({
    name: 'campaign-detail',
    params: { campaignId: props.campaignId },
  });
}

// Notes auto-save on blur
async function saveNotes() {
  if (!combat.value) return;
  const trimmed = notesInput.value.trim() || null;
  if (trimmed === combat.value.notes) return;
  await combatStore.updateCombat({
    id: combat.value.id,
    campaignId: numCampaignId.value,
    name: combat.value.name,
    notes: trimmed,
  });
}

// Active toggle
async function onToggleActive(active: boolean) {
  if (!combat.value) return;
  await combatStore.updateCombat({
    id: combat.value.id,
    campaignId: numCampaignId.value,
    name: combat.value.name,
    isActive: active,
  });
}

function onRoundUpdate(value: number) {
  if (value < 1) return;
  void combatStore.endRound(numCampaignId.value, numCombatId.value, value);
}

// Add NPC
function openAddNpc(side: 'ally' | 'enemy') {
  addNpcSide.value = side;
  showAddNpc.value = true;
}

async function onAddNpc(npcId: number, displayName: string | null) {
  const result = await combatStore.addCombatNpc({
    campaignId: numCampaignId.value,
    combatId: numCombatId.value,
    npcId,
    side: addNpcSide.value,
    displayName,
  });
  if (result) {
    showAddNpc.value = false;
  }
}

// NPC tile event handlers
function onTurnSpeed(npc: CombatNpc, value: 'fast' | 'slow' | null) {
  void combatStore.updateCombatNpc({
    id: npc.id,
    campaignId: numCampaignId.value,
    combatId: numCombatId.value,
    npcId: npc.npcId,
    side: npc.side,
    turnSpeed: value,
  });
}

function onPatchHp(npc: CombatNpc, value: number) {
  void combatStore.patchHp({
    id: npc.id,
    combatId: numCombatId.value,
    campaignId: numCampaignId.value,
    value,
  });
}

function onPatchFocus(npc: CombatNpc, value: number) {
  void combatStore.patchFocus({
    id: npc.id,
    combatId: numCombatId.value,
    campaignId: numCampaignId.value,
    value,
  });
}

function onPatchInvestiture(npc: CombatNpc, value: number) {
  void combatStore.patchInvestiture({
    id: npc.id,
    combatId: numCombatId.value,
    campaignId: numCampaignId.value,
    value,
  });
}

function onRemoveNpc(npc: CombatNpc) {
  void combatStore.removeCombatNpc(numCampaignId.value, numCombatId.value, npc.id);
}
</script>
