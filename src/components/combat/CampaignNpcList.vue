<template>
  <div>
    <div class="row items-center q-mb-md">
      <div class="text-h6">NPCs</div>
      <q-space />
      <q-input
        v-if="npcs.length > 0"
        v-model="search"
        dense
        outlined
        placeholder="Search..."
        class="q-mr-sm"
        style="max-width: 200px"
        clearable
      />
      <q-btn
        color="primary"
        :to="{ name: 'npc-create', params: { campaignId: String(campaignId) } }"
        ><Plus :size="20" class="on-left" />Create NPC</q-btn
      >
    </div>

    <q-spinner-dots v-if="loading" size="40px" color="primary" />

    <div v-else-if="npcs.length === 0" class="text-center q-pa-xl">
      <UserX :size="64" class="text-grey-5" aria-hidden="true" />
      <div class="text-h6 text-grey-7 q-mt-md">No NPCs yet</div>
      <div class="text-body2 text-grey-6">Create an NPC to add to your library.</div>
    </div>

    <q-list v-else bordered separator class="rounded-borders">
      <q-item
        v-for="npc in filtered"
        :key="npc.id"
        clickable
        :to="{
          name: 'npc-detail',
          params: { campaignId: String(campaignId), npcId: String(npc.id) },
        }"
        :class="{ 'npc-archived': npc.deletedAt }"
      >
        <q-item-section>
          <q-item-label>{{ npc.name }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row items-center q-gutter-xs">
            <q-badge v-if="npc.deletedAt" label="Archived" color="grey" />
            <q-badge v-if="npc.isCompanion" label="Companion" color="blue-grey" />
            <q-badge :label="npc.tier.name" color="grey-7" />
            <q-badge
              :label="npc.type"
              :color="npc.type === 'boss' ? 'negative' : 'grey-5'"
              :text-color="npc.type === 'boss' ? 'white' : 'dark'"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Plus, UserX } from 'lucide-vue-next';
import combatService from 'src/services/combatService';
import { handleError } from 'src/utils/errorHandling';
import type { NpcOption } from 'src/types';

const props = defineProps<{
  campaignId: number;
}>();

const loading = ref(true);
const error = ref<string | null>(null);
const npcs = ref<NpcOption[]>([]);
const search = ref('');

const filtered = computed(() => {
  if (!search.value) return npcs.value;
  const q = search.value.toLowerCase();
  return npcs.value.filter(
    (n) =>
      n.name.toLowerCase().includes(q) ||
      n.type.toLowerCase().includes(q) ||
      n.tier.name.toLowerCase().includes(q)
  );
});

onMounted(async () => {
  try {
    const response = await combatService.getNpcLibrary(props.campaignId);
    npcs.value = response.data;
  } catch (err: unknown) {
    handleError(err, { errorRef: error, message: 'Failed to load NPCs' });
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.npc-archived {
  opacity: 0.5;
}
</style>
