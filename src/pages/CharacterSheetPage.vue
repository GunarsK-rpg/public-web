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
        <q-tab-panel v-for="tab in tabs" :key="tab.id" :name="tab.id">
          <component :is="tabComponents[tab.id]" />
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHeroStore } from 'stores/hero';
import { useClassifierStore } from 'stores/classifiers';
import { logger } from 'src/utils/logger';
import CharacterHeader from 'components/character/CharacterHeader.vue';
import StatsTab from 'components/character/tabs/StatsTab.vue';
import SkillsTab from 'components/character/tabs/SkillsTab.vue';
import ActionsTab from 'components/character/tabs/ActionsTab.vue';
import EquipmentTab from 'components/character/tabs/EquipmentTab.vue';
import TalentsTab from 'components/character/tabs/TalentsTab.vue';
import ExpertisesTab from 'components/character/tabs/ExpertisesTab.vue';
import OthersTab from 'components/character/tabs/OthersTab.vue';

// Static tab configuration - hoisted outside reactive scope for performance
const tabs = [
  { id: 'stats', label: 'Stats', icon: 'bar_chart' },
  { id: 'skills', label: 'Skills', icon: 'psychology' },
  { id: 'actions', label: 'Actions', icon: 'bolt' },
  { id: 'equipment', label: 'Equipment', icon: 'shield' },
  { id: 'talents', label: 'Talents', icon: 'auto_awesome' },
  { id: 'expertises', label: 'Expertises', icon: 'school' },
  { id: 'others', label: 'Others', icon: 'more_horiz' },
] as const;

// Map tab IDs to their components for dynamic rendering
const tabComponents: Record<string, typeof StatsTab> = {
  stats: StatsTab,
  skills: SkillsTab,
  actions: ActionsTab,
  equipment: EquipmentTab,
  talents: TalentsTab,
  expertises: ExpertisesTab,
  others: OthersTab,
};

const props = defineProps<{
  campaignId: string;
  characterId: string;
}>();

const router = useRouter();
const heroStore = useHeroStore();
const classifierStore = useClassifierStore();

const activeTab = ref('stats');

const isLoaded = computed(() => heroStore.isLoaded);
const loading = computed(() => heroStore.loading);
const error = computed(() => heroStore.error);
const classifierLoading = computed(() => classifierStore.loading);
const classifierError = computed(() => classifierStore.error);

onMounted(async () => {
  try {
    const campaignId = Number(props.campaignId);
    if (isNaN(campaignId) || campaignId <= 0) {
      heroStore.setError('Invalid campaign ID');
      return;
    }

    const characterId = Number(props.characterId);
    if (isNaN(characterId) || characterId <= 0) {
      heroStore.setError('Invalid character ID');
      return;
    }

    if (!classifierStore.initialized) {
      await classifierStore.initialize();
    }
    await heroStore.loadHero(characterId);
  } catch (err: unknown) {
    logger.error('Failed to load character', err instanceof Error ? err : { error: String(err) });
    heroStore.setError('Failed to load character');
  }
});

onUnmounted(() => {
  heroStore.clearHero();
});

function goBack(): void {
  void router.push({
    name: 'campaign-detail',
    params: { campaignId: props.campaignId },
  });
}
</script>
