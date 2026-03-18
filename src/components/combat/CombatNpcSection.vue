<template>
  <div>
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ title }}</div>
      <q-space />
      <q-btn v-if="!readonly" flat color="primary" :disable="saving" @click="$emit('add')"
        ><UserPlus :size="20" class="on-left" />{{ addLabel }}</q-btn
      >
    </div>

    <div v-if="npcs.length === 0" class="text-center text-grey-6 q-pa-md">
      No {{ title.toLowerCase() }} in this combat.
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="npc in npcs" :key="npc.id" class="col-12 col-sm-6 col-md-4">
        <CombatNpcTile
          :npc="npc"
          :campaign-id="campaignId"
          :saving="saving"
          :readonly="readonly"
          @update-turn-speed="(v) => $emit('update-turn-speed', npc, v)"
          @update-hp="(v) => $emit('update-hp', npc, v)"
          @update-focus="(v) => $emit('update-focus', npc, v)"
          @update-investiture="(v) => $emit('update-investiture', npc, v)"
          @remove="$emit('remove', npc)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserPlus } from 'lucide-vue-next';
import CombatNpcTile from './CombatNpcTile.vue';
import type { CombatNpc } from 'src/types';

defineProps<{
  title: string;
  addLabel: string;
  npcs: CombatNpc[];
  campaignId: number;
  saving: boolean;
  readonly: boolean;
}>();

defineEmits<{
  add: [];
  'update-turn-speed': [npc: CombatNpc, value: 'fast' | 'slow' | null];
  'update-hp': [npc: CombatNpc, value: number];
  'update-focus': [npc: CombatNpc, value: number];
  'update-investiture': [npc: CombatNpc, value: number];
  remove: [npc: CombatNpc];
}>();
</script>
