<template>
  <q-page class="flex flex-center">
    <q-card class="forgot-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Cosmere RPG</div>
        <div class="text-subtitle2">Reset Password</div>
      </q-card-section>

      <q-card-section v-if="submitted" class="text-center q-pa-lg">
        <q-icon name="mark_email_read" size="48px" color="positive" aria-hidden="true" />
        <div class="text-h6 q-mt-sm">Check your email</div>
        <div class="text-body2 q-mt-sm">
          If an account with that email exists, we've sent a password reset link.
        </div>
      </q-card-section>

      <q-card-section v-else>
        <div class="text-body2 q-mb-md">
          Enter your email address and we'll send you a link to reset your password.
        </div>
        <q-form @submit="handleSubmit" class="q-gutter-y-md">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            outlined
            autocomplete="email"
            :rules="[
              (val) => !!val || 'Email is required',
              (val) => /.+@.+\..+/.test(val) || 'Enter a valid email address',
            ]"
          />

          <q-btn
            type="submit"
            label="Send Reset Link"
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
        <router-link :to="{ name: 'login' }" class="text-primary">Back to Login</router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import authService from 'src/services/auth';
import axios from 'axios';

const email = ref('');
const loading = ref(false);
const submitted = ref(false);
const error = ref<string | null>(null);

async function handleSubmit(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    await authService.forgotPassword(email.value);
    submitted.value = true;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      if (status === 429) {
        error.value = 'Too many requests. Please try again later.';
      } else {
        const msg = (err.response.data as { error?: string })?.error;
        error.value = msg || 'Something went wrong. Please try again.';
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
.forgot-card {
  width: 100%;
  max-width: 400px;
}
</style>
