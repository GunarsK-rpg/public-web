<template>
  <q-page>
    <q-spinner-dots
      v-if="loading || classifierLoading"
      size="50px"
      color="primary"
      class="absolute-center"
    />

    <q-banner v-else-if="error || classifierError" class="bg-negative text-white">
      {{ error || classifierError }}
      <template v-slot:action>
        <q-btn flat label="Go Back" @click="goBack" />
      </template>
    </q-banner>

    <template v-else-if="isLoaded">
      <!-- Character Header -->
      <CharacterHeader />

      <!-- Tab Navigation -->
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab
          v-for="tab in tabs"
          :key="tab.id"
          :name="tab.id"
          :icon="tab.icon"
          :label="tab.label"
        />
      </q-tabs>

      <q-separator />

      <!-- Tab Panels -->
      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="stats">
          <StatsTab />
        </q-tab-panel>

        <q-tab-panel name="skills">
          <SkillsTab />
        </q-tab-panel>

        <q-tab-panel name="actions">
          <ActionsTab />
        </q-tab-panel>

        <q-tab-panel name="equipment">
          <EquipmentTab />
        </q-tab-panel>

        <q-tab-panel name="talents">
          <TalentsTab />
        </q-tab-panel>

        <q-tab-panel name="expertises">
          <ExpertisesTab />
        </q-tab-panel>

        <q-tab-panel name="others">
          <OthersTab />
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCharacterStore } from 'stores/character';
import { useClassifierStore } from 'stores/classifiers';
import CharacterHeader from 'components/character/CharacterHeader.vue';
import StatsTab from 'components/character/tabs/StatsTab.vue';
import SkillsTab from 'components/character/tabs/SkillsTab.vue';
import ActionsTab from 'components/character/tabs/ActionsTab.vue';
import EquipmentTab from 'components/character/tabs/EquipmentTab.vue';
import TalentsTab from 'components/character/tabs/TalentsTab.vue';
import ExpertisesTab from 'components/character/tabs/ExpertisesTab.vue';
import OthersTab from 'components/character/tabs/OthersTab.vue';

const props = defineProps<{
  campaignId: string;
  characterId: string;
}>();

const router = useRouter();
const characterStore = useCharacterStore();
const classifierStore = useClassifierStore();

const activeTab = ref('stats');

const tabs = [
  { id: 'stats', label: 'Stats', icon: 'bar_chart' },
  { id: 'skills', label: 'Skills', icon: 'psychology' },
  { id: 'actions', label: 'Actions', icon: 'bolt' },
  { id: 'equipment', label: 'Equipment', icon: 'shield' },
  { id: 'talents', label: 'Talents', icon: 'auto_awesome' },
  { id: 'expertises', label: 'Expertises', icon: 'school' },
  { id: 'others', label: 'Others', icon: 'more_horiz' },
];

const isLoaded = computed(() => characterStore.isLoaded);
const loading = computed(() => characterStore.loading);
const error = computed(() => characterStore.error);
const classifierLoading = computed(() => classifierStore.loading);
const classifierError = computed(() => classifierStore.error);

onMounted(async () => {
  if (!classifierStore.initialized) {
    await classifierStore.initialize();
  }
  await characterStore.loadCharacter(Number(props.characterId));
});

onUnmounted(() => {
  characterStore.clearCharacter();
});

function goBack(): void {
  void router.push({
    name: 'campaign-detail',
    params: { campaignId: props.campaignId },
  });
}
</script>
