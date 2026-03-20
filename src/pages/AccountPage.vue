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

            <div
              v-if="verifyMessage"
              :class="verifyError ? 'text-negative' : 'text-positive'"
              :role="verifyError ? 'alert' : 'status'"
              :aria-live="verifyError ? 'assertive' : 'polite'"
              aria-atomic="true"
            >
              {{ verifyMessage }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Linked Accounts Section -->
      <q-card v-if="authMethodsLoaded && !authMethodsError" class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Linked Accounts</div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-y-sm">
            <div class="row items-center q-gutter-x-sm">
              <span class="text-body1">Google</span>
              <q-badge
                :color="hasGoogle ? 'positive' : 'grey'"
                :label="hasGoogle ? 'Linked' : 'Not linked'"
              />
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
          <q-form @submit.prevent="handleUpdateProfile" class="q-gutter-y-md">
            <q-input
              v-if="authMethodsLoaded && hasPassword"
              v-model="profileEmail"
              label="Email"
              type="email"
              outlined
              :rules="[
                (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Enter a valid email',
                (val) => !val || val.length <= 100 || 'Email must be at most 100 characters',
              ]"
            />

            <div v-if="authMethodsLoaded && !hasPassword" class="text-caption text-grey">
              Email cannot be changed for accounts without a password.
            </div>

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
              :disable="!profileHasChanges"
            />

            <div
              v-if="profileMessage"
              :class="profileError ? 'text-negative' : 'text-positive'"
              :role="profileError ? 'alert' : 'status'"
              :aria-live="profileError ? 'assertive' : 'polite'"
              aria-atomic="true"
            >
              {{ profileMessage }}
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Set Password Section (OAuth-only users) -->
      <PasswordForm
        v-if="authMethodsLoaded && !authMethodsError && !hasPassword"
        ref="setPasswordForm"
        title="Set Password"
        subtitle="Add a password to enable email/password login and email changes."
        submit-label="Set Password"
        :require-current-password="false"
        @submit="handleSetPassword"
      />

      <!-- Change Password Section (users with password) -->
      <PasswordForm
        v-if="authMethodsLoaded && (authMethodsError || hasPassword)"
        ref="changePasswordForm"
        title="Change Password"
        submit-label="Change Password"
        :require-current-password="true"
        @submit="handleChangePassword"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from 'stores/auth';
import authService from 'src/services/auth';
import { refreshToken } from 'src/services/tokenRefresh';
import axios from 'axios';
import PasswordForm from 'src/components/auth/PasswordForm.vue';

const authStore = useAuthStore();

// Auth methods
const authMethodsLoaded = ref(false);
const authMethodsError = ref(false);
const hasPassword = ref(true);
const providers = ref<string[]>([]);
const hasGoogle = computed(() => providers.value.includes('google'));

onMounted(async () => {
  try {
    const response = await authService.getAuthMethods();
    hasPassword.value = response.data.has_password;
    providers.value = response.data.providers;
  } catch {
    authMethodsError.value = true;
  } finally {
    authMethodsLoaded.value = true;
  }
});

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
const trimmedEmail = computed(() => profileEmail.value.trim());
const trimmedDisplayName = computed(() => profileDisplayName.value.trim());
const profileHasChanges = computed(() => {
  if (hasPassword.value && trimmedEmail.value !== authStore.email) return true;
  return trimmedDisplayName.value !== authStore.displayName;
});
const profileLoading = ref(false);
const profileMessage = ref('');
const profileError = ref(false);

async function handleUpdateProfile(): Promise<void> {
  profileLoading.value = true;
  profileMessage.value = '';
  profileError.value = false;

  const data: { email?: string; display_name?: string } = {};
  if (hasPassword.value && trimmedEmail.value !== authStore.email) data.email = trimmedEmail.value;
  if (trimmedDisplayName.value !== authStore.displayName)
    data.display_name = trimmedDisplayName.value;

  if (Object.keys(data).length === 0) {
    profileLoading.value = false;
    return;
  }

  try {
    await authService.updateProfile(data);
    profileMessage.value = 'Profile updated.';
    if (data.email) {
      profileMessage.value += ' Email verification has been reset.';
    }
    // Force new JWT with updated claims, then refresh store
    const refreshed = await refreshToken();
    if (refreshed) {
      await authStore.checkAuthStatus();
      profileEmail.value = authStore.email;
      profileDisplayName.value = authStore.displayName;
    }
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

// Password forms
const setPasswordForm = ref<InstanceType<typeof PasswordForm>>();
const changePasswordForm = ref<InstanceType<typeof PasswordForm>>();

async function handleChangePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const form = changePasswordForm.value;
  if (!form) return;
  form.setLoading(true);

  try {
    await authService.changePassword(payload.currentPassword, payload.newPassword);
    form.setResult('Password changed. You will be logged out.', false);
    form.clearFields();
    setTimeout(() => void authStore.logout(), 2000);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      const msg = (err.response.data as { error?: string })?.error;
      if (status === 401) {
        form.setResult('Current password is incorrect.', true);
      } else {
        form.setResult(msg || 'Failed to change password.', true);
      }
    } else {
      form.setResult('Unable to connect. Please try again.', true);
    }
  } finally {
    form.setLoading(false);
  }
}

async function handleSetPassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const form = setPasswordForm.value;
  if (!form) return;
  form.setLoading(true);

  try {
    await authService.setPassword(payload.newPassword, payload.newPassword);
    form.setResult('Password set. You can now log in with email and password.', false);
    form.clearFields();
    setTimeout(() => {
      hasPassword.value = true;
    }, 3000);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const msg = (err.response.data as { error?: string })?.error;
      form.setResult(msg || 'Failed to set password.', true);
    } else {
      form.setResult('Unable to connect. Please try again.', true);
    }
  } finally {
    form.setLoading(false);
  }
}
</script>

<style scoped>
.account-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
