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
        <div class="row items-center q-mb-md">
          <q-btn flat dense round size="sm" aria-label="Back" @click="goBack">
            <ArrowLeft :size="20" />
          </q-btn>
        </div>

        <NpcStatBlock
          :npc="npc"
          :display-name="instance?.displayName"
          :current-resources="currentResources"
          :notes="instance?.notes"
          :saving="saving"
          :readonly="isReadonly"
          :editable="false"
          @resource-update="onResourceUpdate"
        />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePageTitle } from 'src/composables/usePageTitle';
import { useClassifierStore } from 'src/stores/classifiers';
import { ArrowLeft, UserX } from 'lucide-vue-next';
import npcInstanceService from 'src/services/npcInstanceService';
import npcService from 'src/services/npcService';
import NpcStatBlock from 'src/components/combat/NpcStatBlock.vue';
import { handleError } from 'src/utils/errorHandling';
import type { Npc, NpcInstance } from 'src/types';

const props = defineProps<{
  instanceId: string;
}>();

const route = useRoute();
const router = useRouter();
const classifiers = useClassifierStore();
const { setPageTitle } = usePageTitle();

const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);
const npc = ref<Npc | null>(null);
const instance = ref<NpcInstance | null>(null);
const isReadonly = computed(() => route.query.readonly === '1');

const currentResources = computed(() => {
  if (!instance.value) return null;
  return {
    currentHp: instance.value.currentHp,
    currentFocus: instance.value.currentFocus,
    currentInvestiture: instance.value.currentInvestiture,
  };
});

function goBack() {
  if (!instance.value) {
    router.back();
    return;
  }
  if (instance.value.heroId) {
    void router.push({
      name: 'character-sheet',
      params: { characterId: String(instance.value.heroId) },
      query: { tab: 'companions' },
    });
    return;
  }
  router.back();
}

const resourceFieldMap: Record<string, 'current_hp' | 'current_focus' | 'current_investiture'> = {
  max_health: 'current_hp',
  max_focus: 'current_focus',
  max_investiture: 'current_investiture',
};

const resourceKeyMap: Record<string, 'currentHp' | 'currentFocus' | 'currentInvestiture'> = {
  max_health: 'currentHp',
  max_focus: 'currentFocus',
  max_investiture: 'currentInvestiture',
};

async function onResourceUpdate(code: string, value: number) {
  if (!instance.value) return;
  const field = resourceFieldMap[code];
  const npcKey = resourceKeyMap[code];
  if (!field || !npcKey) return;
  saving.value = true;
  try {
    const response = await npcInstanceService.patchResource(instance.value.id, field, value);
    const newValue = response.data[field];
    if (instance.value && typeof newValue === 'number') {
      instance.value[npcKey] = newValue;
    }
  } catch (err: unknown) {
    handleError(err, { errorRef: error, message: 'Failed to update resource' });
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  const id = Number(props.instanceId);
  if (isNaN(id) || id <= 0) {
    error.value = 'Invalid instance ID';
    loading.value = false;
    return;
  }

  try {
    if (!classifiers.initialized) {
      await classifiers.initialize();
    }

    const instanceResponse = await npcInstanceService.get(id);
    instance.value = instanceResponse.data;

    const npcResponse = await npcService.get(instanceResponse.data.npcId);
    npc.value = npcResponse.data;

    setPageTitle(instance.value.displayName ?? npc.value.name);
  } catch (err: unknown) {
    handleError(err, { errorRef: error, message: 'Failed to load NPC' });
  } finally {
    loading.value = false;
  }
});
</script>
