<template>
  <div>
    <div class="row items-center no-wrap q-mb-md">
      <div class="text-h6">NPCs</div>
      <q-space />
      <q-btn
        color="primary"
        :to="{ name: 'npc-create', params: { campaignId: String(campaignId) } }"
        ><Plus :size="20" class="on-left" />Create NPC</q-btn
      >
    </div>

    <template v-if="npcs.length > 0">
      <q-input v-model="search" label="Search NPCs" dense outlined class="q-mb-sm" clearable />
      <div class="row q-gutter-xs q-mb-sm">
        <q-chip
          v-for="f in filterOptions"
          :key="f.key"
          :selected="filters[f.key]"
          dense
          clickable
          :color="filters[f.key] ? 'primary' : undefined"
          :text-color="filters[f.key] ? 'white' : undefined"
          @click="filters[f.key] = !filters[f.key]"
          >{{ f.label }}</q-chip
        >
      </div>
    </template>

    <q-banner v-if="error" class="bg-negative text-white q-mb-md">
      {{ error }}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="error = null" />
      </template>
    </q-banner>

    <q-spinner-dots v-if="loading" size="40px" color="primary" />

    <div v-else-if="npcs.length === 0" class="text-center q-pa-xl">
      <UserX :size="64" class="text-grey-5" aria-hidden="true" />
      <div class="text-h6 text-grey-7 q-mt-md">No NPCs yet</div>
      <div class="text-body2 text-grey-6">Create an NPC to add to your library.</div>
    </div>

    <div v-else-if="filtered.length === 0" class="text-center q-pa-xl">
      <UserX :size="64" class="text-grey-5" aria-hidden="true" />
      <div class="text-h6 text-grey-7 q-mt-md">No matching NPCs</div>
    </div>

    <q-virtual-scroll
      v-else
      :items="filtered"
      :virtual-scroll-item-size="48"
      class="rounded-borders bordered-list"
      style="max-height: 400px"
      v-slot="{ item: npc }"
    >
      <q-item
        :key="npc.id"
        clickable
        :to="{
          name: 'npc-detail',
          params: { campaignId: String(campaignId), npcId: String(npc.id) },
        }"
        :class="{ 'npc-archived': npc.deletedAt }"
      >
        <q-item-section v-if="npc.avatarKey" avatar>
          <AvatarDisplay :avatar-key="npc.avatarKey" size="32px" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ npc.name }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row items-center q-gutter-xs">
            <q-badge v-if="npc.deletedAt" label="Archived" color="grey" />
            <q-badge v-if="npc.campaignId" label="Custom" color="teal" />
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
    </q-virtual-scroll>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Plus, UserX } from 'lucide-vue-next';
import AvatarDisplay from 'src/components/shared/AvatarDisplay.vue';
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

type FilterKey = 'custom' | 'companion' | 'archived';
const filters = ref<Record<FilterKey, boolean>>({
  custom: false,
  companion: false,
  archived: false,
});
const filterOptions: { key: FilterKey; label: string }[] = [
  { key: 'custom', label: 'Custom' },
  { key: 'companion', label: 'Companion' },
  { key: 'archived', label: 'Archived' },
];

const filtered = computed(() => {
  let result = npcs.value;

  if (filters.value.custom) result = result.filter((n) => !!n.campaignId);
  if (filters.value.companion) result = result.filter((n) => n.isCompanion);
  if (filters.value.archived) result = result.filter((n) => !!n.deletedAt);

  if (search.value) {
    const q = search.value.toLowerCase();
    result = result.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q) ||
        n.tier.name.toLowerCase().includes(q)
    );
  }

  return result;
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

.bordered-list {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
