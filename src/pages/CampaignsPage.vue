<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="text-h5 q-mb-md">My Campaigns</div>

      <q-spinner-dots v-if="loading" size="50px" color="primary" />

      <q-banner v-else-if="error" class="bg-negative text-white q-mb-md">
        {{ error }}
      </q-banner>

      <div v-else-if="campaigns.length === 0" class="text-center q-pa-xl">
        <q-icon name="folder_off" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">No campaigns found</div>
        <div class="text-body2 text-grey-6">You haven't joined any campaigns yet.</div>
      </div>

      <div v-else class="row q-col-gutter-md">
        <div v-for="campaign in campaigns" :key="campaign.id" class="col-12 col-sm-6 col-md-4">
          <q-card class="campaign-card cursor-pointer" @click="selectCampaign(campaign.id)">
            <q-card-section>
              <div class="text-h6">{{ campaign.name }}</div>
              <div class="text-subtitle2 text-grey">
                {{ campaign.description }}
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="text-caption text-grey">
              Updated: {{ formatDate(campaign.updatedAt) }}
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCampaignStore } from 'stores/campaigns';

const router = useRouter();
const campaignStore = useCampaignStore();

const campaigns = computed(() => campaignStore.campaigns);
const loading = computed(() => campaignStore.loading);
const error = computed(() => campaignStore.error);

onMounted(async () => {
  await campaignStore.fetchCampaigns();
});

function selectCampaign(id: string): void {
  void router.push({ name: 'campaign-detail', params: { campaignId: id } });
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}
</script>

<style scoped>
.campaign-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.campaign-card:hover {
  transform: translateY(-2px);
}
</style>
