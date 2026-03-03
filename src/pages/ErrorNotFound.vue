<template>
  <q-page class="error-page flex flex-center">
    <div class="text-center">
      <CircleAlert :size="120" class="text-negative" aria-hidden="true" />

      <div class="q-mt-lg" role="status" aria-live="polite">
        <h1 class="error-code text-negative">404</h1>
        <h2 class="error-title">Page Not Found</h2>
        <p class="error-message text-grey-7">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <q-btn class="q-mt-xl" color="primary" unelevated to="/" no-caps>
        <Home :size="20" class="on-left" />Back to Home
      </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { CircleAlert, Home } from 'lucide-vue-next';
// Styles in src/css/app.scss (.error-page, .error-code, .error-title, .error-message)
</script>
