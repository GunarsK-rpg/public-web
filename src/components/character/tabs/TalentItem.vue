<template>
  <q-item class="talent-item">
    <q-item-section>
      <q-item-label>{{ talent.name }}</q-item-label>
      <q-item-label caption>{{ talent.descriptionShort || talent.description }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import type { Talent } from 'src/types';

defineProps<{
  talent: Talent;
}>();
</script>

<style scoped>
.talent-item {
  min-height: 48px;
}
</style>
