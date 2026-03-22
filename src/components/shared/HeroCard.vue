<template>
  <RouterLink
    :to="{ name: 'character-sheet', params: { characterId: String(hero.id) } }"
    custom
    v-slot="{ href, navigate }"
  >
    <a
      :href="href"
      class="card-link"
      :aria-label="`View character: ${hero.name}`"
      @click="navigate($event)"
    >
      <q-card class="card-interactive cursor-pointer">
        <q-card-section class="row items-center no-wrap q-gutter-x-md">
          <AvatarDisplay :src="hero.avatarKey ? avatarUrl : null" size="44px" expandable />
          <div class="col">
            <div class="text-h6">{{ hero.name }}</div>
            <div class="text-subtitle2">
              Level {{ hero.level }}
              <span v-if="hero.radiantOrder"> · {{ hero.radiantOrder.name }} </span>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="row items-center no-wrap">
          <div>
            <div class="text-caption">HP: {{ hero.currentHealth }}</div>
            <div v-if="subtitle" class="text-caption text-muted">
              {{ subtitle }}
            </div>
          </div>
          <q-space />
          <slot name="actions" />
        </q-card-section>
      </q-card>
    </a>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Hero } from 'src/types';
import AvatarDisplay from './AvatarDisplay.vue';
import filesApi from 'src/services/filesApi';

const props = defineProps<{
  hero: Hero;
  subtitle?: string | null | undefined;
}>();

const avatarUrl = computed(() =>
  props.hero.avatarKey ? filesApi.buildHeroAvatarUrl(props.hero.avatarKey) : null
);
</script>
