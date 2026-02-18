<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center q-mb-md">
        <div class="text-h5">My Campaigns</div>
        <q-space />
        <q-btn
          color="primary"
          icon="sym_o_add"
          label="Create Campaign"
          :disable="campaignStore.saving"
          class="q-mr-sm"
          @click="promptCreateCampaign"
        />
        <q-btn
          color="primary"
          icon="sym_o_person_add"
          label="Create Character"
          @click="createStandaloneCharacter"
        />
      </div>

      <q-spinner-dots v-if="loading" size="50px" color="primary" />

      <q-banner v-else-if="error" class="bg-negative text-white q-mb-md">
        {{ error }}
      </q-banner>

      <div v-else-if="campaigns.length === 0" class="text-center q-pa-xl">
        <q-icon name="folder_off" size="64px" color="grey-5" aria-hidden="true" />
        <div class="text-h6 text-grey-7 q-mt-md">No campaigns found</div>
        <div class="text-body2 text-grey-6">You haven't joined any campaigns yet.</div>
      </div>

      <div v-else class="row q-col-gutter-md">
        <div v-for="campaign in campaigns" :key="campaign.id" class="col-12 col-sm-6 col-md-4">
          <q-card
            class="card-interactive cursor-pointer"
            tabindex="0"
            role="button"
            :aria-label="`View campaign: ${campaign.name}`"
            @click="selectCampaign(campaign.id)"
            @keydown.enter="selectCampaign(campaign.id)"
            @keydown.space.prevent="selectCampaign(campaign.id)"
          >
            <q-card-section>
              <div class="text-h6">{{ campaign.name }}</div>
              <div class="text-subtitle2 text-grey">
                {{ campaign.description }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useCampaignStore } from 'stores/campaigns';
import { MAX_CAMPAIGN_NAME_LENGTH } from 'src/constants/validation';

const $q = useQuasar();
const router = useRouter();
const campaignStore = useCampaignStore();

const campaigns = computed(() => campaignStore.campaigns);
const loading = computed(() => campaignStore.loading);
const error = computed(() => campaignStore.error);

// Store handles errors internally and sets error state - no try/catch needed
onMounted(() => {
  void campaignStore.fetchCampaigns();
});

function selectCampaign(id: number): void {
  void router.push({ name: 'campaign-detail', params: { campaignId: String(id) } });
}

function createStandaloneCharacter(): void {
  void router.push({ name: 'character-create-standalone' });
}

function promptCreateCampaign(): void {
  $q.dialog({
    title: 'Create Campaign',
    message: 'Enter a name for the new campaign:',
    prompt: {
      model: '',
      type: 'text',
      maxlength: MAX_CAMPAIGN_NAME_LENGTH,
      isValid: (val: string) => val.trim().length > 0,
    },
    cancel: true,
    persistent: false,
  }).onOk((name: string) => {
    void campaignStore.createCampaign({ name: name.trim() }).then((campaign) => {
      if (campaign) {
        void router.push({
          name: 'campaign-detail',
          params: { campaignId: String(campaign.id) },
        });
      }
    });
  });
}
</script>
