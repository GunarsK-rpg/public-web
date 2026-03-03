<template>
  <q-banner class="banner-key-talent" dense rounded>
    <template v-slot:avatar>
      <Sparkles aria-hidden="true" />
    </template>
    <strong>{{ label }}:</strong> {{ talent?.name }}
    <div class="text-caption">
      {{ talent?.descriptionShort || talent?.description }}
    </div>
  </q-banner>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next';
import type { Talent } from 'src/types';

withDefaults(
  defineProps<{
    talent: Talent | null | undefined;
    label?: string;
  }>(),
  {
    label: 'Key Talent',
  }
);
</script>
