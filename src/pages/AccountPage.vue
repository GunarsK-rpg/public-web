<template>
  <q-page class="q-pa-md">
    <div class="account-container">
      <div class="text-h5 q-mb-lg">Account Settings</div>

      <!-- Profile Section -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Profile</div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-y-md">
            <div>
              <div class="text-caption text-grey">Username</div>
              <div class="text-body1">{{ authStore.username }}</div>
            </div>

            <div>
              <div class="text-caption text-grey">Email</div>
              <div class="row items-center q-gutter-x-sm">
                <span class="text-body1">{{ authStore.email }}</span>
                <q-badge
                  :color="authStore.emailVerified ? 'positive' : 'warning'"
                  :label="authStore.emailVerified ? 'Verified' : 'Unverified'"
                />
              </div>
            </div>

            <q-btn
              v-if="!authStore.emailVerified"
              label="Send Verification Email"
              color="primary"
              outline
              :loading="verifyLoading"
              @click="handleSendVerification"
            />

            <div v-if="verifyMessage" :class="verifyError ? 'text-negative' : 'text-positive'">
              {{ verifyMessage }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Edit Profile Section -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Edit Profile</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleUpdateProfile" class="q-gutter-y-md">
            <q-input
              v-model="profileEmail"
              label="Email"
              type="email"
              outlined
              :rules="[
                (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Enter a valid email',
                (val) => !val || val.length <= 100 || 'Email must be at most 100 characters',
              ]"
            />

            <q-input
              v-model="profileDisplayName"
              label="Display Name"
              outlined
              :rules="[
                (val) => !val || val.length <= 100 || 'Display name must be at most 100 characters',
              ]"
            />

            <q-btn
              type="submit"
              label="Save Changes"
              color="primary"
              :loading="profileLoading"
              :disable="
                profileEmail === authStore.email && profileDisplayName === authStore.displayName
              "
            />

            <div v-if="profileMessage" :class="profileError ? 'text-negative' : 'text-positive'">
              {{ profileMessage }}
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Security Section -->
      <q-card>
        <q-card-section>
          <div class="text-h6">Change Password</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleChangePassword" class="q-gutter-y-md">
            <q-input
              v-model="currentPassword"
              label="Current Password"
              type="password"
              outlined
              autocomplete="current-password"
              :rules="[(val) => !!val || 'Current password is required']"
            />

            <q-input
              v-model="newPassword"
              label="New Password"
              type="password"
              outlined
              autocomplete="new-password"
              :rules="[
                (val) => !!val || 'New password is required',
                (val) => val.length >= 8 || 'Password must be at least 8 characters',
                (val) => val.length <= 72 || 'Password must be at most 72 characters',
              ]"
            />

            <q-input
              v-model="confirmNewPassword"
              label="Confirm New Password"
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
              label="Change Password"
              color="primary"
              :loading="passwordLoading"
            />

            <div v-if="passwordMessage" :class="passwordError ? 'text-negative' : 'text-positive'">
              {{ passwordMessage }}
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth';
import authService from 'src/services/auth';
import { refreshToken } from 'src/services/tokenRefresh';
import axios from 'axios';

const authStore = useAuthStore();

// Verification
const verifyLoading = ref(false);
const verifyMessage = ref('');
const verifyError = ref(false);

async function handleSendVerification(): Promise<void> {
  verifyLoading.value = true;
  verifyMessage.value = '';
  verifyError.value = false;

  try {
    await authService.sendVerification();
    verifyMessage.value = 'Verification email sent. Check your inbox.';
  } catch (err) {
    verifyError.value = true;
    if (axios.isAxiosError(err) && err.response) {
      const msg = (err.response.data as { error?: string })?.error;
      verifyMessage.value = msg || 'Failed to send verification email.';
    } else {
      verifyMessage.value = 'Unable to connect. Please try again.';
    }
  } finally {
    verifyLoading.value = false;
  }
}

// Profile update
const profileEmail = ref(authStore.email);
const profileDisplayName = ref(authStore.displayName);
const profileLoading = ref(false);
const profileMessage = ref('');
const profileError = ref(false);

async function handleUpdateProfile(): Promise<void> {
  profileLoading.value = true;
  profileMessage.value = '';
  profileError.value = false;

  const data: { email?: string; display_name?: string } = {};
  if (profileEmail.value !== authStore.email) data.email = profileEmail.value;
  if (profileDisplayName.value !== authStore.displayName)
    data.display_name = profileDisplayName.value;

  try {
    await authService.updateProfile(data);
    profileMessage.value = 'Profile updated.';
    if (data.email) {
      profileMessage.value += ' Email verification has been reset.';
    }
    // Force new JWT with updated claims, then refresh store
    await refreshToken();
    await authStore.checkAuthStatus();
    profileEmail.value = authStore.email;
    profileDisplayName.value = authStore.displayName;
  } catch (err) {
    profileError.value = true;
    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      const msg = (err.response.data as { error?: string })?.error;
      if (status === 409) {
        profileMessage.value = 'Email is already in use.';
      } else {
        profileMessage.value = msg || 'Failed to update profile.';
      }
    } else {
      profileMessage.value = 'Unable to connect. Please try again.';
    }
  } finally {
    profileLoading.value = false;
  }
}

// Change password
const currentPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const passwordLoading = ref(false);
const passwordMessage = ref('');
const passwordError = ref(false);

async function handleChangePassword(): Promise<void> {
  passwordLoading.value = true;
  passwordMessage.value = '';
  passwordError.value = false;

  try {
    await authService.changePassword(currentPassword.value, newPassword.value);
    passwordMessage.value = 'Password changed. You will be logged out.';
    currentPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
    // Sessions are invalidated server-side, logout locally
    setTimeout(() => void authStore.logout(), 2000);
  } catch (err) {
    passwordError.value = true;
    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      const msg = (err.response.data as { error?: string })?.error;
      if (status === 401) {
        passwordMessage.value = 'Current password is incorrect.';
      } else {
        passwordMessage.value = msg || 'Failed to change password.';
      }
    } else {
      passwordMessage.value = 'Unable to connect. Please try again.';
    }
  } finally {
    passwordLoading.value = false;
  }
}
</script>

<style scoped>
.account-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
