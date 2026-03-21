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
          <RouterLink
            :to="{ name: 'character-sheet', params: { characterId: String(hero.id) } }"
            custom
            v-slot="{ href, navigate }"
          >
            <a
              :href="href"
              class="card-link"
              :aria-label="`View character: ${hero.name}`"
              @click="navigate"
            >
              <q-card class="card-interactive cursor-pointer">
                <q-card-section>
                  <div class="text-h6">{{ hero.name }}</div>
                  <div class="text-subtitle2">
                    Level {{ hero.level }}
                    <span v-if="hero.radiantOrder"> &middot; {{ hero.radiantOrder.name }} </span>
                  </div>
                </q-card-section>

                <q-card-section>
                  <div class="text-caption">HP: {{ hero.currentHealth }}</div>
                  <div v-if="hero.campaign?.name" class="text-caption text-grey">
                    {{ hero.campaign?.name }}
                  </div>
                </q-card-section>
              </q-card>
            </a>
          </RouterLink>
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
