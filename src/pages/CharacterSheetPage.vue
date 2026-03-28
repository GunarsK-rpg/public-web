<template>
  <q-page>
    <q-banner v-if="error || classifierError" class="bg-negative text-white">
      {{ error || classifierError }}
      <template v-slot:action>
        <q-btn flat label="Go Back" :to="backRoute" />
      </template>
    </q-banner>

    <template v-else>
      <!-- Character Header -->
      <CharacterHeader :character-id="characterId" :readonly="isReadonly" :loading="isLoading" />

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

      <hr class="cosmere-divider" />

      <!-- Tab Panels -->
      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel v-for="tab in tabs" :key="tab.id" :name="tab.id">
          <component
            :is="tabComponents[tab.id]"
            :readonly="isReadonly"
            v-bind="tab.id === 'stats' ? { loading: isLoading } : {}"
          />
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, type Component } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { heroTabKey } from 'src/utils/routeUtils';
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
  Activity,
  PawPrint,
} from 'lucide-vue-next';
import CharacterHeader from 'components/character/CharacterHeader.vue';
import StatsTab from 'components/character/tabs/StatsTab.vue';
import SkillsTab from 'components/character/tabs/SkillsTab.vue';
import ActionsTab from 'components/character/tabs/ActionsTab.vue';
import EquipmentTab from 'components/character/tabs/EquipmentTab.vue';
import TalentsTab from 'components/character/tabs/TalentsTab.vue';
import ExpertisesTab from 'components/character/tabs/ExpertisesTab.vue';
import ConditionsTab from 'components/character/tabs/ConditionsTab.vue';
import OthersTab from 'components/character/tabs/OthersTab.vue';
import CompanionsTab from 'components/character/tabs/CompanionsTab.vue';

// Static tab configuration - hoisted outside reactive scope for performance
const tabs: { id: string; label: string; icon: Component }[] = [
  { id: 'stats', label: 'Stats', icon: ChartBarBig },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'actions', label: 'Actions', icon: Zap },
  { id: 'equipment', label: 'Equipment', icon: Shield },
  { id: 'talents', label: 'Talents', icon: Sparkles },
  { id: 'expertises', label: 'Expertises', icon: GraduationCap },
  { id: 'conditions', label: 'Conditions', icon: Activity },
  { id: 'companions', label: 'Companions', icon: PawPrint },
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
  conditions: ConditionsTab,
  companions: CompanionsTab,
  others: OthersTab,
};

const props = defineProps<{
  characterId: string;
}>();

const heroStore = useHeroStore();
const classifierStore = useClassifierStore();

const tabIds = new Set(tabs.map((t) => t.id));

const router = useRouter();
const route = useRoute();

function resolveInitialTab(): string {
  const queryTab = typeof route.query.tab === 'string' ? route.query.tab : '';
  if (tabIds.has(queryTab)) {
    void router.replace({ query: { ...route.query, tab: undefined } });
    return queryTab;
  }
  const stored = sessionStorage.getItem(heroTabKey(props.characterId));
  if (stored && tabIds.has(stored)) return stored;
  return 'stats';
}

const activeTab = ref(resolveInitialTab());

watch(activeTab, (tab) => {
  sessionStorage.setItem(heroTabKey(props.characterId), tab);
});

const initializing = ref(true);
const isReadonly = computed(() => !heroStore.isOwner);
const isLoading = computed(
  () => initializing.value || heroStore.loading || classifierStore.loading
);
const error = computed(() => heroStore.error);
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
  } finally {
    initializing.value = false;
  }
});

onUnmounted(() => {
  heroStore.clearHero();
});

const backRoute = computed(() => {
  const campaignId = heroStore.hero?.campaignId;
  if (campaignId) {
    return { name: 'campaign-detail', params: { campaignId: String(campaignId) } };
  }
  return { name: 'my-characters' };
});
</script>
