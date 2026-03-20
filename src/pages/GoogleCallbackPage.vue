<template>
  <q-page class="flex flex-center">
    <q-card class="callback-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Cosmere RPG</div>
        <div class="text-subtitle2">Signing in with Google</div>
      </q-card-section>

      <q-card-section class="text-center q-pa-lg">
        <q-spinner-dots
          v-if="loading"
          size="40px"
          color="primary"
          role="status"
          aria-label="Completing sign in"
        />

        <div v-else class="text-negative" role="alert" aria-live="assertive">
          <q-icon name="error" size="48px" class="q-mb-sm" aria-hidden="true" />
          <div class="text-h6">Sign in failed</div>
          <div class="text-body2 q-mt-sm">{{ errorMessage }}</div>
        </div>
      </q-card-section>

      <q-card-section v-if="!loading" class="text-center">
        <q-btn label="Back to Login" color="primary" :to="{ name: 'login' }" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { extractQueryParam } from 'src/utils/routeUtils';
import { OAUTH_REMEMBER_ME_KEY, OAUTH_REDIRECT_KEY } from 'src/services/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const errorMessage = ref('');

onMounted(async () => {
  const code = extractQueryParam(route.query, 'code');
  const state = extractQueryParam(route.query, 'state');

  if (!code || !state) {
    loading.value = false;
    errorMessage.value = 'Missing authorization parameters.';
    return;
  }

  const rememberMe = sessionStorage.getItem(OAUTH_REMEMBER_ME_KEY) === 'true';
  const redirect = sessionStorage.getItem(OAUTH_REDIRECT_KEY);
  sessionStorage.removeItem(OAUTH_REMEMBER_ME_KEY);
  sessionStorage.removeItem(OAUTH_REDIRECT_KEY);

  const success = await authStore.googleCallback(code, state, rememberMe);

  if (success) {
    void router.push(redirect || '/');
  } else {
    loading.value = false;
    errorMessage.value = 'Unable to sign in with Google. Please try again.';
  }
});
</script>

<style scoped>
.callback-card {
  width: 100%;
  max-width: 400px;
}
</style>
