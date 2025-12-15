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
