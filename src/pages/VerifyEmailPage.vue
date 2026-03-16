<template>
  <q-page class="flex flex-center">
    <q-card class="verify-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Cosmere RPG</div>
        <div class="text-subtitle2">Email Verification</div>
      </q-card-section>

      <q-card-section class="text-center q-pa-lg">
        <q-spinner-dots v-if="loading" size="40px" color="primary" />

        <div v-else-if="success" class="text-positive">
          <q-icon name="check_circle" size="48px" class="q-mb-sm" />
          <div class="text-h6">Email verified</div>
          <div class="text-body2 q-mt-sm">Your email has been successfully verified.</div>
        </div>

        <div v-else class="text-negative">
          <q-icon name="error" size="48px" class="q-mb-sm" />
          <div class="text-h6">Verification failed</div>
          <div class="text-body2 q-mt-sm">{{ errorMessage }}</div>
        </div>
      </q-card-section>

      <q-card-section v-if="!loading" class="text-center">
        <q-btn
          :label="success ? 'Continue' : 'Go to Account'"
          color="primary"
          :to="{ name: success ? 'my-characters' : 'account' }"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import authService from 'src/services/auth';
import { refreshToken } from 'src/services/tokenRefresh';
import { useAuthStore } from 'stores/auth';
import axios from 'axios';

const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const success = ref(false);
const errorMessage = ref('');

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    loading.value = false;
    errorMessage.value = 'No verification token provided.';
    return;
  }

  try {
    await authService.verifyEmail(token);
    success.value = true;
    await refreshToken();
    await authStore.checkAuthStatus();
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
