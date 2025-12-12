<template>
  <q-item class="talent-item">
    <q-item-section avatar>
      <q-icon :name="isKey ? 'star' : 'auto_awesome'" :color="isKey ? 'amber' : 'primary'" />
    </q-item-section>
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
  isKey?: boolean;
}>();
</script>

<style scoped>
.talent-item {
  min-height: 48px;
}
</style>
