<template>
  <q-card class="combat-npc-tile" :class="{ 'npc-dimmed': dimmed }">
    <q-card-section class="row items-center no-wrap q-pb-none">
      <RouterLink :to="statBlockRoute" custom v-slot="{ href, navigate }">
        <a
          :href="href"
          class="col cursor-pointer card-link"
          :aria-label="`View ${displayLabel} stat block`"
          @click="navigate($event)"
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
        </a>
      </RouterLink>
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
          :color="turnDone ? 'positive' : undefined"
          :disable="saving"
          aria-label="Toggle turn done"
          @click="$emit('toggle-turn-done')"
          ><CircleCheck v-if="turnDone" :size="16" aria-hidden="true" />
          <Circle v-else :size="16" aria-hidden="true"
        /></q-btn>
        <q-btn
          flat
          dense
          round
          size="sm"
          :disable="saving"
          aria-label="Edit NPC"
          @click="showEditDialog = true"
          ><Pencil :size="16" aria-hidden="true"
        /></q-btn>
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

    <!-- Notes -->
    <q-card-section v-if="npc.notes" class="q-pt-none">
      <div class="text-caption text-grey-5 ellipsis-2-lines cursor-pointer">
        {{ npc.notes }}
        <InfoPopup>{{ npc.notes }}</InfoPopup>
      </div>
    </q-card-section>

    <HpManagementDialog
      v-model="showHpDialog"
      :current-hp="npc.currentHp"
      :max-hp="maxHp"
      :saving="saving"
      @update="onHpUpdate"
    />

    <!-- Edit dialog -->
    <q-dialog v-model="showEditDialog" aria-modal="true">
      <q-card style="min-width: 350px" role="dialog">
        <q-card-section>
          <div class="text-h6">Edit NPC</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-input
            v-model="editName"
            label="Display name"
            dense
            :placeholder="npc.name"
            class="q-mb-sm"
          />
          <q-input v-model="editNotes" label="Notes" type="textarea" dense autogrow />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showEditDialog = false" />
          <q-btn
            flat
            color="primary"
            label="Save"
            :disable="saving"
            :loading="saving"
            @click="saveEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { Circle, CircleCheck, Pencil, Trash2 } from 'lucide-vue-next';
import InfoPopup from 'src/components/shared/InfoPopup.vue';
import { RPG_COLORS } from 'src/constants/theme';
import ResourceBox from 'src/components/shared/ResourceBox.vue';
import HpManagementDialog from 'src/components/shared/HpManagementDialog.vue';
import TurnSpeedToggle from './TurnSpeedToggle.vue';
import type { TurnPhase } from 'src/constants/combat';
import type { CombatNpc } from 'src/types';

const props = defineProps<{
  npc: CombatNpc;
  campaignId: number;
  saving: boolean;
  readonly?: boolean;
  turnPhase?: TurnPhase | undefined;
  turnDone?: boolean;
}>();

const emit = defineEmits<{
  'update-turn-speed': [value: 'fast' | 'slow' | null];
  'update-hp': [value: number];
  'update-focus': [value: number];
  'update-investiture': [value: number];
  edit: [displayName: string | null, notes: string | null];
  remove: [];
  'toggle-turn-done': [];
}>();

const $q = useQuasar();
const showHpDialog = ref(false);
const showEditDialog = ref(false);
const editName = ref('');
const editNotes = ref('');

watch(showEditDialog, (open) => {
  if (open) {
    editName.value = props.npc.displayName ?? '';
    editNotes.value = props.npc.notes ?? '';
  }
});

function saveEdit() {
  emit('edit', editName.value.trim() || null, editNotes.value.trim() || null);
  showEditDialog.value = false;
}

const displayLabel = computed(() => props.npc.displayName ?? props.npc.name);

const dimmed = computed(() => {
  if (props.npc.currentHp <= 0) return true;
  if (props.turnDone) return true;
  if (!props.turnPhase || props.npc.type === 'boss') return false;
  return props.npc.turnSpeed !== props.turnPhase;
});

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

const statBlockRoute = computed(() => ({
  name: 'npc-detail',
  params: {
    campaignId: String(props.campaignId),
    npcId: String(props.npc.npcId),
  },
  query: {
    combatId: String(props.npc.combatId),
    instanceId: String(props.npc.id),
  },
}));

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
.npc-dimmed {
  opacity: 0.4;
  filter: grayscale(30%);
}

.combat-npc-tile {
  min-width: 200px;
}
</style>
