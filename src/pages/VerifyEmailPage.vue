<template>
  <q-page class="flex flex-center">
    <q-card class="verify-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Cosmere RPG</div>
        <div class="text-subtitle2">Email Verification</div>
      </q-card-section>

      <q-card-section class="text-center q-pa-lg">
        <q-spinner-dots
          v-if="loading"
          size="40px"
          color="primary"
          role="status"
          aria-label="Verifying email"
        />

        <div v-else-if="success" class="text-positive">
          <q-icon name="check_circle" size="48px" class="q-mb-sm" aria-hidden="true" />
          <div class="text-h6">Email verified</div>
          <div class="text-body2 q-mt-sm">Your email has been successfully verified.</div>
        </div>

        <div v-else class="text-negative">
          <q-icon name="error" size="48px" class="q-mb-sm" aria-hidden="true" />
          <div class="text-h6">Verification failed</div>
          <div class="text-body2 q-mt-sm">{{ errorMessage }}</div>
        </div>
      </q-card-section>

      <q-card-section v-if="!loading" class="text-center">
        <q-btn :label="ctaLabel" color="primary" :to="{ name: ctaRoute }" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authService from 'src/services/auth';
import { refreshToken } from 'src/services/tokenRefresh';
import { useAuthStore } from 'stores/auth';
import { extractQueryParam } from 'src/utils/routeUtils';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const success = ref(false);
const errorMessage = ref('');

const ctaLabel = computed(() => {
  if (success.value) return 'Continue';
  return authStore.isAuthenticated ? 'Go to Account' : 'Go to Login';
});

const ctaRoute = computed(() => {
  if (success.value) return 'my-characters';
  return authStore.isAuthenticated ? 'account' : 'login';
});

onMounted(async () => {
  const token = extractQueryParam(route.query, 'token');

  if (!token) {
    loading.value = false;
    errorMessage.value = 'No verification token provided.';
    return;
  }

  // Remove token from URL so it doesn't persist in browser history
  const remainingQuery = Object.fromEntries(
    Object.entries(route.query).filter(([key]) => key !== 'token')
  );
  void router.replace({ query: remainingQuery });

  try {
    await authService.verifyEmail(token);
    success.value = true;
    const refreshed = await refreshToken();
    if (refreshed) {
      await authStore.checkAuthStatus();
    }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const msg = (err.response.data as { error?: string })?.error;
      errorMessage.value = msg || 'Invalid or expired verification token.';
    } else {
      errorMessage.value = 'Unable to connect. Please try again.';
    }
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.verify-card {
  width: 100%;
  max-width: 400px;
}
</style>
