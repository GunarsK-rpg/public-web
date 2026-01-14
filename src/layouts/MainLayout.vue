<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          v-show="showBackButton"
          flat
          dense
          round
          icon="arrow_back"
          aria-label="Back"
          @click="goBack"
        />

        <q-toolbar-title>{{ pageTitle }}</q-toolbar-title>

        <q-btn
          flat
          dense
          round
          icon="brightness_6"
          aria-label="Toggle dark mode"
          @click="toggleDarkMode"
        >
          <q-tooltip>Toggle dark mode</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          round
          icon="account_circle"
          aria-label="Account menu"
          v-if="isAuthenticated"
        >
          <q-menu>
            <q-list class="account-menu">
              <q-item-label header>{{ username }}</q-item-label>
              <q-separator />
              <q-item clickable v-close-popup @click="goToCampaigns">
                <q-item-section avatar>
                  <q-icon name="list" aria-hidden="true" />
                </q-item-section>
                <q-item-section>Campaigns</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" aria-hidden="true" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <main>
        <router-view />
      </main>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';
import { logger } from 'src/utils/logger';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const username = computed(() => authStore.currentUser?.username || 'User');

const pageTitle = computed(() => {
  return (route.meta?.title as string) || 'Cosmere RPG';
});

const showBackButton = computed(() => {
  return route.name !== 'campaigns' && route.name !== 'login';
});

function toggleDarkMode(): void {
  $q.dark.toggle();
  try {
    localStorage.setItem('darkMode', $q.dark.isActive ? 'true' : 'false');
  } catch {
    // localStorage may be unavailable (SSR, private browsing, etc.)
  }
}

function goBack(): void {
  router.back();
}

async function goToCampaigns(): Promise<void> {
  try {
    await router.push({ name: 'campaigns' });
  } catch {
    // Navigation cancelled or duplicate navigation - ignore
  }
}

async function logout(): Promise<void> {
  authStore.logout();
  try {
    await router.push({ name: 'login' });
  } catch {
    // Navigation cancelled or duplicate navigation - ignore
  }
}

// Initialize dark mode from storage (in onMounted for SSR safety)
onMounted(() => {
  try {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      $q.dark.set(true);
    } else if (savedDarkMode === 'false') {
      $q.dark.set(false);
    }
  } catch (err) {
    // localStorage may be unavailable (private browsing, etc.)
    logger.debug('localStorage unavailable for dark mode', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
</script>

<style scoped>
.account-menu {
  min-width: 150px;
}
</style>
