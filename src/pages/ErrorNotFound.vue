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
//
</script>

<style scoped>
.error-page {
  min-height: calc(100vh - 64px);
  padding: 40px 20px;
}

.error-code {
  font-size: 72px;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  margin: 16px 0 0 0;
}

.error-message {
  font-size: 18px;
  max-width: 500px;
  margin: 16px auto 0;
}
</style>
