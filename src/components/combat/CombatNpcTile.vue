<template>
  <q-card class="combat-npc-tile">
    <q-card-section class="row items-center no-wrap q-pb-none">
      <div
        class="col cursor-pointer"
        role="button"
        tabindex="0"
        :aria-label="`View ${displayLabel} stat block`"
        @click="goToStatBlock"
        @keydown.enter="goToStatBlock"
        @keydown.space.prevent="goToStatBlock"
      >
        <div class="text-subtitle1 text-weight-bold">{{ displayLabel }}</div>
        <div class="row items-center q-gutter-xs">
          <q-badge :label="npc.tier.name" color="grey-7" />
          <q-badge
            :label="npc.type"
            :color="npc.type === 'boss' ? 'negative' : 'grey-5'"
            :text-color="npc.type === 'boss' ? 'white' : 'dark'"
          />
        </div>
      </div>
      <template v-if="!readonly">
        <TurnSpeedToggle
          v-if="npc.type !== 'boss'"
          :model-value="npc.turnSpeed ?? null"
          :saving="saving"
          class="q-mr-sm"
          @update:model-value="onTurnSpeedChange"
        />
        <q-btn
          flat
          dense
          round
          size="sm"
          color="negative"
          :disable="saving"
          aria-label="Remove NPC"
          @click="confirmRemove"
          ><Trash2 :size="18" aria-hidden="true"
        /></q-btn>
      </template>
    </q-card-section>

    <q-card-section class="q-pt-sm">
      <div class="row q-col-gutter-sm">
        <div :class="resourceColClass">
          <ResourceBox
            label="HP"
            :current="npc.currentHp"
            :max="maxHp"
            color="negative"
            :saving="saving"
            :readonly="readonly"
            :use-dialog="!readonly"
            @update="onHpUpdate"
            @open-dialog="showHpDialog = true"
          />
        </div>
        <div v-if="maxFocus > 0" :class="resourceColClass">
          <ResourceBox
            label="Focus"
            :current="npc.currentFocus"
            :max="maxFocus"
            :color="RPG_COLORS.focus"
            :saving="saving"
            :readonly="readonly"
            @update="onFocusUpdate"
          />
        </div>
        <div v-if="maxInvestiture > 0" :class="resourceColClass">
          <ResourceBox
            label="Investiture"
            :current="npc.currentInvestiture"
            :max="maxInvestiture"
            :color="RPG_COLORS.investiture"
            :saving="saving"
            :readonly="readonly"
            @update="onInvestitureUpdate"
          />
        </div>
      </div>
    </q-card-section>

    <HpManagementDialog
      v-model="showHpDialog"
      :current-hp="npc.currentHp"
      :max-hp="maxHp"
      :saving="saving"
      @update="onHpUpdate"
    />
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { Trash2 } from 'lucide-vue-next';
import { RPG_COLORS } from 'src/constants/theme';
import ResourceBox from 'src/components/shared/ResourceBox.vue';
import HpManagementDialog from 'src/components/shared/HpManagementDialog.vue';
import TurnSpeedToggle from './TurnSpeedToggle.vue';
import type { CombatNpc } from 'src/types';

const props = defineProps<{
  npc: CombatNpc;
  campaignId: number;
  saving: boolean;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update-turn-speed': [value: 'fast' | 'slow' | null];
  'update-hp': [value: number];
  'update-focus': [value: number];
  'update-investiture': [value: number];
  remove: [];
}>();

const $q = useQuasar();
const router = useRouter();
const showHpDialog = ref(false);

const displayLabel = computed(() => props.npc.displayName ?? props.npc.name);

function derivedStat(code: string): number {
  return props.npc.derivedStats.find((s) => s.type.code === code)?.value ?? 0;
}

const maxHp = computed(() => derivedStat('max_health'));
const maxFocus = computed(() => derivedStat('max_focus'));
const maxInvestiture = computed(() => derivedStat('max_investiture'));

const resourceCount = computed(() => {
  let count = 1; // HP always shown
  if (maxFocus.value > 0) count++;
  if (maxInvestiture.value > 0) count++;
  return count;
});

const resourceColClass = computed(() => {
  if (resourceCount.value === 1) return 'col-12';
  if (resourceCount.value === 2) return 'col-6';
  return 'col-4';
});

function goToStatBlock() {
  void router.push({
    name: 'npc-detail',
    params: {
      campaignId: String(props.campaignId),
      npcId: String(props.npc.npcId),
    },
    query: {
      combatId: String(props.npc.combatId),
      instanceId: String(props.npc.id),
    },
  });
}

function onTurnSpeedChange(value: 'fast' | 'slow' | null) {
  emit('update-turn-speed', value);
}

function onHpUpdate(value: number) {
  emit('update-hp', value);
}

function onFocusUpdate(value: number) {
  emit('update-focus', value);
}

function onInvestitureUpdate(value: number) {
  emit('update-investiture', value);
}

function confirmRemove() {
  $q.dialog({
    title: 'Remove NPC',
    message: `Remove ${displayLabel.value} from this combat?`,
    cancel: true,
    persistent: false,
  }).onOk(() => {
    emit('remove');
  });
}
</script>

<style scoped>
.combat-npc-tile {
  min-width: 200px;
}
</style>
