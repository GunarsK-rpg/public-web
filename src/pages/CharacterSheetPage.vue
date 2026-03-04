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
      <CharacterHeader :character-id="characterId" />

      <!-- Tab Navigation -->
      <q-tabs
        v-model="activeTab"
        dense
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
        mobile-arrows
        outside-arrows
      >
        <q-tab v-for="tab in tabs" :key="tab.id" :name="tab.id">
          <component :is="tab.icon" :size="20" class="q-tab__icon" aria-hidden="true" />
          <div class="q-tab__label">{{ tab.label }}</div>
        </q-tab>
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
import { ref, computed, onMounted, onUnmounted, type Component } from 'vue';
import { useRouter } from 'vue-router';
import { useHeroStore } from 'stores/hero';
import { useClassifierStore } from 'stores/classifiers';
import { logger } from 'src/utils/logger';
import { toError } from 'src/utils/errorHandling';
import {
  ChartBarBig,
  Wrench,
  Zap,
  Shield,
  Sparkles,
  GraduationCap,
  Ellipsis,
} from 'lucide-vue-next';
import CharacterHeader from 'components/character/CharacterHeader.vue';
import StatsTab from 'components/character/tabs/StatsTab.vue';
import SkillsTab from 'components/character/tabs/SkillsTab.vue';
import ActionsTab from 'components/character/tabs/ActionsTab.vue';
import EquipmentTab from 'components/character/tabs/EquipmentTab.vue';
import TalentsTab from 'components/character/tabs/TalentsTab.vue';
import ExpertisesTab from 'components/character/tabs/ExpertisesTab.vue';
import OthersTab from 'components/character/tabs/OthersTab.vue';

// Static tab configuration - hoisted outside reactive scope for performance
const tabs: { id: string; label: string; icon: Component }[] = [
  { id: 'stats', label: 'Stats', icon: ChartBarBig },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'actions', label: 'Actions', icon: Zap },
  { id: 'equipment', label: 'Equipment', icon: Shield },
  { id: 'talents', label: 'Talents', icon: Sparkles },
  { id: 'expertises', label: 'Expertises', icon: GraduationCap },
  { id: 'others', label: 'Others', icon: Ellipsis },
];

// Map tab IDs to their components for dynamic rendering
const tabComponents: Record<string, Component> = {
  stats: StatsTab,
  skills: SkillsTab,
  actions: ActionsTab,
  equipment: EquipmentTab,
  talents: TalentsTab,
  expertises: ExpertisesTab,
  others: OthersTab,
};

const props = defineProps<{
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
    logger.error('Failed to load character', toError(err));
    heroStore.setError('Failed to load character');
  }
});

onUnmounted(() => {
  heroStore.clearHero();
});

function goBack(): void {
  const campaignId = heroStore.hero?.campaignId;
  if (campaignId) {
    void router.push({
      name: 'campaign-detail',
      params: { campaignId: String(campaignId) },
    });
  } else {
    void router.push({ name: 'my-characters' });
  }
}
</script>
