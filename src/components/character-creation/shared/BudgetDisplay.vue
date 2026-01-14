<template>
  <div class="text-caption q-mb-md" aria-live="polite" aria-atomic="true">
    {{ label }}:
    <strong :class="remaining >= 0 ? 'text-positive' : 'text-negative'">
      {{ remaining }}
    </strong>
    <template v-if="showTotal">/ {{ total }}</template>
    <template v-if="suffix"> ({{ suffix }})</template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** Label text (e.g., "Points remaining", "Free slots") */
  label: string;
  /** Current remaining budget value */
  remaining: number;
  /** Total budget (optional, shown as "remaining / total") */
  total?: number;
  /** Whether to show the total (defaults to true if total is provided) */
  showTotal?: boolean;
  /** Optional suffix text (e.g., "from Intellect") */
  suffix?: string;
}>();
</script>
