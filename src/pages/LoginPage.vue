<template>
  <q-page class="flex flex-center">
    <q-card class="login-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Cosmere RPG</div>
        <div class="text-subtitle2">Character Sheet Manager</div>
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
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

/**
 * Validates that redirect URL is safe (relative path only)
 */
function isValidRedirect(url: string): boolean {
  // Only allow relative paths starting with /
  // Reject absolute URLs, protocol-relative URLs, and javascript: URLs
  if (!url.startsWith('/')) return false;
  if (url.startsWith('//')) return false;
  if (url.toLowerCase().includes('javascript:')) return false;
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
