<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          v-if="showBackButton"
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
            <q-list style="min-width: 150px">
              <q-item-label header>{{ username }}</q-item-label>
              <q-separator />
              <q-item clickable v-close-popup @click="goToCampaigns">
                <q-item-section avatar>
                  <q-icon name="list" />
                </q-item-section>
                <q-item-section>Campaigns</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';

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

function goToCampaigns(): void {
  void router.push({ name: 'campaigns' });
}

function logout(): void {
  authStore.logout();
  void router.push({ name: 'login' });
}

// Initialize dark mode from storage
try {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === 'true') {
    $q.dark.set(true);
  } else if (savedDarkMode === 'false') {
    $q.dark.set(false);
  }
} catch {
  // localStorage may be unavailable (SSR, private browsing, etc.)
}
</script>
