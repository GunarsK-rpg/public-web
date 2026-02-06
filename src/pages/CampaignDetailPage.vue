<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-spinner-dots v-if="loading" size="50px" color="primary" />

      <q-banner v-else-if="error" class="bg-negative text-white q-mb-md">
        {{ error }}
        <template v-slot:action>
          <q-btn flat label="Go Back" @click="goBack" />
        </template>
      </q-banner>

      <div v-else-if="!campaign" class="text-center q-pa-xl">
        <q-icon name="sym_o_folder_off" size="64px" color="grey-5" aria-hidden="true" />
        <div class="text-h6 text-grey-7 q-mt-md">Campaign not found</div>
        <div class="text-body2 text-grey-6 q-mb-md">
          This campaign doesn't exist or you don't have access to it.
        </div>
        <q-btn color="primary" label="Back to Campaigns" @click="goBack" />
      </div>

      <template v-else>
        <div class="text-h5 q-mb-sm">{{ campaign.name }}</div>
        <div class="text-body2 text-grey q-mb-lg">
          {{ campaign.description }}
        </div>

        <div class="row items-center q-mb-md">
          <div class="text-h6">Characters</div>
          <q-space />
          <q-btn
            color="primary"
            icon="sym_o_add"
            label="Create Character"
            @click="createCharacter"
          />
        </div>

        <div v-if="campaign.heroes.length === 0" class="text-center q-pa-xl">
          <q-icon name="person_off" size="64px" color="grey-5" aria-hidden="true" />
          <div class="text-h6 text-grey-7 q-mt-md">No characters</div>
          <div class="text-body2 text-grey-6 q-mb-md">No characters in this campaign yet.</div>
          <q-btn
            color="primary"
            icon="sym_o_add"
            label="Create Your First Character"
            @click="createCharacter"
          />
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="hero in campaign.heroes" :key="hero.id" class="col-12 col-sm-6 col-md-4">
            <q-card
              class="card-interactive cursor-pointer"
              tabindex="0"
              role="button"
              :aria-label="`View character: ${hero.name}`"
              @click="selectCharacter(hero.id)"
              @keydown.enter="selectCharacter(hero.id)"
              @keydown.space.prevent="selectCharacter(hero.id)"
            >
              <q-card-section>
                <div class="text-h6">{{ hero.name }}</div>
                <div class="text-subtitle2">
                  Level {{ hero.level }}
                  <span v-if="hero.radiantOrder"> · {{ hero.radiantOrder.name }} </span>
                </div>
              </q-card-section>

              <q-card-section>
                <div class="text-caption">HP: {{ hero.currentHealth }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCampaignStore } from 'src/stores/campaigns';
import { useClassifierStore } from 'src/stores/classifiers';
import { useErrorHandler } from 'src/composables/useErrorHandler';
import { logger } from 'src/utils/logger';
import { toError } from 'src/utils/errorHandling';

const props = defineProps<{
  campaignId: string;
}>();

const router = useRouter();
const campaignStore = useCampaignStore();
const classifiers = useClassifierStore();
const { showWarning } = useErrorHandler();

const campaign = computed(() => campaignStore.currentCampaign);
const loading = computed(() => campaignStore.loading);
const error = computed(() => campaignStore.error);

onMounted(async () => {
  const campaignId = Number(props.campaignId);
  if (isNaN(campaignId) || campaignId <= 0) {
    campaignStore.setError('Invalid campaign ID');
    return;
  }
  // Initialize classifiers before loading campaign to ensure radiant order names are available
  if (!classifiers.initialized) {
    try {
      await classifiers.initialize();
    } catch (err) {
      logger.error('Failed to initialize classifiers', { error: toError(err).message });
      showWarning(
        'Some data unavailable',
        'Character details like Radiant Order names may not display correctly.'
      );
      // Continue loading campaign - page still works with degraded functionality
    }
  }
  await campaignStore.selectCampaign(campaignId);
});

function selectCharacter(characterId: number): void {
  void router.push({
    name: 'character-sheet',
    params: {
      campaignId: props.campaignId,
      characterId: String(characterId),
    },
  });
}

function goBack(): void {
  void router.push({ name: 'campaigns' });
}

function createCharacter(): void {
  void router.push({
    name: 'character-create',
    params: { campaignId: props.campaignId },
  });
}
</script>
