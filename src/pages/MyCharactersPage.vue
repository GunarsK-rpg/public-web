<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center q-mb-md">
        <div class="text-h5">My Characters</div>
        <q-space />
        <q-btn color="primary" :to="{ name: 'character-create' }"
          ><UserPlus :size="20" class="on-left" />Create Character</q-btn
        >
      </div>

      <q-spinner-dots v-if="loading" size="50px" color="primary" />

      <q-banner v-else-if="error" class="bg-negative text-white q-mb-md">
        {{ error }}
      </q-banner>

      <div v-else-if="heroes.length === 0" class="text-center q-pa-xl">
        <UserX :size="64" class="text-grey-5" aria-hidden="true" />
        <div class="text-h6 text-grey-7 q-mt-md">No characters yet</div>
        <div class="text-body2 text-grey-6">Create your first character to get started.</div>
      </div>

      <div v-else class="row q-col-gutter-md">
        <div v-for="hero in heroes" :key="hero.id" class="col-12 col-sm-6 col-md-4">
          <HeroCard :hero="hero" :subtitle="hero.campaign?.name" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { UserPlus, UserX } from 'lucide-vue-next';
import type { Hero } from 'src/types';
import heroService from 'src/services/heroService';
import { logger } from 'src/utils/logger';
import { toError } from 'src/utils/errorHandling';
import HeroCard from 'src/components/shared/HeroCard.vue';

const heroes = ref<Hero[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const response = await heroService.getAll();
    heroes.value = response.data.data;
  } catch (err) {
    logger.error('Failed to load characters', { error: toError(err).message });
    error.value = 'Failed to load characters';
  } finally {
    loading.value = false;
  }
});
</script>
