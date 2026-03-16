<template>
  <q-page class="flex flex-center">
    <q-card class="reset-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Cosmere RPG</div>
        <div class="text-subtitle2">Set New Password</div>
      </q-card-section>

      <q-card-section v-if="success" class="text-center q-pa-lg">
        <q-icon name="check_circle" size="48px" color="positive" aria-hidden="true" />
        <div class="text-h6 q-mt-sm">Password reset</div>
        <div class="text-body2 q-mt-sm">Your password has been updated. You can now log in.</div>
      </q-card-section>

      <q-card-section v-else-if="tokenMissing" class="text-center q-pa-lg">
        <q-icon name="error" size="48px" color="negative" aria-hidden="true" />
        <div class="text-h6 q-mt-sm">Invalid link</div>
        <div class="text-body2 q-mt-sm">
          No reset token provided. Please request a new password reset.
        </div>
      </q-card-section>

      <q-card-section v-else>
        <q-form @submit="handleSubmit" class="q-gutter-y-md">
          <q-input
            v-model="newPassword"
            label="New Password"
            type="password"
            outlined
            autocomplete="new-password"
            :rules="[
              (val) => !!val || 'Password is required',
              (val) => val.length >= 8 || 'Password must be at least 8 characters',
            ]"
          />

          <q-input
            v-model="confirmPassword"
            label="Confirm Password"
            type="password"
            outlined
            autocomplete="new-password"
            :rules="[
              (val) => !!val || 'Please confirm your password',
              (val) => val === newPassword || 'Passwords do not match',
            ]"
          />

          <q-btn
            type="submit"
            label="Reset Password"
            color="primary"
            class="full-width q-mt-md"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section v-if="error" class="text-negative" role="alert" aria-live="polite">
        {{ error }}
      </q-card-section>

      <q-card-section v-if="success || tokenMissing" class="text-center">
        <q-btn
          :label="success ? 'Go to Login' : 'Request New Link'"
          color="primary"
          :to="{ name: success ? 'login' : 'forgot-password' }"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authService from 'src/services/auth';
import { extractQueryParam, removeQueryParam } from 'src/utils/routeUtils';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const success = ref(false);
const tokenMissing = ref(false);
const error = ref<string | null>(null);
let resetToken = '';

onMounted(() => {
  const token = extractQueryParam(route.query, 'token');
  if (!token) {
    tokenMissing.value = true;
    return;
  }
  resetToken = token;

  // Remove token from URL so it doesn't persist in browser history
  void router.replace({ query: removeQueryParam(route.query, 'token') });
});

async function handleSubmit(): Promise<void> {
  if (!resetToken) {
    error.value = 'Reset token is missing. Please request a new password reset link.';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await authService.resetPassword(resetToken, newPassword.value);
    success.value = true;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const msg = (err.response.data as { error?: string })?.error;
      error.value = msg || 'Password reset failed. The link may have expired.';
    } else {
      error.value = 'Unable to connect. Please check your connection and try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.reset-card {
  width: 100%;
  max-width: 400px;
}
</style>
