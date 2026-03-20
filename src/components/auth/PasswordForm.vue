<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">{{ title }}</div>
      <div v-if="subtitle" class="text-caption text-grey q-mt-xs">
        {{ subtitle }}
      </div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="handleSubmit" class="q-gutter-y-md">
        <q-input
          v-if="requireCurrentPassword"
          v-model="currentPassword"
          label="Current Password"
          type="password"
          outlined
          autocomplete="current-password"
          :rules="[(val) => !!val || 'Current password is required']"
        />

        <q-input
          v-model="newPassword"
          :label="requireCurrentPassword ? 'New Password' : 'Password'"
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
          :label="requireCurrentPassword ? 'Confirm New Password' : 'Confirm Password'"
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
          :label="submitLabel"
          color="primary"
          :loading="loading"
          :disable="loading"
        />

        <div
          v-if="message"
          :class="isError ? 'text-negative' : 'text-positive'"
          :role="isError ? 'alert' : 'status'"
          :aria-live="isError ? 'assertive' : 'polite'"
          aria-atomic="true"
        >
          {{ message }}
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  title: string;
  submitLabel: string;
  requireCurrentPassword: boolean;
  subtitle?: string;
}>();

const emit = defineEmits<{
  submit: [payload: { currentPassword: string; newPassword: string }];
}>();

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const message = ref('');
const isError = ref(false);

function setResult(msg: string, error: boolean): void {
  message.value = msg;
  isError.value = error;
}

function setLoading(value: boolean): void {
  loading.value = value;
}

function clearFields(): void {
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
}

function handleSubmit(): void {
  if (loading.value) return;
  emit('submit', {
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
  });
}

defineExpose({ setResult, setLoading, clearFields });
</script>
