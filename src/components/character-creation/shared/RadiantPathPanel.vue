<template>
  <q-expansion-item
    :aria-label="`${orderName} order talents`"
    default-opened
    header-class="banner-radiant-path"
    expand-icon-class="text-white"
  >
    <template v-slot:header>
      <q-item-section avatar>
        <q-icon name="sym_o_auto_awesome" color="white" aria-hidden="true" />
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-white text-weight-medium">
          {{ orderName }}
        </q-item-label>
        <q-item-label class="text-white text-secondary-emphasis" caption>
          Ideal {{ idealLevel }} · {{ selectedTalentCount }} talents selected
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          flat
          dense
          round
          icon="close"
          color="white"
          size="sm"
          aria-label="Remove Radiant path"
          @click.stop="$emit('remove')"
        >
          <q-tooltip>Remove Radiant path</q-tooltip>
        </q-btn>
      </q-item-section>
    </template>

    <q-card>
      <q-card-section>
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">Ideal Level (0-5)</div>
          <q-slider
            :model-value="idealLevel"
            :min="0"
            :max="5"
            :step="1"
            label
            markers
            @update:model-value="handleIdealLevelChange"
          />
        </div>

        <!-- Radiant Key Talent -->
        <div v-if="keyTalent" class="q-mb-md">
          <KeyTalentBanner :talent="keyTalent" label="Order Talent" />
        </div>

        <!-- Surge/Order Tab Selection -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">Select Talent Tree</div>
          <q-btn-toggle v-model="activeTab" :options="tabOptions" spread no-caps />
        </div>

        <!-- Radiant Talents List (filtered by selected tab) -->
        <TalentListPanel
          :label="`${activeTabLabel} Talents`"
          :talents="currentTalentsWithStatus"
          :empty-message="`No ${activeTabLabel} talents available`"
          @toggle-talent="(id: number, available: boolean) => $emit('toggleTalent', id, available)"
          @show-details="(talent: Talent) => $emit('showDetails', talent)"
        />
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useClassifierStore } from 'src/stores/classifiers';
import {
  useTalentPrerequisites,
  type TalentWithStatus,
} from 'src/composables/useTalentPrerequisites';
import { findById } from 'src/utils/arrayUtils';
import KeyTalentBanner from './KeyTalentBanner.vue';
import TalentListPanel from './TalentListPanel.vue';
import type { Talent } from 'src/types';

const props = defineProps<{
  orderId: number | null;
  idealLevel: number;
}>();

const emit = defineEmits<{
  remove: [];
  'update:idealLevel': [level: number];
  toggleTalent: [talentId: number, available: boolean];
  showDetails: [talent: Talent];
}>();

function handleIdealLevelChange(value: number | null) {
  if (value !== null) {
    emit('update:idealLevel', value);
  }
}

const classifiers = useClassifierStore();
const {
  getTalentsByRadiantOrder,
  getRadiantOrderKeyTalent,
  getTalentsBySurge,
  mapTalentsWithStatus,
  isTalentSelected,
} = useTalentPrerequisites();

const activeTab = ref<'order' | 'surge1' | 'surge2'>('order');

const selectedOrder = computed(() => findById(classifiers.radiantOrders, props.orderId));

const orderName = computed(() => selectedOrder.value?.name || 'Select Order');

const surge1Id = computed(() => selectedOrder.value?.surge1.id ?? null);
const surge2Id = computed(() => selectedOrder.value?.surge2.id ?? null);

const surge1Name = computed(() => findById(classifiers.surges, surge1Id.value)?.name || 'Surge 1');
const surge2Name = computed(() => findById(classifiers.surges, surge2Id.value)?.name || 'Surge 2');

const tabOptions = computed(() => [
  { value: 'order', label: selectedOrder.value?.name || 'Order' },
  { value: 'surge1', label: surge1Name.value },
  { value: 'surge2', label: surge2Name.value },
]);

const activeTabLabel = computed(() => {
  if (activeTab.value === 'order') return selectedOrder.value?.name || 'Order';
  if (activeTab.value === 'surge1') return surge1Name.value;
  return surge2Name.value;
});

const keyTalent = computed(() => (props.orderId ? getRadiantOrderKeyTalent(props.orderId) : null));

const selectedTalentCount = computed(() => {
  if (!props.orderId) return 0;
  const orderTalents = getTalentsByRadiantOrder(props.orderId);
  const surge1Talents = surge1Id.value ? getTalentsBySurge(surge1Id.value) : [];
  const surge2Talents = surge2Id.value ? getTalentsBySurge(surge2Id.value) : [];
  const allTalents = [...orderTalents, ...surge1Talents, ...surge2Talents];
  return allTalents.filter((t) => isTalentSelected(t.id)).length;
});

const orderTalentsWithStatus = computed((): TalentWithStatus[] => {
  if (!props.orderId) return [];
  const orderTalents = getTalentsByRadiantOrder(props.orderId).filter((t) => !t.isKey);
  return mapTalentsWithStatus(orderTalents);
});

const surge1TalentsWithStatus = computed((): TalentWithStatus[] => {
  if (!surge1Id.value) return [];
  return mapTalentsWithStatus(getTalentsBySurge(surge1Id.value));
});

const surge2TalentsWithStatus = computed((): TalentWithStatus[] => {
  if (!surge2Id.value) return [];
  return mapTalentsWithStatus(getTalentsBySurge(surge2Id.value));
});

const currentTalentsWithStatus = computed((): TalentWithStatus[] => {
  if (activeTab.value === 'order') return orderTalentsWithStatus.value;
  if (activeTab.value === 'surge1') return surge1TalentsWithStatus.value;
  return surge2TalentsWithStatus.value;
});
</script>
