<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
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

    <q-footer v-if="isAuthenticated" elevated class="bg-white text-grey-8">
      <q-tabs
        v-model="activeNavTab"
        dense
        active-color="primary"
        indicator-color="primary"
        class="bottom-nav"
      >
        <q-tab
          name="campaigns"
          icon="sym_o_swords"
          label="Campaigns"
          @click="navigateTo('campaigns')"
        />
        <q-tab
          name="my-characters"
          icon="sym_o_person"
          label="Characters"
          @click="navigateTo('my-characters')"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute, isNavigationFailure, NavigationFailureType } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';
import { logger } from 'src/utils/logger';
import { toError } from 'src/utils/errorHandling';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const username = computed(() => authStore.username || 'User');

const pageTitle = computed(() => {
  return (route.meta?.title as string) || 'Cosmere RPG';
});

const characterRoutes = new Set([
  'my-characters',
  'character-sheet',
  'character-create',
  'character-edit',
]);

const activeNavTab = computed(() => {
  return characterRoutes.has(route.name as string) ? 'my-characters' : 'campaigns';
});

function toggleDarkMode(): void {
  $q.dark.toggle();
  try {
    localStorage.setItem('darkMode', $q.dark.isActive ? 'true' : 'false');
  } catch {
    // localStorage may be unavailable (SSR, private browsing, etc.)
  }
}

async function navigateTo(routeName: string): Promise<void> {
  try {
    await router.push({ name: routeName });
  } catch (err) {
    if (
      !isNavigationFailure(err, NavigationFailureType.duplicated | NavigationFailureType.cancelled)
    ) {
      logger.warn('Navigation failed', { error: toError(err).message });
    }
  }
}

async function logout(): Promise<void> {
  await authStore.logout();
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
    logger.debug('localStorage unavailable for dark mode', { error: toError(err).message });
  }
});
</script>

<style scoped>
.account-menu {
  min-width: 150px;
}

.body--dark .bottom-nav {
  background: var(--q-dark);
}
</style>
