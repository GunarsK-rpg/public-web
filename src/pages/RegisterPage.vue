<template>
  <q-page class="flex flex-center">
    <q-card class="register-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Cosmere RPG</div>
        <div class="text-subtitle2">Create Account</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleRegister" class="q-gutter-y-md">
          <q-input
            v-model="username"
            label="Username"
            outlined
            autocomplete="username"
            :rules="[
              (val) => !!val || 'Username is required',
              (val) => val.length >= 3 || 'Username must be at least 3 characters',
              (val) => val.length <= 50 || 'Username must be at most 50 characters',
            ]"
          />

          <q-input
            v-model="email"
            label="Email"
            type="email"
            outlined
            autocomplete="email"
            :rules="[
              (val) => !!val || 'Email is required',
              (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Enter a valid email address',
              (val) => val.length <= 100 || 'Email must be at most 100 characters',
            ]"
          />

          <q-input
            v-model="password"
            label="Password"
            type="password"
            outlined
            autocomplete="new-password"
            :rules="[
              (val) => !!val || 'Password is required',
              (val) => val.length >= 8 || 'Password must be at least 8 characters',
              (val) => val.length <= 72 || 'Password must be at most 72 characters',
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
              (val) => val === password || 'Passwords do not match',
            ]"
          />

          <q-btn
            type="submit"
            label="Register"
            color="primary"
            class="full-width q-mt-md"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section v-if="error" class="text-negative" role="alert" aria-live="polite">
        {{ error }}
      </q-card-section>

      <q-card-section class="text-center">
        Already have an account?
        <router-link :to="{ name: 'login' }" class="text-primary">Login</router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import authService from 'src/services/auth';

const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

async function handleRegister(): Promise<void> {
  if (loading.value) return;
  loading.value = true;
  error.value = null;

  try {
    await authService.register({
      username: username.value,
      email: email.value,
      password: password.value,
    });

    void router.push({ name: 'login', query: { registered: '1' } });
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      const serverMessage = (err.response.data as { error?: string })?.error;

      switch (status) {
        case 409:
          error.value = 'Username or email is already taken.';
          break;
        case 400:
          error.value =
            typeof serverMessage === 'string' && serverMessage.trim()
              ? serverMessage.trim().slice(0, 200)
              : 'Invalid input. Please check your fields.';
          break;
        case 403:
          error.value = 'Registration is not available at this time.';
          break;
        default:
          error.value = 'Registration failed. Please try again later.';
      }
    } else {
      error.value = 'Unable to connect. Please check your connection and try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-card {
  width: 100%;
  max-width: 400px;
}
</style>
