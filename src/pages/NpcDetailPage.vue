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

      <div v-else-if="!npc" class="text-center q-pa-xl">
        <UserX :size="64" class="text-grey-5" aria-hidden="true" />
        <div class="text-h6 text-grey-7 q-mt-md">NPC not found</div>
        <q-btn color="primary" label="Go Back" class="q-mt-md" @click="goBack" />
      </div>

      <template v-else>
        <div class="q-mb-md">
          <q-btn flat dense round size="sm" aria-label="Back" @click="goBack">
            <ArrowLeft :size="20" />
          </q-btn>
        </div>
        <NpcStatBlock :npc="npc" />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, UserX } from 'lucide-vue-next';
import combatService from 'src/services/combatService';
import NpcStatBlock from 'src/components/combat/NpcStatBlock.vue';
import { handleError } from 'src/utils/errorHandling';
import type { Npc } from 'src/types';

const props = defineProps<{
  campaignId: string;
  npcId: string;
}>();

const router = useRouter();
const loading = ref(true);
const error = ref<string | null>(null);
const npc = ref<Npc | null>(null);

onMounted(async () => {
  const campaignId = Number(props.campaignId);
  const npcId = Number(props.npcId);
  if (isNaN(campaignId) || campaignId <= 0 || isNaN(npcId) || npcId <= 0) {
    error.value = 'Invalid NPC ID';
    loading.value = false;
    return;
  }
  try {
    const response = await combatService.getNpc(campaignId, npcId);
    npc.value = response.data;
  } catch (err: unknown) {
    handleError(err, { errorRef: error, message: 'Failed to load NPC' });
  } finally {
    loading.value = false;
  }
});

function goBack() {
  if (window.history.length > 1) {
    void router.back();
  } else {
    void router.push({
      name: 'campaign-detail',
      params: { campaignId: props.campaignId },
    });
  }
}
</script>
