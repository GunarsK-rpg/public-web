<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-spinner-dots v-if="loading" size="50px" color="primary" />

      <q-banner v-else-if="error" class="bg-negative text-white q-mb-md">
        {{ error }}
        <template v-slot:action>
          <q-btn flat label="Go Back" :to="backRoute" />
        </template>
      </q-banner>

      <div v-else-if="!npc" class="text-center q-pa-xl">
        <UserX :size="64" class="text-grey-5" aria-hidden="true" />
        <div class="text-h6 text-grey-7 q-mt-md">NPC not found</div>
        <q-btn color="primary" label="Go Back" class="q-mt-md" :to="backRoute" />
      </div>

      <template v-else>
        <div class="q-mb-md">
          <q-btn flat dense round size="sm" aria-label="Back" :to="backRoute">
            <ArrowLeft :size="20" />
          </q-btn>
        </div>
        <NpcStatBlock
          :npc="npc"
          :display-name="combatNpc?.displayName"
          :current-resources="currentResources"
          :notes="combatNpc?.notes"
          :saving="saving"
          :readonly="!combatStore.currentCombat?.isActive"
          @resource-update="onResourceUpdate"
        />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePageTitle } from 'src/composables/usePageTitle';
import { ArrowLeft, UserX } from 'lucide-vue-next';
import { useClassifierStore } from 'src/stores/classifiers';
import { useCombatStore } from 'src/stores/combat';
import combatService from 'src/services/combatService';
import NpcStatBlock from 'src/components/combat/NpcStatBlock.vue';
import { handleError } from 'src/utils/errorHandling';
import type { Npc, CombatNpc } from 'src/types';

const props = defineProps<{
  campaignId: string;
  npcId: string;
}>();

const route = useRoute();
const combatStore = useCombatStore();
const { setPageTitle } = usePageTitle();
const loading = ref(true);
const error = ref<string | null>(null);
const npc = ref<Npc | null>(null);
const combatNpc = ref<CombatNpc | null>(null);

const saving = computed(() => combatStore.saving);

const combatId = computed(() => {
  const n = Number(route.query.combatId);
  return Number.isFinite(n) && n > 0 ? n : null;
});

const instanceId = computed(() => {
  const n = Number(route.query.instanceId);
  return Number.isFinite(n) && n > 0 ? n : null;
});

const heroId = computed(() => {
  const n = Number(route.query.heroId);
  return Number.isFinite(n) && n > 0 ? n : null;
});

const backRoute = computed(() => {
  if (combatId.value) {
    return {
      name: 'combat-detail',
      params: { campaignId: props.campaignId, combatId: String(combatId.value) },
    };
  }
  if (heroId.value) {
    return {
      name: 'character-sheet',
      params: { characterId: String(heroId.value) },
      query: { tab: 'companions' },
    };
  }
  return { name: 'campaign-detail', params: { campaignId: props.campaignId } };
});

const currentResources = computed(() => {
  if (!combatNpc.value) return null;
  return {
    currentHp: combatNpc.value.currentHp,
    currentFocus: combatNpc.value.currentFocus,
    currentInvestiture: combatNpc.value.currentInvestiture,
  };
});

onMounted(async () => {
  const campaignId = Number(props.campaignId);
  const npcId = Number(props.npcId);
  if (isNaN(campaignId) || campaignId <= 0 || isNaN(npcId) || npcId <= 0) {
    error.value = 'Invalid NPC ID';
    loading.value = false;
    return;
  }
  try {
    const classifiers = useClassifierStore();
    if (!classifiers.initialized) {
      await classifiers.initialize();
    }
    const response = await combatService.getNpc(campaignId, npcId);
    npc.value = response.data;
    setPageTitle(response.data.name);

    // Load combat NPC instance if combat context provided
    if (combatId.value && instanceId.value) {
      await combatStore.selectCombat(campaignId, combatId.value);
      combatNpc.value =
        combatStore.currentCombat?.npcs.find((n) => n.id === instanceId.value) ?? null;
    }
  } catch (err: unknown) {
    handleError(err, { errorRef: error, message: 'Failed to load NPC' });
  } finally {
    loading.value = false;
  }
});

const resourcePatchMap: Record<
  string,
  (data: { id: number; combatId: number; campaignId: number; value: number }) => Promise<void>
> = {
  max_health: (d) => combatStore.patchHp(d),
  max_focus: (d) => combatStore.patchFocus(d),
  max_investiture: (d) => combatStore.patchInvestiture(d),
};

function onResourceUpdate(code: string, value: number) {
  if (!combatNpc.value || !combatId.value) return;
  const patchFn = resourcePatchMap[code];
  if (!patchFn) return;
  void patchFn({
    id: combatNpc.value.id,
    combatId: combatId.value,
    campaignId: Number(props.campaignId),
    value,
  });
}
</script>
