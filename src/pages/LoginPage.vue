<template>
  <q-page class="flex flex-center">
    <q-card class="login-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Cosmere RPG</div>
        <div class="text-subtitle2">Character Sheet Manager</div>
      </q-card-section>

      <q-card-section v-if="registered" class="bg-positive text-white" role="status">
        Registration successful. Please log in.
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleLogin" class="q-gutter-md">
          <q-input
            v-model="username"
            label="Username"
            outlined
            autocomplete="username"
            :rules="[(val) => !!val || 'Username is required']"
          />

          <q-input
            v-model="password"
            label="Password"
            type="password"
            outlined
            autocomplete="current-password"
            :rules="[(val) => !!val || 'Password is required']"
          />

          <q-btn
            type="submit"
            label="Login"
            color="primary"
            class="full-width"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section v-if="error" class="text-negative" role="alert" aria-live="polite">
        {{ error }}
      </q-card-section>

      <q-card-section class="text-center">
        Don't have an account?
        <router-link :to="{ name: 'register' }" class="text-primary">Register</router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const registered = computed(() => route.query.registered === '1');

/**
 * Validates that redirect URL is safe (relative path only)
 */
function isValidRedirect(url: string): boolean {
  // Normalize backslashes to forward slashes (browsers may interpret \ as /)
  const normalized = url.replace(/\\/g, '/');

  // Only allow relative paths starting with single /
  if (!normalized.startsWith('/')) return false;

  // Reject protocol-relative URLs (//example.com)
  if (normalized.startsWith('//')) return false;

  // Reject any URL containing : before / (protocol schemes like javascript:, data:, etc.)
  const colonIndex = normalized.indexOf(':');
  const slashIndex = normalized.indexOf('/', 1);
  if (colonIndex !== -1 && (slashIndex === -1 || colonIndex < slashIndex)) return false;

  // Reject URLs with @ which could be used for credential injection (http://evil.com@target.com)
  if (normalized.includes('@')) return false;

  // Reject encoded characters that could bypass validation (%2F, %3A, etc.)
  if (/%[0-9a-fA-F]{2}/.test(url)) return false;

  return true;
}

async function handleLogin(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    const success = await authStore.login(username.value, password.value);

    if (success) {
      const redirect = route.query.redirect as string;
      const safeRedirect = redirect && isValidRedirect(redirect) ? redirect : '/';
      void router.push(safeRedirect);
    } else {
      error.value = 'Invalid username or password';
    }
  } catch {
    // Handle network errors or unexpected failures (don't log error object in production)
    error.value = 'Unable to connect. Please check your connection and try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 400px;
}
</style>
