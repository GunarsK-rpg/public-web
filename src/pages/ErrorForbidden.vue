<template>
  <q-page class="error-page flex flex-center">
    <div class="text-center">
      <q-icon name="sym_o_lock" size="120px" color="negative" aria-hidden="true" />

      <div class="q-mt-lg" role="status" aria-live="polite">
        <h1 class="error-code text-negative">403</h1>
        <h2 class="error-title">Access Forbidden</h2>
        <p class="error-message text-grey-7">You don't have permission to access this resource.</p>
      </div>

      <q-btn
        class="q-mt-xl"
        color="primary"
        unelevated
        to="/"
        icon="sym_o_home"
        label="Back to Home"
        no-caps
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Styles in src/css/app.scss (.error-page, .error-code, .error-title, .error-message)
</script>
