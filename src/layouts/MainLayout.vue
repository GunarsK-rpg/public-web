<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="app-header">
      <q-toolbar>
        <q-btn
          v-if="isAuthenticated && isDesktop"
          flat
          dense
          round
          aria-label="Toggle sidebar"
          :aria-expanded="!drawerMini"
          aria-controls="side-nav"
          @click="drawerMini = !drawerMini"
        >
          <PanelLeftClose v-if="!drawerMini" :size="20" aria-hidden="true" />
          <PanelLeftOpen v-else :size="20" aria-hidden="true" />
          <q-tooltip>{{ drawerMini ? 'Expand sidebar' : 'Collapse sidebar' }}</q-tooltip>
        </q-btn>
        <q-toolbar-title class="text-heading">{{ pageTitle }}</q-toolbar-title>

        <q-btn flat dense round aria-label="Toggle dark mode" @click="toggleDarkMode">
          <SunMoon :size="20" aria-hidden="true" />
          <q-tooltip>Toggle dark mode</q-tooltip>
        </q-btn>

        <q-btn flat dense round aria-label="Account menu" v-if="isAuthenticated">
          <CircleUserRound :size="20" aria-hidden="true" />
          <q-menu>
            <q-list class="account-menu">
              <q-item-label header>{{ username }}</q-item-label>
              <q-separator />
              <q-item clickable v-close-popup :to="{ name: 'account' }">
                <q-item-section avatar>
                  <Settings :size="24" aria-hidden="true" />
                </q-item-section>
                <q-item-section>Account</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <LogOut :size="24" aria-hidden="true" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="isAuthenticated"
      id="side-nav"
      :model-value="isDesktop"
      side="left"
      :behavior="isDesktop ? 'desktop' : 'mobile'"
      :mini="drawerMini"
      :mini-width="64"
      :width="200"
      class="side-nav"
    >
      <q-list>
        <q-item
          clickable
          :to="{ name: 'my-characters' }"
          :class="{ 'nav-item--active': activeNavTab === 'my-characters' }"
        >
          <q-item-section avatar>
            <User :size="20" aria-hidden="true" />
          </q-item-section>
          <q-item-section>Characters</q-item-section>
        </q-item>
        <q-item
          clickable
          :to="{ name: 'campaigns' }"
          :class="{ 'nav-item--active': activeNavTab === 'campaigns' }"
        >
          <q-item-section avatar>
            <Swords :size="20" aria-hidden="true" />
          </q-item-section>
          <q-item-section>Campaigns</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <main>
        <router-view />
      </main>
    </q-page-container>

    <q-footer v-if="isAuthenticated && !isDesktop" elevated class="bottom-nav-footer">
      <q-tabs
        :model-value="activeNavTab"
        dense
        active-color="primary"
        indicator-color="primary"
        class="bottom-nav"
      >
        <q-tab name="my-characters" :to="{ name: 'my-characters' }">
          <User :size="20" class="q-tab__icon" aria-hidden="true" />
          <div class="q-tab__label">Characters</div>
        </q-tab>
        <q-tab name="campaigns" :to="{ name: 'campaigns' }">
          <Swords :size="20" class="q-tab__icon" aria-hidden="true" />
          <div class="q-tab__label">Campaigns</div>
        </q-tab>
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  SunMoon,
  CircleUserRound,
  LogOut,
  Settings,
  User,
  Swords,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';
import { usePageTitle } from 'src/composables/usePageTitle';

const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const username = computed(() => authStore.username || 'User');
const drawerMini = ref(false);
const isDesktop = computed(() => $q.screen.gt.sm);

const { dynamicTitle, clearPageTitle } = usePageTitle();

watch(route, () => clearPageTitle());

const pageTitle = computed(() => {
  return dynamicTitle.value || (route.meta?.title as string) || 'Cosmere RPG';
});

const campaignRoutes = new Set([
  'campaigns',
  'campaign-detail',
  'campaign-create',
  'campaign-edit',
  'join-campaign',
  'combat-detail',
  'npc-detail',
]);

const activeNavTab = computed(() => {
  const name = route.name as string;
  if (name === 'account') return null;
  return campaignRoutes.has(name) ? 'campaigns' : 'my-characters';
});

function toggleDarkMode(): void {
  $q.dark.toggle();
  try {
    localStorage.setItem('darkMode', $q.dark.isActive ? 'true' : 'false');
  } catch {
    // localStorage may be unavailable (SSR, private browsing, etc.)
  }
}

async function logout(): Promise<void> {
  await authStore.logout();
}
</script>

<style scoped>
.app-header {
  background: var(--cosmere-navy-deep);
  color: var(--cosmere-text-light);
  border-bottom: 1px solid var(--cosmere-gold-muted);
}

body:not(.body--dark) .app-header {
  background: var(--cosmere-gold-muted);
  color: white;
  border-bottom: none;
}

.account-menu {
  min-width: 150px;
}

.bottom-nav-footer {
  background: var(--cosmere-navy-deep);
  color: var(--cosmere-text-light);
  border-top: 1px solid var(--cosmere-gold-muted);
}

body:not(.body--dark) .bottom-nav-footer {
  background: var(--cosmere-parchment-light);
  color: var(--cosmere-text-dark);
  border-top: 1px solid var(--app-border);
}

.nav-item--active {
  color: var(--cosmere-gold);
  background: rgba(201, 168, 76, 0.1);
}
</style>
