<template>
  <q-btn
    outline
    no-caps
    class="full-width google-btn"
    :loading="loading"
    @click="handleGoogleLogin"
  >
    <svg class="q-mr-sm" width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
    Sign in with Google
  </q-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import authService, { OAUTH_REMEMBER_ME_KEY, OAUTH_REDIRECT_KEY } from 'src/services/auth';

const props = defineProps<{
  rememberMe?: boolean;
  redirect?: string;
}>();

const loading = ref(false);
const emit = defineEmits<{
  error: [message: string];
}>();

async function handleGoogleLogin(): Promise<void> {
  loading.value = true;
  try {
    sessionStorage.setItem(OAUTH_REMEMBER_ME_KEY, String(!!props.rememberMe));
    if (props.redirect) {
      sessionStorage.setItem(OAUTH_REDIRECT_KEY, props.redirect);
    }
    const response = await authService.googleLogin();
    const url = new URL(response.data.url);
    const allowedHosts = ['accounts.google.com', 'oauth2.googleapis.com'];
    if (url.protocol !== 'https:' || !allowedHosts.includes(url.hostname)) {
      throw new Error('Invalid OAuth URL');
    }
    window.location.href = response.data.url;
  } catch {
    sessionStorage.removeItem(OAUTH_REMEMBER_ME_KEY);
    sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
    emit('error', 'Unable to connect to Google. Please try again.');
    loading.value = false;
  }
}
</script>

<style scoped>
.google-btn {
  border-color: #dadce0;
  color: #3c4043;
  background: white;
  font-weight: 500;
}

.google-btn:hover {
  background: #f7f8f8;
  border-color: #dadce0;
}

.body--dark .google-btn {
  border-color: #5f6368;
  color: #e8eaed;
  background: #202124;
}

.body--dark .google-btn:hover {
  background: #303134;
}
</style>
