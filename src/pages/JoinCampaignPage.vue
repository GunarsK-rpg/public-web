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
        <FolderX :size="64" class="text-grey-5" aria-hidden="true" />
        <div class="text-h6 text-grey-7 q-mt-md">Campaign not found</div>
        <div class="text-body2 text-grey-6 q-mb-md">
          This invite link is invalid or the campaign no longer exists.
        </div>
        <q-btn color="primary" label="Back to Campaigns" @click="goBack" />
      </div>

      <template v-else>
        <div class="text-h5 q-mb-xs">Join Campaign</div>
        <div class="text-body2 text-grey q-mb-lg">
          You've been invited to join a campaign. Review the details below and create your character
          or assign an existing one.
        </div>

        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6">{{ campaign.name }}</div>
            <div v-if="campaign.description" class="text-body2 text-grey q-mt-sm">
              {{ campaign.description }}
            </div>
          </q-card-section>

          <q-card-actions>
            <q-btn color="primary" @click="createCharacter"
              ><Plus :size="20" class="on-left" />Create Character</q-btn
            >
          </q-card-actions>
        </q-card>

        <!-- Assign Existing Character -->
        <template v-if="unassignedHeroes.length > 0">
          <div class="text-subtitle1 q-mb-md">Or assign an existing character</div>

          <div class="row q-col-gutter-md">
            <div v-for="hero in unassignedHeroes" :key="hero.id" class="col-12 col-sm-6 col-md-4">
              <q-card
                class="card-interactive cursor-pointer"
                tabindex="0"
                role="button"
                :aria-label="`Assign ${hero.name} to campaign`"
                @click="assignHero(hero)"
                @keydown.enter="assignHero(hero)"
                @keydown.space.prevent="assignHero(hero)"
              >
                <q-card-section>
                  <div class="text-h6">{{ hero.name }}</div>
                  <div class="text-subtitle2">
                    Level {{ hero.level }}
                    <span v-if="hero.ancestry?.name"> &middot; {{ hero.ancestry.name }} </span>
                  </div>
                </q-card-section>

                <q-card-section>
                  <div class="text-caption text-grey">No campaign</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </template>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FolderX, Plus } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';
import type { Campaign, Hero } from 'src/types';
import campaignService from 'src/services/campaignService';
import heroService from 'src/services/heroService';
import { buildHeroCorePayload } from 'src/services/heroPayloads';
import { logger } from 'src/utils/logger';
import { toError } from 'src/utils/errorHandling';

const props = defineProps<{
  code: string;
}>();

const router = useRouter();
const $q = useQuasar();

const campaign = ref<Campaign | null>(null);
const unassignedHeroes = ref<Hero[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const campaignRes = await campaignService.getByCode(props.code);
    campaign.value = campaignRes.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      campaign.value = null;
    } else {
      error.value = 'Failed to load campaign details';
      logger.error('Failed to load campaign', toError(err));
    }
    loading.value = false;
    return;
  }

  try {
    const heroesRes = await heroService.getAll();
    unassignedHeroes.value = heroesRes.data.data.filter((h) => !h.campaign);
  } catch (err: unknown) {
    logger.error('Failed to load heroes', toError(err));
  } finally {
    loading.value = false;
  }
});

function createCharacter(): void {
  if (!campaign.value) return;
  void router.push({
    name: 'character-create',
    query: {
      campaignId: String(campaign.value.id),
      campaignCode: campaign.value.code,
      campaignName: campaign.value.name,
    },
  });
}

async function doAssignHero(hero: Hero, campaignCode: string): Promise<void> {
  try {
    const payload = buildHeroCorePayload({
      ...hero,
      campaign: { id: 0, code: campaignCode, name: '' },
    });
    await heroService.update(hero.id, payload);
    void router.push({
      name: 'character-sheet',
      params: { characterId: String(hero.id) },
    });
  } catch (err) {
    logger.error('Failed to assign hero to campaign', toError(err));
    error.value = 'Failed to assign character to campaign';
  }
}

function assignHero(hero: Hero): void {
  if (!campaign.value) return;

  $q.dialog({
    title: 'Assign Character',
    message: `Assign "${hero.name}" to campaign "${campaign.value.name}"?`,
    cancel: true,
    persistent: false,
  }).onOk(() => {
    if (!campaign.value) return;
    void doAssignHero(hero, campaign.value.code);
  });
}

function goBack(): void {
  void router.push({ name: 'campaigns' });
}
</script>
