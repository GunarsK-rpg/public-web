<template>
  <q-page class="error-page flex flex-center">
    <div class="text-center">
      <q-icon name="sym_o_error" size="120px" color="negative" />

      <div class="q-mt-lg">
        <h1 class="error-code text-negative">404</h1>
        <h2 class="error-title">Page Not Found</h2>
        <p class="error-message text-grey-7">
          The page you're looking for doesn't exist or has been moved.
        </p>
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
