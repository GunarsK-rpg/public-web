<template>
  <q-dialog
    :model-value="modelValue"
    aria-modal="true"
    aria-labelledby="add-npc-dialog-title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="add-npc-card" role="dialog">
      <q-card-section class="row items-center">
        <div id="add-npc-dialog-title" class="text-h6">Add NPC</div>
        <q-space />
        <q-btn flat round dense aria-label="Close dialog" @click="close"><X :size="20" /></q-btn>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-model="searchText"
          label="Search NPCs"
          dense
          clearable
          debounce="200"
          aria-label="Search NPCs"
        />

        <div class="row q-gutter-sm q-mt-sm">
          <q-select
            v-model="filterTier"
            :options="tierOptions"
            label="Tier"
            dense
            outlined
            clearable
            emit-value
            map-options
            style="min-width: 100px"
            aria-label="Filter by tier"
          />
          <q-select
            v-model="filterType"
            :options="typeOptions"
            label="Type"
            dense
            outlined
            clearable
            emit-value
            map-options
            style="min-width: 120px"
            aria-label="Filter by type"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="npc-list-section">
        <div v-if="filteredNpcs.length === 0" class="text-center text-grey-6 q-pa-md">
          No NPCs match your filters.
        </div>

        <q-list v-else dense separator>
          <q-item
            v-for="npc in filteredNpcs"
            :key="npc.id"
            clickable
            :active="selectedNpc?.id === npc.id"
            active-class="bg-primary text-white"
            @click="selectedNpc = npc"
          >
            <q-item-section>
              <q-item-label>{{ npc.name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-badge :label="npc.tier.name" color="grey-7" />
                <q-badge :label="npc.type" color="grey-5" text-color="dark" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <template v-if="selectedNpc">
        <q-separator />
        <q-card-section>
          <div class="text-subtitle2 q-mb-xs">Selected: {{ selectedNpc.name }}</div>
          <q-input
            v-model="displayName"
            label="Display name (optional)"
            dense
            hint="Override the NPC name in this combat"
            aria-label="Display name"
          />
        </q-card-section>
      </template>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="close" />
        <q-btn
          flat
          color="primary"
          label="Add"
          :disable="!selectedNpc || saving"
          :loading="saving"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X } from 'lucide-vue-next';
import { useClassifierStore } from 'src/stores/classifiers';
import type { NpcOption } from 'src/types';

const props = defineProps<{
  modelValue: boolean;
  npcOptions: NpcOption[];
  saving: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  add: [npcId: number, displayName: string | null];
}>();

const searchText = ref('');
const filterTier = ref<number | null>(null);
const filterType = ref<string | null>(null);
const selectedNpc = ref<NpcOption | null>(null);
const displayName = ref('');

const classifiers = useClassifierStore();
const tierOptions = computed(() => classifiers.tiers.map((t) => ({ label: t.name, value: t.id })));

const typeOptions = computed(() => {
  const types = new Set(props.npcOptions.map((n) => n.type));
  return [...types].sort().map((t) => ({ label: t, value: t }));
});

const filteredNpcs = computed(() => {
  let list = props.npcOptions;
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    list = list.filter((n) => n.name.toLowerCase().includes(search));
  }
  if (filterTier.value != null) {
    list = list.filter((n) => n.tier.id === filterTier.value);
  }
  if (filterType.value) {
    list = list.filter((n) => n.type === filterType.value);
  }
  return list;
});

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      searchText.value = '';
      filterTier.value = null;
      filterType.value = null;
      selectedNpc.value = null;
      displayName.value = '';
    }
  }
);

function onSubmit() {
  if (!selectedNpc.value) return;
  emit('add', selectedNpc.value.id, displayName.value.trim() || null);
}

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.add-npc-card {
  min-width: min(450px, 90vw);
  max-width: 550px;
}

.npc-list-section {
  max-height: 300px;
  overflow-y: auto;
}
</style>
