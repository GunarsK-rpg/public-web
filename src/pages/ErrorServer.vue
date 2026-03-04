<template>
  <q-page class="error-page flex flex-center">
    <div class="text-center">
      <CloudOff :size="120" class="text-negative" aria-hidden="true" />

      <div class="q-mt-lg" role="alert" aria-live="assertive">
        <h1 class="error-code text-negative">500</h1>
        <h2 class="error-title">Server Error</h2>
        <p class="error-message text-grey-7">
          Something went wrong on our end. Please try again later.
        </p>
      </div>

      <div class="q-mt-xl q-gutter-sm">
        <q-btn color="primary" unelevated no-caps @click="retry">
          <RefreshCw :size="20" class="on-left" />Try Again
        </q-btn>
        <q-btn color="primary" outline to="/" no-caps>
          <Home :size="20" class="on-left" />Back to Home
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { CloudOff, RefreshCw, Home } from 'lucide-vue-next';

const router = useRouter();

function retry(): void {
  // Navigate back instead of reloading to avoid infinite refresh loops
  // when the server error is persistent. If no history, go home.
  // SSR-safe: check window exists before accessing history
  const hasHistory = typeof window !== 'undefined' && window.history.length > 1;
  if (hasHistory) {
    router.back();
  } else {
    void router.push('/');
  }
}
// Styles in src/css/app.scss (.error-page, .error-code, .error-title, .error-message)
</script>
