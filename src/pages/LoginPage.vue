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
        <q-form @submit="handleLogin" class="q-gutter-y-md">
          <q-input
            v-model="identifier"
            label="Username or Email"
            outlined
            autocomplete="username"
            :rules="[(val) => !!val || 'Username or email is required']"
          />

          <q-input
            v-model="password"
            label="Password"
            type="password"
            outlined
            autocomplete="current-password"
            :rules="[(val) => !!val || 'Password is required']"
          />

          <div class="text-right">
            <router-link :to="{ name: 'forgot-password' }" class="text-primary text-caption">
              Forgot password?
            </router-link>
          </div>

          <q-checkbox v-model="rememberMe" label="Remember me" class="q-mt-sm" />

          <q-btn
            type="submit"
            label="Login"
            color="primary"
            class="full-width q-mt-md"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <q-separator class="q-mb-md" />
        <GoogleSignInButton
          :remember-me="rememberMe"
          v-bind="redirectParam ? { redirect: redirectParam } : {}"
          @error="(msg) => (error = msg)"
        />
      </q-card-section>

      <q-card-section v-if="error" class="text-negative" role="alert" aria-live="polite">
        {{ error }}
      </q-card-section>

      <q-card-section class="text-center">
        Don't have an account?
        <router-link :to="{ name: 'register' }" class="text-primary">Register</router-link>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <router-link :to="{ name: 'privacy-policy' }" class="text-grey-6 text-caption">
          Privacy Policy
        </router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import GoogleSignInButton from 'src/components/auth/GoogleSignInButton.vue';
import { extractQueryParam, isValidRedirect } from 'src/utils/routeUtils';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const identifier = ref('');
const password = ref('');
const rememberMe = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const registered = computed(() => route.query.registered === '1');
const redirectParam = computed(() => extractQueryParam(route.query, 'redirect'));

async function handleLogin(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    const success = await authStore.login(identifier.value, password.value, rememberMe.value);

    if (success) {
      const safeRedirect =
        redirectParam.value && isValidRedirect(redirectParam.value) ? redirectParam.value : '/';
      void router.push(safeRedirect);
    } else {
      error.value = 'Invalid credentials';
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
