<template>
  <q-expansion-item
    :aria-label="`${label} section`"
    :default-opened="defaultOpened"
    class="q-mb-sm"
  >
    <template #header>
      <q-item-section avatar>
        <slot name="icon" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ label }}</q-item-label>
      </q-item-section>
      <slot name="header-side" />
    </template>
    <q-card>
      <q-card-section>
        <slot />
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  defaultOpened?: boolean;
}>();
</script>
