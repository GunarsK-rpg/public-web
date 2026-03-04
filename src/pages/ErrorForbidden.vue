<template>
  <q-page class="error-page flex flex-center">
    <div class="text-center">
      <Lock :size="120" class="text-negative" aria-hidden="true" />

      <div class="q-mt-lg" role="status" aria-live="polite">
        <h1 class="error-code text-negative">403</h1>
        <h2 class="error-title">Access Forbidden</h2>
        <p class="error-message text-grey-7">You don't have permission to access this resource.</p>
      </div>

      <q-btn class="q-mt-xl" color="primary" unelevated to="/" no-caps>
        <Home :size="20" class="on-left" aria-hidden="true" />Back to Home
      </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Lock, Home } from 'lucide-vue-next';
// Styles in src/css/app.scss (.error-page, .error-code, .error-title, .error-message)
</script>
