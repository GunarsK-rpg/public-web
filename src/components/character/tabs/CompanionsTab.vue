<template>
  <div>
    <div class="row items-center q-mb-md">
      <q-space />
      <q-btn v-if="!readonly" flat color="primary" @click="openAddDialog">
        <UserPlus :size="20" class="on-left" />Add Companion
      </q-btn>
    </div>

    <div v-if="heroStore.companions.length" class="row q-col-gutter-md">
      <div v-for="comp in heroStore.companions" :key="comp.id" class="col-12 col-sm-6 col-md-4">
        <CombatNpcTile
          :npc="comp"
          :campaign-id="campaignId"
          :hero-id="heroStore.hero!.id"
          :saving="saving"
          :readonly="readonly"
          @update-hp="heroStore.patchCompanionHp(comp.id, $event)"
          @update-focus="heroStore.patchCompanionFocus(comp.id, $event)"
          @update-investiture="heroStore.patchCompanionInvestiture(comp.id, $event)"
          @edit="(dn: string | null, n: string | null) => onEditCompanion(comp.id, dn, n)"
          @remove="heroStore.removeCompanion(comp.id)"
        />
      </div>
    </div>

    <div v-else class="text-center text-grey-6 q-pa-lg">No companions yet.</div>

    <AddNpcDialog
      v-model="showAddDialog"
      title="Add Companion"
      :npc-options="heroStore.companionNpcOptions"
      :saving="saving"
      @add="onAddCompanion"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { UserPlus } from 'lucide-vue-next';
import { useHeroStore } from 'src/stores/hero';
import CombatNpcTile from 'src/components/combat/CombatNpcTile.vue';
import AddNpcDialog from 'src/components/combat/AddNpcDialog.vue';
import npcInstanceService from 'src/services/npcInstanceService';

defineProps<{
  readonly?: boolean;
}>();

const heroStore = useHeroStore();
const saving = computed(() => heroStore.saving);
const showAddDialog = ref(false);

const campaignId = computed(() => heroStore.hero?.campaignId ?? 0);

async function openAddDialog() {
  await heroStore.fetchCompanionNpcOptions();
  showAddDialog.value = true;
}

async function onAddCompanion(npcId: number, displayName: string | null) {
  if (!heroStore.hero) return;
  const result = await heroStore.addCompanion({
    npcId,
    heroId: heroStore.hero.id,
    displayName,
  });
  if (result) showAddDialog.value = false;
}

async function onEditCompanion(
  instanceId: number,
  displayName: string | null,
  notes: string | null
) {
  await npcInstanceService.patch(instanceId, { displayName, notes });
}
</script>
