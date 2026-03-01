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
          This invite link is invalid or the campaign no longer exists.
        </div>
        <q-btn color="primary" label="Back to Campaigns" @click="goBack" />
      </div>

      <template v-else>
        <div class="text-h5 q-mb-xs">Join Campaign</div>
        <div class="text-body2 text-grey q-mb-lg">
          You've been invited to join a campaign. Review the details below and create your
          character.
        </div>

        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6">{{ campaign.name }}</div>
            <div v-if="campaign.description" class="text-body2 text-grey q-mt-sm">
              {{ campaign.description }}
            </div>
          </q-card-section>

          <q-card-actions>
            <q-btn
              color="primary"
              icon="sym_o_add"
              label="Create Character"
              @click="createCharacter"
            />
          </q-card-actions>
        </q-card>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import type { Campaign } from 'src/types';
import campaignService from 'src/services/campaignService';
import { logger } from 'src/utils/logger';
import { toError } from 'src/utils/errorHandling';

const props = defineProps<{
  code: string;
}>();

const router = useRouter();

const campaign = ref<Campaign | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const response = await campaignService.getByCode(props.code);
    campaign.value = response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      campaign.value = null;
    } else {
      error.value = 'Failed to load campaign details';
      logger.error('Failed to load campaign preview', toError(err));
    }
  } finally {
    loading.value = false;
  }
});

function createCharacter(): void {
  if (!campaign.value) return;
  void router.push({
    name: 'character-create',
    query: { campaignId: String(campaign.value.id) },
  });
}

function goBack(): void {
  void router.push({ name: 'campaigns' });
}
</script>
