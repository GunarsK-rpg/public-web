<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center q-mb-md">
        <div class="text-h5">My Campaigns</div>
        <q-space />
        <q-btn color="primary" :to="{ name: 'campaign-create' }"
          ><Plus :size="20" class="on-left" />Create Campaign</q-btn
        >
      </div>

      <q-spinner-dots v-if="loading" size="50px" color="primary" />

      <q-banner v-else-if="error" class="bg-negative text-white q-mb-md">
        {{ error }}
      </q-banner>

      <div v-else-if="campaigns.length === 0" class="text-center q-pa-xl">
        <FolderX :size="64" class="text-grey-5" aria-hidden="true" />
        <div class="text-h6 text-grey-7 q-mt-md">No campaigns found</div>
        <div class="text-body2 text-grey-6">You haven't joined any campaigns yet.</div>
      </div>

      <div v-else class="row q-col-gutter-md">
        <div v-for="campaign in campaigns" :key="campaign.id" class="col-12 col-sm-6 col-md-4">
          <RouterLink
            :to="{ name: 'campaign-detail', params: { campaignId: String(campaign.id) } }"
            custom
            v-slot="{ href, navigate }"
          >
            <a
              :href="href"
              class="card-link"
              :aria-label="`View campaign: ${campaign.name}`"
              @click="navigate"
            >
              <q-card class="card-interactive cursor-pointer">
                <q-card-section>
                  <div class="text-h6">{{ campaign.name }}</div>
                  <div class="text-subtitle2 text-grey">
                    {{ campaign.description }}
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
import { computed, onMounted, ref } from 'vue';
import { Plus, FolderX } from 'lucide-vue-next';
import { useCampaignStore } from 'stores/campaigns';

const campaignStore = useCampaignStore();

const initializing = ref(true);
const campaigns = computed(() => campaignStore.campaigns);
const loading = computed(() => initializing.value || campaignStore.loading);
const error = computed(() => campaignStore.error);

onMounted(async () => {
  try {
    await campaignStore.fetchCampaigns();
  } finally {
    initializing.value = false;
  }
});
</script>
