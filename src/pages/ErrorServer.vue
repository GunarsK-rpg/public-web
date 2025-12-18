<template>
  <q-page class="error-page flex flex-center">
    <div class="text-center">
      <q-icon name="sym_o_cloud_off" size="120px" color="negative" />

      <div class="q-mt-lg">
        <h1 class="error-code text-negative">500</h1>
        <h2 class="error-title">Server Error</h2>
        <p class="error-message text-grey-7">
          Something went wrong on our end. Please try again later.
        </p>
      </div>

      <div class="q-mt-xl q-gutter-sm">
        <q-btn
          color="primary"
          unelevated
          icon="sym_o_refresh"
          label="Try Again"
          no-caps
          @click="retry"
        />
        <q-btn color="primary" outline to="/" icon="sym_o_home" label="Back to Home" no-caps />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function retry(): void {
  router.go(0);
}
// Styles in src/css/app.scss (.error-page, .error-code, .error-title, .error-message)
</script>
